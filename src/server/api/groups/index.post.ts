import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { groupName } = body;

    // 2. Validate input
    if (!groupName || typeof groupName !== 'string' || groupName.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Group name is required and must be a non-empty string.',
      });
    }

    // creawting group in the database
    const newGroup = await prisma.group.create({
      data: {
        groupName: groupName,
        // uniqueGroupId, numberOfUsers, and isActive will be handled by defaults by Prisma schema?
      },
    });

    return newGroup; // Nuxt will automatically serialize this to JSON and set 200 OK by default
  } catch (error: any) {
    console.error('Error creating group:', error);
    if (error.statusCode) {
      throw error;
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to create group. Please try again later.',
      });
    }
  } finally {
    await prisma.$disconnect(); // disconnect Prisma afyer each request in serverless environments
  }
});