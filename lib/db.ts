import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString =
    process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  // Serverless-friendly pool: keep connections few and short-lived so we never
  // exhaust the Supabase pooler's client limit across many lambda invocations.
  return new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });
}

function createClient(): PrismaClient {
  const pool = global._pgPool ?? createPool();
  if (process.env.NODE_ENV !== "production") global._pgPool = pool;

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = global._prisma ?? createClient();

if (process.env.NODE_ENV !== "production") global._prisma = db;
