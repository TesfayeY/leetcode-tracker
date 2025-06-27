import prisma from '../../../database/db';
import bcrypt from 'bcrypt';
import { defineEventHandler, readBody } from 'h3';

// Define the User interface
export interface User {
  id: number;
  name: string;
  email: string;
  success?: boolean; // Make success an optional property
}

export default defineEventHandler(async (event) => {
  //Checking if the request method is POST
  if (event.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  }

  //Reading the body of the request and splitting it into name, email, and password
  const body = await readBody(event);
  const { name, email, password, confirmPassword } = body;

  //If the name, email, or password fields are missing, send a message
  if (!name || !email || !password || !confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' });
  }

  // Check if the password and password confirmation match
  if (password !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Passwords do not match' });
  }

  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: {
      email: email
    }
  });

  if (user != null) {
    // Disconnect Prisma
    prisma.$disconnect();

    return {
      message: `The user with email "${email}" already exists`,
      success: false
    }
  } else {
    
    // Successfully login
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const createUser = await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
        }
      });

      // Construct a new object without the password property
      const { password, ...userWithoutPassword } = createUser;

      // Ensure userWithoutPassword is of type User and assign success
      const result: User = { ...userWithoutPassword, success: true };

      // Disconnect Prisma
      prisma.$disconnect();

      return result;

    } catch (error: any) {

      throw createError({ statusCode: 500, statusMessage: error.message });
    }
  }
});
