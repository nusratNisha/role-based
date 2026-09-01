import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, hasRole } from '@/utils/roles';
import { Permission, UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: Permission;
  requiredRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  permission,
  requiredRole 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user && !hasRole(user.role, requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permission && user && !hasPermission(user.role, permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};