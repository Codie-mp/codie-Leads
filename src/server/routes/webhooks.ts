import { Router } from "express";
import crypto from "crypto";
import { db } from "../../db/index.js";
import { webhookEndpoints } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireRole, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Secure all webhook routes
router.use(requireAuth);
router.use(requireRole(['admin', 'manager']));

router.get("/", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    const hooks = await db.select({
      id: webhookEndpoints.id,
      url: webhookEndpoints.url,
      events: webhookEndpoints.events,
      active: webhookEndpoints.active,
      createdAt: webhookEndpoints.createdAt
    }).from(webhookEndpoints).where(eq(webhookEndpoints.companyId, companyId));
    
    res.json(hooks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch webhooks" });
  }
});

router.post("/", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  const { url, events } = req.body;
  if (!url) return res.status(400).json({ error: "Webhook URL is required" });

  try {
    const newId = crypto.randomUUID();
    const secret = `whsec_${crypto.randomBytes(24).toString("hex")}`;

    await db.insert(webhookEndpoints).values({
      id: newId,
      companyId,
      url,
      secret,
      events: events || ['lead.created'],
      active: true
    });

    res.json({ id: newId, secret, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create webhook" });
  }
});

router.delete("/:id", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  const { id } = req.params;
  
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    await db.delete(webhookEndpoints)
      .where(and(eq(webhookEndpoints.id, id), eq(webhookEndpoints.companyId, companyId)));
      
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete webhook" });
  }
});

export default router;
