interface CoinIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

export function CoinIcon({ symbol, size = 32, className = "" }: CoinIconProps) {
  const upper = symbol.toUpperCase();

  const props = { width: size, height: size, viewBox: "0 0 32 32", className };

  switch (upper) {
    case "BTC":
    case "BITCOIN":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#F7931A" />
          <path
            fill="#FFF"
            d="M23.189 14.02c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.745-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z"
          />
        </svg>
      );
    case "ETH":
    case "ETHEREUM":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#627EEA" />
          <g fill="#FFF" fillRule="nonzero">
            <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z" />
            <path d="M16.498 4L9 16.22l7.498-3.35z" />
            <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z" />
            <path d="M16.498 27.995v-6.028L9 17.616z" />
            <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z" />
            <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z" />
          </g>
        </svg>
      );
    case "USDT":
    case "TETHER":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#26A17B" />
          <path
            fill="#FFF"
            d="M17.922 17.383v-.002c-.11.008-.677.042-1.942.042-1.01 0-1.721-.03-1.971-.042v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.254.018.982.061 1.988.061 1.207 0 1.812-.05 1.925-.06v-2.643c3.88.173 6.775.85 6.775 1.658 0 .81-2.895 1.485-6.775 1.657m0-3.59v-2.366h5.414V7.819H8.595v3.608h5.414v2.365c-4.4.202-7.709 1.074-7.709 2.118 0 1.044 3.309 1.915 7.709 2.118v7.582h3.913v-7.584c4.393-.202 7.694-1.073 7.694-2.116 0-1.043-3.301-1.914-7.694-2.117"
          />
        </svg>
      );
    case "BNB":
    case "BINANCE":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
          <path
            fill="#FFF"
            d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z"
          />
        </svg>
      );
    case "SOL":
    case "SOLANA":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#000" />
          <defs>
            <linearGradient id="sol-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9945FF" />
              <stop offset="100%" stopColor="#14F195" />
            </linearGradient>
          </defs>
          <path
            fill="url(#sol-grad)"
            d="M9.925 19.687a.59.59 0 01.415-.17h14.366a.295.295 0 01.207.502l-2.838 2.815a.59.59 0 01-.415.171H7.294a.295.295 0 01-.207-.502l2.838-2.816zm0-10.517A.59.59 0 0110.34 9h14.366a.295.295 0 01.207.502l-2.838 2.816a.59.59 0 01-.415.17H7.294a.295.295 0 01-.207-.502l2.838-2.816zm12.15 5.225a.59.59 0 00-.415-.17H7.294a.295.295 0 00-.207.502l2.838 2.816a.59.59 0 00.415.17h14.366a.295.295 0 00.207-.502l-2.838-2.816z"
          />
        </svg>
      );
    case "TRC20":
    case "TRX":
    case "TRON":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="16" fill="#FF060A" />
          <path
            fill="#FFF"
            d="M21.93 9.48a.39.39 0 00-.18-.27L7.7 6.51a.41.41 0 00-.47.55l3.83 9.55a.42.42 0 00.37.26l9.94.92a.41.41 0 00.42-.5L21.93 9.48zm-1.6.95l-1.31 5.27-8.16-.76 9.47-4.51zm-1.55 5.93l1.13-4.54 2.56 4.94-3.69-.4zM9.5 8.41l9.47 2.13-9.6 4.57L9.5 8.4zm.34 6.83l8.36.77 1.51 1.6-9.87-2.37z"
          />
        </svg>
      );
    case "XRP":
      return <CoinBadge symbol="XRP" size={size} className={className} bg="#23292F" text="#FFF" />;
    case "ADA":
      return <CoinBadge symbol="ADA" size={size} className={className} bg="#0033AD" text="#FFF" />;
    case "DOGE":
      return <CoinBadge symbol="Ð" size={size} className={className} bg="#C2A633" text="#FFF" />;
    case "AVAX":
      return <CoinBadge symbol="AVAX" size={size} className={className} bg="#E84142" text="#FFF" />;
    case "DOT":
      return <CoinBadge symbol="DOT" size={size} className={className} bg="#E6007A" text="#FFF" />;
    case "MATIC":
    case "POL":
      return <CoinBadge symbol="MATIC" size={size} className={className} bg="#8247E5" text="#FFF" />;
    case "LINK":
      return <CoinBadge symbol="LINK" size={size} className={className} bg="#2A5ADA" text="#FFF" />;
    case "LTC":
      return <CoinBadge symbol="Ł" size={size} className={className} bg="#345D9D" text="#FFF" />;
    case "UNI":
      return <CoinBadge symbol="UNI" size={size} className={className} bg="#FF007A" text="#FFF" />;
    case "ATOM":
      return <CoinBadge symbol="ATOM" size={size} className={className} bg="#2E3148" text="#FFF" />;
    case "ARB":
      return <CoinBadge symbol="ARB" size={size} className={className} bg="#28A0F0" text="#FFF" />;
    case "OP":
      return <CoinBadge symbol="OP" size={size} className={className} bg="#FF0420" text="#FFF" />;
    case "NEAR":
      return <CoinBadge symbol="NEAR" size={size} className={className} bg="#000" text="#FFF" />;
    case "APT":
      return <CoinBadge symbol="APT" size={size} className={className} bg="#1A1A1A" text="#FFF" />;
    case "SUI":
      return <CoinBadge symbol="SUI" size={size} className={className} bg="#6FBCF0" text="#FFF" />;
    case "PEPE":
      return <CoinBadge symbol="PEPE" size={size} className={className} bg="#4CAA29" text="#FFF" />;
    case "SHIB":
      return <CoinBadge symbol="SHIB" size={size} className={className} bg="#FFA409" text="#FFF" />;
    default:
      return (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-gray-500 to-gray-700 rounded-full ${className}`}
          style={{ width: size, height: size }}
        >
          <span className="text-white font-bold" style={{ fontSize: size * 0.35 }}>
            {upper.slice(0, 3)}
          </span>
        </div>
      );
  }
}

function CoinBadge({ symbol, size, className, bg, text }: { symbol: string; size: number; className: string; bg: string; text: string }) {
  const fontSize = symbol.length === 1 ? size * 0.55 : symbol.length <= 3 ? size * 0.36 : size * 0.28;
  return (
    <div
      className={`flex items-center justify-center rounded-full ${className}`}
      style={{ width: size, height: size, background: bg }}
    >
      <span style={{ color: text, fontSize, fontWeight: 800, lineHeight: 1 }}>{symbol}</span>
    </div>
  );
}
