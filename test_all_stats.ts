import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    await db.execute(sql.raw('SELECT COUNT(*) as total FROM companies'));
    await db.execute(sql.raw('SELECT COUNT(*) as total FROM users WHERE is_super_admin = false'));
    await db.execute(sql.raw('SELECT COUNT(*) as total FROM leads'));
    await db.execute(sql.raw('SELECT COUNT(*) as total FROM companies WHERE active = true'));
    await db.execute(sql.raw('SELECT COALESCE(SUM(credits_balance), 0) as total FROM companies'));
    await db.execute(sql.raw("SELECT COUNT(*) as total FROM subscriptions WHERE status = 'pending'"));
    console.log('All stats queries successful!');
  } catch(e) {
    console.error('Error in stats queries:', e);
  }
  process.exit(0);
}
main();
