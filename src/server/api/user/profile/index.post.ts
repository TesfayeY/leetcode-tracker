import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  const body = await readBody(event);
});