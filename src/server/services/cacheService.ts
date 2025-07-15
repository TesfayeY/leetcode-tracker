import { H3Event } from 'h3'; 
import { getRedisClient } from '../utils/redisHelper'; 
import {
    fetchUserProfileAndRecentSubmissionsFromLeetCode,
    fetchUserCalendarFromLeetCode,
    fetchUserContestRankingFromLeetCode,
    fetchUserLanguageProblemCountFromLeetCode,
    fetchUserQuestionProgressFromLeetCode,
    fetchAllProblemsCountFromLeetCode,
    fetchDailyCodingChallengeQuestionFromLeetCode,
    fetchStreakCounterFromLeetCode,
    fetchCreatedPublicFavoriteListFromLeetCode,
    fetchTagProblemCountsFromLeetCode,
    fetchUserStatusFromLeetCode,
} from './leetcodeApi'; 

import {
    REDIS_TTL_USER_PROFILE_RECENT_SUBMISSIONS,
    REDIS_TTL_USER_CALENDAR,
    REDIS_TTL_USER_LANGUAGE_PROBLEMS,
    REDIS_TTL_USER_QUESTION_PROGRESS,
    REDIS_TTL_ALL_PROBLEMS_COUNT,
    REDIS_TTL_DAILY_CHALLENGE,
    REDIS_TTL_STREAK_COUNTER,
    REDIS_TTL_FAVORITE_LISTS,
    REDIS_TTL_TAG_PROBLEM_COUNTS,
    REDIS_TTL_USER_STATUS,
    REDIS_TTL_USER_CONTEST_RANKING
} from './../../constants/appConst';



// --- Generic Cache-Aside Function (Helper) ---
// This simplifies writing multiple caching functions
async function getCachedData<T>(
    event: H3Event, 
    key: string,
    ttl: number,
    fetcher: (event: H3Event) => Promise<T | null> 
): Promise<T | null> {
    const redis = await getRedisClient();

    let cachedDataStr = await redis.get(key);
    if (cachedDataStr) {
        console.log(`[CacheService] Cache hit for ${key}.`);
        return JSON.parse(cachedDataStr) as T;
    }

    console.log(`[CacheService] Cache miss for ${key}. Fetching from LeetCode API.`);
    const dataFromLeetCode = await fetcher(event); // Pass event to the fetcher

    if (dataFromLeetCode) {
        await redis.set(key, JSON.stringify(dataFromLeetCode));
        await redis.expire(key, ttl);
        console.log(`[CacheService] Cached ${key} with TTL ${ttl}s.`);
        return dataFromLeetCode;
    }
    console.log(`[CacheService] Data for ${key} not found or failed to fetch.`);
    return null;
}


export async function getUserProfileAndRecentSubmissionsCached(
    event: H3Event,
    username: string,
    numRecentSubmission: number = 10
): Promise<UserProfileAndRecentSubmissions | null> {
    const key = `user:${username}:profile_recent_submissions`;
    return getCachedData(event, key, REDIS_TTL_USER_PROFILE_RECENT_SUBMISSIONS,
        (evt) => fetchUserProfileAndRecentSubmissionsFromLeetCode(evt, username, numRecentSubmission)
    );
}

export async function getUserCalendarCached(
    event: H3Event,
    username: string,
    year: number
): Promise<UserCalendar | null> {
    const key = `user:${username}:calendar:${year}`;
    return getCachedData(event, key, REDIS_TTL_USER_CALENDAR,
        (evt) => fetchUserCalendarFromLeetCode(evt, username, year)
    );
}

export async function getUserContestRankingCached(
    event: H3Event,
    username: string
): Promise<UserContestRanking | null> {
    const key = `user:${username}:contest_ranking`;
    return getCachedData(event, key, REDIS_TTL_USER_CONTEST_RANKING,
        (evt) => fetchUserContestRankingFromLeetCode(evt, username)
    );
}

export async function getUserLanguageProblemCountCached(
    event: H3Event,
    username: string
): Promise<LanguageProblemCount[] | null> {
    const key = `user:${username}:language_problem_count`;
    return getCachedData(event, key, REDIS_TTL_USER_LANGUAGE_PROBLEMS,
        (evt) => fetchUserLanguageProblemCountFromLeetCode(evt, username)
    );
}

