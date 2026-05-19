import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { AdminDepositActionSchema } from "@/lib/validators/transactions";
import { TransactionService } from "@/services/transaction.service";
import { getRequestContext } from "@/lib/auth/session";
import { db } from "@/lib/db";
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

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  const { page, limit, skip } = getPaginationParams(req.nextUrl);
  const status = req.nextUrl.searchParams.get("status");

  const where = status ? { status: status as never } : {};

  const [items, total] = await Promise.all([
    db.deposit.findMany({
      where,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.deposit.count({ where }),
  ]);

  return successResponse({ items, meta: buildPaginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();
  if (ctx.role !== "ADMIN" && ctx.role !== "SUPER_ADMIN") return forbiddenResponse();

  try {
    const body = await req.json();
    const { depositId, action, note, txHash } = AdminDepositActionSchema.parse(body);

    if (action === "approve") {
      await TransactionService.approveDeposit(depositId, ctx.userId, note);
    } else {
      await TransactionService.rejectDeposit(depositId, ctx.userId, note);
    }

    return successResponse(null, `Deposit ${action}d`);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
