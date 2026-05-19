import { NextRequest, NextResponse } from "next/server";
import { getCoinIdForSymbol } from "@/lib/trading-pairs";

const INTERVAL_TO_DAYS: Record<string, string> = {
  "1m": "1",
  "5m": "1",
  "15m": "1",
  "1h": "7",
  "4h": "30",
  "1d": "90",
};

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 60_000;

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT";
  const interval = req.nextUrl.searchParams.get("interval") ?? "1m";

  const coinId = getCoinIdForSymbol(symbol);
  if (!coinId) return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });

  const days = INTERVAL_TO_DAYS[interval] ?? "1";
  const cacheKey = `${coinId}-${days}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(cached.data, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      if (cached) return NextResponse.json(cached.data, { headers: { "Cache-Control": "no-store" } });
      return NextResponse.json({ error: `Market API ${res.status}` }, { status: res.status });
    }

    const data: number[][] = await res.json();
    const candles = data.map((c) => [c[0], String(c[1]), String(c[2]), String(c[3]), String(c[4]), "0"]);

    cache.set(cacheKey, { data: candles, expiresAt: Date.now() + TTL_MS });

    return NextResponse.json(candles, { headers: { "Cache-Control": "no-store" } });
  } catch {
    if (cached) return NextResponse.json(cached.data, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
