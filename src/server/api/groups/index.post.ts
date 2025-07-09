import { PrismaClient } from '@prisma/client';
import { defineEventHandler, readBody, createError, getCookie } from 'h3';
import jwt from 'jsonwebtoken'; // Make sure jsonwebtoken is installed

const prisma = new PrismaClient();
const config = useRuntimeConfig(); // Access runtime config for JWT secret

export default defineEventHandler(async (event) => {
  let userId: number | null = null;
  const token = getCookie(event, 'token');

  if (token) {
    try {
      const decodedToken: any = jwt.verify(token, config.jwtSecret);
      userId = decodedToken.userId;
    } catch (jwtError) {
      console.error('Invalid or expired JWT token during group creation:', jwtError);
      setCookie(event, 'token', '', { maxAge: -1, path: '/' });
    }
  }

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required to create a group.',
    });
  }

  try {
    const body = await readBody(event);
    const { groupName } = body;

    if (!groupName || typeof groupName !== 'string' || groupName.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
        message: 'Group name is required and must be a non-empty string.',
      });
    }

    const newGroup = await prisma.group.create({
      data: {
        groupName: groupName,
        isActive: true,
        users: {
          connect: {
            id: userId, 
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            userAvatar: true,
          },
          take: 4, 
        },
        _count: {
          select: { users: true },
        },
      },
    });
    const createdGroupFormatted = {
      id: newGroup.id,
      uniqueGroupId: newGroup.uniqueGroupId,
      groupName: newGroup.groupName,
      numberOfUsers: newGroup._count.users, 
      isActive: newGroup.isActive,
      users: newGroup.users.map(user => ({
        id: user.id,
        userAvatar: user.userAvatar,
      })),
    };

    return createdGroupFormatted;

  } catch (error: any) {
    console.error('Error creating group:', error);
    if (error.statusCode) {
      throw error;
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: 'Failed to create group. Please try again later.',
        data: error 
      });
    }
  } finally {
    await prisma.$disconnect();
  }
});