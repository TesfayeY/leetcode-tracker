//The purpose of this middleware is to check if the user is authenticated and if not, 
//redirect them to the login page. This route is used to access pages only for authenticated users.


// Define a Nuxt route middleware to check authentication
export default defineNuxtRouteMiddleware(async () => {
  console.log('Auth Middleware: Checking authentication');

  // Call the 'me' function to verify authentication status
  const response = await me();
  console.log('Auth Middleware: /api/auth/me response:', response); // Log the response

  // If not authenticated, redirect to the login page
  if (!response.success) { 
    console.log('Auth Middleware: Not authenticated, redirecting to /login');
    return navigateTo('/login');
  } else {
    console.log('Auth Middleware: Authenticated');
    return true;
  }
});

// Function to check the authentication status by calling the backend API
const me = async () => {
  // Retrieve the token from cookies
  const token = useCookie('token').value || "";
  console.log('Auth Middleware: Token:', token);

  // If token is missing, return an error response
  if (!token) {
    console.log('Token is missing in the cookie');
    return { success: false, message: 'Token is missing' };
  }

  // Call the backend API to verify the token
  return await $fetch('/api/auth/me', { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }) 
  }).then((data: any) => { 
    console.log('Auth Middleware: /api/auth/me response:', data);
    return data;
  }).catch((error) => {
    console.log('Auth Middleware: Error:', error);

    // Return an error response if the API call fails
    return {
      success: false,
      message: error.message
    };
  });
}