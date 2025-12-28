import type { users_role } from "@prisma/client";

/**
 * Authentication Request Types
 */

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string | Date;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication Response Types
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface LoginResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: UserResponse;
  message: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: users_role;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  profile?: UserProfileResponse;
}

export interface UserProfileResponse {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  dateOfBirth: Date | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  language: "ENGLISH" | "INDONESIAN";
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
}

export interface VerifyEmailResponse {
  message: string;
  isVerified: boolean;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

/**
 * JWT Payload Types
 */

export interface JwtPayload {
  userId: string;
  email: string;
  role: users_role;
  iat?: number;
  exp?: number;
}

export interface JwtTokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Token Types
 */

export interface EmailVerificationToken {
  id: string;
  email: string;
  token: string;
  userId: string;
  expiresAt: Date;
  verifiedAt: Date | null;
  createdAt: Date;
}

export interface PasswordResetToken {
  id: string;
  email: string;
  token: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface RefreshTokenData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * User Context for Middleware
 */

export interface UserContext {
  userId: string;
  email: string;
  role: users_role;
}

/**
 * Authentication Error Types
 */

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

/**
 * Rate Limiting Types
 */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
}
