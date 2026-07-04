import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function run() {
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS leads (
        id VARCHAR(36) PRIMARY KEY,
        company_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        website VARCHAR(255),
        company VARCHAR(255),
        title VARCHAR(255),
        notes TEXT,
        address TEXT,
        phone VARCHAR(255),
        email VARCHAR(255),
        status VARCHAR(50) DEFAULT 'new',
        source VARCHAR(50) DEFAULT 'search',
        tags JSON,
        rating DOUBLE,
        score INT,
        category_id VARCHAR(36),
        campaign_id VARCHAR(36),
        engagement_count INT DEFAULT 0,
        engagement_opens INT DEFAULT 0,
        engagement_clicks INT DEFAULT 0,
        engagement_replies INT DEFAULT 0,
        linkedin_url VARCHAR(255),
        google_maps_link TEXT,
        reviews INT,
        price_level VARCHAR(10),
        business_category VARCHAR(255),
        business_status VARCHAR(50),
        reviews_summary TEXT,
        search_query TEXT,
        analysis JSON,
        crm_data JSON,
        engagement JSON,
        sequence JSON,
        last_contacted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `));
    console.log("leads table created");

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS recent_searches (
        id VARCHAR(36) PRIMARY KEY,
        company_id VARCHAR(36),
        query TEXT NOT NULL,
        filters JSON,
        results_count INT DEFAULT 0,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `));
    console.log("recent_searches table created");

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY,
        company_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `));
    console.log("categories table created");

    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS campaigns (
        id VARCHAR(36) PRIMARY KEY,
        company_id VARCHAR(36),
        name VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'draft',
        sent INT DEFAULT 0,
        opened INT DEFAULT 0,
        clicked INT DEFAULT 0,
        replied INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `));
    console.log("campaigns table created");
    
    // Also create credit_transactions just in case
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id VARCHAR(255) PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        amount INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        performed_by VARCHAR(255),
        reference_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `));
    console.log("credit_transactions table created");
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
