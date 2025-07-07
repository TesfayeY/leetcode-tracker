import { defineEventHandler } from 'h3';
import { getLeetcodeProfile } from '../../profileService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'GET') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  let leetcodeProfile = {};
  let languageProfile = [];
  
  await getLeetcodeProfile(event, 'getUserProfile').then((response) => {
    leetcodeProfile = response.data;
  });

  await getLeetcodeProfile(event, 'getUserLangProblemsCount').then((response) => {
    languageProfile = response.data.matchedUser.languageProblemCount;
  })

  // Sort the language in descending order on # of problems solved
  languageProfile.sort((first, second) => second.problemsSolved - first.problemsSolved);
  leetcodeProfile.matchedUser.languageProblemsCount = languageProfile;
  
  return { data: leetcodeProfile, message: "Successfully retrieve user profile"}
});