"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  /** Binance-style symbol, e.g. "BTCUSDT" */
  symbol: string;
  /** Our interval format: 1m, 5m, 15m, 1h, 4h, 1d */
  interval?: string;
  height?: number;
}

const INTERVAL_MAP: Record<string, string> = {
  "1m": "1",
  "5m": "5",
  "15m": "15",
  "1h": "60",
  "4h": "240",
  "1d": "D",
};

function TradingViewChart({ symbol, interval = "1m", height = 560 }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Fresh widget mount point that fills the container
    container.innerHTML =
      '<div class="tradingview-widget-container__widget" style="height:100%;width:100%"></div>';

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    // Explicit width/height — autosize is unreliable inside flex/grid panels
    script.innerHTML = JSON.stringify({
      width: "100%",
      height: height,
      symbol: `BINANCE:${symbol}`,
      interval: INTERVAL_MAP[interval] ?? "1",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      enable_publishing: false,
      hide_side_toolbar: false,
      allow_symbol_change: false,
      hide_volume: false,
      backgroundColor: "#0F0F1A",
      gridColor: "rgba(255, 255, 255, 0.04)",
      withdateranges: true,
      details: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, interval, height]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container"
      style={{ height, width: "100%" }}
    />
  );
}

export default memo(TradingViewChart);
