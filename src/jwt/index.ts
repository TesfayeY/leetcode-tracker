import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

// Retrieve the JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET as string;

// Interface for the result of JWT token verification
export interface JwtTokenResult {
  success: boolean;
  decoded?: any;
  name?: string;
  message?: string;
  userId?: number;
}

// Function to create a JWT token for a given user ID
export const createJwtToken = async (userId: number) => {
  // Sign the token with the user ID and secret, set to expire in 30 minutes
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30m" });
  console.log('Token created:', token); // Log the created token
  return token;
};
// Function to verify a given JWT token
export const checkJwtToken = (token: string): Promise<JwtTokenResult> => {
  return new Promise((resolve) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        let { name, message } = err;
        console.error('Token validation error:', err); // Use error logging
        resolve({
          name: name,
          message: message,
          success: false
        });
      } else {
        const payload = decoded as JwtPayload;
        resolve({
          success: true,
          decoded: payload,
          userId: payload.userId
        });
      }
    });
  });
};

// Function to extract userId from a given JWT token
export const extractUserIdFromToken = async (token: string): Promise<number | null> => {
  try {
    const result = await checkJwtToken(token);
    if (result.success && result.userId) {
      console.log('Extracted userId:', result.userId);
      return result.userId;
    } else {
      console.warn('Failed to extract userId:', result.message); // Use warning logging
      return null;
    }
  } catch (error) {
    console.error('Error extracting userId from token:', error);
    return null;
  }
};

