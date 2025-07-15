import { LEETCODE_BASE_URL, LEETCODE_GRAPHQL_URL, USER_AGENT } from './../../constants/leetcodeConst';
import { $fetch } from 'ofetch';

export async function graphqlFetch<T>(
	query: string,
	variables?: Record<string, any>,
	csrf?: string,
	sessionToken?: string
): Promise<T> {
	try {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'Referer': LEETCODE_BASE_URL,
			'User-Agent': USER_AGENT,
			'Cookie': `csrftoken=${csrf}; LEETCODE_SESSION=${sessionToken};`,
			'X-csrftoken': csrf
		};

		const response = await $fetch(LEETCODE_GRAPHQL_URL, {
			method: 'POST',
			headers: headers,
			body: JSON.stringify({
				query,
				variables
			})
		});

		if (response?.errors) {
			console.error('GraphQL response contains errors:', response.errors);
			throw new Error(`LeetCode GraphQL API returned errors: ${JSON.stringify(response.errors)}`);
		}

		return response as T;
	} catch (error: any) {
		console.error("Error in graphqlFetch:", error);
		throw error;
	}
}


export async function graphqlHeaderFetch<T>(
	query: string,
	variables?: Record<string, any>,
): Promise<T> {

	const baseHeaders: Record<string, string> = {
		'Content-Type': 'application/json',
		'Referer': LEETCODE_BASE_URL,
		'User-Agent': USER_AGENT,
	};

	try {
		const response = await $fetch(LEETCODE_GRAPHQL_URL, {
			method: 'POST',
			headers: baseHeaders,
			body: JSON.stringify({
				query,
				variables
			})
		});


		if (response?.errors) {
			console.error('GraphQLHeaderFetch response contains errors:', response.errors);
			throw new Error(`LeetCode GraphQL API returned errors in graphqlHeaderFetch: ${JSON.stringify(response.errors)}`);
		}
		return response as T;
	} catch (error: any) {
		console.error("Error in graphqlHeaderFetch:", error);
		throw error;
	}
}