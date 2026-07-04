import { db } from "../../db/index.js";
import { webhookEndpoints } from "../../db/schema.js";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

export class WebhookService {
  /**
   * Broadcast an event to all active webhooks for a company that subscribe to this event type.
   */
  static async broadcast(companyId: string, eventType: string, payload: any) {
    try {
      const endpoints = await db.select()
        .from(webhookEndpoints)
        .where(
          and(
            eq(webhookEndpoints.companyId, companyId),
            eq(webhookEndpoints.active, true)
          )
        );

      const toSend = endpoints.filter((ep: any) => {
        if (!ep.events || !Array.isArray(ep.events)) return false;
        return ep.events.includes('*') || ep.events.includes(eventType);
      });

      if (toSend.length === 0) return;

      const eventPayload = {
        event: eventType,
        timestamp: new Date().toISOString(),
        data: payload
      };

      const promises = toSend.map(ep => this.sendToEndpoint(ep, eventPayload));
      await Promise.allSettled(promises);
    } catch (error) {
      console.error("Webhook broadcast error:", error);
    }
  }

  private static async sendToEndpoint(endpoint: any, payload: any) {
    try {
      const bodyString = JSON.stringify(payload);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'CodieLeads-Webhook-Service/1.0'
      };

      if (endpoint.secret) {
        const signature = crypto.createHmac('sha256', endpoint.secret).update(bodyString).digest('hex');
        headers['X-Codie-Signature'] = `sha256=${signature}`;
      }

      const res = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: bodyString,
        // Short timeout so we don't hang
        signal: AbortSignal.timeout(5000)
      });

      if (!res.ok) {
        console.warn(`Webhook to ${endpoint.url} failed with status ${res.status}`);
      }
    } catch (error) {
      console.error(`Failed to send webhook to ${endpoint.url}:`, error);
    }
  }
}
