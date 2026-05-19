import { NextRequest } from "next/server";
import { getRefreshToken, validateRefreshToken, setAuthCookies } from "@/lib/auth/session";
import { generateTokenPair } from "@/lib/auth/jwt";
import { db } from "@/lib/db";
import { addDays } from "date-fns";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return unauthorizedResponse();

    const payload = await validateRefreshToken(refreshToken);
    if (!payload) return unauthorizedResponse("Session expired");

    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status === "BANNED" || user.status === "SUSPENDED") {
      return unauthorizedResponse("Account unavailable");
    }

    // Rotate refresh token
    const tokens = await generateTokenPair({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
    });

    await db.session.update({
      where: { refreshToken },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: addDays(new Date(), 7),
      },
    });

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return successResponse({ expiresIn: tokens.expiresIn }, "Token refreshed");
  } catch {
    return serverErrorResponse();
  }
}
