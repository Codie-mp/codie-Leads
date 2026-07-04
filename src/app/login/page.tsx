import type { Metadata } from "next";
import { LoginPage } from "@/views/LoginPage";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your CodieLead account to manage your leads and campaigns.",
  robots: { index: false, follow: false },
};

export default function LoginRoute() {
  return <LoginPage />;
}
export const dynamic = 'force-dynamic';
