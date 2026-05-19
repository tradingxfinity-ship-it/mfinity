import { NextRequest } from "next/server";
import { getRequestContext } from "@/lib/auth/session";
import { TransactionService } from "@/services/transaction.service";
import {
  successResponse,
  unauthorizedResponse,
  serverErrorResponse,
  getPaginationParams,
  buildPaginationMeta,
} from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const { page, limit } = getPaginationParams(req.nextUrl);
    const { items, total } = await TransactionService.getTransactionHistory(
      ctx.userId,
      page,
      limit
    );
    return successResponse({
      items,
      meta: buildPaginationMeta(total, page, limit),
    });
  } catch {
    return serverErrorResponse();
  }
}
