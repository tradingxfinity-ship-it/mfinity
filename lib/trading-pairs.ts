export interface TradingPair {
  id: string;
  display: string;
  base: string;
  quote: string;
  coinId: string;
  name: string;
}

export const TRADING_PAIRS: TradingPair[] = [
  // Tier 1 — Major caps
  { id: "BTCUSDT", display: "BTC/USDT", base: "BTC", quote: "USDT", coinId: "bitcoin", name: "Bitcoin" },
  { id: "ETHUSDT", display: "ETH/USDT", base: "ETH", quote: "USDT", coinId: "ethereum", name: "Ethereum" },
  { id: "SOLUSDT", display: "SOL/USDT", base: "SOL", quote: "USDT", coinId: "solana", name: "Solana" },
  { id: "BNBUSDT", display: "BNB/USDT", base: "BNB", quote: "USDT", coinId: "binancecoin", name: "BNB" },
  { id: "XRPUSDT", display: "XRP/USDT", base: "XRP", quote: "USDT", coinId: "ripple", name: "XRP" },
  { id: "TONUSDT", display: "TON/USDT", base: "TON", quote: "USDT", coinId: "the-open-network", name: "Toncoin" },

  // Tier 2 — Layer 1s
  { id: "ADAUSDT", display: "ADA/USDT", base: "ADA", quote: "USDT", coinId: "cardano", name: "Cardano" },
  { id: "AVAXUSDT", display: "AVAX/USDT", base: "AVAX", quote: "USDT", coinId: "avalanche-2", name: "Avalanche" },
  { id: "DOTUSDT", display: "DOT/USDT", base: "DOT", quote: "USDT", coinId: "polkadot", name: "Polkadot" },
  { id: "TRXUSDT", display: "TRX/USDT", base: "TRX", quote: "USDT", coinId: "tron", name: "Tron" },
  { id: "NEARUSDT", display: "NEAR/USDT", base: "NEAR", quote: "USDT", coinId: "near", name: "Near Protocol" },
  { id: "APTUSDT", display: "APT/USDT", base: "APT", quote: "USDT", coinId: "aptos", name: "Aptos" },
  { id: "SUIUSDT", display: "SUI/USDT", base: "SUI", quote: "USDT", coinId: "sui", name: "Sui" },
  { id: "ATOMUSDT", display: "ATOM/USDT", base: "ATOM", quote: "USDT", coinId: "cosmos", name: "Cosmos" },
  { id: "ALGOUSDT", display: "ALGO/USDT", base: "ALGO", quote: "USDT", coinId: "algorand", name: "Algorand" },
  { id: "HBARUSDT", display: "HBAR/USDT", base: "HBAR", quote: "USDT", coinId: "hedera-hashgraph", name: "Hedera" },
  { id: "FTMUSDT", display: "FTM/USDT", base: "FTM", quote: "USDT", coinId: "fantom", name: "Fantom" },
  { id: "VETUSDT", display: "VET/USDT", base: "VET", quote: "USDT", coinId: "vechain", name: "VeChain" },
  { id: "ICPUSDT", display: "ICP/USDT", base: "ICP", quote: "USDT", coinId: "internet-computer", name: "Internet Computer" },
  { id: "KASUSDT", display: "KAS/USDT", base: "KAS", quote: "USDT", coinId: "kaspa", name: "Kaspa" },
  { id: "TIAUSDT", display: "TIA/USDT", base: "TIA", quote: "USDT", coinId: "celestia", name: "Celestia" },

  // Tier 3 — Bitcoin family & oldies
  { id: "BCHUSDT", display: "BCH/USDT", base: "BCH", quote: "USDT", coinId: "bitcoin-cash", name: "Bitcoin Cash" },
  { id: "LTCUSDT", display: "LTC/USDT", base: "LTC", quote: "USDT", coinId: "litecoin", name: "Litecoin" },
  { id: "ETCUSDT", display: "ETC/USDT", base: "ETC", quote: "USDT", coinId: "ethereum-classic", name: "Ethereum Classic" },
  { id: "XLMUSDT", display: "XLM/USDT", base: "XLM", quote: "USDT", coinId: "stellar", name: "Stellar" },
  { id: "XMRUSDT", display: "XMR/USDT", base: "XMR", quote: "USDT", coinId: "monero", name: "Monero" },
  { id: "EOSUSDT", display: "EOS/USDT", base: "EOS", quote: "USDT", coinId: "eos", name: "EOS" },
  { id: "FILUSDT", display: "FIL/USDT", base: "FIL", quote: "USDT", coinId: "filecoin", name: "Filecoin" },

  // L2s & scaling
  { id: "MATICUSDT", display: "MATIC/USDT", base: "MATIC", quote: "USDT", coinId: "matic-network", name: "Polygon" },
  { id: "ARBUSDT", display: "ARB/USDT", base: "ARB", quote: "USDT", coinId: "arbitrum", name: "Arbitrum" },
  { id: "OPUSDT", display: "OP/USDT", base: "OP", quote: "USDT", coinId: "optimism", name: "Optimism" },
  { id: "IMXUSDT", display: "IMX/USDT", base: "IMX", quote: "USDT", coinId: "immutable-x", name: "Immutable" },

  // DeFi
  { id: "UNIUSDT", display: "UNI/USDT", base: "UNI", quote: "USDT", coinId: "uniswap", name: "Uniswap" },
  { id: "LINKUSDT", display: "LINK/USDT", base: "LINK", quote: "USDT", coinId: "chainlink", name: "Chainlink" },
  { id: "AAVEUSDT", display: "AAVE/USDT", base: "AAVE", quote: "USDT", coinId: "aave", name: "Aave" },
  { id: "MKRUSDT", display: "MKR/USDT", base: "MKR", quote: "USDT", coinId: "maker", name: "Maker" },
  { id: "LDOUSDT", display: "LDO/USDT", base: "LDO", quote: "USDT", coinId: "lido-dao", name: "Lido DAO" },
  { id: "INJUSDT", display: "INJ/USDT", base: "INJ", quote: "USDT", coinId: "injective-protocol", name: "Injective" },
  { id: "RUNEUSDT", display: "RUNE/USDT", base: "RUNE", quote: "USDT", coinId: "thorchain", name: "THORChain" },
  { id: "GRTUSDT", display: "GRT/USDT", base: "GRT", quote: "USDT", coinId: "the-graph", name: "The Graph" },
  { id: "CROUSDT", display: "CRO/USDT", base: "CRO", quote: "USDT", coinId: "crypto-com-chain", name: "Cronos" },

  // AI & infrastructure
  { id: "RNDRUSDT", display: "RNDR/USDT", base: "RNDR", quote: "USDT", coinId: "render-token", name: "Render" },
  { id: "FETUSDT", display: "FET/USDT", base: "FET", quote: "USDT", coinId: "fetch-ai", name: "Fetch.ai" },
  { id: "WLDUSDT", display: "WLD/USDT", base: "WLD", quote: "USDT", coinId: "worldcoin-wld", name: "Worldcoin" },
  { id: "JUPUSDT", display: "JUP/USDT", base: "JUP", quote: "USDT", coinId: "jupiter-exchange-solana", name: "Jupiter" },

  // Gaming & metaverse
  { id: "SANDUSDT", display: "SAND/USDT", base: "SAND", quote: "USDT", coinId: "the-sandbox", name: "The Sandbox" },
  { id: "MANAUSDT", display: "MANA/USDT", base: "MANA", quote: "USDT", coinId: "decentraland", name: "Decentraland" },
  { id: "AXSUSDT", display: "AXS/USDT", base: "AXS", quote: "USDT", coinId: "axie-infinity", name: "Axie Infinity" },
  { id: "THETAUSDT", display: "THETA/USDT", base: "THETA", quote: "USDT", coinId: "theta-token", name: "Theta Network" },

  // Memes
  { id: "DOGEUSDT", display: "DOGE/USDT", base: "DOGE", quote: "USDT", coinId: "dogecoin", name: "Dogecoin" },
  { id: "SHIBUSDT", display: "SHIB/USDT", base: "SHIB", quote: "USDT", coinId: "shiba-inu", name: "Shiba Inu" },
  { id: "PEPEUSDT", display: "PEPE/USDT", base: "PEPE", quote: "USDT", coinId: "pepe", name: "Pepe" },
  { id: "BONKUSDT", display: "BONK/USDT", base: "BONK", quote: "USDT", coinId: "bonk", name: "Bonk" },
  { id: "FLOKIUSDT", display: "FLOKI/USDT", base: "FLOKI", quote: "USDT", coinId: "floki", name: "Floki" },
  { id: "WIFUSDT", display: "WIF/USDT", base: "WIF", quote: "USDT", coinId: "dogwifcoin", name: "dogwifhat" },

  // Newer L1s & ecosystems
  { id: "SEIUSDT", display: "SEI/USDT", base: "SEI", quote: "USDT", coinId: "sei-network", name: "Sei" },
  { id: "STXUSDT", display: "STX/USDT", base: "STX", quote: "USDT", coinId: "blockstack", name: "Stacks" },
  { id: "FLOWUSDT", display: "FLOW/USDT", base: "FLOW", quote: "USDT", coinId: "flow", name: "Flow" },
  { id: "EGLDUSDT", display: "EGLD/USDT", base: "EGLD", quote: "USDT", coinId: "elrond-erd-2", name: "MultiversX" },
  { id: "XTZUSDT", display: "XTZ/USDT", base: "XTZ", quote: "USDT", coinId: "tezos", name: "Tezos" },
  { id: "MINAUSDT", display: "MINA/USDT", base: "MINA", quote: "USDT", coinId: "mina-protocol", name: "Mina" },
  { id: "KAVAUSDT", display: "KAVA/USDT", base: "KAVA", quote: "USDT", coinId: "kava", name: "Kava" },
  { id: "CFXUSDT", display: "CFX/USDT", base: "CFX", quote: "USDT", coinId: "conflux-token", name: "Conflux" },

  // DeFi & infra
  { id: "CRVUSDT", display: "CRV/USDT", base: "CRV", quote: "USDT", coinId: "curve-dao-token", name: "Curve" },
  { id: "COMPUSDT", display: "COMP/USDT", base: "COMP", quote: "USDT", coinId: "compound-governance-token", name: "Compound" },
  { id: "SNXUSDT", display: "SNX/USDT", base: "SNX", quote: "USDT", coinId: "havven", name: "Synthetix" },
  { id: "1INCHUSDT", display: "1INCH/USDT", base: "1INCH", quote: "USDT", coinId: "1inch", name: "1inch" },
  { id: "ENSUSDT", display: "ENS/USDT", base: "ENS", quote: "USDT", coinId: "ethereum-name-service", name: "ENS" },
  { id: "QNTUSDT", display: "QNT/USDT", base: "QNT", quote: "USDT", coinId: "quant-network", name: "Quant" },
  { id: "ARUSDT", display: "AR/USDT", base: "AR", quote: "USDT", coinId: "arweave", name: "Arweave" },
  { id: "GMXUSDT", display: "GMX/USDT", base: "GMX", quote: "USDT", coinId: "gmx", name: "GMX" },
  { id: "PENDLEUSDT", display: "PENDLE/USDT", base: "PENDLE", quote: "USDT", coinId: "pendle", name: "Pendle" },
  { id: "CAKEUSDT", display: "CAKE/USDT", base: "CAKE", quote: "USDT", coinId: "pancakeswap-token", name: "PancakeSwap" },
  { id: "DYDXUSDT", display: "DYDX/USDT", base: "DYDX", quote: "USDT", coinId: "dydx-chain", name: "dYdX" },

  // L2s & scaling
  { id: "STRKUSDT", display: "STRK/USDT", base: "STRK", quote: "USDT", coinId: "starknet", name: "Starknet" },
  { id: "BLURUSDT", display: "BLUR/USDT", base: "BLUR", quote: "USDT", coinId: "blur", name: "Blur" },
  { id: "WUSDT", display: "W/USDT", base: "W", quote: "USDT", coinId: "wormhole", name: "Wormhole" },

  // Trending tokens
  { id: "PYTHUSDT", display: "PYTH/USDT", base: "PYTH", quote: "USDT", coinId: "pyth-network", name: "Pyth Network" },
  { id: "ENAUSDT", display: "ENA/USDT", base: "ENA", quote: "USDT", coinId: "ethena", name: "Ethena" },
  { id: "ONDOUSDT", display: "ONDO/USDT", base: "ONDO", quote: "USDT", coinId: "ondo-finance", name: "Ondo" },
  { id: "JTOUSDT", display: "JTO/USDT", base: "JTO", quote: "USDT", coinId: "jito-governance-token", name: "Jito" },
  { id: "NOTUSDT", display: "NOT/USDT", base: "NOT", quote: "USDT", coinId: "notcoin", name: "Notcoin" },
  { id: "ETHFIUSDT", display: "ETHFI/USDT", base: "ETHFI", quote: "USDT", coinId: "ether-fi", name: "Ether.fi" },

  // Gaming & metaverse
  { id: "APEUSDT", display: "APE/USDT", base: "APE", quote: "USDT", coinId: "apecoin", name: "ApeCoin" },
  { id: "GALAUSDT", display: "GALA/USDT", base: "GALA", quote: "USDT", coinId: "gala", name: "Gala" },
  { id: "CHZUSDT", display: "CHZ/USDT", base: "CHZ", quote: "USDT", coinId: "chiliz", name: "Chiliz" },
];

export function getPairById(id: string): TradingPair | undefined {
  return TRADING_PAIRS.find((p) => p.id === id);
}

export function getPairByDisplay(display: string): TradingPair | undefined {
  return TRADING_PAIRS.find((p) => p.display === display);
}

export function getCoinIdForSymbol(symbol: string): string | undefined {
  return TRADING_PAIRS.find((p) => p.id === symbol || p.display === symbol)?.coinId;
}
