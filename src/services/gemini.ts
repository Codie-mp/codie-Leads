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
  type: 'radius' | 'bounding_box' | 'multi_city';
  center?: { lat: number; lng: number; address?: string };
  radiusKm?: number;
  boundingBox?: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  };
  cities?: string[];
}

export interface SearchFilters {
  minRating?: number;
  priceLevel?: string; // $, $$, $$$, $$$$
  keywords?: string;
  limit?: number;
  locationFilter?: LocationFilterData;
  excludeDomains?: string[];
  excludePhones?: string[];
}

async function safeJson(res: Response) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return res.json();
  }
  const text = await res.text();
  throw new Error(text.substring(0, 100));
}

export async function generateKeywordsFromIntent(intent: string): Promise<string[]> {
  const res = await fetch("/api/gemini/keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent }),
  });
  if (!res.ok) throw new Error(await res.text());
  return safeJson(res);
}

export async function generateNicheSuggestions(): Promise<{ category: string; niches: string[] }[]> {
  const res = await fetch("/api/gemini/niches", { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return safeJson(res);
}

export async function enrichLeadData(leadName: string, companyName: string): Promise<any> {
  const res = await fetch("/api/gemini/enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadName, companyName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return safeJson(res);
}

export async function searchPlaces(
  query: string, 
  filters?: SearchFilters, 
  onStreamUpdate?: (places: PlaceResult[]) => void
): Promise<{ text: string; places: PlaceResult[] }> {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetch("/api/gemini/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filters }),
      });
      
      if (!res.ok) {
        throw new Error(await res.text());
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("text/event-stream") !== -1) {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let allPlaces: PlaceResult[] = [];
        let buffer = "";

        if (!reader) {
          throw new Error("Streaming not supported");
        }

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const jsonStr = line.substring(6);
              try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.error) {
                  reject(new Error(parsed.error));
                  return;
                }
                if (parsed.places) {
                  allPlaces = [...allPlaces, ...parsed.places];
                  if (onStreamUpdate) {
                    onStreamUpdate([...allPlaces]);
                  }
                }
                if (parsed.done) {
                  resolve({ text: "", places: allPlaces });
                  return;
                }
              } catch (e) {
                // Ignore JSON parse errors for partial lines
              }
            }
          }
        }
        resolve({ text: "", places: allPlaces });
      } else {
        // Fallback for non-streaming response
        const data = await safeJson(res);
        if (onStreamUpdate) {
          onStreamUpdate(data.places || []);
        }
        resolve(data);
      }
    } catch (e) {
      reject(e);
    }
  });
}
