import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;
function getAi() {
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiInstance;
}

export interface PlaceResult {
  name: string;
  address: string;
  phone: string;
  website: string;
  rating: string;
  price: string;
  googleMapsLink: string;
  businessCategory?: string;
  businessStatus?: string;
  reviewsSummary?: string;
  reviews?: string;
  lat?: number;
  lng?: number;
}

export interface LocationFilterData {
  type: 'radius' | 'bounding_box';
  center?: { lat: number; lng: number; address?: string };
  radiusKm?: number;
  boundingBox?: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  };
}

export interface SearchFilters {
  minRating?: number;
  priceLevel?: string; // $, $$, $$$, $$$$
  keywords?: string;
  limit?: number;
  locationFilter?: LocationFilterData;
}

export async function generateKeywordsFromIntent(intent: string): Promise<string[]> {
  try {
    // Using gemini-2.5-flash as the standard free-tier model
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a GTM (Go-To-Market) expert. 
      A user is looking for leads and described their intent as: "${intent}".
      
      Based on this, generate 3-5 specific, high-intent Google Maps search queries that would yield the best results for finding these leads.
      Focus on queries that find businesses.
      
      Return ONLY a JSON array of strings. Example: ["Plumbers in Chicago", "Emergency plumbing services Chicago", "Commercial plumbing contractors Chicago"]
    `;

    const response = await getAi().models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse keywords JSON", e);
      return [];
    }
  } catch (error) {
    console.error("Error generating keywords:", error);
    throw error;
  }
}

export async function generateNicheSuggestions(): Promise<{ category: string; niches: string[] }[]> {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a GTM strategist. Generate 4 interesting, high-value business categories for lead generation.
      For each category, provide 4 specific, creative "niche" search queries.
      
      Return ONLY a JSON object with this structure:
      {
        "suggestions": [
          { "category": "Real Estate", "niches": ["Luxury property managers", "Commercial real estate brokers", "Short-term rental operators", "Real estate investment trusts"] },
          ...
        ]
      }
    `;

    const response = await getAi().models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || '{"suggestions": []}');
    return data.suggestions;
  } catch (error) {
    console.error("Error generating niche suggestions:", error);
    return [];
  }
}

export async function enrichLeadData(leadName: string, companyName: string): Promise<any> {
  try {
    const model = "gemini-2.5-flash";
    const prompt = `
      You are a research assistant. Find decision-maker information for the company "${companyName}" related to "${leadName}".
      
      Return ONLY a JSON object:
      {
        "decisionMakers": [
          {
            "name": "Full Name",
            "title": "Job Title",
            "email": "email@company.com",
            "link": "https://linkedin.com/in/username"
          }
        ],
        "signals": ["Signal 1", "Signal 2"],
        "summary": "Brief 1-sentence summary of the company's current state."
      }
    `;

    const response = await getAi().models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error enriching lead data:", error);
    return null;
  }
}

