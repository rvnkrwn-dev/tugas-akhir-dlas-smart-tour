import type { users_role } from "~~/generated/prisma/client";

/**
 * API Route Access Rule
 */
export interface ApiAccessRule {
  endpoint: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "ALL";
  description?: string;
}

/**
 * Public API endpoints - accessible without authentication
 * Anyone can access these endpoints
 */
export const API_PUBLIC: ApiAccessRule[] = [
  // Auth endpoints
  { endpoint: "/api/auth/login", method: "POST", description: "User login" },
  { endpoint: "/api/auth/register", method: "POST", description: "User registration" },
  { endpoint: "/api/auth/refresh", method: "GET", description: "Refresh access token" },
  { endpoint: "/api/auth/password/forgot", method: "POST", description: "Forgot password" },
  { endpoint: "/api/auth/password/reset", method: "POST", description: "Reset password" },
  { endpoint: "/api/auth/email/verify", method: "GET", description: "Email verification" },
  { endpoint: "/api/auth/email/resend", method: "POST", description: "Resend verification email" },

  // Public content
  { endpoint: "/api/inbox", method: "POST", description: "Submit contact form" },

  // Attractions (public browse only)
  { endpoint: "/api/attractions", method: "GET", description: "List all attractions" },
  { endpoint: "/api/attractions/[slug]", method: "GET", description: "Get attraction detail by slug" },

  // Testimonials (public read only)
  { endpoint: "/api/testimonials", method: "GET", description: "List testimonials" },

  // Public system settings
  { endpoint: '/api/settings', method: 'GET', description: 'Public system settings' },

  // Test endpoints (development only)
  { endpoint: "/api/test", method: "ALL", description: "Test endpoints (dev only)" },

  // Virtual Tour (Public)
  { endpoint: "/api/virtual-tour/scenes", method: "GET", description: "List tour scenes" },
  { endpoint: "/api/virtual-tour/scenes/[id]", method: "GET", description: "Get tour scene detail" },
  { endpoint: "/api/virtual-tour/tickets", method: "GET", description: "List tour tickets" },
];

/**
 * Authenticated API endpoints - requires valid token only
 * All authenticated users (any role) can access
 */
export const API_AUTH_ONLY: ApiAccessRule[] = [
  // Auth user management
  { endpoint: "/api/auth/me", method: "GET", description: "Get current user" },
  { endpoint: "/api/auth/me", method: "PATCH", description: "Update current user profile" },
  { endpoint: "/api/auth/password/change", method: "PATCH", description: "Change password" },
  { endpoint: "/api/auth/logout", method: "POST", description: "Logout" },

  // Shopping cart
  { endpoint: "/api/cart", method: "GET", description: "Get cart" },
  { endpoint: "/api/cart/items", method: "POST", description: "Add item to cart" },
  { endpoint: "/api/cart/items/[id]", method: "PATCH", description: "Update cart item" },
  { endpoint: "/api/cart/items/[id]", method: "DELETE", description: "Remove cart item" },
  { endpoint: "/api/cart/clear", method: "DELETE", description: "Clear cart" },

  // Purchase & checkout
  { endpoint: "/api/purchase/checkout", method: "POST", description: "Checkout" },
  { endpoint: "/api/purchase/history", method: "GET", description: "Purchase history" },
  { endpoint: "/api/purchase/my-tickets", method: "GET", description: "My tickets" },
  { endpoint: "/api/purchase/[id]", method: "GET", description: "Purchase detail" },

  // Testimonials
  { endpoint: "/api/testimonials", method: "POST", description: "Submit testimonial" },
];

/**
 * Super Admin only endpoints
 * Only SUPER_ADMIN can access
 */
export const API_SUPER_ADMIN_ONLY: ApiAccessRule[] = [
  { endpoint: "/api/super-admin", method: "ALL", description: "Super admin management" },
  { endpoint: "/api/admin/users/super-admin", method: "ALL", description: "Manage super admins" },
  { endpoint: "/api/system", method: "ALL", description: "System configuration" },
  { endpoint: "/api/logs", method: "ALL", description: "System logs" },
];

/**
 * Admin only endpoints
 * Both ADMIN and SUPER_ADMIN can access
 */
