import jwt from "jsonwebtoken";
import crypto from "crypto";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "@/lib/constants";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export type AccessTokenPayload = {
  userId: string;
  role: string;
};

export type RefreshTokenPayload = {
  userId: string;
  tokenId: string;
};

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

export function generateRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign({ userId, tokenId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  try {
    return jwt.verify(token, JWT_ACCESS_SECRET) as AccessTokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch {
    return null;
  }
}

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}
