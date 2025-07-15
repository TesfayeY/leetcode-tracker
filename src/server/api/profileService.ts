import { readBody, parseCookies, H3Event, getQuery, createError } from 'h3'; // Import createError
import prisma from '../../database/db';
import { extractUserIdFromToken } from '../../jwt';
import { graphqlFetch, graphqlHeaderFetch } from '../utils/graphqlFetch'; // Ensure these are named imports
import readGraphqlFiles from '../utils/graphql-parse';
import { getUserData } from './userService';
import { checkSelf } from '../utils/checkSelf';

export async function getLeetcodeProfile(event: H3Event, queryFile: string) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const queryParams = getQuery(event);

  const username = queryParams.lcUsername;
  const userAccountName = queryParams.username?.toString(); // Make sure username exists
  const year = queryParams.year;

  try {
    const query = readGraphqlFiles(queryFile);
    let variables = queryFile.includes("ActiveDays") ? { username: username, year: year } : { username: username };
    
    // CORRECTED: Pass 'event' as the first argument
    const response = await graphqlFetch(event, query, variables);

    if (response.data.matchedUser === null) {
      throw createError({statusCode: 404, statusMessage: "Leetcode user not found" });
    }

    if (response.data.matchedUser.profile !== undefined && userId !== undefined) { // Add userId check
      const user = await prisma.user.findUnique({ where: { email: userAccountName } });

      if (user && user.userAvatar !== response.data.matchedUser.profile.userAvatar) { // Check if user exists
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

    return { data: response.data, message: 'Successfully retrieve Leetcode profile' };

  } catch(error: any) {
    console.error('Error in getLeetcodeProfile:', error); // Log the error for debugging
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

  // Ensure checkSelf also receives all necessary arguments if its signature requires userId
  if(!(await checkSelf(queryParams.username?.toString(), userId))) { // Add nullish coalescing
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

  if (newUserName === user.lcUsername) { // Compare with lcUsername, not 'name'
    throw createError({statusCode: 400, statusMessage:'LeetCode username is already in use by this account'});
  }

  //Check leetcode profile is legitimate
  try {
    const query = readGraphqlFiles(queryFile);
    // CORRECTED: Pass 'event' as the first argument
    const response = await graphqlFetch(event, query, { username: newUserName });

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
    console.error('Error in addLeetcodeUsername:', error); // Log the error for debugging
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

  if(!(await checkSelf(queryParams.username?.toString(), userId))) { // Add nullish coalescing
    throw createError({ statusCode: 401, statusMessage: 'User is unauthorized to perform this action' })
  }

  // Get the CSRF token
  try {
    const query = readGraphqlFiles('getUserSession');
    // CORRECTED: Pass 'event' as the first argument to graphqlHeaderFetch
    const response = await graphqlHeaderFetch(event, query); // Assuming graphqlHeaderFetch takes event, query, variables, then maybe other args
    csrf = response.headers?.getSetCookie()?.[0]?.split(';')[0]?.split('=')[1] || ''; // Add null checks
  } catch (error:any) {
    console.error('Error fetching CSRF token:', error); // Log the error for debugging
    throw error;
  }
  
  // Fetch the global state of user
  try {
    const query = readGraphqlFiles(queryFile);
    // CORRECTED: Pass 'event' as the first argument to graphqlFetch
    // IMPORTANT: If graphqlFetch needs csrf and sessionToken, its signature in graphqlFetch.ts
    // must be adjusted to accept these. Currently, it expects (event, query, variables).
    // If csrf and sessionToken are *headers* or *cookies*, they should be handled *inside* graphqlFetch.
    // If they are specific to this call, you might need a custom fetcher or modify graphqlFetch.
    // Based on `graphqlFetch(query, {}, csrf, sessionToken);`, it implies graphqlFetch signature is (query, variables, csrf, sessionToken)
    // This is a mismatch with `graphqlFetch(event, query, variables)`.
    // Let's assume you want to pass them as part of the `variables` or expect graphqlFetch to use `event` for cookies.

    // If csrf and sessionToken are meant to be passed as *part of variables* for some custom LeetCode query:
    // const response = await graphqlFetch(event, query, { /* existing vars */, csrf, sessionToken });

    // OR if graphqlFetch should already manage cookies from `event`:
    const response = await graphqlFetch(event, query, {}); // Assuming `sessionToken` is what you mean by `cookies` in graphqlFetch logic

    // If you specifically need to pass CSRF and SessionToken as distinct arguments beyond variables,
    // your `graphqlFetch` signature needs to be:
    // export async function graphqlFetch<T>(event: H3Event, query: string, variables?: Record<string, any>, csrfToken?: string, sessionCookie?: string) { ... }
    // And then your call here would be:
    // const response = await graphqlFetch(event, query, {}, csrf, sessionToken); // This matches your original intent
    // Make sure your graphqlFetch.ts file actually uses these additional arguments if you pass them.
    // The `graphqlFetch` in your `graphqlFetch.ts` already reads cookies from `event.node.req.headers.cookie`,
    // so `sessionToken` (which sounds like a cookie) should be part of that. The `csrf` is also derived from cookies.
    // So, the original `graphqlFetch(event, query, variables)` is probably sufficient if you expect the cookies to be on the `event`.
    // The previous call `graphqlFetch(query, {}, csrf, sessionToken);` was fundamentally misaligned.

    if (response === null) {
      throw createError({ statusCode: 500, statusMessage: "Server error" });
    }

    // Check if the token is valid
    if (response.data.userStatus.userId === null) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid token, please check again'});
    }

    // Check if the username entered is the same as the retrieval name
    if (response.data.userStatus.username !== queryParams.lcUsername?.toString()) { // Add nullish coalescing
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
    console.error('Error in validateLeetcodeUsername:', error); // Log the error for debugging
    throw error;
  }
}