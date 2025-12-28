import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export default defineEventHandler(async (event) => {
    // Apply rate limiting
    await rateLimit(RateLimitPresets.FILE_UPLOAD)(event)

    try {
        // Require admin role
        const currentUser = requireAdmin(event)

        const files = await readMultipartFormData(event)
        if (!files || files.length === 0) {
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: 'No file uploaded'
            })
        }

        const uploadedFile = files[0]

        // Validation
        if (!uploadedFile.filename) {
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: 'Invalid file'
            })
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
        if (!allowedTypes.includes(uploadedFile.type || '')) {
            throw createError({
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: 'Invalid file type. Only JPG and PNG are allowed.'
            })
        }

        // Logic to save file
        // Sanitize filename or use UUID to avoid collisions
        const ext = uploadedFile.filename.split('.').pop()
        const uniqueFilename = `${Date.now()}_${randomUUID().substring(0, 8)}.${ext}`

        // In Nuxt output not usually public is writable in production easily without volume, 
        // but for this "file system" logic requested by user:
        const savePath = join(process.cwd(), 'public', 'images', 'pano', uniqueFilename)
        const publicPath = `/images/pano/${uniqueFilename}`

        await writeFile(savePath, uploadedFile.data)

        return successResponse(
            {
                url: publicPath,
                filename: uniqueFilename
            },
            'File uploaded successfully'
        )

    } catch (error: any) {
        if (error.statusCode) throw error
        console.error('Upload Error:', error)
        throw createError({
            statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
            message: 'Failed to upload file'
        })
    }
})
