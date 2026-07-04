import type { Metadata } from "next";
import { LandingPage } from "@/views/LandingPage";

export const metadata: Metadata = {
  title: "CodieLead — AI-Powered B2B Lead Generation",
  description:
    "Describe your Ideal Customer Profile and let AI find real businesses for you using Google Maps and Google Search grounding. Export to CSV, Excel, or JSON instantly.",
  alternates: {
    canonical: "/",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://codie.ai/#organization",
      name: "Codie",
      url: "https://codie.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://codie.ai/favico.png",
      },
      sameAs: ["https://codiemarket.com"],
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://codie.ai/#product",
      name: "CodieLead",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI-powered B2B lead generation platform. Describe your Ideal Customer Profile and get real business leads from Google Maps and Google Search in seconds.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free tier available. Usage-based credits for AI lead discovery.",
      },
      featureList: [
        "AI-powered ICP lead search via Google Maps",
        "Real-time streaming lead discovery",
        "Lead enrichment with decision-maker data",
        "CSV and Excel export",
        "Campaign management",
        "Category organization",
        "Multi-city location filtering",
      ],
      publisher: {
        "@id": "https://codie.ai/#organization",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is CodieLead?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CodieLead is an AI-powered B2B lead generation platform that uses Google Maps and Google Search grounding to find real businesses matching your Ideal Customer Profile (ICP). It streams results in real time and lets you export leads to CSV or Excel.",
          },
        },
        {
          "@type": "Question",
          name: "How does the AI lead scraper work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You describe your target customer in plain English (your ICP). CodieLead sends this to the Gemini AI model with Google Maps grounding enabled. The AI searches Google Maps and returns matching businesses with names, addresses, phone numbers, websites, ratings, and direct Maps links.",
          },
        },
        {
          "@type": "Question",
          name: "What data does CodieLead return for each lead?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Each lead includes: business name, address, phone number, website, email (where available), Google Maps URL, star rating, price level, and business category.",
          },
        },
      ],
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
export const dynamic = 'force-dynamic';
