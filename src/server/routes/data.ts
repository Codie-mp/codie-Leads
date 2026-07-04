import { Router } from "express";
import crypto from "crypto";
import { db as tidb } from "../../db/index.js";
import { leads, recentSearches, campaigns, categories } from "../../db/schema.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const allLeads = await tidb.select().from(leads);
    const allSearches = await tidb.select().from(recentSearches);
    const allCampaigns = await tidb.select().from(campaigns);
    const allCategories = await tidb.select().from(categories);
    res.json({ leads: allLeads, recentSearches: allSearches, campaigns: allCampaigns, categories: allCategories });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

router.post("/recentSearches", async (req, res) => {
  try {
    const id = req.body.id || crypto.randomUUID();
    await tidb.insert(recentSearches).values({ ...req.body, id });
    res.json({ success: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to save search" });
  }
});

export default router;
