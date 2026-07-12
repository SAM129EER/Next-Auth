export const ACCESS_TOKEN_EXPIRY = "15m";
export const REFRESH_TOKEN_EXPIRY = "7d";
export const ACCESS_TOKEN_MAX_AGE = 15 * 60; // 15 minutes in seconds
export const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
export const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
export const PASSWORD_RESET_TOKEN_EXPIRY_HOURS = 1;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
} as const;

export const RATE_LIMITS = {
  SIGNUP: { limit: 5, windowSeconds: 60 },
  LOGIN: { limit: 10, windowSeconds: 60 },
  REFRESH: { limit: 20, windowSeconds: 60 },
  FORGOT_PASSWORD: { limit: 3, windowSeconds: 60 },
  RESEND_VERIFICATION: { limit: 3, windowSeconds: 60 },
  RESET_PASSWORD: { limit: 5, windowSeconds: 60 },
  ADMIN_USERS: { limit: 30, windowSeconds: 60 },
} as const;
