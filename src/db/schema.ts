import { mysqlTable, serial, varchar, text, timestamp, boolean, int, json, double, mysqlEnum, date } from "drizzle-orm/mysql-core";

// 1. Core Tenant Tables
export const companies = mysqlTable('companies', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  logoUrl: varchar('logo_url', { length: 255 }),
  subscriptionTier: mysqlEnum('subscription_tier', ['starter', 'pro', 'enterprise']).default('starter'),
  creditsBalance: int('credits_balance').default(0),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  role: mysqlEnum('role', ['admin', 'manager', 'editor', 'viewer']).default('viewer'),
  isSuperAdmin: boolean('is_super_admin').default(false),
  isVerified: boolean('is_verified').default(false),
  otp: varchar('otp', { length: 6 }),
  otpExpiresAt: timestamp('otp_expires_at'),
  inviteToken: varchar('invite_token', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  companyId: varchar("company_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  planId: varchar("plan_id", { length: 255 }),
  status: varchar("status", { length: 50 }),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  paymentProofUrl: text("payment_proof_url"),
  planName: varchar("plan_name", { length: 100 }),
  billingCycle: varchar("billing_cycle", { length: 20 }).default('monthly'),
  startsAt: timestamp("starts_at"),
  expiresAt: timestamp("expires_at"),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: timestamp("approved_at"),
  rejectionReason: text("rejection_reason"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

export const pricingPlans = mysqlTable("pricing_plans", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  monthlyPrice: int("monthly_price").notNull(),
  yearlyPrice: int("yearly_price").notNull(),
  creditsPerMonth: int("credits_per_month").notNull(),
  maxMembers: int('max_members').default(1),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

export const creditPackages = mysqlTable("credit_packages", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: int("price").notNull(),
  credits: int("credits").notNull(),
  description: text("description"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

export const aiModels = mysqlTable("ai_models", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 100 }).notNull(), // 'google', 'openai', 'anthropic'
  costPer1kTokensIn: double("cost_per_1k_tokens_in").notNull(),
  costPer1kTokensOut: double("cost_per_1k_tokens_out").notNull(),
  profitMultiplier: double("profit_multiplier").default(3.0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow()
});

// 2. Billing & Subscriptions
export const subscriptionsLegacy = mysqlTable('subscriptions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }).notNull(),
  planName: varchar('plan_name', { length: 100 }), // Starter, Pro, Enterprise
  billingCycle: mysqlEnum('billing_cycle', ['monthly', 'yearly']).default('monthly'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  paymentStatus: mysqlEnum('payment_status', ['pending', 'active', 'failed', 'canceled']).default('pending'),
  instaPayReceiptUrl: varchar('instapay_receipt_url', { length: 500 }),
  createdAt: timestamp('created_at').defaultNow()
});

// 3. API & Integration Tables
export const apiKeys = mysqlTable('api_keys', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(), // hashed for security
  name: varchar('name', { length: 255 }),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow()
});

export const webhookEndpoints = mysqlTable('webhook_endpoints', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }).notNull(),
  url: varchar('url', { length: 500 }).notNull(),
  secret: varchar('secret', { length: 255 }),
  events: json('events'), // Array of event types like 'lead.created'
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

export const crmIntegrations = mysqlTable('crm_integrations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'hubspot', 'salesforce', etc.
  apiKey: varchar('api_key', { length: 500 }).notNull(),
  isActive: boolean('is_active').default(true),
  settings: json('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// 4. Infrastructure Configs
export const r2Accounts = mysqlTable('r2_accounts', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: varchar('account_id', { length: 255 }).notNull(),
  accessKeyId: varchar('access_key_id', { length: 255 }).notNull(),
  secretAccessKey: varchar('secret_access_key', { length: 255 }).notNull(),
  bucketName: varchar('bucket_name', { length: 255 }).notNull(),
  endpoint: varchar('endpoint', { length: 500 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow()
});

// 5. App Data Tables (Tenanted)
export const leads = mysqlTable('leads', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }),
  name: varchar('name', { length: 255 }).notNull(),
  website: varchar('website', { length: 255 }),
  company: varchar('company', { length: 255 }),
  title: varchar('title', { length: 255 }),
  notes: text('notes'),
  address: text('address'),
  phone: varchar('phone', { length: 255 }),
  email: varchar('email', { length: 255 }),
  status: varchar('status', { length: 50 }).default('new'),
  source: varchar('source', { length: 50 }).default('search'),
  tags: json('tags'), 
  rating: double('rating'),
  score: int('score'),
  categoryId: varchar('category_id', { length: 36 }),
  campaignId: varchar('campaign_id', { length: 36 }),
  engagementCount: int('engagement_count').default(0),
  engagementOpens: int('engagement_opens').default(0),
  engagementClicks: int('engagement_clicks').default(0),
  engagementReplies: int('engagement_replies').default(0),
  linkedinUrl: varchar('linkedin_url', { length: 255 }),
  googleMapsLink: text('google_maps_link'),
  reviews: int('reviews'),
  priceLevel: varchar('price_level', { length: 10 }),
  businessCategory: varchar('business_category', { length: 255 }),
  businessStatus: varchar('business_status', { length: 50 }),
  reviewsSummary: text('reviews_summary'),
  searchQuery: text('search_query'),
  analysis: json('analysis'),
  crmData: json('crm_data'),
  engagement: json('engagement'),
  sequence: json('sequence'),
  lastContactedAt: timestamp('last_contacted_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

export const recentSearches = mysqlTable('recent_searches', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }),
  query: text('query').notNull(),
  filters: json('filters'),
  resultsCount: int('results_count').default(0),
  timestamp: timestamp('timestamp').defaultNow()
});

export const categories = mysqlTable('categories', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }),
  name: varchar('name', { length: 255 }).notNull(),
  color: varchar('color', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const campaigns = mysqlTable('campaigns', {
  id: varchar('id', { length: 36 }).primaryKey(),
  companyId: varchar('company_id', { length: 36 }),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).default('draft'),
  sent: int('sent').default(0),
  opened: int('opened').default(0),
  clicked: int('clicked').default(0),
  replied: int('replied').default(0),
  createdAt: timestamp('created_at').defaultNow()
});

// 6. Platform Administration
export const creditTransactions = mysqlTable('credit_transactions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  companyId: varchar('company_id', { length: 255 }).notNull(),
  amount: int('amount').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  description: text('description'),
  performedBy: varchar('performed_by', { length: 255 }),
  referenceId: varchar('reference_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const platformSettings = mysqlTable('platform_settings', {
  id: varchar('id', { length: 255 }).primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: json('value'),
  updatedBy: varchar('updated_by', { length: 255 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

export const activityLogs = mysqlTable('activity_logs', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  companyId: varchar('company_id', { length: 255 }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: varchar('entity_id', { length: 255 }),
  metadata: json('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow()
});

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }),
  companyId: varchar('company_id', { length: 255 }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }),
  message: text('message'),
  isRead: boolean('is_read').default(false),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});
