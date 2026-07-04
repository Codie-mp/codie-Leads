import { Router } from "express";
import crypto from "crypto";
import { db } from "../../db/index.js";
import { 
  users, companies, pricingPlans, creditPackages, aiModels, subscriptions, 
  activityLogs, leads, apiKeys 
} from "../../db/schema.js";
import { eq, sql, count } from "drizzle-orm";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";

const router = Router();

// Secure all super admin routes
router.use(requireAuth);
router.use(requireSuperAdmin);

// ══════════════════════════════════════
// PLATFORM STATS
// ══════════════════════════════════════
router.get("/stats", async (req, res) => {
  try {
    const [[companyCount], [userCount], [leadCount]] = await Promise.all([
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM companies`)),
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM users WHERE is_super_admin = false`)),
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM leads`)),
    ]);

    const [[activeCompanies]] = await Promise.all([
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM companies WHERE active = true`)),
    ]);

    const [[totalCredits]] = await Promise.all([
      db.execute(sql.raw(`SELECT COALESCE(SUM(credits_balance), 0) as total FROM companies`)),
    ]);

    const [[pendingSubscriptions]] = await Promise.all([
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM subscriptions WHERE status = 'pending'`)),
    ]);

    res.json({
      totalCompanies: (companyCount as any).total || 0,
      totalUsers: (userCount as any).total || 0,
      totalLeads: (leadCount as any).total || 0,
      activeCompanies: (activeCompanies as any).total || 0,
      totalCreditsInSystem: (totalCredits as any).total || 0,
      pendingSubscriptions: (pendingSubscriptions as any).total || 0,
    });
  } catch (error: any) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Failed to fetch platform stats", detail: error.message, stack: error.stack });
  }
});

// ══════════════════════════════════════
// PRICING PLANS
// ══════════════════════════════════════
router.get("/pricing-plans", async (req, res) => {
  try {
    const plans = await db.select().from(pricingPlans);
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pricing plans" });
  }
});

router.put("/pricing-plans/:id", async (req, res) => {
  const { id } = req.params;
  const { name, monthlyPrice, yearlyPrice, creditsPerMonth, maxMembers, description, active } = req.body;
  try {
    await db.update(pricingPlans)
      .set({ name, monthlyPrice, yearlyPrice, creditsPerMonth, maxMembers, description, active })
      .where(eq(pricingPlans.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update pricing plan" });
  }
});

router.post("/pricing-plans", async (req, res) => {
  const { name, monthlyPrice, yearlyPrice, creditsPerMonth, maxMembers, description } = req.body;
  const newId = crypto.randomUUID();
  try {
    await db.insert(pricingPlans).values({
      id: newId,
      name,
      monthlyPrice,
      yearlyPrice,
      creditsPerMonth,
      maxMembers,
      description,
      active: true
    });
    res.json({ id: newId, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create pricing plan" });
  }
});

router.delete("/pricing-plans/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.update(pricingPlans).set({ active: false }).where(eq(pricingPlans.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete pricing plan" });
  }
});

// ══════════════════════════════════════
// CREDIT PACKAGES
// ══════════════════════════════════════
router.get("/credit-packages", async (req, res) => {
  try {
    const pkgs = await db.select().from(creditPackages);
    res.json(pkgs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch credit packages" });
  }
});

router.put("/credit-packages/:id", async (req, res) => {
  const { id } = req.params;
  const { name, price, credits, description, active } = req.body;
  try {
    await db.update(creditPackages)
      .set({ name, price, credits, description, active })
      .where(eq(creditPackages.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update credit package" });
  }
});

router.post("/credit-packages", async (req, res) => {
  const { name, price, credits, description } = req.body;
  const newId = crypto.randomUUID();
  try {
    await db.insert(creditPackages).values({
      id: newId,
      name,
      price,
      credits,
      description,
      active: true
    });
    res.json({ id: newId, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create credit package" });
  }
});

router.delete("/credit-packages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.update(creditPackages).set({ active: false }).where(eq(creditPackages.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to archive credit package" });
  }
});

// ══════════════════════════════════════
// AI MODELS
// ══════════════════════════════════════
router.get("/ai-models", async (req, res) => {
  try {
    const models = await db.select().from(aiModels);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch AI models" });
  }
});

router.put("/ai-models/:id", async (req, res) => {
  const { id } = req.params;
  const { name, provider, costPer1kTokensIn, costPer1kTokensOut, profitMultiplier, active } = req.body;
  try {
    await db.update(aiModels)
      .set({ name, provider, costPer1kTokensIn, costPer1kTokensOut, profitMultiplier, active })
      .where(eq(aiModels.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update AI model" });
  }
});

router.post("/ai-models", async (req, res) => {
  const { name, provider, costPer1kTokensIn, costPer1kTokensOut, profitMultiplier } = req.body;
  const newId = crypto.randomUUID();
  try {
    await db.insert(aiModels).values({
      id: newId,
      name,
      provider,
      costPer1kTokensIn,
      costPer1kTokensOut,
      profitMultiplier: profitMultiplier || 3.0,
      active: true
    });
    res.json({ id: newId, success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to create AI model" });
  }
});

router.delete("/ai-models/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.update(aiModels).set({ active: false }).where(eq(aiModels.id, id));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to archive AI model" });
  }
});

// ══════════════════════════════════════
// COMPANIES
// ══════════════════════════════════════
router.get("/companies", async (req, res) => {
  try {
    const rows = await db.execute(sql.raw(`
      SELECT 
        c.id, c.name, c.logo_url, c.subscription_tier, c.credits_balance, c.active, c.created_at,
        COUNT(DISTINCT u.id) as user_count,
        COUNT(DISTINCT l.id) as lead_count
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.is_super_admin = false
      LEFT JOIN leads l ON l.company_id = c.id
      GROUP BY c.id, c.name, c.logo_url, c.subscription_tier, c.credits_balance, c.active, c.created_at
      ORDER BY c.created_at DESC
    `));
    res.json(rows);
  } catch (error) {
    console.error("Companies error:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

router.get("/companies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [companyRows] = await db.execute(sql.raw(`SELECT * FROM companies WHERE id = '${id}'`));
    const [usersRows] = await db.execute(sql.raw(`
      SELECT id, email, first_name, last_name, role, is_verified, created_at 
      FROM users WHERE company_id = '${id}' AND is_super_admin = false
    `));
    const [leadStats] = await db.execute(sql.raw(`
      SELECT 
        COUNT(*) as total_leads,
        SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) as new_leads,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted_leads,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as leads_last_30d
      FROM leads WHERE company_id = '${id}'
    `));
    const [campaignStats] = await db.execute(sql.raw(`
      SELECT COUNT(*) as total_campaigns FROM campaigns WHERE company_id = '${id}'
    `));
    const [subscriptionRows] = await db.execute(sql.raw(`
      SELECT * FROM subscriptions WHERE company_id = '${id}' ORDER BY created_at DESC LIMIT 5
    `));
    const [activityRows] = await db.execute(sql.raw(`
      SELECT * FROM activity_logs WHERE company_id = '${id}' ORDER BY created_at DESC LIMIT 20
    `)).catch(() => [[]]);

    res.json({
      company: companyRows,
      users: usersRows,
      leadStats: leadStats,
      campaignStats: campaignStats,
      subscriptions: subscriptionRows,
      recentActivity: activityRows,
    });
  } catch (error) {
    console.error("Company detail error:", error);
    res.status(500).json({ error: "Failed to fetch company details" });
  }
});

router.put("/companies/:id", async (req, res) => {
  const { id } = req.params;
  const { subscriptionTier, creditsBalance, active, name } = req.body;
  try {
    const updateFields: string[] = [];
    if (subscriptionTier !== undefined) updateFields.push(`subscription_tier = '${subscriptionTier}'`);
    if (creditsBalance !== undefined) updateFields.push(`credits_balance = ${creditsBalance}`);
    if (active !== undefined) updateFields.push(`active = ${active ? 1 : 0}`);
    if (name !== undefined) updateFields.push(`name = '${name.replace(/'/g, "''")}'`);
    
    if (updateFields.length > 0) {
      await db.execute(sql.raw(`UPDATE companies SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = '${id}'`));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update company" });
  }
});

