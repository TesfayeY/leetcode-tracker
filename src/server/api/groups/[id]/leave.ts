import { defineEventHandler, createError, parseCookies } from 'h3'
import { extractUserIdFromToken } from '../../../../jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const uniqueGroupId = event.context.params?.id as string
  if (!uniqueGroupId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing group ID' })
  }

  // auth
  const cookies = parseCookies(event)
  const userId  = await extractUserIdFromToken(cookies.token)
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  try {
    // remove membership + decrement count
    await prisma.group.update({
      where: { uniqueGroupId },
      data: {
        users:          { disconnect: { id: userId } },
        numberOfUsers:  { decrement: 1 }
      }
    })
    return { success: true, message: 'Left group' }
  } catch (err: any) {
    console.error('Error leaving group:', err)
    throw createError({ statusCode: 500, statusMessage: 'Could not leave group' })
  } finally {
    await prisma.$disconnect()
  }
})