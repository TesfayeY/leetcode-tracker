import { defineEventHandler } from 'h3';
import { getLeetcodeProblem } from '../problemService';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'GET') {
    event.res.statusCode = 405;
    console.log('Method not allowed');
    return { message: 'Method not allowed' };
  }

  return getLeetcodeProblem(event, 'getDailyProblem');
});