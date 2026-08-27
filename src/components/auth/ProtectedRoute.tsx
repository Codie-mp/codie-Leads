"use client";
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; requireSuperAdmin?: boolean }> = ({
  children,
  requireSuperAdmin = false,
}) => {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    } else if (requireSuperAdmin && !user?.isSuperAdmin) {
      router.replace('/app');
    }
  }, [isAuthenticated, requireSuperAdmin, user, router, pathname]);

  if (!isAuthenticated) return null;
  if (requireSuperAdmin && !user?.isSuperAdmin) return null;

  return <>{children}</>;
};
