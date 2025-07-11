import { defineEventHandler } from 'h3';
import { deleteUserInbox } from '../../inboxService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'DELETE') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  return deleteUserInbox(event);
});