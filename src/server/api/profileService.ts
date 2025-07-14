import { readBody, parseCookies, H3Event, getQuery, createError } from 'h3';
import prisma from '../../database/db';
import { extractUserIdFromToken } from '../../jwt';
import { graphqlFetch, graphqlHeaderFetch } from '../utils/graphqlFetch';
import readGraphqlFiles from '../utils/graphql-parse';
import { getUserData } from './userService';
import { checkSelf } from '../utils/checkSelf';

export async function getLeetcodeProfile(event: H3Event, queryFile: string) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const queryParams = getQuery(event);

  const username = queryParams.lcUsername;
  const userAccountName = queryParams.username.toString();
  const year = queryParams.year;

  try {
    const query = readGraphqlFiles(queryFile);
    let variables = queryFile.includes("ActiveDays") ? { username: username, year: year } : { username: username };
    const response = await graphqlFetch(query, variables);

    if (response.data.matchedUser === null) {
      throw createError({statusCode: 404, statusMessage: "Leetcode user not found" });
    }

    if (response.data.matchedUser.profile !== undefined) {
      const user = await prisma.user.findUnique({ where: { email: userAccountName } });

      if (user.userAvatar !== response.data.matchedUser.profile.userAvatar) {
        await prisma.user.update({
          where: { 
            id: userId 
          },
          data: { 
            userAvatar: response.data.matchedUser.profile.userAvatar
          },
        });
      }
    }

    return { data: response.data, message: 'Sucessfully retrieve Leetcode profile' };

  } catch(error: any) {
    throw error;
  }
}

export async function addLeetcodeUsername(event: H3Event, queryFile: any) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const queryParams = getQuery(event);

  const body = await readBody(event);
  const newUserName = body.lcUsername;
  const newProfileVerified = body.isProfileVerified;

  if(!(await checkSelf(queryParams.username.toString()), userId)) {
    throw createError({ statusCode: 401, statusMessage: 'User is unauthorized to perform this action' })
  }

  if (!newUserName) {
      throw createError({statusCode: 400, statusMessage: "Missing Fields" });
  }

  if (userId === undefined) {
      throw createError({statusCode: 401, statusMessage:'Invalid user'});
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
      throw createError({statusCode: 401, statusMessage:'Invalid user'});
  }

  if (newUserName === user.name) {
    throw createError({statusCode: 400, statusMessage:'Name is already in use'});
  }

  //Check leetcode profile is legitimate
  try {
    const query = readGraphqlFiles(queryFile);
    const response = await graphqlFetch(query, { username: newUserName });

    if (response.data.matchedUser === null) {
      throw createError({statusCode: 404, statusMessage: "Leetcode user not found" });
    }
    
    await prisma.user.update({ 
      where: { 
        id: userId 
      },
      data: { 
        userAvatar: response.data.matchedUser.profile.userAvatar,
        lcUsername: newUserName, 
        isProfileVerified: newProfileVerified 
      } 
    });

    return { message: 'User Profile added successfully' };

  } catch(error: any) {
    throw error;
  }
}

export async function validateLeetcodeUsername(event: H3Event, queryFile: any) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const queryParams = getQuery(event);

  const body = await readBody(event);
  const sessionToken = body.sessionToken;
  let csrf = '';

  if(!(await checkSelf(queryParams.username.toString(), userId))) {
    throw createError({ statusCode: 401, statusMessage: 'User is unauthorized to perform this action' })
  }

  // Get the CSRF token
  try {
    const query = readGraphqlFiles('getUserSession');
    const response = await graphqlHeaderFetch(query);
    csrf = response.headers.getSetCookie()[0].split(';')[0].split('=')[1];
  } catch (error:any) {
    throw error;
  }
  
  // Fetch the global state of user
  try {
    const query = readGraphqlFiles(queryFile);
    const response = await graphqlFetch(query, {}, csrf, sessionToken);

    if (response === null) {
      throw createError({ statusCode: 500, statusMessage: "Server error" });
    }

    // Check if the token is valid
    if (response.data.userStatus.userId === null) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid token, please check again'});
    }

    // Check if the username entered is the same as the retrieval name
    if (response.data.userStatus.username !== queryParams.lcUsername.toString()) {
      throw createError({ statusCode: 404, statusMessage: 'User does not match' });
    }

    // Store the sessionToken into User modal
    await prisma.user.update({
      where: {
        id: userId
      },
      data: {
        lcSessionToken: sessionToken,
        isProfileVerified: true
      }
    })

    // Fetch the user account back
    const userAccountResponse = await getUserData(event)
    
    return userAccountResponse;
  } catch (error: any) {
    throw error;
  }
}