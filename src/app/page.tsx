import type { Metadata } from "next";
import { LandingPage } from "@/views/LandingPage";

export const metadata: Metadata = {
  title: "CodieLead | AI-assisted B2B prospecting for better outbound",
  description:
    "Turn your ideal customer profile into clean, outreach-ready B2B lead lists with AI-assisted search, multi-city targeting, enrichment, and campaigns.",
  keywords: [
    "B2B lead generation",
    "AI prospecting",
    "cold outreach",
    "ICP search",
    "sales lead lists",
    "multi-city lead search",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "CodieLead | AI-assisted B2B prospecting",
    description:
      "Find the right businesses, keep your lists clean, and move from cold prospecting to a confident next step.",
    type: "website",
    url: "/",
    siteName: "CodieLead",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodieLead | AI-assisted B2B prospecting",
    description:
      "Turn your ICP into a clean, outreach-ready pipeline.",
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
      "@type": "WebSite",
      "@id": "https://codie.ai/#website",
      name: "CodieLead",
      url: "https://codie.ai",
      publisher: { "@id": "https://codie.ai/#organization" },
      description:
        "AI-assisted B2B prospecting and cold-outreach preparation for teams that need cleaner lead lists.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://codie.ai/#product",
      name: "CodieLead",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "AI-assisted B2B prospecting that turns an ideal customer profile into deduplicated, outreach-ready business leads.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free trial available. Paid plans scale with search volume.",
      },
      featureList: [
        "AI-assisted ICP lead search",
        "Google Maps and web-grounded business discovery",
        "Multi-city location filtering",
        "Database-backed lead deduplication",
        "Lead enrichment and fit signals",
        "CSV and Excel export",
        "Campaign preparation",
      ],
      publisher: { "@id": "https://codie.ai/#organization" },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is CodieLead?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "CodieLead is a B2B prospecting workspace that turns an ideal customer profile into a clean list of businesses for outbound selling. It combines AI-assisted search, location targeting, enrichment, deduplication, and campaign preparation.",
          },
        },
        {
          "@type": "Question",
          name: "How does AI-assisted lead search work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You describe the companies you want in plain language. CodieLead uses the active AI search provider and connected business data to discover matching businesses, then streams the results into your workspace for review.",
          },
        },
        {
          "@type": "Question",
          name: "Can I search several cities at once?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Multi-city mode lets you select multiple locations in one search so you can expand a territory without rebuilding the same search from scratch.",
          },
        },
        {
          "@type": "Question",
          name: "What can I do with the results?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "You can review business details, filter and sort results, save leads, export them to CSV or Excel, and add selected leads to campaigns using the existing workspace actions.",
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

export const dynamic = "force-dynamic";
