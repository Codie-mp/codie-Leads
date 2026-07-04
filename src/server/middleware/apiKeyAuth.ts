import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { db } from "../../db/index.js";
import { apiKeys } from "../../db/schema.js";
import { eq } from "drizzle-orm";

export interface ApiRequest extends Request {
  companyId?: string;
}

export const requireApiKey = async (req: ApiRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer sk_")) {
    return res.status(401).json({ error: "Missing or invalid API key" });
  }

  const rawKey = authHeader.split(" ")[1];
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  try {
    const keys = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash));

    if (keys.length === 0) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const keyInfo = keys[0];

    // Update last used asynchronously
    db.update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, keyInfo.id))
      .execute()
      .catch(console.error);

    req.companyId = keyInfo.companyId;
    next();
  } catch (error) {
    console.error("API Key Auth Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};
