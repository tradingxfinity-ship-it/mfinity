import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/auth/session";
import { generateTOTPSecret, generateQRCode } from "@/lib/auth/totp";
import { db } from "@/lib/db";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) return unauthorizedResponse();
    if (user.twoFactorEnabled) {
      return successResponse({ alreadyEnabled: true });
    }

    const { secret, otpauthUrl } = generateTOTPSecret(user.email);
    const qrCode = await generateQRCode(otpauthUrl);

    // Store secret temporarily (not enabled until verified)
    await db.user.update({
      where: { id: ctx.userId },
      data: { twoFactorSecret: secret },
    });

    return successResponse({ qrCode, secret });
  } catch {
    return serverErrorResponse();
  }
}
