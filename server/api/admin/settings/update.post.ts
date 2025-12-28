import { z } from 'zod'
import { defineAdminHandler } from '~~/server/utils/handler'
import { prisma } from '~~/server/lib/prisma'
import { successResponse, errorResponse, HTTP_STATUS } from '~~/server/utils/response'

const updateSettingsSchema = z.object({
    settings: z.array(z.object({
        key: z.string(),
        value: z.any(),
        description: z.string().optional()
    }))
})

export default defineAdminHandler(async (event) => {
    const body = await readBody(event)
    const validation = updateSettingsSchema.safeParse(body)

    if (!validation.success) {
        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: 'Validation Error',
            data: errorResponse('Invalid settings data', 'VALIDATION_ERROR', validation.error.errors)
        })
    }

    const { settings } = validation.data
    const results = []

    // Process updates in transaction
    await prisma.$transaction(async (tx) => {
        for (const setting of settings) {
            const result = await tx.system_settings.upsert({
                where: { key: setting.key },
                update: {
                    value: setting.value,
                    description: setting.description,
                },
                create: {
                    key: setting.key,
                    value: setting.value,
                    description: setting.description
                }
            })
            results.push(result)
        }
    })

    return successResponse(results, 'Settings updated successfully')
})
