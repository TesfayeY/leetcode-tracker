import { LEETCODE_BASE_URL, LEETCODE_GRAPHQL_URL } from "../../constants/leetcodeConst";

export default async function graphqlFetch(query: string, variables?: Record<string, any>) {
  try {
    const response = await $fetch(LEETCODE_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': LEETCODE_BASE_URL,
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
     
    return response;

  } catch(error: any) {
    throw error;
  }
}