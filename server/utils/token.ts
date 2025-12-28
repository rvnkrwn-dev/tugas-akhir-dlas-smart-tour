import crypto from 'crypto'

/**
 * Generate a random token for email verification or password reset
 * @param length - Length of the token in bytes (default: 32)
 * @returns A hexadecimal string token
 */
export const generateRandomToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * Generate a UUID-based token
 * @returns A UUID string
 */
export const generateUuidToken = (): string => {
  return crypto.randomUUID()
}

/**
 * Hash a token for secure storage
 * @param token - The token to hash
 * @returns A hashed version of the token
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generate expiry time for tokens
 * @param minutes - Number of minutes until expiry (default: 60)
 * @returns A Date object representing the expiry time
 */
export const generateTokenExpiry = (minutes: number = 60): Date => {
  const expiry = new Date()
  expiry.setMinutes(expiry.getMinutes() + minutes)
  return expiry
}

/**
 * Check if a token has expired
 * @param expiryDate - The expiry date to check
 * @returns True if expired, false otherwise
 */
export const isTokenExpired = (expiryDate: Date): boolean => {
  return new Date() > new Date(expiryDate)
}

/**
 * Generate a numeric OTP code
 * @param length - Length of the OTP (default: 6)
 * @returns A numeric string OTP
 */
export const generateOTP = (length: number = 6): string => {
  const digits = '0123456789'
  let otp = ''

  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, digits.length)
    otp += digits[randomIndex]
  }

  return otp
}
