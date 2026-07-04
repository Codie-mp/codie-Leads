import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.js";
import { db } from "../../db/index.js";
import { companies } from "../../db/schema.js";
import { eq } from "drizzle-orm";

/**
 * Middleware to ensure the user's company subscription is active.
 * Used for core product features (e.g., search, campaigns, exports).
 */
export async function requireActiveSubscription(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.companyId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Super admins bypass subscription checks
  if (req.user.isSuperAdmin) {
    return next();
  }

  try {
    const comp = await db.select({ 
      active: companies.active 
    }).from(companies).where(eq(companies.id, req.user.companyId));

    if (!comp.length) {
      return res.status(404).json({ error: "Company not found" });
    }

    if (!comp[0].active) {
      return res.status(403).json({ 
        error: "Subscription inactive", 
        code: "SUBSCRIPTION_INACTIVE",
        message: "Your company subscription is inactive. Please renew to continue using this feature."
      });
    }

    next();
  } catch (err) {
    console.error("Subscription check error:", err);
    return res.status(500).json({ error: "Failed to verify subscription status" });
  }
}