export const API_ADMIN_ONLY: ApiAccessRule[] = [
  // Admin check
  { endpoint: "/api/admin/_check", method: "GET", description: "Admin check" },

  // Admin dashboard
  { endpoint: "/api/admin/dashboard/overview", method: "GET", description: "Dashboard overview" },
  { endpoint: "/api/admin/dashboard/users", method: "GET", description: "Dashboard users stats" },
  { endpoint: "/api/admin/dashboard/attractions", method: "GET", description: "Dashboard attractions stats" },
  { endpoint: "/api/admin/dashboard/tickets", method: "GET", description: "Dashboard tickets stats" },
  { endpoint: "/api/admin/dashboard/transactions", method: "GET", description: "Dashboard transactions stats" },
  { endpoint: "/api/admin/dashboard/payments", method: "GET", description: "Dashboard payments stats" },
  { endpoint: "/api/admin/dashboard/revenue", method: "GET", description: "Dashboard revenue stats" },
  { endpoint: "/api/admin/dashboard/activity-logs", method: "GET", description: "Dashboard activity logs" },

  // User management
  { endpoint: "/api/admin/users", method: "GET", description: "List users" },
  { endpoint: "/api/admin/users", method: "POST", description: "Create user" },
  { endpoint: "/api/admin/users/[id]", method: "GET", description: "Get user detail" },
  { endpoint: "/api/admin/users/[id]", method: "PATCH", description: "Update user" },
  { endpoint: "/api/admin/users/[id]", method: "DELETE", description: "Delete user" },
  { endpoint: "/api/admin/users/[id]/toggle-active", method: "PATCH", description: "Toggle user active status" },

  // Attraction management
  { endpoint: "/api/admin/attractions", method: "GET", description: "List attractions" },
  { endpoint: "/api/admin/attractions", method: "POST", description: "Create attraction" },
  { endpoint: "/api/admin/attractions/[id]", method: "PATCH", description: "Partial update attraction" },
  { endpoint: "/api/admin/attractions/[id]", method: "PUT", description: "Full replace attraction" },
  { endpoint: "/api/admin/attractions/[id]", method: "DELETE", description: "Delete attraction" },
  { endpoint: "/api/admin/attractions/[id]/toggle-status", method: "PATCH", description: "Toggle attraction status" },
  { endpoint: "/api/admin/attractions/[id]/images/cover", method: "PATCH", description: "Update attraction cover image" },
  { endpoint: "/api/admin/attractions/[id]/images/gallery", method: "POST", description: "Add attraction gallery image" },
  { endpoint: "/api/admin/attractions/[id]/images/gallery", method: "DELETE", description: "Remove attraction gallery image" },

  // Transaction management
  { endpoint: "/api/admin/transactions", method: "GET", description: "List transactions" },
  { endpoint: "/api/admin/transactions/[id]", method: "GET", description: "Get transaction detail" },
  { endpoint: "/api/admin/transactions/[id]/status", method: "PATCH", description: "Update transaction status" },
  { endpoint: "/api/admin/transactions/[id]/refund", method: "POST", description: "Refund transaction" },

  // Payment management
  { endpoint: "/api/admin/payments", method: "GET", description: "List payments" },
  { endpoint: "/api/admin/payments/[id]", method: "GET", description: "Get payment detail" },
  { endpoint: "/api/admin/payments/[id]/status", method: "PATCH", description: "Update payment status" },

  // Ticket management
  { endpoint: "/api/admin/tickets", method: "GET", description: "List tickets" },
  { endpoint: "/api/admin/tickets/[id]", method: "GET", description: "Get ticket detail" },
  { endpoint: "/api/admin/tickets/code/[code]", method: "GET", description: "Get ticket by code" },

  // Activity logs
  { endpoint: "/api/admin/activity-logs", method: "GET", description: "List activity logs" },
  { endpoint: "/api/admin/activity-logs/[id]", method: "GET", description: "Get activity log detail" },

  // Testimonial management
  { endpoint: "/api/admin/testimonials", method: "GET", description: "List testimonials" },
  { endpoint: "/api/admin/testimonials/[id]", method: "DELETE", description: "Delete testimonial" },
  { endpoint: "/api/admin/testimonials/[id]", method: "PATCH", description: "Update testimonial" },
  { endpoint: "/api/tasks/send-review-reminders", method: "POST", description: "Trigger review reminders manually" },

  // Inbox management
  { endpoint: "/api/admin/inbox", method: "GET", description: "List inbox messages" },
  { endpoint: "/api/admin/inbox/[id]", method: "GET", description: "Get inbox message detail" },
  { endpoint: "/api/admin/inbox/[id]", method: "DELETE", description: "Delete inbox message" },
  { endpoint: "/api/admin/inbox/[id]/read", method: "PATCH", description: "Mark inbox message as read" },

  // Virtual Tour (Admin)
  { endpoint: "/api/admin/tour/scenes", method: "ALL", description: "Manage tour scenes" },
  { endpoint: "/api/admin/tour/scenes/[id]", method: "ALL", description: "Manage tour scene detail" },
  { endpoint: "/api/admin/tour/upload", method: "POST", description: "Upload tour assets" },
  { endpoint: "/api/admin/tour/hotspots", method: "POST", description: "Create hotspot" },
  { endpoint: "/api/admin/tour/hotspots/[id]", method: "ALL", description: "Manage hotspot" },

  // System Settings
  { endpoint: "/api/admin/settings", method: "GET", description: "Get system settings" },
  { endpoint: "/api/admin/settings/update", method: "POST", description: "Update system settings" },
];

/**
 * Scanner only endpoints
 * SCANNER, ADMIN, and SUPER_ADMIN can access
 */
export const API_SCANNER_ONLY: ApiAccessRule[] = [
  { endpoint: "/api/scanner/check", method: "POST", description: "Validate ticket QR code" },
  { endpoint: "/api/scanner/redeem", method: "POST", description: "Redeem ticket item" },
  { endpoint: "/api/scanner/history", method: "GET", description: "Get scan history" },
];

/**
 * Role hierarchy - higher roles inherit lower role permissions
 */
export const ROLE_HIERARCHY: Record<users_role, users_role[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ADMIN", "SCANNER", "CUSTOMER"],
  ADMIN: ["ADMIN", "SCANNER", "CUSTOMER"],
  SCANNER: ["SCANNER", "CUSTOMER"],
  CUSTOMER: ["CUSTOMER"],
};

/**
 * Get all allowed roles for a specific role (including inherited roles)
 */
export const getAllowedRoles = (role: users_role): users_role[] => {
  return ROLE_HIERARCHY[role] || [role];
};

/**
 * Check if a role has access to another role's permissions
 */
export const hasRoleAccess = (
  userRole: users_role,
  requiredRole: users_role,
): boolean => {
  const allowedRoles = getAllowedRoles(userRole);
  return allowedRoles.includes(requiredRole);
};
