import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { getHeader } from 'h3'
import { prisma } from '~~/server/lib/prisma'
import { generateRandomToken, generateTokenExpiry } from '~~/server/utils/token'
import { sendVerificationEmail } from '~~/server/services/emailService'
import { successResponse, errorResponse, ERROR_CODES, HTTP_STATUS } from '~~/server/utils/response'
import { defineAdminHandler } from '~~/server/utils/handler'
import { RateLimitPresets } from '~~/server/utils/rateLimit'

// Zod Schema for create user
const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "SCANNER", "CUSTOMER"]),
    isActive: z.boolean().default(true),
    isEmailVerified: z.boolean().default(false),
    profile: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        city: z.string().optional(),
        country: z.string().optional(),
    }).optional()
})

export default defineAdminHandler(async (event, currentUser) => {
    const body = await readBody(event)
    const validation = createUserSchema.safeParse(body)

    if (!validation.success) {
        const errors = validation.error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message
        }))

        throw createError({
            statusCode: HTTP_STATUS.BAD_REQUEST,
            statusMessage: 'Validation Error',
            data: errorResponse('Validation failed', ERROR_CODES.VALIDATION_ERROR, {
                errors
            })
        })
    }

    const validatedData = validation.data

    // Check if email already exists
    const existingUser = await prisma.users.findUnique({
        where: { email: validatedData.email }
    })

    if (existingUser) {
        throw createError({
            statusCode: HTTP_STATUS.CONFLICT,
            statusMessage: 'Email already exists',
            data: errorResponse(
                'Email is already registered',
                ERROR_CODES.ALREADY_EXISTS
            )
        })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Generate verification token if email is not verified
    const verificationToken = !validatedData.isEmailVerified ? generateRandomToken() : null
    const tokenExpiry = verificationToken ? generateTokenExpiry(60) : null // 1 hour

    // Create user with profile in transaction
    const newUser = await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
            data: {
                email: validatedData.email,
                password: hashedPassword,
                role: validatedData.role,
                isActive: validatedData.isActive,
                isEmailVerified: validatedData.isEmailVerified,
            }
        })

        // Create profile if provided
        if (validatedData.profile) {
            await tx.user_profiles.create({
                data: {
                    userId: user.id,
                    ...validatedData.profile
                }
            })
        }

        // Create email verification token if needed
        if (verificationToken && tokenExpiry) {
            await tx.email_verifications.create({
                data: {
                    email: user.email,
                    token: verificationToken,
                    expiresAt: tokenExpiry,
                    users: {
                        connect: { id: user.id }
                    }
                }
            })
        }

        // Return user with profile
        return await tx.users.findUnique({
            where: { id: user.id },
            include: {
                user_profiles: true,
                _count: {
                    select: {
                        purchase_transactions: true,
                        activity_logs: true
                    }
                }
            }
        })
    })

    // Send verification email if not verified
    let emailSent = false
    if (verificationToken && !validatedData.isEmailVerified) {
        const userName = newUser?.user_profiles?.firstName ?? newUser?.email.split('@')[0]
        emailSent = await sendVerificationEmail(
            newUser!.email,
            userName ?? '',
            verificationToken
        )

        if (!emailSent) {
            console.error('Failed to send verification email to:', newUser?.email)
            // Don't throw error - user is created, they can resend verification later
        }
    }

    // Log activity (fire and forget)
    await prisma.activity_logs.create({
        data: {
            userId: currentUser.userId,
            userRole: currentUser.role,
            action: 'CREATE_USER',
            entityType: 'USER',
            entityId: newUser!.id,
            description: `Admin created user ${newUser!.email} `,
            metadata: {
                createdUserRole: validatedData.role,
                isActive: validatedData.isActive,
                isEmailVerified: validatedData.isEmailVerified
            },
            ipAddress: getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || '0.0.0.0',
            userAgent: getHeader(event, 'user-agent') || null
        }
    }).catch(err => console.error("Failed to log activity", err))

    return successResponse(
        {
            user: newUser,
            emailSent
        },
        emailSent
            ? 'User created successfully. Verification email has been sent.'
            : 'User created successfully.'
    )
}, {
    rateLimit: 'AUTH_REGISTER' // Using specific rate limit for creation if desired, or API_GENERAL
})
