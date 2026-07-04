"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute requireSuperAdmin>{children}</ProtectedRoute>;
}