// ══════════════════════════════════════
// USERS
// ══════════════════════════════════════
router.get("/users", async (req, res) => {
  try {
    const rows = await db.execute(sql.raw(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.role, u.is_super_admin,
        u.is_verified, u.created_at,
        c.name as company_name, c.id as company_id
      FROM users u
      LEFT JOIN companies c ON c.id = u.company_id
      ORDER BY u.created_at DESC
    `));
    res.json(rows);
  } catch (error) {
    console.error("Users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { role, isVerified, active } = req.body;
  try {
    const updateFields: string[] = [];
    if (role !== undefined) updateFields.push(`role = '${role}'`);
    if (isVerified !== undefined) updateFields.push(`is_verified = ${isVerified ? 1 : 0}`);
    // Note: 'active' on users is managed via is_verified or a separate field. We use is_verified as proxy.

    if (updateFields.length > 0) {
      await db.execute(sql.raw(`UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = '${id}'`));
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(sql.raw(`DELETE FROM users WHERE id = '${id}' AND is_super_admin = false`));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ══════════════════════════════════════
// SUBSCRIPTIONS (Approval Queue)
// ══════════════════════════════════════
router.get("/subscriptions", async (req, res) => {
  try {
    const rows = await db.execute(sql.raw(`
      SELECT 
        s.*,
        c.name as company_name
      FROM subscriptions s
      LEFT JOIN companies c ON c.id = s.company_id
      ORDER BY s.created_at DESC
    `));
    res.json(rows);
  } catch (error) {
    console.error("Subscriptions error:", error);
    res.status(500).json({ error: "Failed to fetch subscriptions" });
  }
});

router.put("/subscriptions/:id/approve", async (req, res) => {
  const { id } = req.params;
  const { creditsToGrant, planName } = req.body;
  try {
    // Approve the subscription
    await db.execute(sql.raw(`
      UPDATE subscriptions SET 
        status = 'active',
        updated_at = NOW()
      WHERE id = '${id}'
    `));

    // Grant credits and update company plan if provided
    if (creditsToGrant) {
      const subRows = await db.execute(sql.raw(`SELECT company_id FROM subscriptions WHERE id = '${id}'`));
      const sub = Array.isArray(subRows) ? subRows[0] : null;
      const companyId = (sub as any)?.company_id;
      if (companyId) {
        await db.execute(sql.raw(`
          UPDATE companies SET 
            credits_balance = credits_balance + ${creditsToGrant},
            subscription_tier = '${planName || 'starter'}',
            updated_at = NOW()
          WHERE id = '${companyId}'
        `));
        // Log credit transaction
        const txId = crypto.randomUUID();
        await db.execute(sql.raw(`
          INSERT INTO credit_transactions (id, company_id, amount, type, description, created_at)
          VALUES ('${txId}', '${companyId}', ${creditsToGrant}, 'subscription_grant', 'Subscription approved by admin', NOW())
        `)).catch(() => {}); // Silently fail if table doesn't exist yet
      }
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Approve subscription error:", error);
    res.status(500).json({ error: "Failed to approve subscription" });
  }
});

router.put("/subscriptions/:id/reject", async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  try {
    await db.execute(sql.raw(`
      UPDATE subscriptions SET 
        status = 'rejected',
        updated_at = NOW()
      WHERE id = '${id}'
    `));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to reject subscription" });
  }
});

// ══════════════════════════════════════
// CREDIT MANAGEMENT
// ══════════════════════════════════════
router.post("/credits/grant", async (req, res) => {
  const { companyId, amount, reason } = req.body;
  if (!companyId || !amount) {
    return res.status(400).json({ error: "companyId and amount are required" });
  }
  try {
    await db.execute(sql.raw(`
      UPDATE companies SET 
        credits_balance = credits_balance + ${parseInt(amount)},
        updated_at = NOW()
      WHERE id = '${companyId}'
    `));
    // Log the transaction
    const txId = crypto.randomUUID();
    await db.execute(sql.raw(`
      INSERT INTO credit_transactions (id, company_id, amount, type, description, created_at)
      VALUES ('${txId}', '${companyId}', ${parseInt(amount)}, 'admin_grant', '${(reason || 'Admin credit grant').replace(/'/g, "''")}', NOW())
    `)).catch(() => {});
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to grant credits" });
  }
});

router.post("/credits/deduct", async (req, res) => {
  const { companyId, amount, reason } = req.body;
  if (!companyId || !amount) {
    return res.status(400).json({ error: "companyId and amount are required" });
  }
  try {
    await db.execute(sql.raw(`
      UPDATE companies SET 
        credits_balance = GREATEST(0, credits_balance - ${parseInt(amount)}),
        updated_at = NOW()
      WHERE id = '${companyId}'
    `));
    const txId = crypto.randomUUID();
    await db.execute(sql.raw(`
      INSERT INTO credit_transactions (id, company_id, amount, type, description, created_at)
      VALUES ('${txId}', '${companyId}', -${parseInt(amount)}, 'admin_deduct', '${(reason || 'Admin credit deduction').replace(/'/g, "''")}', NOW())
    `)).catch(() => {});
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to deduct credits" });
  }
});

// ══════════════════════════════════════
// PLATFORM SETTINGS (Theming)
// ══════════════════════════════════════
router.get("/platform-settings", async (req, res) => {
  try {
    const rows = await db.execute(sql.raw(`
      SELECT \`key\`, value FROM platform_settings
    `));
    // Convert array to object
    const settings: Record<string, any> = {};
    (rows as any[]).forEach((row: any) => {
      try {
        settings[row.key] = typeof row.value === 'string' ? JSON.parse(row.value) : row.value;
      } catch {
        settings[row.key] = row.value;
      }
    });
    res.json(settings);
  } catch (error) {
    // Return defaults if table doesn't exist yet
    res.json({
      platform_name: "Codie Leads",
      primary_color: "#2563EB",
      font_family: "inter",
      logo_url: "",
    });
  }
});

