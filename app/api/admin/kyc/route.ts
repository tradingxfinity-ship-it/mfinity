import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { KYCService } from "@/services/kyc.service";
import { getRequestContext } from "@/lib/auth/session";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  serverErrorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api";

const KYCActionSchema = z.object({
  userId: z.string().cuid(),
  action: z.enum(["approve", "reject"]),
  note: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  const { page, limit } = getPaginationParams(req.nextUrl);
  const { items, total } = await KYCService.getPendingKYC(page, limit);

  return successResponse({ items, meta: buildPaginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  try {
    const body = await req.json();
    const { userId, action, note } = KYCActionSchema.parse(body);

    if (action === "approve") {
      await KYCService.approveKYC(userId, ctx.userId, note);
    } else {
      if (!note) return errorResponse("Rejection reason required", 400);
      await KYCService.rejectKYC(userId, ctx.userId, note);
    }

    return successResponse(null, `KYC ${action}d`);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
