import { Router } from "express";
import crypto from "crypto";
import { db } from "../../db/index.js";
import { users, companies } from "../../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth, requirePermission, Permission, AuthenticatedRequest } from "../middleware/auth.js";
import { AuthService } from "../services/authService.js";

const router = Router();

// Secure all company admin routes
router.use(requireAuth);
// We check specific permissions on individual routes, but all need VIEW_TEAM basically
router.use(requirePermission(Permission.VIEW_TEAM));

// TEAM MANAGEMENT
router.get("/team", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    const team = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).where(eq(users.companyId, companyId));
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

router.post("/team/invite", requirePermission(Permission.INVITE_USERS), async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  const { email, password, role, firstName, lastName, sendInviteLink } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required" });
  }

  if (!sendInviteLink && !password) {
    return res.status(400).json({ error: "Password is required for direct creation" });
  }

  try {
    // Check max members limit
    const [companyInfo] = await db.select().from(companies).where(eq(companies.id, companyId));
    if (!companyInfo) return res.status(404).json({ error: "Company not found" });

    const [plan] = await db.execute(sql.raw(`SELECT max_members FROM pricing_plans WHERE name = '${companyInfo.subscriptionTier}'`));
    const maxMembers = Array.isArray(plan) && plan.length > 0 ? (plan[0] as any).max_members : 1;

    const [currentUsers] = await db.execute(sql.raw(`SELECT COUNT(*) as count FROM users WHERE company_id = '${companyId}'`));
    const currentUserCount = Array.isArray(currentUsers) && currentUsers.length > 0 ? (currentUsers[0] as any).count : 0;

    if (currentUserCount >= maxMembers) {
      return res.status(403).json({ error: `Your ${companyInfo.subscriptionTier} plan limits you to ${maxMembers} team member(s). Please upgrade to add more.` });
    }

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(400).json({ error: "User with this email already exists" });
    }

    const newId = crypto.randomUUID();
    let inviteToken = null;
    let passwordHash = "";

    if (sendInviteLink) {
      inviteToken = crypto.randomBytes(32).toString("hex");
      // Create a dummy un-guessable password hash so they can't login until they set it
      passwordHash = await AuthService.hashPassword(crypto.randomUUID() + crypto.randomUUID());
    } else {
      passwordHash = await AuthService.hashPassword(password);
    }

    await db.insert(users).values({
      id: newId,
      companyId,
      email,
      passwordHash,
      role,
      firstName,
      lastName,
      isSuperAdmin: false,
      inviteToken,
      isVerified: !sendInviteLink // direct creation auto-verifies
    });

    if (sendInviteLink) {
      const appUrl = process.env.APP_URL || "http://localhost:3000";
      const inviteUrl = `${appUrl}/accept-invite?token=${inviteToken}`;
      // In a real app we'd send an email here using SendGrid/Resend
      res.json({ success: true, id: newId, inviteUrl, message: "Invite link generated" });
    } else {
      res.json({ success: true, id: newId, message: "User created directly" });
    }
  } catch (error) {
    console.error("Invite user error:", error);
    res.status(500).json({ error: "Failed to invite user" });
  }
});

router.put("/team/:id", requirePermission(Permission.MANAGE_ROLES), async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  const { id } = req.params;
  const { role } = req.body;
  
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    // Only allow updating users within the same company
    await db.update(users)
      .set({ role })
      .where(and(eq(users.id, id), eq(users.companyId, companyId)));
      
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update team member" });
  }
});

router.delete("/team/:id", requirePermission(Permission.MANAGE_ROLES), async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  const { id } = req.params;
  
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    // Prevent deleting oneself
    const authReq = req as AuthenticatedRequest;
    if (id === authReq.user?.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    // Only allow deleting users within the same company
    await db.delete(users)
      .where(and(eq(users.id, id), eq(users.companyId, companyId)));
      
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove team member" });
  }
});

// SUBSCRIPTION DETAILS
router.get("/subscription", requirePermission(Permission.MANAGE_BILLING), async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    const comp = await db.select().from(companies).where(eq(companies.id, companyId));
    if (comp.length === 0) return res.status(404).json({ error: "Company not found" });

    res.json({
      subscriptionTier: comp[0].subscriptionTier,
      creditsBalance: comp[0].creditsBalance,
      active: comp[0].active
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch subscription details" });
  }
});

// CRM INTEGRATIONS
router.get("/crm", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    const integrations = await db.execute(sql.raw(`
      SELECT * FROM crm_integrations WHERE company_id = '${companyId}'
    `));
    res.json(Array.isArray(integrations[0]) ? integrations[0] : integrations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch CRM integrations" });
  }
});

router.post("/crm", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  const { provider, apiKey, isActive, settings } = req.body;
  if (!provider || !apiKey) return res.status(400).json({ error: "Provider and API Key are required" });

  try {
    // Delete existing of same provider for simplicity or just upsert
    await db.execute(sql.raw(`DELETE FROM crm_integrations WHERE company_id = '${companyId}' AND provider = '${provider}'`));
    
    const newId = crypto.randomUUID();
    const settingsStr = settings ? `'${JSON.stringify(settings)}'` : 'NULL';
    
    await db.execute(sql.raw(`
      INSERT INTO crm_integrations (id, company_id, provider, api_key, is_active, settings)
      VALUES ('${newId}', '${companyId}', '${provider}', '${apiKey}', ${isActive ? 'true' : 'false'}, ${settingsStr})
    `));

    res.json({ success: true, id: newId });
  } catch (error) {
    console.error("CRM Integration Error:", error);
    res.status(500).json({ error: "Failed to save CRM integration" });
  }
});

router.delete("/crm/:id", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  const { id } = req.params;
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    await db.execute(sql.raw(`DELETE FROM crm_integrations WHERE id = '${id}' AND company_id = '${companyId}'`));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete CRM integration" });
  }
});

export default router;
