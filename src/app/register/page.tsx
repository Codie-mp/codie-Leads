import type { Metadata } from "next";
import { LoginPage } from "@/features/auth";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your CodieLead account and start generating AI-powered leads today.",
  robots: { index: false, follow: false },
};

export default function RegisterRoute() {
  return <LoginPage />;
}
export const dynamic = 'force-dynamic';
