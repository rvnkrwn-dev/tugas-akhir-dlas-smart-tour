import { defineEventHandler, getRequestHeader, createError, getHeader } from "h3";
import { verifyAccessToken } from "~~/server/utils/jwt";
import {
  API_PUBLIC,
  API_AUTH_ONLY,
  API_ADMIN_ONLY,
  API_SCANNER_ONLY,
  API_SUPER_ADMIN_ONLY,
  hasRoleAccess,
  type ApiAccessRule,
} from "~~/server/constants/api-access";
import {
  errorResponse,
  ERROR_CODES,
  ERROR_MESSAGES,
  HTTP_STATUS,
} from "~~/server/utils/response";
import { prisma } from "~~/server/lib/prisma";
import { getCache, setCache, CacheKeys, CacheTTL } from "~~/server/utils/cache";

/**
 * Match dynamic route patterns like /api/attractions/[id]
 */
function matchDynamicRoute(url: string, pattern: string): boolean {
  const urlParts = url.split('/').filter(Boolean);
  const patternParts = pattern.split('/').filter(Boolean);

  if (urlParts.length !== patternParts.length) return false;

  return patternParts.every((part, i) => {
    // [id], [slug], etc. match any value
    if (part.startsWith('[') && part.endsWith(']')) return true;
    return part === urlParts[i];
  });
}

/**
 * Match request against access rules
 * Fixed: Proper path matching to prevent false positives
 */
function matchRoute(
  rules: ApiAccessRule[],
  url: string,
  method: string,
): boolean {
  return rules.some((rule) => {
    const methodMatches = rule.method === "ALL" || rule.method === method;

    // Extract path without query string
    const urlPath = url.split('?')[0];
    const rulePath = rule.endpoint;

    // Exact match, path segment match, or dynamic route match
    const pathMatches =
      urlPath === rulePath ||
      urlPath.startsWith(rulePath + '/') ||
      (rulePath.includes('[') && matchDynamicRoute(urlPath, rulePath));

    return methodMatches && pathMatches;
  });
}

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
}

/**
 * Global authentication middleware
 * Runs on every request and enforces role-based access control
 * 
 * Fixed bugs:
 * - Route matching now prevents false positives
 * - Database queries are cached
 * - Comprehensive error handling
 * - Query strings are stripped from URLs
 * - Explicit deny for unmatched routes
 */
export default defineEventHandler(async (event) => {
  // Get full URL and strip query string
  const fullUrl = event.node.req.url ?? "";
  const url = fullUrl.split('?')[0]; // Strip query string
  const method = (event.node.req.method ?? "GET").toUpperCase();

  // Skip non-API requests
  if (!url.includes("/api")) {
    return;
  }

  // Skip authentication for public endpoints
  const isPublic = matchRoute(API_PUBLIC, url, method);
  if (isPublic) {
    return; // Continue without authentication
  }

  // Get authorization header
  const authHeader = getRequestHeader(event, "authorization");
  const token = extractToken(authHeader);

  if (!token) {
    throw createError({
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      statusMessage: "Unauthorized",
      data: errorResponse(
        ERROR_MESSAGES.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED,
      ),
    });
  }

  // Verify token with error handling
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch (error) {
    console.error('Token verification error:', error);
    throw createError({
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      statusMessage: "Invalid token format",
      data: errorResponse(
        ERROR_MESSAGES.TOKEN_INVALID,
        ERROR_CODES.TOKEN_INVALID,
      ),
    });
  }

  if (!payload) {
    throw createError({
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      statusMessage: "Invalid or expired token",
      data: errorResponse(
        ERROR_MESSAGES.TOKEN_INVALID,
        ERROR_CODES.TOKEN_INVALID,
      ),
    });
  }

  // Check cache first for user data
  const cacheKey = CacheKeys.userById(payload.userId);
  let user = await getCache<any>(cacheKey);

  // If not in cache, query database
  if (!user) {
    try {
      user = await prisma.users.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          isEmailVerified: true,
        },
      });

      if (user) {
        // Cache user data for 2 minutes
        await setCache(cacheKey, user, CacheTTL.SHORT);
      }
    } catch (error) {
      // Database error - service unavailable
      console.error('Auth middleware database error:', error);
      throw createError({
        statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
        statusMessage: "Service temporarily unavailable",
        data: errorResponse(
          "Authentication service unavailable",
          ERROR_CODES.INTERNAL_ERROR
        ),
      });
    }
  }

  // Check if user exists
  if (!user) {
    throw createError({
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      statusMessage: "User not found",
      data: errorResponse("User not found", ERROR_CODES.NOT_FOUND),
    });
  }

  // Check if user is active
  if (!user.isActive) {
    throw createError({
      statusCode: HTTP_STATUS.FORBIDDEN,
      statusMessage: "Account inactive",
      data: errorResponse(
        ERROR_MESSAGES.ACCOUNT_INACTIVE,
        ERROR_CODES.ACCOUNT_INACTIVE,
      ),
    });
  }

  // Attach user info to event context for use in route handlers
  event.context.user = {
    userId: user.id,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  };

  // Check AUTH_ONLY endpoints (any authenticated user can access)
  const isAuthOnly = matchRoute(API_AUTH_ONLY, url, method);
  if (isAuthOnly) {
    return; // User is authenticated, allow access
  }

  // Check SUPER_ADMIN_ONLY endpoints
  const isSuperAdminOnly = matchRoute(API_SUPER_ADMIN_ONLY, url, method);
  if (isSuperAdminOnly) {
    if (user.role !== "SUPER_ADMIN") {
      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Super Admin access required",
        data: errorResponse(
          "Super Admin access required",
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          {
            requiredRole: "SUPER_ADMIN",
            userRole: user.role,
          },
        ),
      });
    }
    return; // Super admin access granted
  }

  // Check ADMIN_ONLY endpoints (ADMIN and SUPER_ADMIN can access)
  const isAdminOnly = matchRoute(API_ADMIN_ONLY, url, method);
  if (isAdminOnly) {
    if (!hasRoleAccess(user.role, "ADMIN")) {
      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Admin access required",
        data: errorResponse(
          "Admin access required",
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          {
            requiredRoles: ["ADMIN", "SUPER_ADMIN"],
            userRole: user.role,
          },
        ),
      });
    }
    return; // Admin access granted
  }

  // Check SCANNER_ONLY endpoints (SCANNER, ADMIN, and SUPER_ADMIN can access)
  const isScannerOnly = matchRoute(API_SCANNER_ONLY, url, method);
  if (isScannerOnly) {
    if (!hasRoleAccess(user.role, "SCANNER")) {
      throw createError({
        statusCode: HTTP_STATUS.FORBIDDEN,
        statusMessage: "Scanner access required",
        data: errorResponse(
          "Scanner access required",
          ERROR_CODES.INSUFFICIENT_PERMISSIONS,
          {
            requiredRoles: ["SCANNER", "ADMIN", "SUPER_ADMIN"],
            userRole: user.role,
          },
        ),
      });
    }
    return; // Scanner access granted
  }

  // If route doesn't match any pattern, deny access by default (security-first)
  throw createError({
    statusCode: HTTP_STATUS.FORBIDDEN,
    statusMessage: "Access denied",
    data: errorResponse(
      "This endpoint requires specific permissions",
      ERROR_CODES.INSUFFICIENT_PERMISSIONS,
      {
        url,
        method,
        userRole: user.role,
      }
    ),
  });
});
