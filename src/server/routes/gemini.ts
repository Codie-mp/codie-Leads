import { Router } from "express";
import { GoogleGenAI } from "@google/genai";
import { 
  generateKeywordsFromIntent, 
  generateNicheSuggestions, 
  enrichLeadData, 
  searchPlaces 
} from "../../services/gemini-server.js";
import { CreditService } from "../services/creditService.js";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth.js";
import { requireActiveSubscription } from "../middleware/subscriptionGuard.js";

const router = Router();

// Protect all AI and search endpoints since they consume credits and are core product features
router.use(requireAuth);
router.use(requireActiveSubscription);

router.post("/scrape", async (req, res) => {
  const { icp, filters } = req.body;
  if (!icp) {
    return res.status(400).json({ error: "ICP is required" });
  }

  const companyId = (req as AuthenticatedRequest).user?.companyId;
  const userId = (req as AuthenticatedRequest).user?.id;
  const limit = filters?.limit || 10;

  try {
    if (companyId) {
      // 1 lead = 3 credits
      await CreditService.chargeCredits(companyId, limit * 3, `Scrape ${limit} leads`, userId);
    }
  } catch (e: any) {
    return res.status(402).json({ error: e.message || "Insufficient credits for scraping" });
  }

  try {
    const minRating = filters?.minRating;
    const priceLevel = filters?.priceLevel;
    const keywords = filters?.keywords;

    let filterInstructions = "";
    if (minRating) {
      filterInstructions += `\n- Only include businesses with a rating of ${minRating} stars or higher.`;
    }
    if (priceLevel) {
      filterInstructions += `\n- Only include businesses with a price level of ${priceLevel}.`;
    }
    if (keywords) {
      filterInstructions += `\n- Only include businesses that match these keywords or attributes: "${keywords}".`;
    }

    const apiKey = process.env.GEMINI_API_KEY || "";
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find exactly ${limit} business leads matching this ICP (Ideal Customer Profile) using Google Search: "${icp}".
      ${filterInstructions}
      
      Return a comprehensive list of businesses matching the criteria. Include their public names, websites, and any descriptive notes. Also return rating, priceLevel, phone and address if found in the search results.
      
      CRITICAL: YOU MUST RETURN ONLY A VALID JSON ARRAY OF OBJECTS in the following format (and NOTHING ELSE!):
      [
        {
          "name": "Business Name",
          "website": "https://example.com",
          "company": "Company Name",
          "title": "Short descriptive title",
          "notes": "Descriptive notes",
          "rating": "4.5",
          "priceLevel": "$$",
          "phone": "+1 555-555-5555",
          "address": "123 Main St, City, State"
        }
      ]`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text;
    if (text) {
      let cleanText = text.trim();
      // Remove markdown formatting
      if (cleanText.startsWith('\`\`\`json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('\`\`\`')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('\`\`\`')) {
        cleanText = cleanText.slice(0, -3);
      }
      const results = JSON.parse(cleanText);
      // Ensure no duplicates are returned by checking against existing names
      const existingNames: string[] = req.body.existingNames || [];
      const existingNamesSet = new Set(existingNames.map((n: string) => n?.toLowerCase()));
      const uniqueResults = results.filter(
        (r: any) => !r.name || !existingNamesSet.has(r.name.toLowerCase())
      );
      res.json({ results: uniqueResults });
    } else {
      res.status(500).json({ error: "No text returned from Gemini." });
    }

  } catch (error: any) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: error.message || "Failed to scrape using Gemini ICP Search" });
  }
});

router.post("/keywords", async (req, res) => {
  try {
    const data = await generateKeywordsFromIntent(req.body.intent);
    res.json(data);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

router.post("/niches", async (req, res) => {
  try {
    const data = await generateNicheSuggestions();
    res.json(data);
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

router.post("/enrich", async (req, res) => {
  const companyId = req.headers['x-company-id'] as string;
  try {
    if (companyId) {
      // 12 credits for AI enrichment
      await CreditService.chargeCredits(companyId, 12);
    }
    const data = await enrichLeadData(req.body.leadName, req.body.companyName);
    res.json(data);
  } catch (e: any) {
    console.error(e);
    res.status(e.message.includes("Insufficient credits") ? 402 : 500).send(e.message);
  }
});

/**
 * POST /api/gemini/search
 * Streaming endpoint using Server-Sent Events (SSE) for real-time lead discovery.
 * Uses Google Maps + Google Search grounding tools via the Gemini 2.5 Flash model.
 */
router.post("/search", async (req, res) => {
  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    let lastSentIndex = 0;
    const onStreamUpdate = (places: any[]) => {
      const newPlaces = places.slice(lastSentIndex);
      if (newPlaces.length > 0) {
        res.write(`data: ${JSON.stringify({ places: newPlaces })}\n\n`);
        lastSentIndex = places.length;
      }
    };

    const data = await searchPlaces(
      req.body.query,
      req.body.filters,
      onStreamUpdate
    );

    const finalNewPlaces = data.places.slice(lastSentIndex);
    res.write(
      `data: ${JSON.stringify({ done: true, places: finalNewPlaces })}\n\n`
    );
    res.end();
  } catch (e: any) {
    console.error(e);
    res.write(`data: ${JSON.stringify({ error: e.message })}\n\n`);
    res.end();
  }
});

router.post("/generate", async (req, res) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
    const response = await ai.models.generateContent({
      model: req.body.model || "gemini-2.5-flash",
      contents: req.body.contents,
      config: req.body.config,
    });
    res.json({ text: response.text });
  } catch (e: any) {
    console.error(e);
    res.status(500).send(e.message);
  }
});

export default router;
