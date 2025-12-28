import jwt, { type SignOptions } from "jsonwebtoken";
import type { users_role } from "~~/generated/prisma/client";

export interface JwtPayload {
  userId: string;
  email: string;
  role: users_role;
  iat?: number;
  exp?: number;
}

/**
 * Generate access token
 */
export const generateAccessToken = (payload: JwtPayload): string => {
  const config = useRuntimeConfig();
  const options: SignOptions = {
    expiresIn: (config.jwtAccessExpiresIn || "15m") as any,
  };
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    config.jwtAccessSecret || "",
    options,
  );
};

/**
 * Generate refresh token
 */
export const generateRefreshToken = (payload: JwtPayload): string => {
  const config = useRuntimeConfig();
  const options: SignOptions = {
    expiresIn: (config.jwtRefreshExpiresIn || "7d") as any,
  };
  return jwt.sign(
    { userId: payload.userId, email: payload.email, role: payload.role },
    config.jwtRefreshSecret || "",
    options,
  );
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const config = useRuntimeConfig();
    const decoded = jwt.verify(
      token,
      config.jwtAccessSecret || "",
    ) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const config = useRuntimeConfig();
    const decoded = jwt.verify(
      token,
      config.jwtRefreshSecret || "",
    ) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokenPair = (payload: JwtPayload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Decode token without verification (useful for expired tokens)
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};
