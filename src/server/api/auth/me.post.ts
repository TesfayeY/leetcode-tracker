import { checkJwtToken, createJwtToken } from "../../../jwt";
import prisma from '../../../database/db';

// Define the event handler for the POST request
export default defineEventHandler(async (event) => {
  // Read the request body
  const body = await readBody(event);
  const { token } = body;

  console.log('Received body:', body); // Log the entire request body
  console.log('Received token:', token); // Log the received token

  // Check if the token is missing
  if (!token) {
    console.log('Token is missing in the request body');
    return { success: false, message: 'Token is missing' };
  }

  // Validate the JWT token
  const isValid = await checkJwtToken(token);

  // If the token is invalid, return an error response
  if (!isValid.success) {
    console.log('Token is invalid:', isValid.message); // Log the invalid token message
    return { success: false, message: 'Invalid token' };
  }

  // Decode the token to get the user ID
  const decoded = isValid.decoded as { userId: number }; // Assuming decoded contains a 'userId' field
  console.log('Decoded token:', decoded); // Log the decoded token

  // Find the user in the database using the user ID
  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

  // If the user is not found, return an error response
  if (!user) {
    console.log('User not found for ID:', decoded.userId); // Log the user not found message
    return { success: false, message: 'User not found' };
  }

  // Refresh the JWT token
  const newToken = await createJwtToken(user.id);
  setCookie(event, "token", newToken); // Set the new token in the cookies
  setCookie(event, "user", JSON.stringify(user)); // Set the user info in the cookies

  // Remove sensitive information like password from the user object
  const { password, ...userWithoutPassword } = user;

  // Return a success response with the user info
  return { success: true, user: userWithoutPassword };
});
