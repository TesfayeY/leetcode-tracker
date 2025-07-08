import { PrismaClient } from '@prisma/client';
import { createError, defineEventHandler } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const groups = await prisma.group.findMany({
      // Include both the count of users AND specific user data for avatars
      include: {
        users: { // This includes the related 'User' records
          select: {
            id: true,
            userAvatar: true, // Select the userAvatar field
            // If you later decide to get avatars dynamically from an external API
            // you might also select lcUsername: true here.
          },
          // Optional: Limit the number of users whose avatars you fetch for the card list display.
          // This prevents fetching all user data for very large groups unnecessarily.
          take: 5, // For example, fetch avatars of the first 5 users
        },
        _count: { // This provides the total count of users in the group
          select: { users: true },
        },
      },
    });

    // Map the Prisma response to the desired format for the frontend
    const groupsWithUsersAndAvatars = groups.map(group => ({
      id: group.id,
      uniqueGroupId: group.uniqueGroupId,
      groupName: group.groupName,
      // Use the count from _count.users for the total number of users
      numberOfUsers: group._count.users,
      isActive: group.isActive,
      // Map the included user objects to only contain the necessary avatar data
      users: group.users.map(user => ({
        id: user.id,
        userAvatar: user.userAvatar // This will be null if no avatar is set in the DB
      })),
    }));

    return groupsWithUsersAndAvatars;
  } catch (error: any) {
    console.error('Error fetching groups with user avatars:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch groups',
      data: error.message, // Provide error message for better debugging
    });
  } finally {
    await prisma.$disconnect();
  }
});