import type { Metadata } from "next";
import { PrivacyPolicy } from "@/views/PrivacyPolicy";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read CodieLead's Privacy Policy to understand how we collect, use, and protect your data.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyRoute() {
  return <PrivacyPolicy />;
}
export const dynamic = 'force-dynamic';
