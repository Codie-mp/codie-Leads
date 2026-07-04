import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import next from "next";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
// Modular App Routes
import dataRoutes from "./routes/data.js";
import leadsRoutes from "./routes/leads.js";
import campaignsRoutes from "./routes/campaigns.js";
import categoriesRoutes from "./routes/categories.js";
import extensionRoutes from "./routes/extension.js";
import geminiRoutes from "./routes/gemini.js";
import superAdminRoutes from "./routes/superAdmin.js";
import companyAdminRoutes from "./routes/companyAdmin.js";
import apiKeysRoutes from "./routes/apiKeys.js";
import webhooksRoutes from "./routes/webhooks.js";
import billingRoutes from "./routes/billing.js";
import notificationsRoutes from "./routes/notifications.js";
import apiV1Routes from "./routes/apiV1.js";
import publicRoutes from "./routes/public.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createServer(): Promise<Express> {
  const dev = process.env.NODE_ENV !== "production";
  
  // Initialize Next.js app
  const nextApp = next({ dev, dir: path.resolve(__dirname, "../..") });
  const nextHandle = nextApp.getRequestHandler();
  await nextApp.prepare();

  const app = express();

  // Basic security middleware
  // CSP is relaxed here; Next.js handles its own CSP headers via next.config.mjs
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
  }));
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Set up API routes — these are handled by Express before Next.js sees the request
  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);

  // Health Check Endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // App modular routes
  app.use("/api/superadmin", superAdminRoutes);
  app.use("/api/company", companyAdminRoutes);
  app.use("/api/apikeys", apiKeysRoutes);
  app.use("/api/webhooks", webhooksRoutes);
  app.use("/api/billing", billingRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/data", dataRoutes);
  app.use("/api/leads", leadsRoutes);
  app.use("/api/campaigns", campaignsRoutes);
  app.use("/api/categories", categoriesRoutes);
  app.use("/api/extension", extensionRoutes);
  app.use("/api/gemini", geminiRoutes); // All Gemini AI routes under /api/gemini/*

  // External API v1
  app.use("/api/v1", apiV1Routes);

  // Delegate all non-API requests to Next.js
  app.all("*", (req, res) => {
    return nextHandle(req, res);
  });

  // Error handling middleware
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });

  return app;
}
