const baseUrl = (process.env.E2E_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");

async function get(path: string) {
  return fetch(`${baseUrl}${path}`);
}

async function post(path: string, body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`E2E assertion failed: ${message}`);
}

const landing = await get("/");
const landingHtml = await landing.text();
assert(landing.ok, `landing page returned ${landing.status}`);
assert(landingHtml.includes("AI-assisted B2B prospecting"), "landing page positioning is missing");
assert(landingHtml.includes("Start your free workspace"), "primary CTA is missing");
assert(landingHtml.includes("FAQPage"), "FAQ structured data is missing");

const pricing = await get("/api/public/pricing-plans");
assert(pricing.ok, `pricing endpoint returned ${pricing.status}`);
const pricingBody = await pricing.json();
assert(Array.isArray(pricingBody), "pricing endpoint did not return an array");

const invalidLogin = await post("/api/auth/login", { email: "e2e@example.com" });
assert(invalidLogin.status === 400, `invalid login should return 400, received ${invalidLogin.status}`);

const protectedSearch = await post("/api/gemini/search", { query: "dentists" });
assert(protectedSearch.status === 401, `unauthenticated search should return 401, received ${protectedSearch.status}`);

console.log(`E2E smoke passed against ${baseUrl}`);
