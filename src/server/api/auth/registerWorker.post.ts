import { createError, defineEventHandler } from "h3";
import bcrypt from 'bcrypt';
import prisma from "../../../database/db";
import { SYSTEM_WORKER_DISPLAYNAME } from '../../../constants/appConst';

export default defineEventHandler(async (event) => {
  if (event.req.method !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
  }

  const runtimeConfig = useRuntimeConfig();
  const hashedPassword = await bcrypt.hash(runtimeConfig.systemAdmin.appWorkerPassword, 10);

  try {
    const worker = await prisma.user.findUnique({
      where: {
        email: runtimeConfig.systemAdmin.appWorkerUsername
      }
    })

    if (worker) {
      console.log('Worker has been created...')
      return;
    }

    // Create system worker
    await prisma.user.create({
      data: {
        name: SYSTEM_WORKER_DISPLAYNAME,
        email: runtimeConfig.systemAdmin.appWorkerUsername,
        password: hashedPassword,
        lcUsername: "",
        userPreference: {
          create: [{}]
        }
      }
    })
  } catch(error) {

  }
});