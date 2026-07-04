import { db } from "../../db/index.js";
import { companies, pricingPlans } from "../../db/schema.js";
import { eq, sql } from "drizzle-orm";

export class CreditService {
  /**
   * Deducts credits from a company's balance and logs the transaction.
   * Throws an error if insufficient credits.
   */
  static async chargeCredits(companyId: string, amount: number, description: string = 'Service usage', userId?: string): Promise<void> {
    if (amount <= 0) return;

    // Use transaction for safe deduct + log
    const [result] = await db.execute(sql`
      UPDATE companies 
      SET credits_balance = credits_balance - ${amount} 
      WHERE id = ${companyId} AND credits_balance >= ${amount}
    `);

    if ((result as any).affectedRows === 0) {
      throw new Error("Insufficient credits");
    }

    // Log transaction
    const txId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO credit_transactions (id, company_id, amount, type, description, performed_by, created_at)
      VALUES (${txId}, ${companyId}, -${amount}, 'consume', ${description}, ${userId || null}, NOW())
    `).catch(console.error);
  }

  /**
   * Grants credits to a company's balance and logs the transaction.
   */
  static async grantCredits(companyId: string, amount: number, description: string = 'Admin grant', userId?: string): Promise<void> {
    if (amount <= 0) return;

    await db.execute(sql`
      UPDATE companies 
      SET credits_balance = credits_balance + ${amount} 
      WHERE id = ${companyId}
    `);

    // Log transaction
    const txId = crypto.randomUUID();
    await db.execute(sql`
      INSERT INTO credit_transactions (id, company_id, amount, type, description, performed_by, created_at)
      VALUES (${txId}, ${companyId}, ${amount}, 'grant', ${description}, ${userId || null}, NOW())
    `).catch(console.error);
  }

  static async getBalance(companyId: string): Promise<number> {
    const comp = await db.select({ balance: companies.creditsBalance }).from(companies).where(eq(companies.id, companyId));
    if (!comp.length) throw new Error("Company not found");
    return comp[0].balance || 0;
  }

  static async getHistory(companyId: string, limit: number = 50) {
    const rows = await db.execute(sql`
      SELECT * FROM credit_transactions 
      WHERE company_id = ${companyId} 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `);
    const results = Array.isArray(rows) ? rows[0] : rows;
    return results;
  }
}
