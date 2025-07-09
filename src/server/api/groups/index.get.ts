import { PrismaClient } from '@prisma/client';
import { defineEventHandler, createError, getCookie } from 'h3'; 
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const config = useRuntimeConfig(); // Access runtime config for JWT secret

export default defineEventHandler(async (event) => {
  let userId: number | null = null;
  const token = getCookie(event, 'token'); // Get the token from cookies

  if (token) {
    try {
      const decodedToken: any = jwt.verify(token, config.jwtSecret); // Use JWT secret from runtime config,find groups only for current user
      userId = decodedToken.userId;
    } catch (jwtError) {
      console.error('Invalid or expired JWT token:', jwtError);
      setCookie(event, 'token', '', { maxAge: -1, path: '/' });
      
    }
  }

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Authentication required to fetch groups.',
    });
  }

  try {
    const groups = await prisma.group.findMany({
      where: {
        users: {
          some: {
            id: userId, // Filter groups where at least 'some' user has this userId
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

    const groupsWithUsers = groups.map(group => ({
      id: group.id,
      uniqueGroupId: group.uniqueGroupId,
      groupName: group.groupName,
      numberOfUsers: group._count.users,
      isActive: group.isActive,
      users: group.users.map(user => ({
        id: user.id,
        userAvatar: user.userAvatar,
      })),
    }));

    // to prevent caching of previous user group data from server side
    event.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    event.res.setHeader('Pragma', 'no-cache');
    event.res.setHeader('Expires', '0');

    return groupsWithUsers;
  } catch (error) {
    console.error('Error fetching groups with user data:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch groups with user data',
      data: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});