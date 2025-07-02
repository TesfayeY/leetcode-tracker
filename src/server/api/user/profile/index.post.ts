import { defineEventHandler, readBody } from 'h3';
import { addLeetcodeUsername } from '../../profileService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  const body = await readBody(event);

  if ('lcUsername' in body) {
    return addLeetcodeUsername(event, "getUserProfile");
  } else {
    event.res.statusCode = 400;
    return { message: 'Missing fields' };
  }
});