import { defineEventHandler, readBody, createError, parseCookies, assertMethod } from 'h3'
import { PrismaClient } from '@prisma/client'
import { extractUserIdFromToken } from '../../../../jwt'
import { createMessageFromSenderRecipient } from '../../inboxService'
import { encryptSymmetric } from '~/composables/encryption'
import { useRuntimeConfig } from '#imports'


const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  assertMethod(event, 'POST')

  const uniqueGroupId = event.context.params?.id as string
  if (!uniqueGroupId) {
    throw createError({ statusCode: 400, statusMessage: 'Group ID is required.' })
  }

  const body = await readBody(event);
  let usersToInvite: string[] = [];

  if (body) {
    if (body.users && Array.isArray(body.users)) {
      usersToInvite = body.users;
    } else if (Array.isArray(body)) {
      usersToInvite = body;
    } else if (typeof body === 'object') {
      const allValues = Object.values(body);
      const stringValues = allValues.filter(val => typeof val === 'string') as string[];
      if (stringValues.length > 0) {
        usersToInvite = stringValues;
      }
    }
  }

  if (!usersToInvite || !Array.isArray(usersToInvite) || usersToInvite.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Usernames array is required.' })
  }

  const cookies = parseCookies(event)
  const inviterId = await extractUserIdFromToken(cookies.token)
  if (!inviterId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    console.log('Starting invite process...');
    // Verify the inviter is a member of the group
    const group = await prisma.group.findFirst({
      where: {
        uniqueGroupId,
        users: { some: { id: inviterId } },
      },
      include: {
        users: { select: { email: true } }
      }
    })
    console.log('Group lookup result:', group);

    if (!group) {
      console.error('Group not found or inviter is not a member.');
      throw createError({ statusCode: 403, statusMessage: 'Access denied or group not found.' })
    }

    const existingUserEmails = new Set(group.users.map(u => u.email));
    console.log('Existing user emails in group:', existingUserEmails);

    const newUserEmails = usersToInvite.filter(email => !existingUserEmails.has(email));
    console.log('Filtered new user emails to invite:', newUserEmails);
    
    const usersToAdd = await prisma.user.findMany({
      where: { email: { in: newUserEmails } },
      select: { id: true, email: true },
    })
    console.log('Users found to add:', usersToAdd);

    if (usersToAdd.length === 0) {
      console.error('No users found to invite.');
      throw createError({ statusCode: 404, statusMessage: 'None of the invited users were found.' })
    }

    // Encrypt the message content before saving to inbox
    const runtimeConfig = useRuntimeConfig();
    const messageText = `Group invite: ${group.groupName} [${group.uniqueGroupId}]`;
    console.log('Message text to encrypt:', messageText);
    
    await Promise.all(usersToAdd.map(async user => {
      console.log('About to create inbox message:', { inviterId, recipientId: user.id, encryptedMessageLength: messageText.length });
      try {
        await createMessageFromSenderRecipient(
          inviterId,
          user.id,
          messageText,
          true
        );
        console.log('Inbox message created for', user.email);
      } catch (err) {
        console.error('Failed to create inbox message for', user.email, err);
        throw err;
      }
    }));

    console.log('All invitations processed successfully.');
    return { message: 'Invitations sent successfully.' }
  } catch (error: any) {
    console.error('Error in invite process:', error);
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Failed to send invitations.',
    })
  }
})