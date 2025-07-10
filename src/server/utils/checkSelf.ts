import prisma from '../../database/db';

export async function checkSelf(queryUsername: string, tokenUserId: number) {
  if (queryUsername === undefined || tokenUserId === undefined) {
    return false;
  }

  try {
    const user = await prisma.user.findUnique({ 
      where: { 
        email: queryUsername 
      } 
    });

    if (!user) {
      throw createError({statusCode: 401, statusMessage:'Invalid user'});
    }
    
    return tokenUserId === user.id;
  } catch (error: any) {
    throw createError({ statusCode: 500, statucMessage: 'Server Error' });
  }
}