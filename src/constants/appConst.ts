export const NUM_LANGUAGE_DISPLAY: number = 3;
export const NUM_INBOX_DEFAULT_DISPLAY: number = 5;
export const LEETCODE_SESSION_INSTRUCTION: string = 
`You can obtain the Leetcode Session 
by after login to Leetcode and open Browser Inspection, 
navigate to Application tab, 
click on the Cookies dropdown,
find the leetcode.com domain,
then seek for LEETCODE_SESSION value. 
Do not share this token!`;
// --- Define TTLs for different data types (in seconds) ---
export const REDIS_TTL_USER_PROFILE_RECENT_SUBMISSIONS = 300; // 5 minutes (for recent submissions)
export const REDIS_TTL_USER_CALENDAR = 3600 * 24; // 24 hours
export const REDIS_TTL_USER_CONTEST_RANKING = 3600 * 12; // 12 hour
export const REDIS_TTL_USER_LANGUAGE_PROBLEMS = 3600 * 6; // 6 hours
export const REDIS_TTL_USER_QUESTION_PROGRESS = 3600 * 3 // 3 hours
export const REDIS_TTL_ALL_PROBLEMS_COUNT = 3600 * 24 * 7; // 1 week
export const REDIS_TTL_DAILY_CHALLENGE = 3600 * 2; // 2 hours 
export const REDIS_TTL_STREAK_COUNTER = 300; // 5 minutes (needs auth)
export const REDIS_TTL_FAVORITE_LISTS = 3600 * 24; // 24 hours
export const REDIS_TTL_TAG_PROBLEM_COUNTS = 3600 * 12; // 12 hours
export const REDIS_TTL_USER_STATUS = 300; // 5 minutes (needs auth) 