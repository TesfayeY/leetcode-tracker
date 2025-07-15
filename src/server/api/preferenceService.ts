import prisma from '../../database/db';
import { parseCookies, H3Event, getQuery, readBody, createError } from 'h3';
import { extractUserIdFromToken } from '../../jwt';

async function getPreferenceFromUserId(userId: number) {
  if (userId) {
    const allUserPreference = await prisma.preference.findUnique({
      where: {
        id: userId
      },
      select: {
        isNotify: true,
        isAutoNotify: true,
        isInboxNotify: true,
        isEmailNotify: true,
        isWebPushNotify: true,
        isStreakNotify: true,
        isCheckinNotify: true,
        isProblemNotify: true,
        isInboxMessage: true,
        isEmailMessage: true,
        isWebPushMessage: true,
        autoStreakDatetime: true,
        autoCheckinDatetime: true,
        autoProblemDatetime: true
      }
    });
    
    return allUserPreference;
  }
}

export async function getUserPreference(event: H3Event) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;

  try {
    if (userId) {
      const user = await prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized user' });
      }
    }

    const allPreferences = await getPreferenceFromUserId(userId);

    return { data: allPreferences, message: 'Sucessfully retrieve user preferences' };

  } catch (error: any) {
    throw error;
  }
}

export async function updateUserPreference(event: H3Event, type: string) {
  const cookies = parseCookies(event);
  const extractedUserId = await extractUserIdFromToken(cookies.token);
  const userId = extractedUserId !== null ? extractedUserId : undefined;
  const body = await readBody(event);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized user' });
    }

    switch (type) {
      case 'all':
        await prisma.preference.update({
          where: {
            userId: userId
          },
          data: {
            isNotify: body.isNotify,
            isAutoNotify: body.isAutoNotify,
            isInboxNotify: body.isInboxNotify,
            isEmailNotify: body.isEmailNotify,
            isWebPushNotify: body.isWebPushNotify,
            isStreakNotify: body.isStreakNotify,
            isCheckinNotify: body.isCheckinNotify,
            isProblemNotify: body.isProblemNotify,
            isInboxMessage: body.isInboxMessage,
            isEmailMessage: body.isEmailMessage,
            isWebPushMessage: body.isWebPushMessage,
          }
        });
        break;
      case 'auto':
        await prisma.preference.update({
          where: {
            userId: userId
          },
          data: {
            isAutoNotify: body.isAutoNotify,
            isStreakNotify: body.isStreakNotify,
            isCheckinNotify: body.isCheckinNotify,
            isProblemNotify: body.isProblemNotify,
          }
        });
        break;
      case 'individual':
        await prisma.preference.update({
          where: {
            userId: userId
          },
          data: {
            [body.notificationType]: body.value
          }
        });
        break;
      case 'datetime':
        await prisma.preference.update({
          where: {
            userId: userId
          },
          data: {
            [body.autoTimeInputType]: body.value
          }
        })
        break;
      default:
        throw createError({ statusCode: 500, statusMessage: 'Server error, cannot update preferences' });
    }
    
    const allPreferences = await getPreferenceFromUserId(userId);

    return { data: allPreferences, message: 'Sucessfully update user preferences' };

  } catch (error: any) {
    throw error;
  }
}