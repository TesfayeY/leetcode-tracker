import { LEETCODE_BASE_URL, LEETCODE_GRAPHQL_URL } from '~/constants/leetcodeConst';
import { $fetch } from 'ofetch';
import { H3Event } from 'h3';

export async function graphqlFetch<T>(
    event: H3Event,
    query: string,
    variables?: Record<string, any>
): Promise<T> {
    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Referer': LEETCODE_BASE_URL,
            'User-Agent': 'YourLeetCodeWebApp/1.0 (contact@yourapp.com)',
        };

        const cookieHeader = event.node.req.headers.cookie;
        if (cookieHeader) {
            headers['Cookie'] = cookieHeader;
            const csrfTokenMatch = cookieHeader.match(/csrftoken=([^;]+)/);
            if (csrfTokenMatch && csrfTokenMatch[1]) {
                headers['X-CSRF-Token'] = csrfTokenMatch[1];
            }
        }


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
    } catch(error: any) {
        console.error("Error in graphqlFetch:", error);
        throw error;
    }
}


export async function graphqlHeaderFetch<T>(
    event: H3Event,
    query: string,
    variables?: Record<string, any>,
    additionalHeaders?: Record<string, string> 
): Promise<T> {
    console.warn("graphqlHeaderFetch is a placeholder. Implement its logic.");

    const baseHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Referer': LEETCODE_BASE_URL,
        'User-Agent': 'YourLeetCodeWebApp/1.0 (contact@yourapp.com)',
    };

    const cookieHeader = event.node.req.headers.cookie;
    if (cookieHeader) {
        baseHeaders['Cookie'] = cookieHeader;
        const csrfTokenMatch = cookieHeader.match(/csrftoken=([^;]+)/);
        if (csrfTokenMatch && csrfTokenMatch[1]) {
            baseHeaders['X-CSRF-Token'] = csrfTokenMatch[1];
        }
    }

    const headers = { ...baseHeaders, ...additionalHeaders };

    try {
        // --- DEBUG LOGS START (re-added for verification) ---
        console.log(`[graphqlHeaderFetch DEBUG] Sending request to: ${LEETCODE_GRAPHQL_URL}`);
        console.log(`[graphqlHeaderFetch DEBUG] Request Body:`, JSON.stringify({ query, variables }, null, 2));
        console.log(`[graphqlHeaderFetch DEBUG] Request Headers (partial):`, {
            'Content-Type': headers['Content-Type'],
            'Referer': headers['Referer'],
            'User-Agent': headers['User-Agent'],
            'Cookie': headers['Cookie'] ? headers['Cookie'].substring(0, 50) + '...' : 'N/A', // Truncate for log safety
            'X-CSRF-Token': headers['X-CSRF-Token'] || 'N/A',
        });
        // --- DEBUG LOGS END ---

        const response = await $fetch(LEETCODE_GRAPHQL_URL, {
            method: 'POST',
            headers: headers,
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