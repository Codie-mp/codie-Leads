import { db } from './src/db/index.js';
import { sql } from 'drizzle-orm';

async function main() {
  try {
    const res = await db.execute(sql.raw('SELECT COUNT(*) as total FROM users WHERE is_super_admin = false'));
    console.log("Users:", res);

    const subs = await db.execute(sql.raw("SELECT COUNT(*) as total FROM subscriptions WHERE status = 'pending'"));
    console.log("Subs:", subs);
  } catch(e) {
    console.error("DB Error:", e);
  }
  process.exit(0);
}
main();
