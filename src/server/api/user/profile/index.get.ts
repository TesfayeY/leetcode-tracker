// server/api/user/profile.get.ts
import { defineEventHandler, getQuery, getCookie, createError, H3Event } from 'h3';
import { PrismaClient } from '@prisma/client';

import {
  getUserProfileAndRecentSubmissionsCached,
  getUserCalendarCached,
  getUserLanguageProblemCountCached,
  getUserQuestionProgressCached,
  getUserContestRankingCached,
  getStreakCounterCached, // Requires authentication to LeetCode
  getTagProblemCountsCached,
  getUserStatusCached, // Requires authentication to LeetCode

} from '../../../services/cacheService';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  if (!globalThis.prisma) {
    // @ts-ignore
    globalThis.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = globalThis.prisma;
}

export default defineEventHandler(async (event: H3Event) => {
  if (event.req.method !== 'GET') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' });
  }

  const { lcUsername } = getQuery(event);
  if (typeof lcUsername !== 'string' || !lcUsername.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'LeetCode username (lcUsername) is required.',
    });
  }

  // Get userId from authentication cookie for Prisma DB update
  const userIdCookie = getCookie(event, 'id');
  let userId: number | null = null;
  if (userIdCookie) {
    try {
      userId = parseInt(userIdCookie, 10);
      if (isNaN(userId)) {
        userId = null;
      }
    } catch (e) {
      console.error('Error parsing userId cookie:', e);
      userId = null;
    }
  }

  // Initialize a structure for the final combined response
  let finalProfileResponse: any = {};

  try {
    const userProfileAndRecentSubmissionsData = await getUserProfileAndRecentSubmissionsCached(event, lcUsername);

    if (!userProfileAndRecentSubmissionsData || !userProfileAndRecentSubmissionsData.userProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: `LeetCode profile for username '${lcUsername}' not found or failed to retrieve.`
      });
    }

    finalProfileResponse.matchedUser = {
      ...userProfileAndRecentSubmissionsData.userProfile,
      recentSubmissionList: userProfileAndRecentSubmissionsData.recentSubmissions,
    };

    const userAvatarUrl = userProfileAndRecentSubmissionsData.userProfile.profile?.userAvatar;
    if (userId && userAvatarUrl) {
      try {
        await prisma.user.update({
          where: { id: userId },
          data: { userAvatar: userAvatarUrl },
        });
        console.log(`[DB] Successfully updated user ${userId}'s avatar with: ${userAvatarUrl}`);
      } catch (dbError) {
        console.error(`[DB Error] Failed to update user ${userId}'s avatar:`, dbError);
      }
    }

    //  Fetch User Calendar (Cached) 
    const currentYear = new Date().getFullYear();
    const userCalendarData = await getUserCalendarCached(event, lcUsername, currentYear) || {};
    finalProfileResponse.matchedUser.userCalendar = userCalendarData;
    if (userCalendarData.activeYears && Array.isArray(userCalendarData.activeYears)) {
      userCalendarData.activeYears.sort((a: number, b: number) => b - a);
    }

    //Fetch User Language Problem Counts (Cached)
    const userLanguageProblemCountData = await getUserLanguageProblemCountCached(event, lcUsername) || [];
    userLanguageProblemCountData.sort((a, b) => b.problemsSolved - a.problemsSolved);
    finalProfileResponse.matchedUser.languageProblemCount = userLanguageProblemCountData;

    //Fetch User Contest Ranking (Cached) 
    const userContestRankingData = await getUserContestRankingCached(event, lcUsername);
    if (userContestRankingData) {
      finalProfileResponse.matchedUser.userContestRanking = userContestRankingData;
    }

    // Fetch User Question Progress (Cached) 
    const userQuestionProgressData = await getUserQuestionProgressCached(event, lcUsername);
    if (userQuestionProgressData) {
      finalProfileResponse.matchedUser.userQuestionProgress = userQuestionProgressData;
    }

    // Fetch Streak Counter (Cached) 
    // This query usually requires authentication via cookies. Ensure graphqlFetch handles it.
    const streakCounterData = await getStreakCounterCached(event);
    if (streakCounterData) {
      finalProfileResponse.streakCounter = streakCounterData;
    }

    // Fetch Tag Problem Counts (Cached)
    const tagProblemCountsData = await getTagProblemCountsCached(event, lcUsername);
    if (tagProblemCountsData) {
      finalProfileResponse.matchedUser.tagProblemCounts = tagProblemCountsData;
    }

    // Fetch User Status (Cached) 
    // This query usually requires authentication via cookies. Ensure graphqlFetch handles it.
    const userStatusData = await getUserStatusCached(event);
    if (userStatusData) {
      finalProfileResponse.userStatus = userStatusData;
    }

  } catch (error: any) {
    console.error('Error in /api/user/profile.get.ts:', error);
    // Propagate specific H3 errors, otherwise return a generic 500
    if (error.statusCode) {
      throw error;
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred while processing profile data.',
      });
    }
  }

  return { data: finalProfileResponse, message: "Successfully retrieved comprehensive user profile." };
});