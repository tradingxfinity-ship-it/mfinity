import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload, AuthTokens } from "@/types";

function getSecret(key: string): Uint8Array {
  return new TextEncoder().encode(key);
}

const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN ?? "15m";
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN ?? "7d";

export async function signAccessToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRES)
    .sign(getSecret(process.env.JWT_SECRET!));
}

export async function signRefreshToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES)
    .sign(getSecret(process.env.JWT_REFRESH_SECRET!));
}

export async function verifyAccessToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret(process.env.JWT_SECRET!));
  return payload as unknown as JWTPayload;
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret(process.env.JWT_REFRESH_SECRET!));
  return payload as unknown as JWTPayload;
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString());
    return decoded as JWTPayload;
  } catch {
    return null;
  }
}

export async function generateTokenPair(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<AuthTokens> {
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  const parts = accessToken.split(".");
  const decoded = JSON.parse(Buffer.from(parts[1], "base64url").toString());
  const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

  return { accessToken, refreshToken, expiresIn };
}
