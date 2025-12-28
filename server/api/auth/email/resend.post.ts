import { z } from "zod";
import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import {
  generateRandomToken,
  generateTokenExpiry,
} from "~~/server/utils/token";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { sendVerificationEmail } from "~~/server/services/emailService";

// Zod Schema
const resendVerificationSchema = z.object({
  email: z.email("Invalid email format").toLowerCase().trim(),
});

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event);
    const validation = resendVerificationSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues.map((err: any) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Validation Error",
        data: errorResponse("Validation failed", ERROR_CODES.VALIDATION_ERROR, {
          errors,
        }),
      });
    }

    const { email } = validation.data;

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_profiles: {
          select: {
            firstName: true,
          },
        },
      },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return successResponse(
        null,
        "If the email exists and is not verified, a verification email will be sent",
      );
    }

    // Check if already verified
    if (user.isEmailVerified) {
      throw createError({
        statusCode: HTTP_STATUS.BAD_REQUEST,
        statusMessage: "Email already verified",
        data: errorResponse(
          "This email has already been verified",
          ERROR_CODES.VALIDATION_ERROR,
        ),
      });
    }

    // Check for recent verification emails (rate limiting)
    const recentVerification = await prisma.email_verifications.findFirst({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000), // Last 2 minutes
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (recentVerification) {
      throw createError({
        statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
        statusMessage: "Too many requests",
        data: errorResponse(
          "Please wait a few minutes before requesting another verification email",
          ERROR_CODES.TOO_MANY_REQUESTS,
        ),
      });
    }

    // Generate new verification token
    const verificationToken = generateRandomToken();
    const tokenExpiry = generateTokenExpiry(60); // 1 hour

    // Create new verification record
    await prisma.email_verifications.create({
      data: {
        email,
        token: verificationToken,
        userId: user.id,
        expiresAt: tokenExpiry,
      },
    });

    // Send verification email
    const userName = user.user_profiles?.firstName ?? user.email.split("@")[0];
    const emailSent = await sendVerificationEmail(
      user.email,
      userName ?? "",
      verificationToken,
    );

    if (!emailSent) {
      console.error("Failed to send verification email to:", user.email);
      throw createError({
        statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
        statusMessage: "Email sending failed",
        data: errorResponse(
          "Failed to send verification email. Please try again later",
          ERROR_CODES.EXTERNAL_API_ERROR,
        ),
      });
    }

    // Log activity
    await prisma.activity_logs.create({
      data: {
        userId: user.id,
        userRole: user.role,
        action: "RESEND_VERIFICATION_EMAIL",
        entityType: "USER",
        entityId: user.id,
        description: "User requested resend verification email",
        ipAddress:
          getHeader(event, "x-forwarded-for") ||
          getHeader(event, "x-real-ip") ||
          "0.0.0.0",
        userAgent: getHeader(event, "user-agent") || null,
      },
    });

    return successResponse(
      null,
      "Verification email sent successfully. Please check your inbox",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Resend verification error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while resending verification email",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
