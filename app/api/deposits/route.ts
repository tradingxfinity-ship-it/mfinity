import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { DepositSchema } from "@/lib/validators/transactions";
import { TransactionService } from "@/services/transaction.service";
import { getRequestContext } from "@/lib/auth/session";
import { apiRateLimit } from "@/lib/redis";
import { db } from "@/lib/db";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  rateLimitResponse,
  serverErrorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const { page, limit, skip } = getPaginationParams(req.nextUrl);

  const [items, total] = await Promise.all([
    db.deposit.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.deposit.count({ where: { userId: ctx.userId } }),
  ]);

  return successResponse({
    items,
    meta: buildPaginationMeta(total, page, limit),
  });
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const { success } = await apiRateLimit.limit(`deposit:${ctx.userId}`);
  if (!success) return rateLimitResponse();

  try {
    const body = await req.json();
    const input = DepositSchema.parse(body);
    const deposit = await TransactionService.createDeposit(ctx.userId, input);
    return successResponse(deposit, "Deposit request submitted", 201);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
