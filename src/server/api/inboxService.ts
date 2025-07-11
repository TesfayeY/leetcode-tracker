import prisma from '../../database/db';
import { parseCookies, H3Event, getQuery, readBody, createError } from 'h3';
import { extractUserIdFromToken } from '../../jwt';

async function getInboxFromUserId(userId: number) {
  const allUserInbox = await prisma.inbox.findMany({
    where: {
      recipientId: {
        equals: userId
      }
    },
    include: {
      sender: {
        select: {
          name: true
        }
      }
    }
  });
  
  return allUserInbox;
}

export async function getUserInboxMessages(event: H3Event) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;

  const user = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized user' });
  }

  try {
    const allUserInbox = await getInboxFromUserId(userId);

    return { data: allUserInbox, message: 'Sucessfully retrieve user inbox' };

  } catch(error: any) {
    throw error;
  }
}

export async function createUserInboxMessage(event: H3Event) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const body = await readBody(event);

  const recipientUsername = body.recipientUsername;
  const messageContent = body.messageContent;
  const isInvitation = body.isInvitation;

  try {
    // Get the recipient user id
    const recipient = await prisma.user.findUnique({
      where: {
        email: recipientUsername
      }
    });

    if (!recipient) {
      throw createError({ statusCode: 404, statusMessage: 'Recipient user not found' })
    }

    // Only create message if the token and both userId is valid
    if (userId !== undefined) {
      const message = await prisma.inbox.create({
        data: {
          recipient: {
            connect: {
              id: recipient.id
            }
          },
          sender: {
            connect: {
              id: userId
            }
          },
          context: messageContent,
          isInvitation: isInvitation,
          acknowledgement: 'RECEIVED'
        }
      });

      if (message === null) {
        throw createError({ statusCode: 500, statusMessage: 'Internal Server Error, cannot create message' })
      }
    }
    
    const allUserInbox = await getInboxFromUserId(userId);

    return { data: allUserInbox, message: 'Sucessfully send messages' };

  } catch (error: any) {
    throw error;
  }
}

export async function updateUserInbox(event: H3Event) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const queryParams = getQuery(event);

  const inboxId = parseInt(queryParams.inboxId.toString());
  const body = await readBody(event);

  try {
    const inbox = await prisma.inbox.findUnique({
        where: { id: inboxId },
    });

    if (!inbox) {
      throw createError({ statusCode: 404, message: 'Message not found' })
    }

    await prisma.inbox.update({
      where: { id: inboxId },
      data: { 
        acknowledgement: body.acknowledgement
      }
    });

    const allUserInbox = await getInboxFromUserId(userId);

    return { data: allUserInbox, message: 'Sucessfully update user inbox' };

  } catch(error: any) {
    throw error;
  }
}

export async function deleteUserInbox(event: H3Event) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const queryParams = getQuery(event);

  const inboxId = parseInt(queryParams.inboxId.toString());

  try {
    await prisma.inbox.delete({
      where: { 
        id: inboxId
      }
    });

    const allUserInbox = await getInboxFromUserId(userId);

    return { data: allUserInbox, message: 'Sucessfully delete user inbox' };

  } catch(error: any) {
    throw error;
  }
}