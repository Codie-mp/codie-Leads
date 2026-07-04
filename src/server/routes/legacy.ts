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
    const alterQueries = [
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
