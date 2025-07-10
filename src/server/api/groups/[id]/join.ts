import { PrismaClient } from '@prisma/client';
import { createError, defineEventHandler, getCookie } from 'h3'; //for server side authentiation

const prisma = new PrismaClient(); 

export default defineEventHandler(async (event) => {
  try {
    const uniqueGroupId = event.context.params?.id;

    // read 'id' cookie set during login
    const userIdCookie = getCookie(event, 'id');
    let userId: number | null = null;

    if (userIdCookie) {
      try {
        userId = JSON.parse(userIdCookie);
        if (typeof userId !== 'number' || isNaN(userId)) {
          userId = null; // invalidate if not a valid id number
        }
      } catch (e) {
        console.error('Error parsing userId cookie:', e);
        userId = null; // Cookie content was not valid JSON
      }
    }

    if (!userId) {
      //if userId is null means either cookie missing or invalid, throw unauthorized error
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required. Please log in.',
      });
    }


    if (!uniqueGroupId || typeof uniqueGroupId !== 'string' || uniqueGroupId.trim() === '') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Group ID is required and must be a non-empty string.',
      });
    }

    // find group by its uniqueGroupId
    const group = await prisma.group.findUnique({
      where: {
        uniqueGroupId: uniqueGroupId,
      },
      include: {
        users: true, // include checking if user is already in the group
      },
    });

    if (!group) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Group not found with the provided ID.',
      });
    }

    // if the user is already a member of the group, just return and navigate to that group
    const isAlreadyMember = group.users.some((user) => user.id === userId);
    if (isAlreadyMember) {
      return {
        group: group
      };
    }

    // connect user to group
    const updatedGroup = await prisma.group.update({
      where: {
        uniqueGroupId: uniqueGroupId,
      },
      data: {
        users: {
          connect: {
            id: userId, // Use the authenticated userId here
          },
        },
        numberOfUsers: {
          increment: 1, 
        },
      },
      include: {
        users: true, 
      },
    });

    return {
      statusCode: 200,
      statusMessage: 'OK',
      message: 'Successfully joined the group!',
      group: updatedGroup,
    };
  } catch (error: any) {
    console.error('Error joining group:', error.message);
    if (error.statusCode) {
      throw error;
    } else {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to join group. Please try again later.',
      });
    }
  } finally {
    await prisma.$disconnect(); 
  }
});