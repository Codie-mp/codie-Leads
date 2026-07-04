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
  const res = await fetch("/api/gemini/keywords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateNicheSuggestions(): Promise<{ category: string; niches: string[] }[]> {
  const res = await fetch("/api/gemini/niches", { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function enrichLeadData(leadName: string, companyName: string): Promise<any> {
  const res = await fetch("/api/gemini/enrich", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadName, companyName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function searchPlaces(
  query: string, 
  filters?: SearchFilters, 
  onStreamUpdate?: (places: PlaceResult[]) => void
): Promise<{ text: string; places: PlaceResult[] }> {
  const res = await fetch("/api/gemini/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, filters }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  if (onStreamUpdate) {
    onStreamUpdate(data.places);
  }
  return data;
}
