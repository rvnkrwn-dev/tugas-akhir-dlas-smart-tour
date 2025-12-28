import { z } from 'zod'

/**
 * Common weak passwords to reject
 */
const COMMON_PASSWORDS = [
    'password', 'password123', '12345678', 'qwerty', 'qwerty123',
    'admin', 'admin123', 'letmein', 'welcome', 'monkey',
    'dragon', 'master', 'sunshine', 'princess', 'football',
    '123456', '1234567', '123456789', '12345', '1234',
]

/**
 * Enhanced password validation schema
 * Requirements:
 * - 8-128 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 * - Not a common password
 * - No sequential characters (123, abc)
 * - No repeated characters (aaa, 111)
 */
export const passwordSchema = z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .refine((password) => {
        // Check for common passwords
        return !COMMON_PASSWORDS.includes(password.toLowerCase())
    }, 'Password is too common. Please choose a stronger password.')
    .refine((password) => {
        // Check for sequential characters (123, abc, etc.)
        const sequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i
        return !sequential.test(password)
    }, 'Password contains sequential characters. Please choose a stronger password.')
    .refine((password) => {
        // Check for repeated characters (aaa, 111, etc.)
        return !/(.)\1{2,}/.test(password)
    }, 'Password contains repeated characters. Please choose a stronger password.')

/**
 * Email validation schema
 */
export const emailSchema = z
    .string()
    .email('Invalid email format')
    .max(320, 'Email must not exceed 320 characters')
    .toLowerCase()
    .trim()
    .refine((email) => {
        // Check for disposable email domains
        const disposableDomains = [
            'tempmail.com', 'throwaway.email', '10minutemail.com',
            'guerrillamail.com', 'mailinator.com', 'trashmail.com'
        ]
        const domain = email.split('@')[1]
        return !disposableDomains.includes(domain || '')
    }, 'Disposable email addresses are not allowed')

/**
 * Phone number validation (Indonesian format)
 */
export const phoneSchema = z
    .string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Invalid Indonesian phone number format')
    .optional()
    .or(z.literal(''))

/**
 * Name validation schema
 */
export const nameSchema = (fieldName: string) => z
    .string()
    .min(1, `${fieldName} is required`)
    .max(100, `${fieldName} must not exceed 100 characters`)
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`)

/**
 * URL validation schema
 */
export const urlSchema = z
    .string()
    .url('Invalid URL format')
    .max(2048, 'URL must not exceed 2048 characters')

/**
 * Slug validation schema
 */
export const slugSchema = z
    .string()
    .min(1, 'Slug is required')
    .max(300, 'Slug must not exceed 300 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

/**
 * UUID validation schema
 */
export const uuidSchema = z
    .string()
    .uuid('Invalid UUID format')

/**
 * Positive integer validation
 */
export const positiveIntSchema = (fieldName: string) => z
    .number()
    .int(`${fieldName} must be an integer`)
    .positive(`${fieldName} must be positive`)

/**
 * Positive decimal validation
 */
export const positiveDecimalSchema = (fieldName: string) => z
    .number()
    .positive(`${fieldName} must be positive`)

/**
 * Date validation (future dates only)
 */
export const futureDateSchema = z
    .date()
    .refine((date) => date > new Date(), 'Date must be in the future')

/**
 * Date validation (past dates only)
 */
export const pastDateSchema = z
    .date()
    .refine((date) => date < new Date(), 'Date must be in the past')

/**
 * Validate and sanitize HTML input
 * Removes all HTML tags and dangerous content
 */
export const sanitizeHtml = (input: string): string => {
    return input
        .trim()
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onerror, etc.)
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, '&')
}

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove < and >
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers
        .slice(0, 10000) // Limit length to prevent DoS
}

/**
 * Validate file size
 */
export const validateFileSize = (
    bytes: number,
    maxSizeMB: number = 10
): { isValid: boolean; error?: string } => {
    const maxBytes = maxSizeMB * 1024 * 1024

    if (bytes > maxBytes) {
        return {
            isValid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`
        }
    }

    return { isValid: true }
}

/**
 * Validate image MIME type
 */
export const validateImageMimeType = (
    mimeType: string
): { isValid: boolean; error?: string } => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(mimeType)) {
        return {
            isValid: false,
            error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed'
        }
    }

    return { isValid: true }
}

/**
 * Validate file signature (magic bytes)
 */
export const validateFileSignature = (
    buffer: Buffer,
    mimeType: string
): { isValid: boolean; error?: string } => {
    const signatures: Record<string, number[]> = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46],
        'image/webp': [0x52, 0x49, 0x46, 0x46],
    }

    const signature = signatures[mimeType]
    if (!signature) {
        return { isValid: true } // Skip validation for unknown types
    }

    const fileSignature = Array.from(buffer.slice(0, signature.length))
    const isValid = signature.every((byte, i) => byte === fileSignature[i])

    if (!isValid) {
        return {
            isValid: false,
            error: 'File signature does not match MIME type. File may be corrupted or malicious.'
        }
    }

    return { isValid: true }
}

/**
 * Comprehensive file validation
 */
export const validateFile = (file: {
    buffer: Buffer
    mimeType: string
    size: number
}, options: {
    maxSizeMB?: number
    allowedTypes?: string[]
} = {}): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Validate size
    const sizeValidation = validateFileSize(file.size, options.maxSizeMB)
    if (!sizeValidation.isValid && sizeValidation.error) {
        errors.push(sizeValidation.error)
    }

    // Validate MIME type
    const mimeValidation = validateImageMimeType(file.mimeType)
    if (!mimeValidation.isValid && mimeValidation.error) {
        errors.push(mimeValidation.error)
    }

    // Validate file signature
    const signatureValidation = validateFileSignature(file.buffer, file.mimeType)
    if (!signatureValidation.isValid && signatureValidation.error) {
        errors.push(signatureValidation.error)
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}
