// server/api/user/profile.get.ts

import { defineEventHandler, getQuery, getCookie, createError } from 'h3'; // Ensure getQuery, getCookie, createError are imported
import { getLeetcodeProfile } from '../../profileService';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

const prisma = new PrismaClient(); // Initialize PrismaClient

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'GET') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  // --- Start of added/modified logic ---

  // Get lcUsername from query parameters
  const { lcUsername, username } = getQuery(event);
  if (typeof lcUsername !== 'string' || !lcUsername.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'LeetCode username is required.',
    });
  }

  // Get userId from authentication cookie
  const userIdCookie = getCookie(event, 'id');
  let userId: number | null = null;
  if (userIdCookie) {
    try {
      userId = parseInt(JSON.parse(userIdCookie));
      if (isNaN(userId)) {
        userId = null; // Invalidate if not a valid number
      }
    } catch (e) {
      console.error('Error parsing userId cookie:', e);
      userId = null;
    }
  }

  // --- End of added/modified logic ---

  let leetcodeProfile: any = {};
  let languageProfile: any[] = [];
  let submissionProfile: any = {};

  try {
    // Pass lcUsername to getLeetcodeProfile for the profile call
    const profileResponse = await getLeetcodeProfile(event, 'getUserProfile'); // <-- Pass lcUsername here
    leetcodeProfile = profileResponse.data;

    // Pass lcUsername to subsequent getLeetcodeProfile calls as well
    const langResponse = await getLeetcodeProfile(event, 'getUserLangProblemsCount');
    languageProfile = langResponse.data?.matchedUser?.languageProblemCount || [];

    const submissionResponse = await getLeetcodeProfile(event, 'getUserActiveDays');
    submissionProfile = submissionResponse.data?.matchedUser?.userCalendar || {};

  } catch (error: any) {
    console.error('Error in profile.get.ts:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
      message: error.message || 'Failed to retrieve user profile.',
    });
  } finally {
    await prisma.$disconnect(); // Ensure Prisma disconnects
  }

  // Sort the language in descending order on # of problems solved
  languageProfile.sort((first, second) => second.problemsSolved - first.problemsSolved);
  // Ensure activeYears is an array before sorting
  if (submissionProfile.activeYears && Array.isArray(submissionProfile.activeYears)) {
    submissionProfile.activeYears.sort((first: number, second: number) => second - first);
  }

  // Ensure these nested objects exist before assigning
  if (!leetcodeProfile.matchedUser) {
    leetcodeProfile.matchedUser = {};
  }
  leetcodeProfile.matchedUser.languageProblemsCount = languageProfile;
  leetcodeProfile.matchedUser.userCalendar = submissionProfile;

  return { data: leetcodeProfile, message: "Successfully retrieve user profile" };
});