export async function getUserQuestionProgressCached(
    event: H3Event,
    username: string
): Promise<UserQuestionProgress | null> {
    const key = `user:${username}:question_progress`;
    return getCachedData(event, key, REDIS_TTL_USER_QUESTION_PROGRESS,
        (evt) => fetchUserQuestionProgressFromLeetCode(evt, username)
    );
}

export async function getAllProblemsCountCached(
    event: H3Event 
): Promise<AllQuestionsCount[] | null> {
    const key = `global:all_problems_count`;
    return getCachedData(event, key, REDIS_TTL_ALL_PROBLEMS_COUNT,
        (evt) => fetchAllProblemsCountFromLeetCode(evt)
    );
}

export async function getDailyCodingChallengeQuestionCached(
    event: H3Event 
): Promise<DailyChallengeQuestion | null> {
    const key = `global:daily_challenge`;
    return getCachedData(event, key, REDIS_TTL_DAILY_CHALLENGE,
        (evt) => fetchDailyCodingChallengeQuestionFromLeetCode(evt)
    );
}

export async function getStreakCounterCached(
    event: H3Event
): Promise<StreakCounter | null> {
    const key = `user_authenticated:streak_counter`;
    return getCachedData(event, key, REDIS_TTL_STREAK_COUNTER,
        (evt) => fetchStreakCounterFromLeetCode(evt)
    );
}

export async function getCreatedPublicFavoriteListCached(
    event: H3Event,
    userSlug: string
): Promise<CreatedPublicFavoriteList | null> {
    const key = `user:${userSlug}:favorite_lists`;
    return getCachedData(event, key, REDIS_TTL_FAVORITE_LISTS,
        (evt) => fetchCreatedPublicFavoriteListFromLeetCode(evt, userSlug)
    );
}

export async function getTagProblemCountsCached(
    event: H3Event,
    username: string
): Promise<TagProblemCounts | null> {
    const key = `user:${username}:tag_problem_counts`;
    return getCachedData(event, key, REDIS_TTL_TAG_PROBLEM_COUNTS,
        (evt) => fetchTagProblemCountsFromLeetCode(evt, username)
    );
}

export async function getUserStatusCached(
    event: H3Event 
): Promise<UserStatus | null> {
    // Key is global as it represents the current server's authenticated LeetCode user status
    const key = `user_authenticated:status`;
    return getCachedData(event, key, REDIS_TTL_USER_STATUS,
        (evt) => fetchUserStatusFromLeetCode(evt)
    );
}


export async function invalidateUserProfileCache(
    event: H3Event,
    username: string
): Promise<void> {
    const redis = await getRedisClient();

    // List all possible keys related to a user's profile data
    const keysToInvalidatePatterns = [
        `user:${username}:profile_recent_submissions`,
        `user:${username}:calendar:*`, 
        `user:${username}:contest_ranking`,
        `user:${username}:language_problem_count`,
        `user:${username}:question_progress`,
        `user:${username}:favorite_lists`,
        `user:${username}:tag_problem_counts`,
        // `user_authenticated:streak_counter`, // Invalidate if the user-facing streak counter is tied to this user
        // `user_authenticated:status`, // Invalidate if status is user-specific
    ];

    const specificKeysToDelete: string[] = [];


    for (const pattern of keysToInvalidatePatterns) {
        if (pattern.includes('*')) {
            
            // redis.scan() in a loop to find keys incrementally?
            const matchingKeys = await redis.keys(pattern);
            specificKeysToDelete.push(...matchingKeys);
        } else {
            specificKeysToDelete.push(pattern);
        }
    }

    if (specificKeysToDelete.length > 0) {
        const deletedCount = await redis.del(...specificKeysToDelete);
        console.log(`[CacheService] Invalidated ${deletedCount} user profile cache keys for ${username}.`);
    } else {
        console.log(`[CacheService] No specific keys found to invalidate for ${username}.`);
    }

}