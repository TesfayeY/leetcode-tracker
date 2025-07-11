import { defineEventHandler, readBody } from 'h3';
import { updateUserPreference } from '../../preferenceService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'PUT') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  const body = await readBody(event);

  if ('isNotify' in body) {
    return updateUserPreference(event, 'all');
  } 
  
  if ('isAutoNotify' in body) {
    return updateUserPreference(event, 'auto');
  }

  if ('notificationType' in body) {
    return updateUserPreference(event, 'individual');
  }
  
  event.res.statusCode = 400;
  return { message: 'Missing fields' };
});