import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://codie.ai"),
  title: {
    default: "CodieLead — AI-Powered B2B Lead Generation",
    template: "%s | CodieLead",
  },
  description:
    "Discover, enrich, and manage high-quality B2B leads using AI-powered search grounded in Google Maps and Google Search. Built for GTM Engineers and sales teams.",
  keywords: [
    "B2B lead generation",
    "AI lead scraper",
    "Google Maps leads",
    "ICP search",
    "GTM leads",
    "sales prospecting",
    "lead enrichment",
  ],
  authors: [{ name: "Codie", url: "https://codiemarket.com" }],
  creator: "Codie",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "CodieLead",
    title: "CodieLead — AI-Powered B2B Lead Generation",
    description:
      "Discover, enrich, and manage high-quality B2B leads using AI-powered search grounded in Google Maps and Google Search.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodieLead — AI-Powered B2B Lead Generation",
    description:
      "Discover, enrich, and manage high-quality B2B leads using AI-powered search grounded in Google Maps and Google Search.",
    creator: "@codiemarket",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favico.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
