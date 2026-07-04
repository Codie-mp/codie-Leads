import { Router } from "express";
import { db } from "../../db/index.js";
import { notifications } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// All notification routes require authentication
router.use(requireAuth);

/**
 * GET /api/notifications
 * Get all notifications for the current user's company
 * Note: Could be filtered by userId, but for now we'll do company-wide or user-specific.
 */
router.get("/", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  const userId = (req as AuthenticatedRequest).user?.id;
  
  if (!companyId || !userId) return res.status(400).json({ error: "Missing identity" });

  try {
    // Fetch notifications for the company OR specifically for this user
    const userNotifications = await db.select()
      .from(notifications)
      .where(
        and(
          eq(notifications.companyId, companyId),
          // We could filter by eq(notifications.userId, userId) if we wanted private notifications,
          // but let's fetch all company notifications for simplicity, or just user ones if populated.
        )
      )
      .orderBy(desc(notifications.createdAt))
      .limit(50);
      
    res.json(userNotifications);
  } catch (error) {
    console.error("Fetch notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark a single notification as read
 */
router.put("/:id/read", async (req, res) => {
  const { id } = req.params;
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.companyId, companyId)));
      
    res.json({ success: true });
  } catch (error) {
    console.error("Update notification error:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read for the company
 */
router.put("/read-all", async (req, res) => {
  const companyId = (req as AuthenticatedRequest).user?.companyId;
  
  if (!companyId) return res.status(400).json({ error: "No company ID" });

  try {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.companyId, companyId));
      
    res.json({ success: true });
  } catch (error) {
    console.error("Read all notifications error:", error);
    res.status(500).json({ error: "Failed to mark all as read" });
  }
});

export default router;
