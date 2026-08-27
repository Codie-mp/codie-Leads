import { db } from "./index.js";
import { sql } from "drizzle-orm";
import crypto from "crypto";

async function runMigration() {
  console.log("Starting SaaS Migration...");

  // 0. Create SaaS tables and add columns using raw SQL to avoid Drizzle push issues on TiDB
  console.log("Applying schema migrations...");
  
  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS companies (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo_url VARCHAR(255),
      subscription_tier VARCHAR(50) DEFAULT 'free',
      credits_balance INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      company_id VARCHAR(255),
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      first_name VARCHAR(100),
      last_name VARCHAR(100),
      role VARCHAR(50) DEFAULT 'viewer',
      is_super_admin BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id VARCHAR(255) PRIMARY KEY,
      company_id VARCHAR(255),
      stripe_customer_id VARCHAR(255),
      stripe_subscription_id VARCHAR(255),
      plan_id VARCHAR(255),
      status VARCHAR(50),
      current_period_end TIMESTAMP,
      cancel_at_period_end BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id VARCHAR(255) PRIMARY KEY,
      company_id VARCHAR(255),
      key_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      last_used_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS webhook_endpoints (
      id VARCHAR(255) PRIMARY KEY,
      company_id VARCHAR(255),
      url TEXT NOT NULL,
      secret VARCHAR(255),
      events JSON,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS crm_integrations (
      id VARCHAR(255) PRIMARY KEY,
      company_id VARCHAR(255) NOT NULL,
      provider VARCHAR(50) NOT NULL,
      api_key VARCHAR(500) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      settings JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS r2_accounts (
      id VARCHAR(255) PRIMARY KEY,
      company_id VARCHAR(255),
      account_id VARCHAR(255) NOT NULL,
      access_key_id VARCHAR(255) NOT NULL,
      secret_access_key TEXT NOT NULL,
      bucket_name VARCHAR(255) NOT NULL,
      public_url VARCHAR(255),
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id VARCHAR(255) PRIMARY KEY,
      company_id VARCHAR(255) NOT NULL,
      amount INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      description TEXT,
      performed_by VARCHAR(255),
      reference_id VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      id VARCHAR(255) PRIMARY KEY DEFAULT (UUID()),
      \`key\` VARCHAR(100) NOT NULL UNIQUE,
      value JSON,
      updated_by VARCHAR(255),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255),
      company_id VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(50),
      entity_id VARCHAR(255),
      metadata JSON,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255),
      company_id VARCHAR(255),
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255),
      message TEXT,
      is_read BOOLEAN DEFAULT false,
      metadata JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `));

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS pricing_plans (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      monthly_price INT NOT NULL,
      yearly_price INT NOT NULL,
      credits_per_month INT NOT NULL,
      description TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `));

  // Enhance subscriptions table with payment proof fields
  const subAlterQueries = [
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS payment_proof_url TEXT",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100)",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(20) DEFAULT 'monthly'",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS starts_at TIMESTAMP",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255)",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS rejection_reason TEXT",
    "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS notes TEXT"
  ];
  for (const q of subAlterQueries) {
    try { await db.execute(sql.raw(q)); } catch (e: any) { console.log(`Notice: ${e.message}`); }
  }


  // Add columns to existing tables
  const alterQueries = [
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS company_id VARCHAR(255)",
    "ALTER TABLE categories ADD COLUMN IF NOT EXISTS company_id VARCHAR(255)",
    "ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS company_id VARCHAR(255)",
    "ALTER TABLE recent_searches ADD COLUMN IF NOT EXISTS company_id VARCHAR(255)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6)",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_last_sent_at TIMESTAMP NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_send_count INT DEFAULT 0",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_send_window_started_at TIMESTAMP NULL"
  ];

  for (const q of alterQueries) {
    try {
      await db.execute(sql.raw(q));
    } catch (e: any) {
      console.log(`Notice: ${e.message}`);
    }
  }

  // 1. Create a default company
  const companyId = crypto.randomUUID();
  console.log(`Creating default company with ID: ${companyId}`);
  
  await db.execute(sql.raw(`
    INSERT INTO companies (id, name, subscription_tier, credits_balance, active, created_at, updated_at)
    VALUES ('${companyId}', 'CodieLead Legacy', 'pro', 10000, true, NOW(), NOW())
  `));

  // 2. Create a default admin user
  const userId = crypto.randomUUID();
  // Using a dummy hash for now, you will need to reset this via the UI later or we can set it to a known password
  const defaultPasswordHash = "$2b$12$hOgR.07wFN27sBmgNAWppO0LbgpsD5Rykbud2qJYBa94qLCpacQjO"; // 'password123'
  console.log(`Creating default admin user: admin@codielead.com`);
  
  await db.execute(sql.raw(`
    INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role, is_super_admin, is_verified, created_at, updated_at)
    VALUES ('${userId}', '${companyId}', 'admin@codielead.com', '${defaultPasswordHash}', 'Admin', 'User', 'admin', true, true, NOW(), NOW())
    ON DUPLICATE KEY UPDATE is_verified = true, is_super_admin = true, password_hash = '${defaultPasswordHash}'
  `));

  // 3. Update existing records to link to this company (silently skip if tables don't exist)
  console.log("Linking legacy data to default company...");
  const legacyUpdates = [
    `UPDATE leads SET company_id = '${companyId}' WHERE company_id IS NULL OR company_id = ''`,
    `UPDATE categories SET company_id = '${companyId}' WHERE company_id IS NULL OR company_id = ''`,
    `UPDATE campaigns SET company_id = '${companyId}' WHERE company_id IS NULL OR company_id = ''`,
    `UPDATE recent_searches SET company_id = '${companyId}' WHERE company_id IS NULL OR company_id = ''`,
  ];
  for (const q of legacyUpdates) {
    try { await db.execute(sql.raw(q)); }
    catch (e: any) { console.log(`Notice (skipped): ${e.message}`); }
  }

  // Priority 3: Team Management & Invites
  console.log("Checking users table for invite_token...");
  try {
    await db.execute(sql.raw(`ALTER TABLE users ADD COLUMN invite_token VARCHAR(255) NULL`));
    console.log("Added invite_token column to users table.");
  } catch (error: any) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log("invite_token column already exists.");
    } else {
      console.log("Warning: Could not add invite_token column:", error.message);
    }
  }

  // Priority 5: Default Pricing Plans
  console.log("Seeding default pricing plans...");
  try {
    const plans = [
      { id: 'starter-plan', name: 'starter', monthly: 25, yearly: 250, credits: 1000, desc: 'Perfect for small teams starting outreach.' },
      { id: 'pro-plan', name: 'pro', monthly: 100, yearly: 1000, credits: 5000, desc: 'For scaling GTM teams and agencies.' },
      { id: 'enterprise-plan', name: 'enterprise', monthly: 500, yearly: 5000, credits: 100000, desc: 'Custom limits and dedicated support.' }
    ];

    for (const p of plans) {
      await db.execute(sql.raw(`
        INSERT INTO pricing_plans (id, name, monthly_price, yearly_price, credits_per_month, description, active)
        VALUES ('${p.id}', '${p.name}', ${p.monthly}, ${p.yearly}, ${p.credits}, '${p.desc}', true)
        ON DUPLICATE KEY UPDATE 
          monthly_price = ${p.monthly}, yearly_price = ${p.yearly}, credits_per_month = ${p.credits}, description = '${p.desc}'
      `));
    }
    console.log("Pricing plans seeded successfully.");
  } catch (error: any) {
    console.log("Warning: Could not seed pricing plans:", error.message);
  }

  console.log("Migration completed successfully!");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
