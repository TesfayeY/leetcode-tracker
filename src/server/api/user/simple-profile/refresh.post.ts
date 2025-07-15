// server/api/user/profile/refresh.post.ts
import { defineEventHandler, getQuery, createError, H3Event } from 'h3';
import { invalidateUserProfileCache } from '~/server/services/cacheService'; 

export default defineEventHandler(async (event: H3Event) => {
    if (event.req.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
    }

    const { lcUsername } = getQuery(event); // lcUsername from query
    if (typeof lcUsername !== 'string' || !lcUsername.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'LeetCode username (lcUsername) is required for refresh.',
        });
    }

    try {
        await invalidateUserProfileCache(event, lcUsername); // Pass event for potentially authenticated re-warm
        return { message: `Cache for user profile '${lcUsername}' invalidated. Data will be refreshed on next request.` };
    } catch (error: any) {
        console.error(`Error invalidating user profile cache for ${lcUsername}:`, error);
        throw createError({ statusCode: 500, statusMessage: 'Failed to invalidate cache.' });
    }
});