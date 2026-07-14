import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { Pool as NeonPool } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import * as schema from "./schema";

function isCiPostgresUrl(): boolean {
  if (process.env.CI !== "true") {
    return false;
  }

  const url = process.env.DATABASE_URL;
  if (!url) {
    return false;
  }

  try {
    const { hostname } = new URL(url.replace(/^postgresql:/, "http:"));
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function createDb() {
  if (isCiPostgresUrl()) {
    const pool = new PgPool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

    return drizzlePg(pool, { schema });
  }

  const pool = new NeonPool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  return drizzleNeon(pool, { schema });
}

export const db = createDb();
