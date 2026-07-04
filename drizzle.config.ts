import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: process.env.DB_HOST || "gateway01.eu-central-1.prod.aws.tidbcloud.com",
    port: parseInt(process.env.DB_PORT || "4000"),
    user: process.env.DB_USER || "35upkxzueT8wsWa.root",
    password: process.env.DB_PASSWORD || "iJy6df5b6LvArut0",
    database: process.env.DB_NAME || "test",
    ssl: { rejectUnauthorized: true } as any,
  },
} satisfies Config;
