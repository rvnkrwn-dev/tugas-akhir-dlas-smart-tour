import { H3Event, getHeader } from "h3";
import { prisma } from "~~/server/lib/prisma";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "~~/server/utils/jwt";
import { generateTokenExpiry } from "~~/server/utils/token";
import {
  successResponse,
  errorResponse,
  ERROR_CODES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { rateLimit, RateLimitPresets } from "~~/server/utils/rateLimit";

export default defineEventHandler(async (event: H3Event) => {
  // Apply rate limiting: 20 refreshes per minute
  await rateLimit(RateLimitPresets.AUTH_TOKEN_REFRESH)(event);

  try {
    // Get refresh token from cookie
    const refreshToken = getCookie(event, "refreshToken");

    if (!refreshToken) {
      throw createError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        statusMessage: "No refresh token provided",
        data: errorResponse(
          "Refresh token is missing",
          ERROR_CODES.UNAUTHORIZED,
        ),
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      // Clear invalid cookie
      deleteCookie(event, "refreshToken");

      throw createError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        statusMessage: "Invalid refresh token",
        data: errorResponse(
          "Refresh token is invalid or expired",
          ERROR_CODES.TOKEN_INVALID,
        ),
      });
    }

    // Check if refresh token exists in database
    const storedToken = await prisma.refresh_tokens.findFirst({
      where: {
        token: refreshToken,
        userId: decoded.userId,
      },
    });

    if (!storedToken) {
      // Clear invalid cookie
      deleteCookie(event, "refreshToken");

      throw createError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        statusMessage: "Refresh token not found",
        data: errorResponse(
          "Refresh token does not exist or has been revoked",
          ERROR_CODES.TOKEN_INVALID,
        ),
      });
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      // Use deleteMany to prevent race condition errors
      await prisma.refresh_tokens.deleteMany({
        where: { id: storedToken.id },
      });

      // Clear expired cookie
      deleteCookie(event, "refreshToken");

      throw createError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        statusMessage: "Refresh token expired",
        data: errorResponse(
          "Refresh token has expired, please login again",
          ERROR_CODES.TOKEN_EXPIRED,
        ),
      });
    }

    // Get user data
    const user = await prisma.users.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isEmailVerified: true,
      },
    });

    if (!user) {
      // Delete token for non-existent user (use deleteMany for race condition)
      await prisma.refresh_tokens.deleteMany({
        where: { id: storedToken.id },
      });

      // Clear cookie
      deleteCookie(event, "refreshToken");

      throw createError({
        statusCode: HTTP_STATUS.UNAUTHORIZED,
        statusMessage: "User not found",
        data: errorResponse(
          "User account no longer exists",
          ERROR_CODES.NOT_FOUND,
        ),
      });
    }

    // Check if user account is still active
    if (!user.isActive) {
      // Delete token for inactive user (use deleteMany for race condition)
      await prisma.refresh_tokens.deleteMany({
        where: { id: storedToken.id },
      });

      // Clear cookie
      deleteCookie(event, "refreshToken");

      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Account inactive",
        data: errorResponse(
          "Your account has been deactivated",
          ERROR_CODES.ACCOUNT_INACTIVE,
        ),
      });
    }

    // SECURITY: Rotate refresh token (delete old, create new)
    await prisma.refresh_tokens.deleteMany({
      where: { id: storedToken.id },
    });

    // Generate new refresh token
    const newRefreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenExpiry = generateTokenExpiry(7 * 24 * 60); // 7 days
    await prisma.refresh_tokens.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    // Set new refresh token cookie
    setCookie(event, "refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF protection
      maxAge: refreshTokenExpiry.getTime() - Date.now(),
      path: "/",
    });

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      {
        accessToken,
      },
      "Access token refreshed successfully",
    );
  } catch (error: any) {
    // If it's already a H3Error, rethrow it
    if (error.statusCode) {
      throw error;
    }

    // Log unexpected errors
    console.error("Token refresh error:", error);

    // Return generic error
    throw createError({
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      statusMessage: "Internal server error",
      data: errorResponse(
        "An unexpected error occurred while refreshing token",
        ERROR_CODES.INTERNAL_ERROR,
      ),
    });
  }
});
