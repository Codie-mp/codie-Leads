import { describe, it, expect, beforeEach, vi } from 'vitest';
import { calculateLeadScore, getScoreColor } from './scoring';

describe('Scoring Logic', () => {
  beforeEach(() => {
    // Mock localStorage
    const mockStorage: Record<string, string> = {};
    global.localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => { mockStorage[key] = val; },
      clear: () => {},
      removeItem: (key: string) => { delete mockStorage[key]; },
      length: 0,
      key: () => null,
    };
  });

  it('calculates score correctly for a perfect lead', () => {
    const lead = {
      id: '1',
      name: 'Test Lead',
      website: 'https://example.com',
      phone: '123-456-7890',
      rating: 4.8,
      priceLevel: '$$$'
    };

    const score = calculateLeadScore(lead as any);
    // website(40) + phone(30) + rating45(20) + highPrice(10) = 100
    expect(score).toBe(100);
  });

  it('calculates score correctly for a poor lead', () => {
    const lead = {
      id: '2',
      name: 'Bad Lead',
      website: 'N/A',
      phone: 'N/A',
      rating: 2.5
    };

    const score = calculateLeadScore(lead as any);
    // website(0) + phone(0) + badRating(-10) = -10, bounded to 0
    expect(score).toBe(0);
  });

  it('returns correct color based on score', () => {
    expect(getScoreColor(85)).toContain('text-green-600');
    expect(getScoreColor(60)).toContain('text-yellow-600');
    expect(getScoreColor(40)).toContain('text-red-600');
  });
});
