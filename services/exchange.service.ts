import { db } from "@/lib/db";
import type { SupportedExchange, ExchangeCredentials, ExchangeBalance } from "@/types";

// Exchange credential validation — each adapter validates against the real API
const EXCHANGE_VALIDATORS: Record<SupportedExchange, (creds: ExchangeCredentials) => Promise<boolean>> = {
  binance: async (creds) => {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const crypto = await import("crypto");
    const signature = crypto
      .createHmac("sha256", creds.apiSecret)
      .update(queryString)
      .digest("hex");

    const res = await fetch(
      `https://api.binance.com/api/v3/account?${queryString}&signature=${signature}`,
      { headers: { "X-MBX-APIKEY": creds.apiKey } }
    );
    return res.ok;
  },

  bybit: async (creds) => {
    const timestamp = Date.now().toString();
    const crypto = await import("crypto");
    const signature = crypto
      .createHmac("sha256", creds.apiSecret)
      .update(timestamp + creds.apiKey + "5000" + "")
      .digest("hex");

    const res = await fetch("https://api.bybit.com/v5/account/wallet-balance?accountType=UNIFIED", {
      headers: {
        "X-BAPI-API-KEY": creds.apiKey,
        "X-BAPI-SIGN": signature,
        "X-BAPI-TIMESTAMP": timestamp,
        "X-BAPI-RECV-WINDOW": "5000",
      },
    });
    return res.ok;
  },

  okx: async (creds) => {
    if (!creds.passphrase) throw new Error("OKX requires a passphrase");
    const timestamp = new Date().toISOString();
    const method = "GET";
    const path = "/api/v5/account/balance";
    const crypto = await import("crypto");
    const preHash = timestamp + method + path;
    const signature = crypto
      .createHmac("sha256", creds.apiSecret)
      .update(preHash)
      .digest("base64");

    const res = await fetch(`https://www.okx.com${path}`, {
      headers: {
        "OK-ACCESS-KEY": creds.apiKey,
        "OK-ACCESS-SIGN": signature,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": creds.passphrase,
      },
    });
    return res.ok;
  },

  coinbase: async (creds) => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = "GET";
    const path = "/api/v3/brokerage/accounts";
    const crypto = await import("crypto");
    const message = timestamp + method + path;
    const signature = crypto
      .createHmac("sha256", creds.apiSecret)
      .update(message)
      .digest("hex");

    const res = await fetch(`https://api.coinbase.com${path}`, {
      headers: {
        "CB-ACCESS-KEY": creds.apiKey,
        "CB-ACCESS-SIGN": signature,
        "CB-ACCESS-TIMESTAMP": timestamp,
      },
    });
    return res.ok;
  },
};

export const ExchangeService = {
  async connectExchange(
    userId: string,
    exchange: SupportedExchange,
    credentials: ExchangeCredentials,
    label: string
  ) {
    const valid = await EXCHANGE_VALIDATORS[exchange](credentials);
    if (!valid) throw new Error(`Invalid ${exchange} API credentials`);

    const apiKey = await db.apiKey.create({
      data: {
        userId,
        exchange,
        label,
        apiKey: credentials.apiKey,
        apiSecret: credentials.apiSecret,
        passphrase: credentials.passphrase,
      },
    });

    const connection = await db.exchangeConnection.create({
      data: {
        userId,
        apiKeyId: apiKey.id,
        exchange,
        status: "CONNECTED",
        lastSyncAt: new Date(),
      },
    });

    return { apiKey: { ...apiKey, apiSecret: "***" }, connection };
  },

  async disconnectExchange(connectionId: string, userId: string) {
    const conn = await db.exchangeConnection.findFirst({
      where: { id: connectionId, userId },
    });

    if (!conn) throw new Error("Connection not found");

    await db.$transaction([
      db.exchangeConnection.delete({ where: { id: connectionId } }),
      db.apiKey.delete({ where: { id: conn.apiKeyId } }),
    ]);
  },

  async getUserConnections(userId: string) {
    return db.exchangeConnection.findMany({
      where: { userId },
      include: {
        apiKey: {
          select: {
            id: true,
            label: true,
            exchange: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });
  },
};
