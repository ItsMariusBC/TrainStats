'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

type Role = 'ADMIN' | 'USER';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

export function RoleGuard({
  children,
  requiredRole = 'ADMIN',
  fallback = null,
  showFallback = true,
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return null;
  }
  
  if (!session || session.user?.role !== requiredRole) {
    return showFallback ? <>{fallback}</> : null;
  }
  return <>{children}</>;
}

export function AdminOnly({
  children,
  fallback = null,
  showFallback = true,
}: Omit<RoleGuardProps, 'requiredRole'>) {
  return (
    <RoleGuard 
      requiredRole="ADMIN" 
      fallback={fallback} 
      showFallback={showFallback}
    >
      {children}
    </RoleGuard>
  );
}

export function useHasRole(requiredRole: Role = 'ADMIN'): boolean {
  const { data: session } = useSession();
  return !!session && session.user?.role === requiredRole;
}

export function useIsAdmin(): boolean {
  return useHasRole('ADMIN');
}
