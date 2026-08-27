import { Router } from "express";
import crypto from "crypto";
import { db as tidb } from "../../db/index.js";
import { categories, leads } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const id = req.body.id || crypto.randomUUID();
    await tidb.insert(categories).values({ ...req.body, id });
    res.json({ success: true, id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to add category" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, color } = req.body;
    await tidb.update(categories)
      .set({ name, color })
      .where(eq(categories.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to update category" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await tidb.delete(categories).where(eq(categories.id, req.params.id));
    await tidb.update(leads).set({ categoryId: null }).where(eq(leads.categoryId, req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

export default router;
