//The purpose of this middleware is to check if the user is authenticated and if so, 
//redirect them to the welcome page. This route is used to access pages only for unauthenticated users,
//like the registeration and login pages.

// Define a Nuxt route middleware to check if the user is not authenticated
export default defineNuxtRouteMiddleware(async () => {
  console.log('Not-Auth Middleware: Checking authentication');

  // Call the 'me' function to verify authentication status
  const response = await me();

  // If authenticated, redirect to the welcome page
  if (response.success) {
    console.log('Not-Auth Middleware: Already authenticated, redirecting to /welcome');
    return navigateTo('/welcome');
  } else {
    console.log('Not-Auth Middleware: Not authenticated');
    return true;
  }
});

// Function to check the authentication status by calling the backend API
const me = async () => {
  // Retrieve the token from cookies
  const token = useCookie('token').value || "";
  console.log('Not-Auth Middleware: Token:', token);

  // If token is missing, return an error response
  if (!token) {
    console.log('Not-Auth Middleware: No token found, user is not authenticated');
    return { success: false };
  }

  // Call the backend API to verify the token
  return await $fetch('/api/auth/me', { 
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }) 
  }).then((data: any) => { 
    console.log('Not-Auth Middleware: /api/auth/me response:', data);
    return data;
  }).catch((error) => {
    console.log('Not-Auth Middleware: Error:', error);

    // Return an error response if the API call fails
    return { success: false };
  });
};