import type { Metadata } from "next";
import { AcceptInvitePage } from "@/views/AcceptInvitePage";

export const metadata: Metadata = {
  title: "Accept Invitation",
  description: "Accept your invitation to join a CodieLead workspace.",
  robots: { index: false, follow: false },
};

export default function AcceptInviteRoute() {
  return <AcceptInvitePage />;
}
export const dynamic = 'force-dynamic';
