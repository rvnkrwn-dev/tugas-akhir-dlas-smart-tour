/**
 * JWT Utility Functions
 * Decode and extract information from JWT tokens (client-side only)
 */

interface JWTPayload {
  userId: string
  email: string
  role: string
  iat: number // Issued at (seconds)
  exp: number // Expiration (seconds)
}

/**
 * Decode a JWT token and extract its payload
 * Note: This does NOT verify the signature (server-side only)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split('.')
    if (parts.length !== 3) {
      console.warn('Invalid JWT format: expected 3 parts')
      return null
    }

    // Decode the payload (base64url encoded)
    const payload = parts[1]
    
    // Base64url decode: replace URL-safe chars and add padding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, '=')
    
    // Decode and parse JSON
    const decoded = JSON.parse(atob(paddedBase64))
    
    return decoded as JWTPayload
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return null
  }
}

/**
 * Get the expiration time of a JWT token
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds, or null if invalid
 */
export function getTokenExpiry(token: string): number | null {
  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) {
    return null
  }
  
  // Convert from seconds to milliseconds
  return decoded.exp * 1000
}

/**
 * Get the time remaining until token expiration
 * @param token - JWT token string
 * @returns Time in milliseconds until expiration, or null if invalid
 */
export function getTimeUntilExpiry(token: string): number | null {
  const expiry = getTokenExpiry(token)
  if (!expiry) {
    return null
  }
  
  const now = Date.now()
  const timeRemaining = expiry - now
  
  return timeRemaining
}

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns True if expired, false if still valid, null if invalid token
 */
export function isTokenExpired(token: string): boolean | null {
  const timeRemaining = getTimeUntilExpiry(token)
  if (timeRemaining === null) {
    return null
  }
  
  return timeRemaining <= 0
}

/**
 * Get a human-readable time remaining string
 * @param token - JWT token string
 * @returns Formatted string like "5m 30s" or "expired"
 */
export function getTimeRemainingFormatted(token: string): string {
  const timeRemaining = getTimeUntilExpiry(token)
  
  if (timeRemaining === null) {
    return 'invalid token'
  }
  
  if (timeRemaining <= 0) {
    return 'expired'
  }
  
  const seconds = Math.floor(timeRemaining / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  
  return `${seconds}s`
}
