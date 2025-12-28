import type { H3Event } from "h3";
import type { users_role } from "~~/generated/prisma/client";
import { hasRoleAccess } from "~~/server/constants/api-access";

/**
 * User context attached to event by auth middleware
 */
export interface UserContext {
  userId: string;
  email: string;
  role: users_role;
  isEmailVerified: boolean;
}

/**
 * Get current authenticated user from event context
 * This assumes the auth middleware has already run
 */
export const getCurrentUser = (event: H3Event): UserContext | null => {
  return event.context.user || null;
};

/**
 * Require authenticated user or throw error
 * Useful for route handlers that need user info
 */
export const requireUser = (event: H3Event): UserContext => {
  const user = getCurrentUser(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "User not authenticated",
    });
  }

  return user;
};

/**
 * Check if current user has specific role
 */
export const hasRole = (event: H3Event, role: users_role): boolean => {
  const user = getCurrentUser(event);
  return user ? user.role === role : false;
};

/**
 * Check if current user is admin (ADMIN or SUPER_ADMIN)
 */
export const isAdmin = (event: H3Event): boolean => {
  const user = getCurrentUser(event);
  if (!user) return false;

  return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
};

/**
 * Check if current user is super admin
 */
export const isSuperAdmin = (event: H3Event): boolean => {
  const user = getCurrentUser(event);
  return user ? user.role === "SUPER_ADMIN" : false;
};

/**
 * Check if current user is scanner
 */
export const isScanner = (event: H3Event): boolean => {
  const user = getCurrentUser(event);
  if (!user) return false;

  return hasRoleAccess(user.role, "SCANNER");
};

/**
 * Require specific role or throw error
 */
export const requireRole = (event: H3Event, requiredRole: users_role) => {
  const user = requireUser(event);

  if (!hasRoleAccess(user.role, requiredRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: `${requiredRole} role required`,
      data: {
        requiredRole,
        userRole: user.role,
      },
    });
  }

  return user;
};

/**
 * Require admin role (ADMIN or SUPER_ADMIN)
 */
export const requireAdmin = (event: H3Event): UserContext => {
  return requireRole(event, "ADMIN");
};

/**
 * Require super admin role
 */
export const requireSuperAdmin = (event: H3Event): UserContext => {
  const user = requireUser(event);

  if (user.role !== "SUPER_ADMIN") {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Super Admin role required",
      data: {
        requiredRole: "SUPER_ADMIN",
        userRole: user.role,
      },
    });
  }

  return user;
};

/**
 * Require scanner role
 */
export const requireScanner = (event: H3Event): UserContext => {
  return requireRole(event, "SCANNER");
};

/**
 * Check if user owns a resource
 * Useful for checking if user can modify their own data
 */
export const isResourceOwner = (
  event: H3Event,
  resourceUserId: string,
): boolean => {
  const user = getCurrentUser(event);
  return user ? user.userId === resourceUserId : false;
};

/**
 * Require user to be owner of resource or admin
 */
export const requireOwnerOrAdmin = (
  event: H3Event,
  resourceUserId: string,
): UserContext => {
  const user = requireUser(event);

  const isOwner = user.userId === resourceUserId;
  const isAdminUser = user.role === "ADMIN" || user.role === "SUPER_ADMIN";

  if (!isOwner && !isAdminUser) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "You do not have permission to access this resource",
    });
  }

  return user;
};
