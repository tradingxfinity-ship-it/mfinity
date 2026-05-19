import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mfinity Trading Bot — Next-Gen Crypto Trading Platform",
  description:
    "Trade smarter with Mfinity Trading Bot. Blazing-fast execution, real-time analytics, and institutional-grade security — all in one platform.",
  keywords: "crypto trading, DeFi, trading bot, blockchain, analytics, xfinity",
  openGraph: {
    title: "Mfinity Trading Bot — Next-Gen Crypto Trading Platform",
    description: "Trade smarter with Mfinity Trading Bot. Blazing-fast execution, real-time analytics, and institutional-grade security.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased bg-[#0A0A0F] text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
