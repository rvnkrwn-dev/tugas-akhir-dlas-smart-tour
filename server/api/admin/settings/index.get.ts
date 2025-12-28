import { defineAdminHandler } from '~~/server/utils/handler'
import { prisma } from '~~/server/lib/prisma'
import { successResponse } from '~~/server/utils/response'

export default defineAdminHandler(async (event) => {
    const settings = await prisma.system_settings.findMany()

    // Transform array to object for easier frontend consumption
    const settingsMap = settings.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
    }, {} as Record<string, any>)

    return successResponse(settingsMap, 'Admin settings retrieved')
})
