import { Router } from "express";
import crypto from "crypto";
import { db as tidb } from "../../db/index.js";
import { campaigns, leads } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const id = req.body.id || crypto.randomUUID();
    await tidb.insert(campaigns).values({ ...req.body, id });
    res.json({ success: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to create campaign" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await tidb.delete(campaigns).where(eq(campaigns.id, req.params.id));
    await tidb.update(leads).set({ campaignId: null }).where(eq(leads.campaignId, req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete campaign" });
  }
});

export default router;
