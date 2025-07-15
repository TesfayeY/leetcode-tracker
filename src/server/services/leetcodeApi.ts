import { H3Event } from 'h3';
import { graphqlFetch } from './../utils/graphqlFetch';
import graphqlParse from './../utils/graphql-parse';

// --- Interfaces for LeetCode API Responses ---
interface AcSubmissionNum { difficulty: string; count: number; submissions: number; }
interface TotalSubmissionNum { difficulty: string; count: number; submissions: number; }
interface LeetCodeProfileData {
	username: string;
	githubUrl?: string;
	linkedinUrl?: string;
	profile?: {
		realName?: string;
		userAvatar?: string;
		reputation?: number;
		ranking?: number;
		skillTags?: string[];
		certificationLevel?: number;
		solutionCount?: number;
	};
	submitStats?: {
		acSubmissionNum: AcSubmissionNum[];
		totalSubmissionNum: TotalSubmissionNum[];
	};
}
interface RecentSubmission {
	title: string;
	titleSlug: string;
	timestamp: string;
	statusDisplay: string;
	lang: string;
}
interface UserProfileAndRecentSubmissions {
	userProfile: LeetCodeProfileData;
	recentSubmissions: RecentSubmission[];
}
interface UserCalendar {
	activeYears: number[];
	streak: number;
	submissionCalendar: string;
	totalActiveDays: number;
}
interface UserContestRanking {
	attendedContestsCount: number;
	globalRanking: number;
	totalParticipants: number;
	topPercentage: number;
	badge?: { name: string; };
}
interface LanguageProblemCount {
	languageName: string;
	problemsSolved: number;
}
interface UserQuestionProgress {
	numAcceptedQuestions: Array<{ difficulty: string; count: number }>;
	numFailedQuestions: Array<{ difficulty: string; count: number }>;
	numUntouchedQuestions: Array<{ difficulty: string; count: number }>;
	totalQuestionBeatsPercentage: number;
	userSessionBeatsPercentage: Array<{ difficulty: string; percentage: number }>;
}
interface AllQuestionsCount {
	difficulty: string;
	count: number;
}
interface DailyChallengeQuestion {
	date: string;
	userStatus?: string;
	link: string;
	question?: {
		titleSlug: string; title: string; translatedTitle: string; acRate: number; difficulty: string; freqBar: number;
		questionFrontendId: string; isPaidOnly: boolean; status?: string; hasSolution: boolean;
		topicTags: Array<{ name: string; slug: string }>;
	};
}
interface StreakCounter {
	streakCount: number | null;
	daysSkipped: number | null;
	currentDayCompleted: boolean;
}
interface FavoriteList {
	description?: string; hasCurrentQuestion: boolean; isPublicFavorite: boolean; name: string;
	questionNumber: number; viewCount: number;
}
interface CreatedPublicFavoriteList {
	favorites: FavoriteList[]; hasMore: boolean; totalLength: number;
}
interface TagProblemCountDetail {
	tagName: string; tagSlug: string; problemsSolved: number;
}
interface TagProblemCounts {
	advanced: TagProblemCountDetail[];
	fundamental: TagProblemCountDetail[];
	intermediate: TagProblemCountDetail[];
}
interface UserStatus {
	userId?: number; username?: string; realName?: string; avatar?: string; isSignedIn: boolean;
	isMockUser: boolean; isPremium: boolean; isVerified: boolean; isAdmin: boolean; isSuperuser: boolean;
	isTranslator: boolean; checkedInToday: boolean; permissions?: string[];
}


// --- Functions to fetch specific data from LeetCode GraphQL ---

/**
 * Fetches a user's comprehensive profile and recent submissions.
 * Corresponds to `getUserProfile.graphql`.
 * @param username The LeetCode username.
 * @param numRecentSubmission Number of recent submissions to fetch (default 10).
 * @returns User profile data including recent submissions, or null.
 */