export async function searchPlaces(query: string, filters?: SearchFilters, onStreamUpdate?: (places: PlaceResult[]) => void): Promise<{ text: string; places: PlaceResult[] }> {
  try {
    // Must use gemini-2.5-flash because googleMaps tool is currently only supported in 2.5 series
    const model = "gemini-2.5-flash";
    
    let filterInstructions = "";
    const targetLimit = filters?.limit || 20;
    const maxIterations = Math.ceil(targetLimit / 15); // Try to get 15-20 per iteration

    if (filters) {
      if (filters.minRating) {
        filterInstructions += `\n- Only include places with a rating of ${filters.minRating} stars or higher.`;
      }
      if (filters.priceLevel) {
        filterInstructions += `\n- Only include places with a price level of ${filters.priceLevel}.`;
      }
      if (filters.keywords) {
        filterInstructions += `\n- Only include places that match these keywords: "${filters.keywords}".`;
      }
      if (filters.locationFilter) {
        const lf = filters.locationFilter;
        if (lf.type === 'radius' && lf.center) {
          filterInstructions += `\n- GEOGRAPHIC CONSTRAINT: The search MUST be limited strictly to a radius of ${lf.radiusKm || 10} km around Latitude ${lf.center.lat.toFixed(5)}, Longitude ${lf.center.lng.toFixed(5)}${lf.center.address ? ` (${lf.center.address})` : ''}. Only find and return places situated inside this precise radial zone.`;
        } else if (lf.type === 'bounding_box' && lf.boundingBox) {
          const { northEast, southWest } = lf.boundingBox;
          filterInstructions += `\n- GEOGRAPHIC CONSTRAINT: Only return places situated inside this bounding box:
            * South-West corner: Latitude ${southWest.lat.toFixed(5)}, Longitude ${southWest.lng.toFixed(5)}
            * North-East corner: Latitude ${northEast.lat.toFixed(5)}, Longitude ${northEast.lng.toFixed(5)}
            Do NOT include any places outside these coordinate bounds.`;
        }
      }
    }

    let allPlaces: PlaceResult[] = [];
    let allText = "";
    const foundNames = new Set<string>();

    for (let i = 0; i < maxIterations; i++) {
      const remaining = targetLimit - allPlaces.length;
      if (remaining <= 0) break;

      let limitInstruction = `Find exactly ${Math.min(remaining, 20)} results.`;
      let excludeInstruction = "";
      let iterationInstruction = "";
      
      if (foundNames.size > 0) {
        // Limit exclude list to last 50 to avoid huge prompts
        const recentNames = Array.from(foundNames).slice(-50);
        const excludeList = recentNames.map(name => `"${name}"`).join(", ");
        excludeInstruction = `\nIMPORTANT: Do NOT include any of these places as they have already been found: ${excludeList}. Please find NEW places.`;
        iterationInstruction = `\nTo find new places, try searching in different neighborhoods, surrounding areas, or using slightly different variations of the search terms.`;
      }

      let localizedQuery = query;
      if (filters?.locationFilter) {
        const lf = filters.locationFilter;
        if (lf.type === 'radius' && lf.center) {
          const areaLabel = lf.center.address ? lf.center.address.split(',')[0] : `${lf.center.lat.toFixed(3)}, ${lf.center.lng.toFixed(3)}`;
          localizedQuery = `${query} near ${areaLabel}`;
        } else if (lf.type === 'bounding_box' && lf.boundingBox) {
          localizedQuery = `${query} inside specified bounds`;
        }
      }

      const prompt = `
        Find "${localizedQuery}". 
        I need a comprehensive list of leads for my GTM process.
        ${filterInstructions}
        ${excludeInstruction}
        ${iterationInstruction}
        
        Task:
        1. Use Google Maps to find the places.
        2. Use Google Search to find the *actual* official website for each place if the Maps result is missing it or generic.
        
        Please provide a Markdown table with the following columns exactly: 
        Name | Category | Address | Lat | Lng | Phone | Website | Rating | Price | Status | Reviews Summary
        
        ${limitInstruction}
        
        Guidelines:
        - If a piece of information is missing, put "N/A".
        - For "Lat" and "Lng", provide the latitude and longitude coordinates of the place.
        - For "Category", provide the primary business category (e.g., "Plumber", "Italian Restaurant").
        - For "Status", provide the current operational status (e.g., "Open", "Closed", "Temporarily Closed").
        - For "Reviews Summary", provide a very brief 3-5 word summary of what people say (e.g., "Great service, expensive", "Friendly staff").
        - For "Website", ensure it is the valid, direct URL to the business website.
        - Do not include any other text before or after the table, just the table.
      `;

      const response = await getAi().models.generateContent({
        model: model,
        contents: prompt,
        config: {
          // Enable both Google Maps and Google Search for maximum accuracy
          tools: [{ googleMaps: {} }, { googleSearch: {} }],
        },
      });

      const text = response.text || "";
      allText += text + "\n\n";
      
      let newPlaces = parseMarkdownTable(text);

      // Extract exact Maps URLs from grounding chunks
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      // Create a map of place names to their Maps URI from grounding chunks
      const mapsUris = new Map<string, string>();
      for (const chunk of chunks) {
        if (chunk.maps && chunk.maps.title && chunk.maps.uri) {
          // Normalize names for better matching
          const normalizedTitle = chunk.maps.title.toLowerCase().trim();
          mapsUris.set(normalizedTitle, chunk.maps.uri);
        }
      }

      // Attach Maps URIs to places and filter out duplicates
      let addedInThisIteration = 0;
      for (const place of newPlaces) {
        const normalizedPlaceName = place.name.toLowerCase().trim();
        
        if (foundNames.has(normalizedPlaceName)) {
          continue; // Skip duplicates
        }

        let exactUri = "N/A";
        
        // Try exact match
        if (mapsUris.has(normalizedPlaceName)) {
          exactUri = mapsUris.get(normalizedPlaceName)!;
        } else {
          // Try partial match
          for (const [title, uri] of mapsUris.entries()) {
            if (normalizedPlaceName.includes(title) || title.includes(normalizedPlaceName)) {
              exactUri = uri;
              break;
            }
          }
        }

        const enrichedPlace = {
          ...place,
          googleMapsLink: exactUri !== "N/A" ? exactUri : place.googleMapsLink,
        };

        allPlaces.push(enrichedPlace);
        foundNames.add(normalizedPlaceName);
        addedInThisIteration++;

        if (allPlaces.length >= targetLimit) {
          break;
        }
      }

      // Call the stream update callback if provided
      if (onStreamUpdate) {
        onStreamUpdate([...allPlaces]);
      }

      // If we didn't find any new places in this iteration, the model might be exhausted for this query
      if (addedInThisIteration === 0) {
        break;
      }
      
      // Add a small delay between iterations to avoid rate limits
      if (i < maxIterations - 1 && allPlaces.length < targetLimit) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return { text: allText, places: allPlaces };
  } catch (error) {
    console.error("Error searching places:", error);
    throw error;
  }
}

function parseMarkdownTable(markdown: string): PlaceResult[] {
  const lines = markdown.trim().split('\n');
  const places: PlaceResult[] = [];
  
  // Find the header line (starts with | Name | or similar)
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('|') && lines[i].toLowerCase().includes('name')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) return [];

  // Skip header and separator line
  for (let i = headerIndex + 2; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith('|')) continue;

    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell !== '');
    
    // Name | Category | Address | Lat | Lng | Phone | Website | Rating | Price | Status | Reviews Summary
    if (cells.length >= 11) {
      places.push({
        name: cells[0] || "N/A",
        businessCategory: cells[1] || "N/A",
        address: cells[2] || "N/A",
        lat: parseFloat(cells[3]) || undefined,
        lng: parseFloat(cells[4]) || undefined,
        phone: cells[5] || "N/A",
        website: cells[6] || "N/A",
        rating: cells[7] || "N/A",
        price: cells[8] || "N/A",
        businessStatus: cells[9] || "N/A",
        reviewsSummary: cells[10] || "N/A",
        googleMapsLink: "N/A", // Will be populated by grounding chunks
        reviews: "0",
      });
    } else if (cells.length >= 9) {
      places.push({
        name: cells[0] || "N/A",
        businessCategory: cells[1] || "N/A",
        address: cells[2] || "N/A",
        phone: cells[3] || "N/A",
        website: cells[4] || "N/A",
        rating: cells[5] || "N/A",
        price: cells[6] || "N/A",
        businessStatus: cells[7] || "N/A",
        reviewsSummary: cells[8] || "N/A",
        googleMapsLink: "N/A", // Will be populated by grounding chunks
        reviews: "0",
      });
    } else if (cells.length >= 7) {
       // Fallback for older format
       places.push({
        name: cells[0] || "N/A",
        address: cells[1] || "N/A",
        phone: cells[2] || "N/A",
        website: cells[3] || "N/A",
        rating: cells[4] || "N/A",
        price: cells[5] || "N/A",
        googleMapsLink: cells[6] || "N/A",
        reviews: "0",
      });
    }
  }

  return places;
}
