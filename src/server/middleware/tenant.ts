import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.js";

// Ensure the user's request is scoped to their company
export function requireTenant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.companyId) {
    return res.status(401).json({ error: "Unauthorized: Missing tenant context" });
  }

  // Bind the companyId to the request body/query for downstream handlers, 
  // but be careful not to allow users to override it
  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    req.body.companyId = req.user.companyId;
  }
  
  next();
}