async function fetchUserProfileAndRecentSubmissionsFromLeetCode(
	username: string,
	numRecentSubmission: number = 10
): Promise<UserProfileAndRecentSubmissions | null> {
	console.log(`[LeetCode API] Fetching comprehensive profile for: ${username}`);
	const query = graphqlParse('getUserProfile');
	if (!query) {
		console.error('GraphQL query for getUserProfile.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query, { username, numRecentSubmission });
		const data = response?.data;
		if (data && data.matchedUser) {
			return {
				userProfile: {
					username: data.matchedUser.username,
					githubUrl: data.matchedUser.githubUrl,
					linkedinUrl: data.matchedUser.linkedinUrl,
					profile: {
						realName: data.matchedUser.profile?.realName,
						userAvatar: data.matchedUser.profile?.userAvatar,
						reputation: data.matchedUser.profile?.reputation,
						ranking: data.matchedUser.profile?.ranking,
						skillTags: data.matchedUser.profile?.skillTags,
						certificationLevel: data.matchedUser.profile?.certificationLevel,
						solutionCount: data.matchedUser.profile?.solutionCount,
					},
					submitStats: data.matchedUser.submitStats,
				},
				recentSubmissions: data.recentSubmissionList || [],
			};
		}
	} catch (error) {
		console.error(`Error fetching user profile and submissions for ${username}:`, error);
	}
	return null;
}

/**
 * Fetches user calendar data. Corresponds to `getUserActiveDays.graphql`.
 * @param username The LeetCode username.
 * @param year The year for which to fetch calendar data.
 * @returns User calendar data or null.
 */
async function fetchUserCalendarFromLeetCode(username: string, year: number): Promise<UserCalendar | null> {
	console.log(`[LeetCode API] Fetching calendar for ${username} in ${year}.`);
	const query = graphqlParse('getUserActiveDays');
	if (!query) {
		console.error('GraphQL query for getUserActiveDays.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query, { username, year });
		const data = response?.data;
		if (data && data.matchedUser && data.matchedUser.userCalendar) {
			return data.matchedUser.userCalendar;
		}
	} catch (error) {
		console.error(`Error fetching user calendar for ${username}:`, error);
	}
	return null;
}

/**
 * Fetches user contest ranking. Corresponds to `getUserContest.graphql`.
 * @param username The LeetCode username.
 * @returns User contest ranking data or null.
 */
async function fetchUserContestRankingFromLeetCode(username: string): Promise<UserContestRanking | null> {
	console.log(`[LeetCode API] Fetching contest ranking for ${username}.`);
	const query = graphqlParse('getUserProfile');
	if (!query) {
		console.error('GraphQL query for getUserContest.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query, { username });
		const data = response?.data;
		if (data && data.streakCount) {
			return data.streakCount;
		}
	} catch (error) {
		console.error(`Error fetching user contest ranking for ${username}:`, error);
	}
	return null;
}



/**
 * Fetches language problem counts for a user. Corresponds to `getUserLangProblemsCount.graphql`.
 * @param username The LeetCode username.
 * @returns An array of language problem counts or null.
 */
async function fetchUserLanguageProblemCountFromLeetCode(username: string): Promise<LanguageProblemCount[] | null> {
	console.log(`[LeetCode API] Fetching language problem counts for ${username}.`);
	const query = graphqlParse('getUserLangProblemsCount');
	if (!query) {
		console.error('GraphQL query for getUserLangProblemsCount.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query, { username });
		const data = response?.data;
		if (data && data.matchedUser && data.matchedUser.languageProblemCount) {
			return data.matchedUser.languageProblemCount;
		}
	} catch (error) {
		console.error(`Error fetching language problem counts for ${username}:`, error);
	}
	return null;
}

/**
 * Fetches user question progress (accepted, failed, untouched counts). Corresponds to `getUserQuestionProgress.graphql`.
 * @param username The LeetCode username.
 * @returns User question progress data or null.
 */
async function fetchUserQuestionProgressFromLeetCode(username: string): Promise<UserQuestionProgress | null> {
	console.log(`[LeetCode API] Fetching question progress for ${username}.`);
	const query = graphqlParse('getUserQuestionProgress');
	if (!query) {
		console.error('GraphQL query for getUserQuestionProgress.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query, { username });
		const data = response?.data;
		if (data && data.userProfileUserQuestionProgressV2) {
			return data.userProfileUserQuestionProgressV2;
		}
	} catch (error) {
		console.error(`Error fetching user question progress for ${username}:`, error);
	}
	return null;
}

/**
 * Fetches all problem counts by difficulty. Corresponds to `getAllProblemsCount.graphql`.
 * @returns An array of all question counts by difficulty or null.
 */
async function fetchAllProblemsCountFromLeetCode(): Promise<AllQuestionsCount[] | null> {
	console.log(`[LeetCode API] Fetching all problems count.`);
	const query = graphqlParse('getAllProblemsCount');
	if (!query) {
		console.error('GraphQL query for getAllProblemsCount.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query);
		const data = response?.data;
		if (data && data.allQuestionsCount) {
			return data.allQuestionsCount;
		}
	} catch (error) {
		console.error(`Error fetching all problems count:`, error);
	}
	return null;
}

/**
 * Fetches the active daily coding challenge question. Corresponds to `getDailyProblem.graphql`.
 * @returns Daily coding challenge question data or null.
 */
async function fetchDailyCodingChallengeQuestionFromLeetCode(): Promise<DailyChallengeQuestion | null> {
	console.log(`[LeetCode API] Fetching daily coding challenge question.`);
	const query = graphqlParse('getDailyProblem');
	if (!query) {
		console.error('GraphQL query for getDailyProblem.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query);
		const data = response?.data;
		if (data && data.activeDailyCodingChallengeQuestion) {
			return data.activeDailyCodingChallengeQuestion;
		}
	} catch (error) {
		console.error(`Error fetching daily coding challenge question:`, error);
	}
	return null;
}

/**
 * Fetches the user's streak counter. Corresponds to `getUserStreak.graphql`.
 * NOTE: This query likely requires authentication (cookies/crsftoken).
 * @returns Streak counter data or null.
 */
async function fetchStreakCounterFromLeetCode(): Promise<StreakCounter | null> {
	console.log(`[LeetCode API] Fetching streak counter.`);
	const query = graphqlParse('getUserStreak');
	if (!query) {
		console.error('GraphQL query for getUserStreak.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query); // No variables needed, but pass event for auth
		const data = response?.data;

		if (data && data.streakCount) {
			return data.streakCount;
		}
	} catch (error) {
		console.error(`Error fetching streak counter:`, error);
	}
	return null;
}

/**
 * Fetches a user's created public favorite lists. Corresponds to `getUserFavoriteList.graphql`.
 * @param userSlug The user's slug (often the username).
 * @returns Created public favorite lists or null.
 */
async function fetchCreatedPublicFavoriteListFromLeetCode(userSlug: string): Promise<CreatedPublicFavoriteList | null> {
	console.log(`[LeetCode API] Fetching created public favorite lists for ${userSlug}.`);
	const query = graphqlParse('getUserFavoriteList');
	if (!query) {
		console.error('GraphQL query for getUserFavoriteList.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query, { userSlug });
		const data = response?.data;
		if (data && data.createdPublicFavoriteList) {
			return data.createdPublicFavoriteList;
		}
	} catch (error) {
		console.error(`Error fetching created public favorite lists for ${userSlug}:`, error);
	}
	return null;
}

/**
 * Fetches tag problem counts for a user. Corresponds to `getUserTagProblemCounts.graphql`.
 * @param username The LeetCode username.
 * @returns Tag problem counts or null.
 */
async function fetchTagProblemCountsFromLeetCode(username: string): Promise<TagProblemCounts | null> {
	console.log(`[LeetCode API] Fetching tag problem counts for ${username}.`);
	const query = graphqlParse('getUserTagProblemsCount');
	if (!query) {
		console.error('GraphQL query for getUserTagProblemCout.graphql not Not Found.');
		return null;
	}
	try {
		const response = await graphqlFetch(query, { username });
		const data = response?.data;
		if (data && data.matchedUser && data.matchedUser.tagProblemCounts) {
			return data.matchedUser.tagProblemCounts;
		}
	} catch (error) {
		console.error(`Error fetching tag problem counts for ${username}:`, error);
	}
	return null;
}

/**
 * Fetches the current user's status (signed in, premium, etc.). Corresponds to `getUserSession.graphql`.
 * NOTE: This query requires authentication (cookies/crsftoken).
 * @returns User status data or null.
 */
async function fetchUserStatusFromLeetCode(): Promise<UserStatus | null> {
	console.log(`[LeetCode API] Fetching user status.`);
	const query = graphqlParse('getUserSession');
	if (!query) {
		console.error('GraphQL query for getUserSession.graphql not found.');
		return null;
	}

	try {
		const response = await graphqlFetch(query); // No variables, but pass event for auth
		const data = response?.data;
		if (data && data.userStatus) {
			return data.userStatus;
		}
	} catch (error) {
		console.error(`Error fetching user status:`, error);
	}
	return null;
}

export {
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
};