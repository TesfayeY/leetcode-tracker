import { defineEventHandler } from 'h3';
import { getUserInboxMessages } from '../inboxService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'GET') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }
  
  return getUserInboxMessages(event);
});