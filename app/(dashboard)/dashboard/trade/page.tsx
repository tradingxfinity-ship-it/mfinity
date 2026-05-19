"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { TrendingUp, TrendingDown, Loader2, Zap, X, Activity, Sparkles, BarChart2, ChevronDown, Search } from "lucide-react";
import { OrderBook } from "@/components/OrderBook";
import { CoinIcon } from "@/components/CoinIcon";
import { TRADING_PAIRS } from "@/lib/trading-pairs";

const TradingChart = dynamic(() => import("@/components/TradingChart").then((m) => m.TradingChart), {
  ssr: false,
  loading: () => <div className="h-[480px] flex items-center justify-center text-gray-500"><Loader2 className="animate-spin" size={20} /></div>,
});

const SYMBOLS = TRADING_PAIRS;

const INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"];

interface Ticker {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

interface Position {
  id: string;
  symbol: string;
  side: string;
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
  leverage: number;
  openedAt: string;
}

export default function TradePage() {
  const [symbol, setSymbol] = useState(SYMBOLS[0]);
  const [interval, setInterval_] = useState("1m");
  const [showSymbols, setShowSymbols] = useState(false);
  const [symbolQuery, setSymbolQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [ticker, setTicker] = useState<Ticker | null>(null);
  const [side, setSide] = useState<"LONG" | "SHORT">("LONG");
  const [quantity, setQuantity] = useState("");
  const [leverage, setLeverage] = useState(1);
  const [balance, setBalance] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [closing, setClosing] = useState<string | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSymbols(false);
      }
    }
    if (showSymbols) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSymbols]);

  const loadPositions = useCallback(() => {
    fetch("/api/trade/positions?status=OPEN")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPositions(d.data); });
  }, []);

  useEffect(() => {
    loadPositions();
    fetch("/api/user/dashboard")
      .then((r) => r.json())
      .then((d) => { if (d.success) setBalance(d.data.stats.availableBalance); });
  }, [loadPositions]);

  // Live ticker via polling (CoinGecko works globally, no regional blocks)
  useEffect(() => {
    let active = true;
    async function fetchTicker() {
      try {
        const res = await fetch(`/api/market/ticker?symbol=${symbol.id}`);
        const data = await res.json();
        if (active && data && !data.error) setTicker(data);
      } catch {}
    }
    fetchTicker();
    const interval = setInterval(fetchTicker, 10000);
    return () => { active = false; clearInterval(interval); };
  }, [symbol.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticker) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/trade/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: symbol.display,
          side,
          quantity: parseFloat(quantity),
          marketPrice: ticker.price,
          leverage,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error); return; }
      setQuantity("");
      loadPositions();
      // refresh balance
      const dash = await fetch("/api/user/dashboard").then((r) => r.json());
      if (dash.success) setBalance(dash.data.stats.availableBalance);
    } catch {
      setError("Order failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleClose(pos: Position) {
    setClosing(pos.id);
    try {
      const body = ticker?.price && pos.symbol === symbol.display ? { exitPrice: ticker.price } : {};
      const res = await fetch(`/api/trade/positions/${pos.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        loadPositions();
        const dash = await fetch("/api/user/dashboard").then((r) => r.json());
        if (dash.success) setBalance(dash.data.stats.availableBalance);
      } else {
        setError(data.error ?? "Failed to close position");
      }
    } finally {
      setClosing(null);
    }
  }

  const orderValue = ticker && quantity ? parseFloat(quantity) * ticker.price : 0;
  const margin = orderValue / leverage;
  const canSubmit = quantity && parseFloat(quantity) > 0 && margin <= balance && !submitting;
  const isUp = (ticker?.changePercent24h ?? 0) >= 0;

  return (
    <div className="space-y-4 max-w-[1600px]">
      {/* Top ticker bar */}
      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl px-5 py-4">
        <div className="flex flex-wrap items-center gap-5">
          {/* Symbol selector */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => { setShowSymbols(!showSymbols); setSymbolQuery(""); }}
              className="flex items-center gap-3 hover:bg-white/5 rounded-xl px-2 py-1.5 -mx-2 transition-colors"
            >
              <CoinIcon symbol={symbol.base} size={32} className="shrink-0" />
              <div className="text-left">
                <p className="text-white font-bold text-base flex items-center gap-1">
                  {symbol.display}
                  <ChevronDown size={14} className="text-gray-500" />
                </p>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Paper Trading</p>
              </div>
            </button>
            {showSymbols && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#13131F] border border-[#1E1E2E] rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="p-2 border-b border-[#1E1E2E]">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      autoFocus
                      value={symbolQuery}
                      onChange={(e) => setSymbolQuery(e.target.value)}
                      placeholder="Search markets..."
                      className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white text-sm rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/10"
                    />
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {SYMBOLS.filter((s) => {
                    if (!symbolQuery) return true;
                    const q = symbolQuery.toLowerCase();
                    return s.base.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.display.toLowerCase().includes(q);
                  }).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSymbol(s); setShowSymbols(false); setSymbolQuery(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors ${s.id === symbol.id ? "bg-blue-500/10" : ""}`}
                    >
                      <CoinIcon symbol={s.base} size={24} className="shrink-0" />
                      <div className="flex-1 text-left">
                        <p className="text-sm text-white font-medium">{s.display}</p>
                        <p className="text-[10px] text-gray-500">{s.name}</p>
                      </div>
                      {s.id === symbol.id && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-10 w-px bg-white/5" />

          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Last Price</p>
            <p className={`text-2xl font-bold tracking-tight ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              ${ticker?.price.toFixed(2) ?? "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">24h Change</p>
            <p className={`text-sm font-bold flex items-center gap-1 ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
              {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {isUp ? "+" : ""}{ticker?.changePercent24h.toFixed(2) ?? "—"}%
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">24h High</p>
            <p className="text-sm text-white font-semibold">${ticker?.high24h.toFixed(2) ?? "—"}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">24h Low</p>
            <p className="text-sm text-white font-semibold">${ticker?.low24h.toFixed(2) ?? "—"}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">24h Volume</p>
            <p className="text-sm text-white font-semibold">{((ticker?.volume24h ?? 0) / 1000).toFixed(1)}K {symbol.base}</p>
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-lg font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Market
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart */}
        <div className="lg:col-span-7 bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E1E2E]">
            <div className="flex items-center gap-2">
              <BarChart2 size={14} className="text-blue-400" />
              <span className="text-sm text-white font-bold">{symbol.display}</span>
              <span className="text-[10px] bg-white/5 text-gray-400 px-1.5 py-0.5 rounded font-medium">Candlestick</span>
            </div>
            <div className="flex items-center gap-1 bg-[#0A0A14] border border-[#1E1E2E] rounded-lg p-1">
              {INTERVALS.map((i) => (
                <button
                  key={i}
                  onClick={() => setInterval_(i)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                    interval === i ? "bg-gradient-to-r from-blue-500/20 to-purple-500/10 text-white border border-blue-500/20" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="p-2">
            <TradingChart key={`${symbol.id}-${interval}`} symbol={symbol.display} interval={interval} height={480} />
          </div>
        </div>

        {/* Order book */}
        <div className="lg:col-span-2 bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
          <div className="px-3 py-3 border-b border-[#1E1E2E] flex items-center gap-2">
            <Activity size={13} className="text-blue-400" />
            <span className="text-sm text-white font-bold">Order Book</span>
          </div>
          <OrderBook symbol={symbol.display} basePrice={ticker?.price ?? null} />
        </div>

        {/* Trade form */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden flex flex-col">
          <div className="flex">
            <button
              onClick={() => setSide("LONG")}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                side === "LONG" ? "bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-500" : "text-gray-500 hover:text-gray-300 border-b-2 border-transparent"
              }`}
            >
              Buy / Long
            </button>
            <button
              onClick={() => setSide("SHORT")}
              className={`flex-1 py-3 text-sm font-bold transition-all ${
                side === "SHORT" ? "bg-rose-500/15 text-rose-400 border-b-2 border-rose-500" : "text-gray-500 hover:text-gray-300 border-b-2 border-transparent"
              }`}
            >
              Sell / Short
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Available</span>
              <span className="text-sm text-white font-bold">${balance.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-bold">Order Type</label>
              <div className="bg-[#0A0A14] border border-[#1E1E2E] rounded-xl px-3 py-2.5 text-sm text-white font-medium flex items-center justify-between">
                <span>Market</span>
                <span className="text-[10px] text-gray-500">@ ${ticker?.price.toFixed(2) ?? "—"}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 mb-2 uppercase tracking-wider font-bold">Quantity ({symbol.base})</label>
              <input
                type="number"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#0A0A14] border border-[#1E1E2E] focus:border-blue-500/40 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-mono transition-all"
                required
              />
              <div className="flex gap-1 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      if (ticker) {
                        const targetMargin = (balance * pct) / 100;
                        const qty = (targetMargin * leverage) / ticker.price;
                        setQuantity(qty.toFixed(6));
                      }
                    }}
                    className="flex-1 text-[10px] font-bold text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-[#1E1E2E] rounded-lg py-1.5 transition-colors"
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Leverage</label>
                <span className="text-sm text-white font-bold">{leverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={leverage}
                onChange={(e) => setLeverage(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-[9px] text-gray-600 mt-1">
                <span>1x</span><span>5x</span><span>10x</span><span>15x</span><span>20x</span>
              </div>
            </div>

            {quantity && ticker && (
              <div className="bg-[#0A0A14] border border-[#1E1E2E] rounded-xl p-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order value</span>
                  <span className="text-white font-medium">${orderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Margin (locked)</span>
                  <span className="text-white font-medium">${margin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-[#1E1E2E] pt-1.5">
                  <span className="text-gray-400 font-medium">Remaining</span>
                  <span className={`font-bold ${balance - margin >= 0 ? "text-emerald-400" : "text-rose-400"}`}>${(balance - margin).toFixed(2)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 text-xs text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                side === "LONG"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:opacity-90 shadow-emerald-500/20"
                  : "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:opacity-90 shadow-rose-500/20"
              } disabled:opacity-40 disabled:shadow-none disabled:cursor-not-allowed`}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {side === "LONG" ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {side === "LONG" ? "Buy" : "Sell"} {symbol.base}
            </button>

            <p className="text-[10px] text-gray-600 text-center">
              <Sparkles size={9} className="inline mr-1" />
              Paper trading · Simulated with live prices
            </p>
          </form>
        </div>
      </div>

      {/* Open positions */}
      <div className="bg-gradient-to-br from-[#13131F] to-[#0F0F1A] border border-[#1E1E2E] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1E1E2E] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <span className="text-sm text-white font-bold">Open Positions</span>
            <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-md">{positions.length}</span>
          </div>
        </div>
        {positions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-2">
              <Activity size={18} className="text-gray-500" />
            </div>
            <p className="text-gray-400 text-sm">No open positions</p>
            <p className="text-gray-600 text-xs mt-0.5">Place your first trade above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-[#1E1E2E]">
                  <th className="text-left px-4 py-2.5 font-bold">Symbol</th>
                  <th className="text-left px-4 py-2.5 font-bold">Side</th>
                  <th className="text-right px-4 py-2.5 font-bold">Quantity</th>
                  <th className="text-right px-4 py-2.5 font-bold">Entry</th>
                  <th className="text-right px-4 py-2.5 font-bold">Mark</th>
                  <th className="text-right px-4 py-2.5 font-bold">Margin</th>
                  <th className="text-right px-4 py-2.5 font-bold">P&L</th>
                  <th className="text-right px-4 py-2.5 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((p) => {
                  const livePrice = p.symbol === symbol.display && ticker ? ticker.price : Number(p.currentPrice);
                  const livePnl = p.side === "LONG"
                    ? (livePrice - Number(p.entryPrice)) * Number(p.quantity)
                    : (Number(p.entryPrice) - livePrice) * Number(p.quantity);
                  const livePnlPct = (livePnl / Number(p.margin)) * 100;
                  const positive = livePnl >= 0;
                  return (
                    <tr key={p.id} className="border-b border-[#1E1E2E] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 text-white font-semibold">{p.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${p.side === "LONG" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {p.side} {p.leverage}x
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono text-xs">{Number(p.quantity).toFixed(6)}</td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono text-xs">${Number(p.entryPrice).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-white font-mono text-xs">${livePrice.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono text-xs">${Number(p.margin).toFixed(2)}</td>
                      <td className={`px-4 py-3 text-right font-bold ${positive ? "text-emerald-400" : "text-rose-400"}`}>
                        {positive ? "+" : ""}${livePnl.toFixed(2)}
                        <div className="text-[10px] font-medium">{positive ? "+" : ""}{livePnlPct.toFixed(2)}%</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleClose(p)}
                          disabled={closing === p.id}
                          className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 rounded-lg px-3 py-1 font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                        >
                          {closing === p.id ? <Loader2 size={11} className="animate-spin" /> : <X size={11} />}
                          Close
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
