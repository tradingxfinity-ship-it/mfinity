interface ExchangeIconProps {
  name: string;
  size?: number;
  className?: string;
}

export function ExchangeIcon({ name, size = 32, className = "" }: ExchangeIconProps) {
  const lower = name.toLowerCase();
  const props = { width: size, height: size, viewBox: "0 0 40 40", className };

  switch (lower) {
    case "binance":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#F3BA2F" />
          <path
            fill="#FFF"
            d="M14.94 18.06L20 13l5.06 5.06 2.94-2.94L20 7.13l-7.94 7.99 2.88 2.94zM7 20l2.94-2.94L12.88 20l-2.94 2.94L7 20zm7.94 1.94L20 27l5.06-5.06 2.94 2.94L20 32.87l-7.99-7.99 2.93-2.94zM28 20l2.94-2.94L33.87 20l-2.93 2.94L28 20zm-5 0l-3-3-3 3 3 3 3-3z"
          />
        </svg>
      );

    case "bybit":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#17181F" />
          <text
            x="20"
            y="25"
            textAnchor="middle"
            fill="#F7A600"
            fontSize="11"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            letterSpacing="-0.5"
          >
            Bybit
          </text>
        </svg>
      );

    case "okx":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#000" />
          <g fill="#FFF">
            <rect x="10" y="10" width="6" height="6" rx="0.5" />
            <rect x="17" y="17" width="6" height="6" rx="0.5" />
            <rect x="24" y="10" width="6" height="6" rx="0.5" />
            <rect x="10" y="24" width="6" height="6" rx="0.5" />
            <rect x="24" y="24" width="6" height="6" rx="0.5" />
          </g>
        </svg>
      );

    case "coinbase":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#0052FF" />
          <circle cx="20" cy="20" r="9" fill="none" stroke="#FFF" strokeWidth="3.5" />
          <rect x="16" y="17" width="8" height="6" rx="1" fill="#0052FF" />
        </svg>
      );

    case "kraken":
      return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="20" fill="#5741D9" />
          <g fill="#FFF">
            <rect x="11" y="13" width="3" height="14" rx="1.5" />
            <rect x="17" y="13" width="3" height="14" rx="1.5" />
            <rect x="23" y="13" width="3" height="14" rx="1.5" />
          </g>
        </svg>
      );

    default:
      return (
        <div
          className={`flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-800 rounded-full ${className}`}
          style={{ width: size, height: size }}
        >
          <span className="text-white font-bold" style={{ fontSize: size * 0.32 }}>
            {name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      );
  }
}
