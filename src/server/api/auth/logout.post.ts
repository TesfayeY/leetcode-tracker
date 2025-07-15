import { defineEventHandler, setCookie } from "h3";

export default defineEventHandler(async (event) => {
    // Remove the token and user cookies
    setCookie(event, "token", "", { maxAge: -1 }); // Correctly remove the token cookie
    setCookie(event, "user", "", { maxAge: -1 }); // Correctly remove the user cookie
    setCookie(event, "id" , "", { maxAge: -1 });
    setCookie(event, 'email', '', { maxAge: -1 });
    setCookie(event, 'name', '', { maxAge: -1 });
    setCookie(event, 'latestDailyProblemNotification', '', { maxAge: -1 });
    setCookie(event, 'latestCheckinNotification', '', { maxAge: -1 });
    setCookie(event, 'latestStreakNotification', '', { maxAge: -1 });
    setCookie(event, 'latestDailyProblemToken', '', { maxAge: -1 });
    setCookie(event, 'latestCheckinToken', '', { maxAge: -1 });
    setCookie(event, 'latestStreakToken', '', { maxAge: -1 });
    setCookie(event, 'preference', '', { maxAge: -1 });
    
    return {
        success: true,
        message: 'Logged out successfully'
    };
});
