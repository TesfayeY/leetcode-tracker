import { defineEventHandler } from 'h3';
import { createUserInboxMessage } from '../../inboxService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  return createUserInboxMessage(event);
});