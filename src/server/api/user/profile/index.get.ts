import { defineEventHandler } from 'h3';
import { getLeetcodeProfile } from '../../profileService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'GET') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }
  
  return getLeetcodeProfile(event, 'getUserProfile');
});