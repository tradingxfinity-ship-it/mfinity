import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ResetPasswordSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/auth.service";
import { clearAuthCookies } from "@/lib/auth/session";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = ResetPasswordSchema.parse(body);
    await AuthService.resetPassword(token, password);
    await clearAuthCookies();
    return successResponse(null, "Password reset successfully. Please log in.");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
