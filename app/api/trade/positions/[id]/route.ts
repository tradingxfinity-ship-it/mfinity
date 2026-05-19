import { NextRequest } from "next/server";
import { TradingService } from "@/services/trading.service";
import { getRequestContext } from "@/lib/auth/session";
import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

import { getCoinIdForSymbol } from "@/lib/trading-pairs";

async function fetchCurrentPrice(symbol: string): Promise<number | null> {
  const coinId = getCoinIdForSymbol(symbol);
  if (!coinId) return null;
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data[coinId]?.usd ?? null;
  } catch {
    return null;
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const { id } = await context.params;

  try {
    const body = await req.json().catch(() => ({}));
    let exitPrice: number | undefined = typeof body.exitPrice === "number" && body.exitPrice > 0 ? body.exitPrice : undefined;

    if (!exitPrice) {
      const position = await db.position.findUnique({ where: { id } });
      if (!position) return errorResponse("Position not found", 404);
      if (position.userId !== ctx.userId) return errorResponse("Forbidden", 403);

      const livePrice = await fetchCurrentPrice(position.symbol);
      exitPrice = livePrice ?? Number(position.currentPrice);
    }

    if (!exitPrice || exitPrice <= 0) {
      return errorResponse("Unable to determine exit price", 400);
    }

    const closed = await TradingService.closePosition(ctx.userId, id, exitPrice);
    return successResponse(closed, "Position closed");
  } catch (err) {
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
