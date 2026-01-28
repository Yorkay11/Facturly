"use client";

import { ReactNode } from 'react';
import { Redirect, RedirectProps } from './Redirect';

interface ConditionalRedirectProps extends Omit<RedirectProps, 'condition'> {
  /**
   * Condition pour effectuer la redirection
   */
  condition: boolean;
  
  /**
   * Contenu à afficher si la condition est false
   */
  fallback?: ReactNode;
}

/**
 * Composant de redirection conditionnelle
 * 
 * @example
 * <ConditionalRedirect
 *   condition={!isAuthenticated}
 *   to="/login"
 *   fallback={<DashboardContent />}
 * />
 */
export function ConditionalRedirect({
  condition,
  fallback = null,
  ...redirectProps
}: ConditionalRedirectProps) {
  return (
    <>
      {condition ? (
        <Redirect {...redirectProps} condition={condition} />
      ) : (
        fallback
      )}
    </>
  );
}
