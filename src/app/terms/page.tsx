import type { Metadata } from "next";
import { TermsOfService } from "@/views/TermsOfService";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read CodieLead's Terms of Service to understand the rules and guidelines for using our platform.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsRoute() {
  return <TermsOfService />;
}
export const dynamic = 'force-dynamic';
