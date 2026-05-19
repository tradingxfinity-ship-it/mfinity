import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyAccessToken, verifyRefreshToken } from "./jwt";
import type { JWTPayload, RequestContext } from "@/types";

const ACCESS_COOKIE = "mfinity_access";
const REFRESH_COOKIE = "mfinity_refresh";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}

export async function getRefreshToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value ?? null;
}

export async function getRequestContext(): Promise<RequestContext | null> {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };
  } catch {
    return null;
  }
}

export async function validateRefreshToken(
  refreshToken: string
): Promise<JWTPayload | null> {
  try {
    const payload = await verifyRefreshToken(refreshToken);

    const session = await db.session.findUnique({
      where: { refreshToken },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function revokeSession(refreshToken: string): Promise<void> {
  await db.session.updateMany({
    where: { refreshToken },
    data: { revokedAt: new Date() },
  });
}
