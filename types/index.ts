import type {
  User,
  Session,
  Portfolio,
  Position,
  Transaction,
  Deposit,
  Withdrawal,
  KYCDocument,
  Subscription,
  Notification,
  ApiKey,
  ExchangeConnection,
  AdminLog,
  ActivityLog,
  Watchlist,
  WatchlistItem,
} from "@prisma/client";

// ─── Re-exports ───────────────────────────────────────────────────────────────
export type {
  User,
  Session,
  Portfolio,
  Position,
  Transaction,
  Deposit,
  Withdrawal,
  KYCDocument,
  Subscription,
  Notification,
  ApiKey,
  ExchangeConnection,
  AdminLog,
  ActivityLog,
  Watchlist,
  WatchlistItem,
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  kycStatus: string;
  twoFactorEnabled: boolean;
  emailVerified: Date | null;
  avatarUrl: string | null;
  subscriptionPlan: string;
  availableBalance: number;
  createdAt: Date;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  openPositions: number;
  winRate: number;
  availableBalance: number;
}

export interface PortfolioSnapshot {
  date: string;
  value: number;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingKYC: number;
  pendingWithdrawals: number;
  totalDeposits: number;
  totalWithdrawals: number;
  revenue: number;
}

// ─── Exchange ─────────────────────────────────────────────────────────────────

export type SupportedExchange = "binance" | "bybit" | "okx" | "coinbase";

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
}

export interface ExchangeBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface ExchangeTicker {
  symbol: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

// ─── Middleware context ────────────────────────────────────────────────────────

export interface RequestContext {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export type KYCDocumentType =
  | "PASSPORT"
  | "NATIONAL_ID"
  | "DRIVERS_LICENSE"
  | "SELFIE"
  | "PROOF_OF_ADDRESS";

export type CryptoNetwork =
  | "BTC"
  | "ETH"
  | "BNB"
  | "TRX"
  | "SOL"
  | "MATIC"
  | "USDT_ERC20"
  | "USDT_TRC20"
  | "USDC";

export interface WalletAddress {
  network: CryptoNetwork;
  address: string;
  label: string;
}
