import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { leads } from "../../db/schema.js";

export interface ExistingLeadIdentifiers {
  names: string[];
  domains: string[];
}

const normalizeName = (value: unknown): string => String(value ?? "").trim().toLowerCase();

const normalizeDomain = (value: unknown): string => {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "";
  try {
    const url = raw.includes("://") ? new URL(raw) : new URL(`https://${raw}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return raw.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
};

export class LeadService {
  static async getExistingLeadIdentifiers(companyId: string): Promise<ExistingLeadIdentifiers> {
    const rows = await db
      .select({ name: leads.name, website: leads.website })
      .from(leads)
      .where(eq(leads.companyId, companyId));

    const names = [...new Set(rows.map((row) => normalizeName(row.name)).filter(Boolean))];
    const domains = [...new Set(rows.map((row) => normalizeDomain(row.website)).filter(Boolean))];
    return { names, domains };
  }

  static async getExistingLeadNames(companyId: string): Promise<string[]> {
    return (await this.getExistingLeadIdentifiers(companyId)).names;
  }

  static async getExistingLeadDomains(companyId: string): Promise<string[]> {
    return (await this.getExistingLeadIdentifiers(companyId)).domains;
  }
}

export default LeadService;
export { normalizeDomain, normalizeName };
