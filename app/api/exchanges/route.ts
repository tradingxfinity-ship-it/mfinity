import { NextRequest } from "next/server";
import { z, ZodError } from "zod";
import { ExchangeService } from "@/services/exchange.service";
import { getRequestContext } from "@/lib/auth/session";
import {
  successResponse,
  zodErrorResponse,
  errorResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from "@/lib/api";
import type { SupportedExchange } from "@/types";

const ConnectSchema = z.object({
  exchange: z.enum(["binance", "bybit", "okx", "coinbase"]),
  label: z.string().min(1).max(50),
  apiKey: z.string().min(1),
  apiSecret: z.string().min(1),
  passphrase: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  const connections = await ExchangeService.getUserConnections(ctx.userId);
  return successResponse(connections);
}

export async function POST(req: NextRequest) {
  const ctx = await getRequestContext();
  if (!ctx) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { exchange, label, apiKey, apiSecret, passphrase } = ConnectSchema.parse(body);

    const result = await ExchangeService.connectExchange(
      ctx.userId,
      exchange as SupportedExchange,
      { apiKey, apiSecret, passphrase },
      label
    );

    return successResponse(result, "Exchange connected", 201);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof Error) return errorResponse(err.message, 400);
    return serverErrorResponse();
  }
}
