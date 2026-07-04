import { Router, Request } from "express";
import crypto from "crypto";
import { db } from "../../db/index.js";
import { apiKeys } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Secure all API Key routes
router.use(requireAuth);
router.use(requireRole(['admin', 'manager']));

router.get("/", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    const keys = await db.select({
      id: apiKeys.id,
      name: apiKeys.name,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt
    }).from(apiKeys).where(eq(apiKeys.companyId, companyId));
    
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

router.post("/", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Key name is required" });

  try {
    // Generate a secure random key
    const rawKey = `sk_${crypto.randomBytes(24).toString("hex")}`;
    
    // Hash it for storage
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
    const newId = crypto.randomUUID();

    await db.insert(apiKeys).values({
      id: newId,
      companyId,
      keyHash,
      name
    });

    // Return the raw key ONLY once
    res.json({ id: newId, name, rawKey });
  } catch (error) {
    res.status(500).json({ error: "Failed to generate API key" });
  }
});

router.delete("/:id", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  const { id } = req.params;
  
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    await db.delete(apiKeys)
      .where(and(eq(apiKeys.id, id), eq(apiKeys.companyId, companyId)));
      
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

export default router;
