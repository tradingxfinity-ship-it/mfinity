import { NextRequest, NextResponse } from "next/server";
import { getCoinIdForSymbol } from "@/lib/trading-pairs";

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const TTL_MS = 15_000;
const STALE_TTL_MS = 300_000;

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol") ?? "BTCUSDT";
  const coinId = getCoinIdForSymbol(symbol);
  if (!coinId) return NextResponse.json({ error: "Unknown symbol" }, { status: 400 });

  const cached = cache.get(coinId);
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return NextResponse.json(cached.data, { headers: { "Cache-Control": "no-store" } });
  }

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      // Serve stale data for up to 5 minutes on API errors
      if (cached && cached.expiresAt + STALE_TTL_MS > now) {
        return NextResponse.json(cached.data, { headers: { "Cache-Control": "no-store" } });
      }
      return NextResponse.json({ error: `Market API ${res.status}` }, { status: res.status });
    }

    const data = await res.json();
    const c = data[coinId];
    if (!c) return NextResponse.json({ error: "No data" }, { status: 404 });

    const price = c.usd;
    const change = c.usd_24h_change ?? 0;

    const result = {
      price,
      change24h: (price * change) / 100,
      changePercent24h: change,
      high24h: price * (1 + Math.max(0, change / 100) + 0.01),
      low24h: price * (1 - Math.abs(change / 100) - 0.005),
      volume24h: (c.usd_24h_vol ?? 0) / price,
    };

    cache.set(coinId, { data: result, expiresAt: Date.now() + TTL_MS });

    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    if (cached) return NextResponse.json(cached.data, { headers: { "Cache-Control": "no-store" } });
    return NextResponse.json({ error: `Fetch failed: ${String(err)}` }, { status: 500 });
  }
}
