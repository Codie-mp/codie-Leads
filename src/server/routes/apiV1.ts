import { Router } from "express";
import { db } from "../../db/index.js";
import { leads } from "../../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { requireApiKey, ApiRequest } from "../middleware/apiKeyAuth.js";

const router = Router();

// Apply the API Key middleware to all v1 routes
router.use(requireApiKey as any);

/**
 * GET /api/v1/leads
 * Fetch leads for the authenticated company
 */
router.get("/leads", async (req, res) => {
  const companyId = (req as ApiRequest).companyId;
  if (!companyId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;

    let conditions = [eq(leads.companyId, companyId)];
    if (status) conditions.push(eq(leads.status, status));

    const companyLeads = await db.select()
      .from(leads)
      .where(and(...conditions))
      .orderBy(desc(leads.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      data: companyLeads,
      meta: {
        limit,
        offset,
        count: companyLeads.length
      }
    });
  } catch (error) {
    console.error("API V1 Leads Error:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

/**
 * POST /api/v1/leads
 * Programmatically insert a lead
 */
router.post("/leads", async (req, res) => {
  const companyId = (req as ApiRequest).companyId;
  if (!companyId) return res.status(401).json({ error: "Unauthorized" });

  const { name, email, phone, company, website, status, source } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const newId = crypto.randomUUID();

  try {
    await db.insert(leads).values({
      id: newId,
      companyId,
      name,
      email,
      phone,
      company,
      website,
      status: status || 'new',
      source: source || 'api',
      score: 50
    });

    res.status(201).json({ success: true, id: newId });
  } catch (error) {
    console.error("API V1 Insert Lead Error:", error);
    res.status(500).json({ error: "Failed to create lead" });
  }
});

export default router;
