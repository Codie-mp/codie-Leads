import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.js";
import { CreditService } from "../services/creditService.js";

/**
 * Middleware to ensure the user's company has enough credits to perform an action.
 * @param requiredCredits Default is 1
 */
export function requireCredits(requiredCredits: number = 1) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.companyId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const balance = await CreditService.getBalance(req.user.companyId);
      if (balance < requiredCredits) {
        return res.status(402).json({ 
          error: "Insufficient credits", 
          required: requiredCredits, 
          balance 
        });
      }
      // Attach balance to req if later routes want to use it
      (req as any).creditBalance = balance;
      next();
    } catch (err) {
      console.error("Credit check error:", err);
      return res.status(500).json({ error: "Failed to verify credits" });
    }
  };
}
