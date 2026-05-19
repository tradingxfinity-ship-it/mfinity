import { NextRequest } from "next/server";
import { ExchangeService } from "@/services/exchange.service";
import { getRequestContext } from "@/lib/auth/session";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const { id } = await params;
    await ExchangeService.disconnectExchange(id, ctx.userId);
    return successResponse(null, "Exchange disconnected");
  } catch (err) {
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
