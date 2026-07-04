import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const [[companyCount], [userCount], [leadCount]] = await Promise.all([
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM companies`)),
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM users WHERE is_super_admin = false`)),
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM leads`)),
    ]);

    const [[activeCompanies]] = await Promise.all([
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM companies WHERE active = true`)),
    ]);

    const [[totalCredits]] = await Promise.all([
      db.execute(sql.raw(`SELECT COALESCE(SUM(credits_balance), 0) as total FROM companies`)),
    ]);

    const [[pendingSubscriptions]] = await Promise.all([
      db.execute(sql.raw(`SELECT COUNT(*) as total FROM subscriptions WHERE status = 'pending'`)),
    ]);

    console.log({
      totalCompanies: (companyCount as any).total || 0,
      totalUsers: (userCount as any).total || 0,
      totalLeads: (leadCount as any).total || 0,
      activeCompanies: (activeCompanies as any).total || 0,
      totalCreditsInSystem: (totalCredits as any).total || 0,
      pendingSubscriptions: (pendingSubscriptions as any).total || 0,
    });
  } catch(e) {
    console.error('Error:', e);
  }
  process.exit(0);
}
main();
