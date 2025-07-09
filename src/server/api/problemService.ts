import { readBody, parseCookies, H3Event, getQuery } from 'h3';
import { extractUserIdFromToken } from '../../jwt';
import { graphqlFetch } from '../utils/graphqlFetch';
import readGraphqlFiles from '../utils/graphql-parse';

export async function getLeetcodeProblem(event: H3Event, queryFile: any) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;

  try {
    const query = readGraphqlFiles(queryFile);
    const response = await graphqlFetch(query);

    if (response.data === null) {
      throw createError({statusCode: 404, statusMessage: "Leetcode problem not found" });
    }

    return { data: response.data, message: 'Sucessfully retrieve Leetcode problem' };

  } catch(error: any) {
    throw error;
  }
}