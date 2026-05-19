"use client";

import { useEffect, useState } from "react";

interface Entry {
  price: number;
  qty: number;
  total: number;
}

interface OrderBookProps {
  symbol: string;
  basePrice: number | null;
}

/**
 * Synthetic order book — generates a realistic-looking depth chart centered
 * on the current market price. Updates every 2 seconds with small variations.
 */
export function OrderBook({ symbol: _symbol, basePrice }: OrderBookProps) {
  const [bids, setBids] = useState<Entry[]>([]);
  const [asks, setAsks] = useState<Entry[]>([]);

  useEffect(() => {
    if (!basePrice || basePrice <= 0) return;

    function generate() {
      const spread = basePrice! * 0.0001;
      const tickSize = basePrice! < 100 ? 0.01 : basePrice! < 1000 ? 0.1 : 1;

      const newBids: Entry[] = [];
      const newAsks: Entry[] = [];

      let bidCum = 0;
      let askCum = 0;

      for (let i = 0; i < 10; i++) {
        const bidPrice = basePrice! - spread - i * tickSize - Math.random() * tickSize;
        const askPrice = basePrice! + spread + i * tickSize + Math.random() * tickSize;
        const bidQty = Math.random() * 2 + 0.05;
        const askQty = Math.random() * 2 + 0.05;
        bidCum += bidQty;
        askCum += askQty;
        newBids.push({ price: bidPrice, qty: bidQty, total: bidCum });
        newAsks.push({ price: askPrice, qty: askQty, total: askCum });
      }

      setBids(newBids);
      setAsks(newAsks);
    }

    generate();
    const interval = setInterval(generate, 2000);
    return () => clearInterval(interval);
  }, [basePrice]);

  const maxAskTotal = asks.length ? Math.max(...asks.map((a) => a.total)) : 1;
  const maxBidTotal = bids.length ? Math.max(...bids.map((b) => b.total)) : 1;

  if (!basePrice) {
    return (
      <div className="px-3 py-8 text-center text-xs text-gray-500">
        Loading market depth...
      </div>
    );
  }

  return (
    <div className="text-xs font-mono">
      <div className="grid grid-cols-3 px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-gray-500 border-b border-[#1E1E2E]">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>

      <div className="space-y-px">
        {[...asks].reverse().map((a, i) => (
          <div key={`a-${i}`} className="relative grid grid-cols-3 px-3 py-1 hover:bg-white/[0.02]">
            <div
              className="absolute inset-y-0 right-0 bg-rose-500/[0.08]"
              style={{ width: `${(a.total / maxAskTotal) * 100}%` }}
            />
            <span className="relative text-rose-400 font-medium">{a.price.toFixed(2)}</span>
            <span className="relative text-right text-gray-300">{a.qty.toFixed(4)}</span>
            <span className="relative text-right text-gray-500">{a.total.toFixed(4)}</span>
          </div>
        ))}
      </div>

      {bids.length > 0 && asks.length > 0 && (
        <div className="my-1 px-3 py-1.5 text-center border-y border-[#1E1E2E] bg-white/[0.02]">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Spread </span>
          <span className="text-white font-semibold">
            ${(asks[0].price - bids[0].price).toFixed(2)} ({(((asks[0].price - bids[0].price) / asks[0].price) * 100).toFixed(3)}%)
          </span>
        </div>
      )}

      <div className="space-y-px">
        {bids.map((b, i) => (
          <div key={`b-${i}`} className="relative grid grid-cols-3 px-3 py-1 hover:bg-white/[0.02]">
            <div
              className="absolute inset-y-0 right-0 bg-emerald-500/[0.08]"
              style={{ width: `${(b.total / maxBidTotal) * 100}%` }}
            />
            <span className="relative text-emerald-400 font-medium">{b.price.toFixed(2)}</span>
            <span className="relative text-right text-gray-300">{b.qty.toFixed(4)}</span>
            <span className="relative text-right text-gray-500">{b.total.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
