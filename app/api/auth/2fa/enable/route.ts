import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { Enable2FASchema } from "@/lib/validators/auth";
import { getRequestContext } from "@/lib/auth/session";
import { verifyTOTPToken } from "@/lib/auth/totp";
import { db } from "@/lib/db";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { token } = Enable2FASchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user?.twoFactorSecret) {
      return errorResponse("Setup 2FA first", 400);
    }

    const valid = verifyTOTPToken(user.twoFactorSecret, token);
    if (!valid) return errorResponse("Invalid token", 400);

    await db.user.update({
      where: { id: ctx.userId },
      data: { twoFactorEnabled: true },
    });

    return successResponse(null, "2FA enabled successfully");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return serverErrorResponse();
  }
}

export async function DELETE(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { token } = Enable2FASchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: ctx.userId },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) return errorResponse("2FA not enabled", 400);

    const valid = verifyTOTPToken(user.twoFactorSecret, token);
    if (!valid) return errorResponse("Invalid token", 400);

    await db.user.update({
      where: { id: ctx.userId },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    return successResponse(null, "2FA disabled");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    return serverErrorResponse();
  }
}
