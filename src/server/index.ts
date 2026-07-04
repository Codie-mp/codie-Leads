import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { syncLegacySchema } from "./routes/legacy.js"; // Keeping this purely for the schema sync function
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
  const app = express();

  // Basic security middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Vite HMR needs relaxations
  }));
  
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
    credentials: true,
  }));

  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Set up API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/public", publicRoutes);
  
  // Health Check Endpoint
  app.get("/health", (req, res) => {
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
  app.use("/api", geminiRoutes); // This handles /scrape, /gemini/keywords, etc since the old paths were mostly under /api/gemini or /api/scrape
  
  // External API v1
  app.use("/api/v1", apiV1Routes);

  // Serve static files or Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // We are running from dist/server.cjs in production
    const staticDir = path.resolve(__dirname); 
    app.use(express.static(staticDir));
    app.get("*", (req, res) => {
      // Don't serve index.html for api routes that fall through
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: "Not Found" });
        return;
      }
      res.sendFile(path.join(staticDir, "index.html"));
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  });

  // Run initial migrations / schema sync
  // await syncLegacySchema(); // Disabled locally to prevent schema warnings since Drizzle handles migrations

  return app;
}
