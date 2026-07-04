import { Router } from "express";
import crypto from "crypto";
import { db } from "../../db/index.js";
import { sql } from "drizzle-orm";
import { requireAuth, requirePermission, Permission, AuthenticatedRequest } from "../middleware/auth.js";
import { CreditService } from "../services/creditService.js";

const router = Router();

// Ensure all routes are authenticated
router.use(requireAuth);

/**
 * GET /api/billing/plans
 * Returns all active pricing plans
 */
router.get("/plans", async (req, res) => {
  try {
    const rows = await db.execute(sql`SELECT * FROM pricing_plans WHERE active = true ORDER BY monthly_price ASC`);
    const plans = Array.isArray(rows) ? rows[0] : rows;
    res.json(plans);
  } catch (error) {
    console.error("Fetch plans error:", error);
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
});

/**
 * GET /api/billing/credit-packages
 * Returns all active credit packages
 */
router.get("/credit-packages", async (req, res) => {
  try {
    const rows = await db.execute(sql`SELECT * FROM credit_packages WHERE active = true ORDER BY price ASC`);
    const pkgs = Array.isArray(rows) ? rows[0] : rows;
    res.json(pkgs);
  } catch (error) {
    console.error("Fetch credit packages error:", error);
    res.status(500).json({ error: "Failed to fetch credit packages" });
  }
});

/**
 * GET /api/billing/subscription
 * Returns the current company's subscription details
 */
router.get("/subscription", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    const rows = await db.execute(sql`
      SELECT * FROM subscriptions 
      WHERE company_id = ${companyId} 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    const results = Array.isArray(rows) ? rows[0] : rows;
    const sub = ((results as unknown) as any[])[0] || null;
    res.json(sub);
  } catch (error) {
    console.error("Fetch subscription error:", error);
    res.status(500).json({ error: "Failed to fetch subscription details" });
  }
});

/**
 * GET /api/billing/credits
 * Returns the current company's credit balance and history
 */
router.get("/credits", requirePermission(Permission.MANAGE_BILLING), async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    const balance = await CreditService.getBalance(companyId);
    const history = await CreditService.getHistory(companyId, 10);
    res.json({ balance, history });
  } catch (error) {
    console.error("Fetch credits error:", error);
    res.status(500).json({ error: "Failed to fetch credit details" });
  }
});

/**
 * POST /api/billing/subscribe
 * Submit a subscription request with InstaPay receipt
 */
router.post("/subscribe", requirePermission(Permission.MANAGE_BILLING), async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  const { planName, billingCycle, paymentProofUrl, planId } = req.body;
  
  if (!paymentProofUrl) {
    return res.status(400).json({ error: "Payment proof is required" });
  }

  try {
    const newId = crypto.randomUUID();
    
    // We insert a new subscription record as 'pending'
    await db.execute(sql`
      INSERT INTO subscriptions (
        id, company_id, plan_id, plan_name, billing_cycle, 
        status, payment_proof_url, created_at, updated_at
      ) VALUES (
        ${newId}, ${companyId}, ${planId || null}, ${planName || 'unknown'}, ${billingCycle || 'monthly'},
        'pending', ${paymentProofUrl}, NOW(), NOW()
      )
    `);

    res.json({ success: true, message: "Subscription request submitted for approval" });
  } catch (error) {
    console.error("Subscribe error:", error);
    res.status(500).json({ error: "Failed to submit subscription request" });
  }
});

export default router;
