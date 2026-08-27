# Perfect ICP Generation Guide

This document provides a comprehensive guide on how to structure and write the perfect Ideal Customer Profile (ICP) for the system's AI-powered Web Scraper. 

The scraper relies on **Google Search Grounding** through the Gemini model, which means the more precise and detailed your ICP description, the better the search results will be.

## 1. Core Principles of the ICP Scraper

When you run a search, the system formulates a prompt directly for the Gemini model:
```
Find exactly {limit} business leads matching this ICP (Ideal Customer Profile) using Google Search: "{Your ICP}".
```
Because of this, your ICP should be written as a **clear, natural language query** that describes the exact type of business or customer you are targeting.

## 2. Available Settings & Filters

The application provides several explicit filters that you don't need to write into the text of the ICP itself. Use the UI settings to narrow down these aspects:

- **Limit**: The exact number of leads to return (e.g., 10, 25, 50).
- **Minimum Rating**: Only includes businesses with a rating of `X` stars or higher.
- **Price Level**: Restricts search to a specific price bracket (e.g., `$$`, `$$$`, `$$$$`).
- **Keywords/Attributes**: Specific words that must be associated with the business.

*Note: Since the system explicitly passes these filters, you don't need to say "only businesses with 4 stars" in your ICP. Use the settings for that.*

## 3. How to Structure Your ICP Text

To get the most relevant leads, your ICP should follow this formula:
**[Industry/Niche] + [Location/Geography] + [Defining Characteristics] + [Pain Points / Solutions they need]**

### Examples of Weak vs. Strong ICPs

**Weak ICP:**
> "Restaurants in New York"
*(Too broad, will return generic results or directories like Yelp instead of actual distinct businesses.)*

**Perfect ICP:**
> "Family-owned Italian restaurants in Manhattan and Brooklyn, New York, that offer catering services, have an active online ordering system, and have been established for at least 5 years. They typically target high-income professionals and tourists."

**Weak ICP:**
> "Tech startups"
*(Extremely vague, relies on search engines guessing your intention.)*

**Perfect ICP:**
> "B2B SaaS startups in the San Francisco Bay Area and Austin, Texas, that recently received Series A funding. They have between 10 to 50 employees, are currently hiring software engineers, and focus on AI or machine learning solutions."

## 4. Key Elements to Include in the ICP

To maximize the capabilities of the Gemini Search Grounding:

1. **Specific Geography:** Don't just say "USA". Specify cities, neighborhoods, or regions (e.g., "Downtown Chicago", "Pacific Northwest").
2. **Business Type & Niche:** Be specific (e.g., "Boutique digital marketing agencies specializing in healthcare" instead of "Marketing companies").
3. **Firmographics:** Size of the company, employee count, or years in business.
4. **Technographics / Operations:** Mention specific technologies they use or operational details (e.g., "E-commerce stores using Shopify", "Clinics offering telehealth").
5. **Target Audience:** Who do *they* sell to? (e.g., "Plumbers serving commercial properties").

## 5. Pro-Tips for the System

* **Avoid Directories:** Sometimes Google Search will return directory sites (like Yelp, G2, or Yellowpages). To avoid this, you can append your ICP with phrases like: *"Focus on finding the direct websites of these businesses, excluding aggregator sites like Yelp or TripAdvisor."*
* **Descriptive Output:** The system is instructed to return `notes`, `rating`, `priceLevel`, `phone`, and `address`. If you want specific data extracted into the `notes` (e.g., "Extract their mission statement"), you can ask for it in the keywords field.
* **Combine with Keywords:** Use the "Keywords" filter in the UI for hard requirements (e.g., "Dentist"), and use the ICP description field for the nuanced context (e.g., "Private dental practices focusing on cosmetic procedures for affluent demographics").
