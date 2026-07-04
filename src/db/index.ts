import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema.js";
import dotenv from "dotenv";

dotenv.config();

// Connection for server-side
const poolConnection = mysql.createPool({
  host: process.env.DB_HOST || "gateway01.eu-central-1.prod.aws.tidbcloud.com",
  user: process.env.DB_USER || "35upkxzueT8wsWa.root",
  password: process.env.DB_PASSWORD || "iJy6df5b6LvArut0",
  database: process.env.DB_NAME || "test",
  port: parseInt(process.env.DB_PORT || "4000"),
  ssl: { rejectUnauthorized: true },
});

export const db = drizzle(poolConnection, { schema, mode: "default" });
