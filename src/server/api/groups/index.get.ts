import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    const groupsWithUserCount = groups.map(group => ({
      id: group.id,
      uniqueGroupId: group.uniqueGroupId, // might include later
      groupName: group.groupName,
      numberOfUsers: group._count.users,
      isActive: group.isActive, // might include 
    }));

    return groupsWithUserCount;
  } catch (error) {
    console.error('Error fetching groups with user count:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch groups',
      data: error,
    });
  } finally {
    await prisma.$disconnect();
  }
});