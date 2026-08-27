# UX Research Notes

## Product-page clarity

Current B2B SaaS guidance favors a clear sequence of **clarity → comprehension → credibility → conversion**. The hero should state what the product is, who it is for, and the primary outcome in plain language, then show a real product workflow rather than generic stock imagery. The recommended page flow is hero, workflow/how-it-works, proof, objections/FAQ, and one repeated primary conversion path.

Source: [Flow Agency, B2B SaaS landing page best practices](https://www.flow-agency.com/blog/b2b-saas-landing-page-best-practices/).

## Sales-engagement workflow

Sales-engagement products reduce friction by centralizing prospect actions, surfacing a next-best action, and connecting list quality to outreach execution. Relevant CodieLead implications are a focused discovery workspace, clear lead readiness states, explicit save/export actions, and a future-friendly path from search results to campaigns without changing current backend contracts.

Source: [Salesforce, Sales Engagement](https://www.salesforce.com/sales/engagement-platform/).

## Cold-outreach workflow

Cold outreach guidance emphasizes defining an ICP before prospecting, filtering by role/location/company profile, enriching contact details, personalizing the message, and tracking outcomes in a CRM. Relevant CodieLead implications are to make ICP inputs understandable, show why each result matches, prevent duplicate leads, and keep the path from discovery to campaign creation visible.

Source: [HubSpot, Mastering Effective Cold Sales Outreach for Startups](https://www.hubspot.com/startups/mastering-cold-sales-outreach).

## Conversion and usability principles

Modern SaaS pages should maintain one dominant CTA destination, use authentic product visuals, keep copy scannable, include credible proof and objection-handling FAQs, optimize for mobile, and avoid decorative complexity that harms comprehension or performance.

Source: [Unbounce, The State of SaaS Landing Pages](https://unbounce.com/conversion-rate-optimization/the-state-of-saas-landing-pages/).

## Product-specific observations

The current landing page is visually polished but generic: the hero says “Scale Your Outbound On Autopilot,” while the product’s actual differentiator is AI-assisted discovery of targeted businesses and contacts for B2B outreach. It also references Gemini despite the current Kimi provider context, relies on client-side pricing loading, and mixes a `Book Demo` CTA with trial CTAs. The authenticated shell exposes seven primary destinations in a dense horizontal header. Search already owns the correct backend contract (`searchPlaces(query, filters, ...)`), and landing CTAs already preserve `/register?plan=...` and `/app?view=billing&plan=...` behavior.