router.put("/platform-settings", async (req, res) => {
  const settings = req.body; // { platform_name, primary_color, font_family, logo_url, ... }
  const userId = (req as any).user?.id;
  try {
    for (const [key, value] of Object.entries(settings)) {
      const encoded = JSON.stringify(value).replace(/'/g, "''");
      await db.execute(sql.raw(`
        INSERT INTO platform_settings (\`key\`, value, updated_by, updated_at)
        VALUES ('${key}', '${encoded}', '${userId}', NOW())
        ON DUPLICATE KEY UPDATE value = '${encoded}', updated_by = '${userId}', updated_at = NOW()
      `));
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Platform settings error:", error);
    res.status(500).json({ error: "Failed to save platform settings" });
  }
});

// ══════════════════════════════════════
// ACTIVITY FEED
// ══════════════════════════════════════
router.get("/activity", async (req, res) => {
  try {
    const rows = await db.execute(sql.raw(`
      SELECT 
        a.id, a.action, a.created_at as time,
        u.email as user_email,
        c.name as company_name
      FROM activity_logs a
      LEFT JOIN users u ON u.id = a.user_id
      LEFT JOIN companies c ON c.id = a.company_id
      ORDER BY a.created_at DESC
      LIMIT 100
    `));
    res.json(rows);
  } catch (error) {
    // Return empty if table doesn't exist
    res.json([]);
  }
});

// ══════════════════════════════════════
// R2 STORAGE POOL MANAGER
// ══════════════════════════════════════
router.get("/r2", async (req, res) => {
  try {
    const accounts = await db.execute(sql.raw(`SELECT * FROM r2_accounts ORDER BY created_at DESC`));
    // Drizzle mysql2 execute returns [rows, fields] usually, or array of rows. Let's map it safely.
    res.json(Array.isArray(accounts[0]) ? accounts[0] : accounts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch R2 accounts" });
  }
});

router.post("/r2", async (req, res) => {
  const { accountId, accessKeyId, secretAccessKey, bucketName, endpoint } = req.body;
  const newId = crypto.randomUUID();
  try {
    // Add simple S3 client test if needed, but for now we trust the inputs
    await db.execute(sql.raw(`
      INSERT INTO r2_accounts (id, account_id, access_key_id, secret_access_key, bucket_name, endpoint, is_active)
      VALUES ('${newId}', '${accountId}', '${accessKeyId}', '${secretAccessKey}', '${bucketName}', '${endpoint}', true)
    `));
    res.json({ success: true, id: newId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add R2 account" });
  }
});

router.put("/r2/:id", async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  try {
    await db.execute(sql.raw(`UPDATE r2_accounts SET is_active = ${isActive} WHERE id = '${id}'`));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update R2 account" });
  }
});

router.delete("/r2/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute(sql.raw(`DELETE FROM r2_accounts WHERE id = '${id}'`));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete R2 account" });
  }
});

export default router;
