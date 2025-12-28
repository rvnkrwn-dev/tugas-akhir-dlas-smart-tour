import { defineEventHandler } from 'h3'
import { prisma } from '~~/server/lib/prisma'
import { successResponse } from '~~/server/utils/response'

export default defineEventHandler(async (event) => {
    // Fetch relevant public settings
    // For now, only 'tour_debug_mode' is public-relevant (though mostly used by admins, 
    // it needs to be accessible if we ever wanted to enable it for testers easily, 
    // but primarily this endpoint is for general app config that might be needed client-side)
    
    // Actually, let's just fetch all that are deemed "public" or safe.
    // For this specific task, we just need to know if debug mode is on.
    
    const debugSetting = await prisma.system_settings.findUnique({
        where: { key: 'tour_debug_mode' }
    })

    const isDebugMode = debugSetting?.value === true

    return successResponse({
        tourDebugMode: isDebugMode
    }, 'Settings retrieved')
})
