import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.tsx';

export const ProtectedRoute: React.FC<{ children: React.ReactNode, requireSuperAdmin?: boolean }> = ({ children, requireSuperAdmin = false }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireSuperAdmin && !user?.isSuperAdmin) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
};
