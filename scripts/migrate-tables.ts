import { db } from "../src/db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  console.log("Creating tables...");
  
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS credit_packages (
        id varchar(255) PRIMARY KEY,
        name varchar(255) NOT NULL,
        price int NOT NULL,
        credits int NOT NULL,
        description text,
        active boolean DEFAULT true,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created credit_packages table");

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ai_models (
        id varchar(255) PRIMARY KEY,
        name varchar(255) NOT NULL,
        provider varchar(100) NOT NULL,
        cost_per_1k_tokens_in double NOT NULL,
        cost_per_1k_tokens_out double NOT NULL,
        profit_multiplier double DEFAULT 3.0,
        active boolean DEFAULT true,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP,
        updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("Created ai_models table");

    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
