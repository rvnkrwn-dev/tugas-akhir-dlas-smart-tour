/**
 * Security utilities for authentication
 */

/**
 * Dummy bcrypt hash for timing attack prevention
 * Pre-computed hash of "dummy_password_for_timing_attack_prevention"
 * This ensures consistent timing whether user exists or not
 */
export const DUMMY_PASSWORD_HASH = '$2b$10$rKJ8qH5F5F5F5F5F5F5F5uZxK5F5F5F5F5F5F5F5F5F5F5F5F5F5F5';

/**
 * Constant-time string comparison to prevent timing attacks
 * Always compares full length even if mismatch found early
 */
export function constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
}
