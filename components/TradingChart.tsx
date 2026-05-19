"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type Time } from "lightweight-charts";

interface TradingChartProps {
  symbol: string;
  interval?: string;
  height?: number;
}

export function TradingChart({ symbol, interval = "1m", height = 480 }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#9CA3AF",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.04)" },
        horzLines: { color: "rgba(255,255,255,0.04)" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.06)" },
      timeScale: { borderColor: "rgba(255,255,255,0.06)", timeVisible: true, secondsVisible: false },
      crosshair: {
        mode: 1,
        vertLine: { color: "rgba(96,165,250,0.4)", labelBackgroundColor: "#60A5FA" },
        horzLine: { color: "rgba(96,165,250,0.4)", labelBackgroundColor: "#60A5FA" },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10B981",
      downColor: "#F43F5E",
      borderUpColor: "#10B981",
      borderDownColor: "#F43F5E",
      wickUpColor: "#10B981",
      wickDownColor: "#F43F5E",
    });

    chartRef.current = chart;
    seriesRef.current = candleSeries;

    const binanceSymbol = symbol.replace("/", "");
    let active = true;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    async function loadCandles() {
      try {
        const res = await fetch(`/api/market/klines?symbol=${binanceSymbol}&interval=${interval}`);
        const data: (string | number)[][] = await res.json();
        if (!active || !Array.isArray(data) || !seriesRef.current) return;

        const candles = data.map((k) => ({
          time: (Number(k[0]) / 1000) as Time,
          open: parseFloat(String(k[1])),
          high: parseFloat(String(k[2])),
          low: parseFloat(String(k[3])),
          close: parseFloat(String(k[4])),
        }));
        seriesRef.current.setData(candles);
        chart.timeScale().fitContent();
      } catch (err) {
        console.error("Failed to load candles:", err);
      }
    }

    loadCandles();
    // Refresh chart every 30 seconds
    pollInterval = setInterval(loadCandles, 30000);

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      active = false;
      if (pollInterval) clearInterval(pollInterval);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [symbol, interval, height]);

  return <div ref={containerRef} style={{ height }} className="w-full" />;
}
