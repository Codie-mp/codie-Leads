import { db } from "../../db/index.js";
import { crmIntegrations } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";

export class HubSpotService {
  /**
   * Sync a newly created lead to HubSpot as a Contact
   */
  static async syncLead(companyId: string, leadData: any) {
    try {
      const integrations = await db.select()
        .from(crmIntegrations)
        .where(
          and(
            eq(crmIntegrations.companyId, companyId),
            eq(crmIntegrations.provider, 'hubspot'),
            eq(crmIntegrations.isActive, true)
          )
        );

      if (integrations.length === 0) return;

      const hubspotKey = integrations[0].apiKey;

      // Map lead data to HubSpot properties
      // Note: HubSpot properties are usually lowercase internal names
      const properties: any = {
        email: leadData.email,
        firstname: leadData.name ? leadData.name.split(' ')[0] : '',
        lastname: leadData.name && leadData.name.includes(' ') ? leadData.name.split(' ').slice(1).join(' ') : '',
        company: leadData.company,
        website: leadData.website,
        phone: leadData.phone,
        hs_lead_status: 'NEW'
      };

      // Clean undefined properties
      Object.keys(properties).forEach(key => properties[key] === undefined && delete properties[key]);

      const res = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hubspotKey}`
        },
        body: JSON.stringify({ properties })
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("HubSpot sync failed:", err);
      } else {
        console.log(`Successfully synced lead ${leadData.email} to HubSpot`);
      }
    } catch (error) {
      console.error("HubSpot service error:", error);
    }
  }
}
