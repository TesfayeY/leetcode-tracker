import prisma from '../../database/db';
import { parseCookies, H3Event, getQuery } from 'h3';
import { extractUserIdFromToken } from '../../jwt';

export async function getUserInboxMessages(event: H3Event) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;

  try {
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

    return { data: allUserInbox, message: 'Sucessfully retrieve user inbox' };

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

    return { data: allUserInbox, message: 'Sucessfully delete user inbox' };

  } catch(error: any) {
    throw error;
  }
}