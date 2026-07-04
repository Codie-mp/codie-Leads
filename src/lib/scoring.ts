import { PlaceResult } from '@/services/gemini';
import { Lead } from './schema';

export function calculateLeadScore(lead: PlaceResult | Lead): number {
  // Load weights from localStorage or use defaults
  const weights = JSON.parse(localStorage.getItem('scoringWeights') || JSON.stringify({
    website: 40,
    phone: 30,
    rating45: 20,
    rating40: 10,
    badRating: -10,
    highPrice: 10
  }));

  let score = 0;
  const rating = typeof lead.rating === 'string' ? parseFloat(lead.rating) : (lead.rating || 0);
  const hasWebsite = lead.website && lead.website !== 'N/A';
  const hasPhone = lead.phone && lead.phone !== 'N/A';

  // Base score for contactability
  if (hasWebsite) score += weights.website;
  if (hasPhone) score += weights.phone;

  // Quality score based on rating
  if (rating >= 4.5) score += weights.rating45;
  else if (rating >= 4.0) score += weights.rating40;
  else if (rating > 0 && rating < 3.5) score += weights.badRating; // Penalize bad ratings

  // Price level bonus (if available)
  const priceLevel = (lead as any).priceLevel;
  if (priceLevel === '$$$' || priceLevel === '$$$$') score += weights.highPrice;

  return Math.max(0, Math.min(100, score));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
  if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}
