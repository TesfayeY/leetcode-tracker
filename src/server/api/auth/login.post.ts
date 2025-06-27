import bcrypt from 'bcrypt';
import { defineEventHandler, readBody } from 'h3';
import prisma from '../../../database/db';
import { createJwtToken } from '../../../jwt';

export default defineEventHandler(async (event) => {
  

  console.log('Request received');

  if (event.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  }

  //Reading the body of the request and splitting it into name, email, and password
  const body = await readBody(event);
  const { email, password } = body;
  
  

  // Validate presence of email and password
  setCookie(event, "email", email); 
  
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing email or password' });
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: {
       email: email
    },
    select: {
      id: true,
      email: true,
      name: true,
      password: true
    }
   });
   
   console.log('User found:', user);

 if(user){
    const match = await bcrypt.compare(password, user.password);

    if(match){
       const token = await createJwtToken(user.id); // Pass user ID to createJwtToken

       setCookie(event, "token", token); // Corrected to set the token in the cookie
       console.log('Token set:', token);
       
       // Destructure the user object to exclude the password property
       const { password, ...userWithoutPassword } = user;
       
       // Store encrypted user data in cookie without the password
       setCookie(event, "user", JSON.stringify(userWithoutPassword));
       setCookie(event, "id", JSON.stringify(user.id));
       console.log('User data stored in cookie:', userWithoutPassword);
       console.log('User ID stored in cookie:', user.id);

       prisma.$disconnect();

       // Prepare user object for response without directly mutating the original user object
       const responseUser = { ...userWithoutPassword, token: token, success: true };
      
       console.log('User logged in:', responseUser);
       return responseUser;
    } else {
      throw createError({ statusCode: 401, statusMessage: 'Invalid password' });
    }
 } else {
    prisma.$disconnect();
    throw createError({ statusCode: 404, statusMessage: 'User not found' });
 }
});
