/**
 * Extrait le chemin sans le préfixe de locale
 * Exemple: /fr/dashboard -> /dashboard
 *          /en/dashboard -> /dashboard
 *          /dashboard -> /dashboard (déjà sans préfixe)
 */
export function removeLocalePrefix(path: string, locales: string[] = ['fr', 'en']): string {
  // Si le chemin commence par /, on le garde
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Vérifier si le chemin commence par un préfixe de locale
  for (const locale of locales) {
    if (normalizedPath.startsWith(`/${locale}/`) || normalizedPath === `/${locale}`) {
      // Retirer le préfixe de locale
      return normalizedPath.replace(`/${locale}`, '') || '/';
    }
  }
  
  // Si aucun préfixe de locale n'est trouvé, retourner le chemin tel quel
  return normalizedPath;
}
