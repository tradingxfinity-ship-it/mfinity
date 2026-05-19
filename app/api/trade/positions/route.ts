import { NextRequest } from "next/server";
import { TradingService } from "@/services/trading.service";
import { getRequestContext } from "@/lib/auth/session";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const status = (req.nextUrl.searchParams.get("status") ?? "OPEN") as "OPEN" | "CLOSED" | "ALL";
    const positions = await TradingService.getPositions(ctx.userId, status);
    return successResponse(positions);
  } catch {
    return serverErrorResponse();
  }
}
