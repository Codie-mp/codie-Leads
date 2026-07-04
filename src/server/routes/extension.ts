import { Router } from "express";
import crypto from "crypto";
import { db as tidb } from "../../db/index.js";
import { leads } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/leads", async (req, res) => {
  const { name, title, company, website, linkedinUrl, notes } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const newId = crypto.randomUUID();
    await tidb.insert(leads).values({
      id: newId,
      name,
      title,
      company,
      website,
      linkedinUrl,
      notes,
      source: 'extension'
    });
    res.json({ id: newId, status: "success" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

router.get("/leads", async (req, res) => {
  try {
    const extLeads = await tidb.select().from(leads).where(eq(leads.source, 'extension'));
    res.json(extLeads);
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

router.delete("/leads/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await tidb.delete(leads).where(eq(leads.id, id));
    res.json({ status: "success" });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

export default router;
