import { defineEventHandler, readBody } from 'h3';
import { validateLeetcodeUsername } from '../../profileService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  const body = await readBody(event);

  if ('streak' in body) {
    return validateLeetcodeUsername(event, "getUserStreak");
  }

  if ('sessionToken' in body) {
    return validateLeetcodeUsername(event, "getUserSession");
  }

  event.res.statusCode = 400;
  return { message: 'Missing fields' };
});