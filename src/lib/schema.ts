import { z } from 'zod';

export const LeadStatusSchema = z.enum(['new', 'contacted', 'qualified', 'lost', 'customer']);
export type LeadStatus = z.infer<typeof LeadStatusSchema>;

export const LeadSourceSchema = z.enum(['search', 'manual', 'import']);
export type LeadSource = z.infer<typeof LeadSourceSchema>;

export const CampaignSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(z.object({
    day: z.number(),
    type: z.enum(['email', 'linkedin', 'call', 'other']),
    template: z.string().optional(),
  })),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const LeadSchema = z.object({
  id: z.string().uuid().optional(), // Dexie auto-increment or UUID
  name: z.string().min(1, "Name is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  googleMapsLink: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().optional(),
  priceLevel: z.string().optional(), // $, $$, etc.
  
  // New Enhanced Fields
  businessCategory: z.string().optional(),
  businessStatus: z.string().optional(),
  reviewsSummary: z.string().optional(),
  
  // Smart Classification Fields
  status: LeadStatusSchema.default('new'),
  source: LeadSourceSchema.default('search'),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  
  // Metadata
  searchQuery: z.string().optional(), // To track which search found this lead
  categoryId: z.string().optional(), // Link to a specific list/category
  campaignId: z.string().optional(), // Link to a specific outreach campaign
  
  // Intelligence Data
  analysis: z.object({
    summary: z.string().optional(),
    targetAudience: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
    iceBreaker: z.string().optional(),
    suggestedTitles: z.array(z.string()).optional(),
    signals: z.array(z.string()).optional(),
    decisionMakers: z.array(z.object({
      name: z.string(),
      title: z.string(),
      link: z.string().optional(),
      email: z.string().email().optional(),
      phone: z.string().optional()
    })).optional(),
    lastAnalyzedAt: z.date().optional()
  }).optional(),

  // CRM Integration
  crmData: z.object({
    provider: z.enum(['hubspot', 'salesforce', 'pipedrive']),
    id: z.string(),
    url: z.string().url().optional()
  }).optional(),

  // Engagement Tracking
  engagement: z.object({
    opens: z.number().default(0),
    clicks: z.number().default(0),
    lastActive: z.date().optional()
  }).optional(),

  // Sales Cadence / Sequence
  sequence: z.object({
    step: z.number().default(1),
    nextAction: z.string().default('Send Initial Email'),
    nextActionDate: z.date().optional()
  }).optional(),

  lastContactedAt: z.date().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Lead = z.infer<typeof LeadSchema>;

export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  color: z.string().default('#6366f1'), // Default blue-500
  icon: z.string().optional(),
  description: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

export type Category = z.infer<typeof CategorySchema>;

export const RecentSearchSchema = z.object({
  id: z.string().uuid().optional(),
  query: z.string(),
  filters: z.any().optional(), // Store the filters used
  timestamp: z.date().default(() => new Date()),
  resultsCount: z.number().optional()
});

export type RecentSearch = z.infer<typeof RecentSearchSchema>;
