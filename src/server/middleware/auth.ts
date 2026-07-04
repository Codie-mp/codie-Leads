import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    companyId: string;
    email: string;
    role: string;
    isSuperAdmin: boolean;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export enum Permission {
  INVITE_USERS = 'INVITE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES',
  MANAGE_BILLING = 'MANAGE_BILLING',
  VIEW_TEAM = 'VIEW_TEAM',
  EXPORT_LEADS = 'EXPORT_LEADS',
  CREATE_CAMPAIGN = 'CREATE_CAMPAIGN',
  SEARCH_LEADS = 'SEARCH_LEADS',
  MANAGE_API_KEYS = 'MANAGE_API_KEYS',
}

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    Permission.INVITE_USERS,
    Permission.MANAGE_ROLES,
    Permission.MANAGE_BILLING,
    Permission.VIEW_TEAM,
    Permission.EXPORT_LEADS,
    Permission.CREATE_CAMPAIGN,
    Permission.SEARCH_LEADS,
    Permission.MANAGE_API_KEYS,
  ],
  manager: [
    Permission.VIEW_TEAM,
    Permission.EXPORT_LEADS,
    Permission.CREATE_CAMPAIGN,
    Permission.SEARCH_LEADS,
  ],
  member: [
    Permission.SEARCH_LEADS,
    Permission.VIEW_TEAM,
  ],
};

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.isSuperAdmin) return next();
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    if (req.user.isSuperAdmin) {
      return next(); // Super admin bypasses all checks
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ error: `Forbidden: requires ${permission} permission` });
    }
    
    next();
  };
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.isSuperAdmin) {
    return res.status(403).json({ error: "Forbidden: requires super admin privileges" });
  }
  next();
}
