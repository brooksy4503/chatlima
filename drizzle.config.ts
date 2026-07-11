import type { Config } from "drizzle-kit";
import dotenv from "dotenv";

// Local: .env.local — Production: vercel env pull .env.production.local, then NODE_ENV=production
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production.local" });
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env.local" });
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
