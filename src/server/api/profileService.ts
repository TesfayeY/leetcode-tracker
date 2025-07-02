import { readBody, parseCookies, H3Event } from 'h3';
import prisma from '../../database/db';
import { extractUserIdFromToken } from '../../jwt';
import graphqlFetch from '../utils/graphqlFetch';
import readGraphqlFiles from '../utils/graphql-parse';

export async function addLeetcodeUsername(event: H3Event, queryFile: any) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;

  const body = await readBody(event);
  const newUserName = body.lcUsername;

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
    
    await prisma.user.update({ where: { id: userId }, data: { lc_username: newUserName } });

    return { message: 'User Profile added successfully' };

  } catch(error: any) {
    throw error;
  }
}