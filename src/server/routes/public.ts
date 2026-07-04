import { Router } from "express";
import { db } from "../../db/index.js";
import { sql } from "drizzle-orm";

const router = Router();

/**
 * GET /api/public/pricing-plans
 * Returns all active pricing plans for the public landing page.
 */
router.get("/pricing-plans", async (req, res) => {
  try {
    const rows = await db.execute(sql.raw(`SELECT * FROM pricing_plans WHERE active = true ORDER BY monthly_price ASC`));
    const plans = Array.isArray(rows[0]) ? rows[0] : rows;
    res.json(plans);
  } catch (error) {
    console.error("Fetch plans error:", error);
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
});

export default router;
