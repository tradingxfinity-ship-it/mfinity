import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { VerifyEmailSchema } from "@/lib/validators/auth";
import { AuthService } from "@/services/auth.service";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = VerifyEmailSchema.parse(body);
    await AuthService.verifyEmail(token);
    return successResponse(null, "Email verified successfully");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
