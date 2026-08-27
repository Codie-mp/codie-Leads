import { Router } from "express";
import crypto from "crypto";
import { db as tidb } from "../../db/index.js";
import { leads, recentSearches, campaigns, categories } from "../../db/schema.js";
import { eq, inArray, sql } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";
import { 
  generateKeywordsFromIntent, 
  generateNicheSuggestions, 
  enrichLeadData, 
  searchPlaces 
} from "../../services/gemini-server.js";

const router = Router();

const VALID_LEAD_KEYS = [
  "id", "name", "website", "company", "title", "notes", "address", "phone", "email",
  "status", "source", "tags", "rating", "score", "categoryId", "campaignId",
  "engagementCount", "engagementOpens", "engagementClicks", "engagementReplies",
  "linkedinUrl", "googleMapsLink", "reviews", "priceLevel", "businessCategory",
  "businessStatus", "reviewsSummary", "searchQuery", "analysis", "crmData",
  "engagement", "sequence", "lastContactedAt", "createdAt", "updatedAt"
];

const cleanLeadPayload = (payload: any) => {
  const clean: any = {};
  for (const key of VALID_LEAD_KEYS) {
    if (payload[key] !== undefined) {
      if ((key === "createdAt" || key === "updatedAt" || key === "lastContactedAt") && payload[key]) {
        clean[key] = new Date(payload[key]);
      } else {
        clean[key] = payload[key];
      }
    }
  }
  return clean;
};

export async function syncLegacySchema() {
  try {
    const createQueries = [
      `CREATE TABLE IF NOT EXISTS pricing_plans (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        monthly_price INT NOT NULL,
        yearly_price INT NOT NULL,
        credits_per_month INT NOT NULL,
        max_members INT DEFAULT 1,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS credit_packages (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        credits INT NOT NULL,
        description TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ai_models (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        provider VARCHAR(100) NOT NULL,
        cost_per_1k_tokens_in DOUBLE NOT NULL,
        cost_per_1k_tokens_out DOUBLE NOT NULL,
        profit_multiplier DOUBLE DEFAULT 3.0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS credit_transactions (
        id VARCHAR(255) PRIMARY KEY,
        company_id VARCHAR(255) NOT NULL,
        amount INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        performed_by VARCHAR(255),
        reference_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS platform_settings (
        id VARCHAR(255) PRIMARY KEY,
        \`key\` VARCHAR(100) NOT NULL UNIQUE,
        value JSON,
        updated_by VARCHAR(255),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        company_id VARCHAR(255),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(255),
        metadata JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255),
        company_id VARCHAR(255),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255),
        message TEXT,
        is_read BOOLEAN DEFAULT false,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const q of createQueries) {
      try {
        await tidb.execute(sql.raw(q));
      } catch (err: any) {
        console.warn(`Schema create notice: ${err.message}`);
      }
    }

    const alterQueries = [
      "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `is_verified` BOOLEAN DEFAULT false",
      "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `otp` VARCHAR(6)",
      "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `otp_expires_at` TIMESTAMP NULL",
      "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `otp_last_sent_at` TIMESTAMP NULL",
      "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `otp_send_count` INT DEFAULT 0",
      "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `otp_send_window_started_at` TIMESTAMP NULL",
      "ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `invite_token` VARCHAR(255) NULL",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `linkedin_url` varchar(255)",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `google_maps_link` text",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `reviews` int",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `price_level` varchar(10)",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `business_category` varchar(255)",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `business_status` varchar(50)",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `reviews_summary` text",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `search_query` text",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `analysis` json",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `crm_data` json",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `engagement` json",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `sequence` json",
      "ALTER TABLE `leads` ADD COLUMN IF NOT EXISTS `last_contacted_at` timestamp NULL",
      "ALTER TABLE `leads` MODIFY COLUMN `rating` double"
    ];

    for (const q of alterQueries) {
      try {
        await tidb.execute(sql.raw(q));
      } catch (err: any) {
        // TiDB throws errors for IF NOT EXISTS on ADD COLUMN if column already exists.
        // Silently swallow these expected warnings to keep server logs clean.
      }
    }
    console.log("TiDB database schema sync completed successfully.");
  } catch (globalErr) {
    console.error("Global database schema sync failed:", globalErr);
  }
}
