'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Role } from '@prisma/client';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: Role; // Rôle requis, par défaut ADMIN
  fallback?: React.ReactNode; // Contenu alternatif à afficher si l'utilisateur n'a pas le rôle requis
  showFallback?: boolean; // Si true, montrer le fallback au lieu de masquer complètement
}

/**
 * Composant RoleGuard qui affiche conditionnellement son contenu
 * en fonction du rôle de l'utilisateur
 */
export function RoleGuard({
  children,
  requiredRole = 'ADMIN',
  fallback = null,
  showFallback = true,
}: RoleGuardProps) {
  const { data: session, status } = useSession();
  
  // Afficher null pendant le chargement
  if (status === 'loading') {
    return null;
  }
  
  // Si l'utilisateur n'est pas connecté ou n'a pas le rôle requis
  if (!session || session.user?.role !== requiredRole) {
    // Afficher le contenu alternatif ou rien selon showFallback
    return showFallback ? <>{fallback}</> : null;
  }
  
  // L'utilisateur a le rôle requis, afficher le contenu normal
  return <>{children}</>;
}

/**
 * Composant AdminOnly - Variante simplifiée de RoleGuard pour les fonctions admin
 */
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

/**
 * Hook personnalisé pour vérifier si l'utilisateur a un rôle spécifique
 */
export function useHasRole(requiredRole: Role = 'ADMIN'): boolean {
  const { data: session } = useSession();
  return !!session && session.user?.role === requiredRole;
}

/**
 * Hook pour vérifier si l'utilisateur est admin
 */
export function useIsAdmin(): boolean {
  return useHasRole('ADMIN');
}
