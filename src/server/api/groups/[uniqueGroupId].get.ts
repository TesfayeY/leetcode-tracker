import { defineEventHandler, createError, parseCookies } from 'h3'
import { extractUserIdFromToken } from '../../../jwt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to fetch group details
async function getGroupDetails(uniqueGroupId: string, userId: number) {
  // console.log(`Fetch group ${uniqueGroupId} for user ${userId}`)
  const group = await prisma.group.findFirst({
    where: {
      uniqueGroupId,
      users: { some: { id: userId } }
    },
    include: {
      users: { select: { id: true, name: true, email: true } }
    }
  })
  if (!group) {
    // console.warn(`Group ${uniqueGroupId} not found or not a member`)
    throw createError({ statusCode: 404, statusMessage: 'Group not found or access denied.' })
  }
  return group
}

export default defineEventHandler(async (event) => {
  const uniqueGroupId = event.context.params?.uniqueGroupId as string
  // console.log(`[GROUP DETAILS] Request for ${uniqueGroupId}`)

  try {
    const cookies = parseCookies(event)
    const userId  = await extractUserIdFromToken(cookies.token)
    if (!userId) {
      // console.warn(`[GROUP DETAILS] Unauthorized for ${uniqueGroupId}`)
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
    if (!uniqueGroupId) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid group ID' })
    }

    return await getGroupDetails(uniqueGroupId, userId)
  } catch (err: any) {
    // console.error(`[GROUP DETAILS] Error for ${uniqueGroupId}:`, err)
    throw createError({
      statusCode:    err.statusCode    || 500,
      statusMessage: err.statusMessage || 'Error fetching group details.'
    })
  }
})