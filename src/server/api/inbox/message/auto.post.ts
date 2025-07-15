import { defineEventHandler } from 'h3';
import { createAutoInboxMessage } from '../../inboxService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  return createAutoInboxMessage(event);
});