import express from "express";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  chargeCredits: vi.fn(),
  identifiers: vi.fn(),
  searchPlaces: vi.fn(),
  generateContent: vi.fn(),
}));

vi.mock("../services/creditService.js", () => ({ CreditService: { chargeCredits: mocks.chargeCredits } }));
vi.mock("../services/leadService.js", () => ({
  LeadService: { getExistingLeadIdentifiers: mocks.identifiers },
  normalizeDomain: (value: unknown) => {
    const raw = String(value ?? "").trim().toLowerCase();
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  },
  normalizeName: (value: unknown) => String(value ?? "").trim().toLowerCase(),
}));
vi.mock("../../services/gemini-server.js", () => ({
  searchPlaces: mocks.searchPlaces,
  generateKeywordsFromIntent: vi.fn(),
  generateNicheSuggestions: vi.fn(),
  enrichLeadData: vi.fn(),
}));
vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = { generateContent: mocks.generateContent };
  },
}));
vi.mock("../middleware/auth.js", () => ({
  requireAuth: (req: any, res: any, next: any) => {
    if (req.headers.authorization !== "Bearer test-token") return res.status(401).json({ error: "Unauthorized" });
    req.user = { id: "u1", companyId: "c1", email: "user@example.com", role: "member", isSuperAdmin: false };
    next();
  },
}));
vi.mock("../middleware/subscriptionGuard.js", () => ({
  requireActiveSubscription: (req: any, res: any, next: any) => {
    if (req.headers["x-subscription"] === "inactive") {
      return res.status(403).json({ error: "Subscription inactive", code: "SUBSCRIPTION_INACTIVE" });
    }
    next();
  },
}));

import geminiRouter from "./gemini";

const app = express();
app.use(express.json());
app.use("/api/gemini", geminiRouter);

let server: ReturnType<typeof app.listen>;
let baseUrl = "";

async function post(path: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer test-token", ...headers },
    body: JSON.stringify(body),
  });
}

beforeAll(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server failed to bind");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(() => server.close());

beforeEach(() => {
  mocks.chargeCredits.mockReset();
  mocks.chargeCredits.mockResolvedValue(undefined);
  mocks.identifiers.mockReset();
  mocks.identifiers.mockResolvedValue({ names: ["existing business"], domains: ["existing.com"] });
  mocks.searchPlaces.mockReset();
  mocks.generateContent.mockReset();
});

describe("protected Gemini/search routes", () => {
  it("rejects unauthenticated search requests", async () => {
    const response = await fetch(`${baseUrl}/api/gemini/search`, { method: "POST" });
    expect(response.status).toBe(401);
  });

  it("rejects inactive subscriptions before consuming credits", async () => {
    const response = await post("/api/gemini/scrape", { icp: "dentists", filters: { limit: 5 } }, { "x-subscription": "inactive" });
    expect(response.status).toBe(403);
    expect(mocks.chargeCredits).not.toHaveBeenCalled();
  });

  it("charges scrape credits and removes database duplicates by name and domain", async () => {
    mocks.generateContent.mockResolvedValueOnce({
      text: JSON.stringify([
        { name: "Existing Business", website: "https://new.example" },
        { name: "New Business", website: "https://existing.com/about" },
        { name: "Qualified Business", website: "https://qualified.com" },
      ]),
    });

    const response = await post("/api/gemini/scrape", { icp: "dentists", filters: { limit: 3 } });
    expect(response.status).toBe(200);
    expect(mocks.chargeCredits).toHaveBeenCalledWith("c1", 9, "Scrape 3 leads", "u1");
    expect(await response.json()).toEqual({
      results: [{ name: "Qualified Business", website: "https://qualified.com" }],
    });
  });

  it("streams incremental search results and sends a final done event", async () => {
    mocks.searchPlaces.mockImplementationOnce(async (_query: string, filters: any, onUpdate: (places: any[]) => void) => {
      expect(filters.existingNames).toEqual(["existing business"]);
      expect(filters.excludeDomains).toEqual(["existing.com"]);
      onUpdate([{ name: "One" }, { name: "Two" }]);
      return { text: "done", places: [{ name: "One" }, { name: "Two" }, { name: "Three" }] };
    });

    const response = await post("/api/gemini/search", { query: "dentists", filters: { type: "multi_city", cities: ["Cairo", "Giza"] } });
    const body = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(body).toContain('"places":[{"name":"One"},{"name":"Two"}]');
    expect(body).toContain('"done":true');
    expect(body).toContain('"places":[{"name":"Three"}]');
  });
});
