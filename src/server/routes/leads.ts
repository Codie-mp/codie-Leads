import { Router } from "express";
import crypto from "crypto";
import { db as tidb } from "../../db/index.js";
import { leads } from "../../db/schema.js";
import { eq, inArray } from "drizzle-orm";
import { WebhookService } from "../services/webhookService.js";
import { HubSpotService } from "../services/hubspotService.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

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

router.post("/", async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    // In some contexts, we might have AuthenticatedRequest if we use requireAuth
    // Or we rely on the client passing companyId for now. Let's try to get it from req.user
    const authReq = req as unknown as AuthenticatedRequest;
    const companyId = authReq.user?.companyId || payload[0]?.companyId;

    const newValues = payload.map(l => {
      const cleaned = cleanLeadPayload(l);
      return {
        ...cleaned,
        id: cleaned.id || crypto.randomUUID(),
        companyId: companyId || cleaned.companyId,
        createdAt: cleaned.createdAt || new Date(),
        updatedAt: cleaned.updatedAt || new Date()
      };
    });
    
    await tidb.insert(leads).values(newValues);

    // Trigger integrations asynchronously
    if (companyId) {
      newValues.forEach(lead => {
        WebhookService.broadcast(companyId, 'lead.created', lead).catch(console.error);
        HubSpotService.syncLead(companyId, lead).catch(console.error);
      });
    }

    res.json({ success: true, count: newValues.length });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to add lead", details: e instanceof Error ? e.message : String(e) });
  }
});

router.put("/bulk-update", async (req, res) => {
  try {
    const { ids, update } = req.body;
    if (ids && update) {
      const cleanedUpdate = cleanLeadPayload(update);
      if (Object.keys(cleanedUpdate).length > 0) {
        await tidb.update(leads).set(cleanedUpdate).where(inArray(leads.id, ids));
      }
    }
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to bulk update leads", details: e.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const cleanedUpdate = cleanLeadPayload(req.body);
    if (Object.keys(cleanedUpdate).length > 0) {
      await tidb.update(leads).set(cleanedUpdate).where(eq(leads.id, req.params.id));
    }
    res.json({ success: true });
  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: "Failed to update lead", details: e.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await tidb.delete(leads).where(eq(leads.id, req.params.id));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to delete lead" });
  }
});

router.post("/bulk-delete", async (req, res) => {
  try {
    await tidb.delete(leads).where(inArray(leads.id, req.body.ids));
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to bulk delete leads" });
  }
});

export default router;
