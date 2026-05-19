import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { TradingService } from "@/services/trading.service";
import { getRequestContext } from "@/lib/auth/session";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";

const OrderSchema = z.object({
  symbol: z.string().min(1),
  side: z.enum(["LONG", "SHORT"]),
  quantity: z.number().positive(),
  marketPrice: z.number().positive(),
  leverage: z.number().int().min(1).max(20).optional(),
  stopLoss: z.number().positive().optional(),
  takeProfit: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const input = OrderSchema.parse(body);

    const position = await TradingService.placePaperOrder({
      userId: ctx.userId,
      ...input,
    });

    return successResponse(position, "Order placed");
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
