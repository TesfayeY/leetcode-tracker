export default defineEventHandler(async (event) => {
    // Remove the token and user cookies
    setCookie(event, "token", "", { maxAge: -1 }); // Correctly remove the token cookie
    setCookie(event, "user", "", { maxAge: -1 }); // Correctly remove the user cookie
    setCookie(event,"id" , "", { maxAge: -1 });
    
    return {
        success: true
    };
});
