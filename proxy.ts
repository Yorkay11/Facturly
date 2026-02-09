import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Configuration des chemins publics (sans authentification)
const PUBLIC_PATHS = ['/login', '/register', '/callback', '/auth/login', '/auth', '/', '/pricing', '/features', '/testimonials', '/privacy', '/terms', '/legal', '/404', '/how-it-works'];
// Routes publiques avec paramètres dynamiques (ex: /invoice/[token], /pay/[token])
const PUBLIC_PATH_PATTERNS = [/^\/invoice\/[^/]+$/, /^\/pay\/[^/]+$/];

const isPublicPath = (pathname: string): boolean => {
  // Retirer le préfixe de locale pour vérifier le chemin
  const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/';
  
  // Vérifier les chemins exacts ou qui commencent par un chemin public
  if (PUBLIC_PATHS.some((path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`))) {
    return true;
  }
  // Vérifier les patterns pour les routes publiques avec paramètres
  return PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathWithoutLocale));
};

// Créer le middleware next-intl
const intlMiddleware = createMiddleware(routing);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy pour les fichiers statiques, API routes, sitemap, robots, etc.
  // IMPORTANT: Ces fichiers doivent être exclus AVANT le middleware next-intl
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public") ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/sw.js" ||
    pathname === "/site.webmanifest" ||
    pathname.endsWith(".xml") ||
    pathname.endsWith(".txt") ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return NextResponse.next();
  }

  // Appliquer le middleware next-intl pour gérer les locales
  // Cela va rediriger automatiquement vers /fr ou /en si nécessaire
  const response = intlMiddleware(request);

  // Si next-intl a fait une redirection, on la laisse passer
  if (response.headers.get('location')) {
    return response;
  }

  // Extraire la locale de l'URL (après traitement par next-intl, l'URL devrait avoir la locale)
  const localeMatch = pathname.match(/^\/(fr|en)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : 'fr';
  
  // Construire le chemin sans locale pour vérifier l'authentification
  const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, '') || '/';
  const token = request.cookies.get("facturly_access_token")?.value;

  // Utilisateur connecté qui arrive sur la landing → redirection vers le dashboard (PWA : éviter de rester sur la landing).
  // Si ?landing=1 est présent, on n’applique pas la redirection : l’utilisateur peut volontairement aller sur la landing.
  const wantsLanding = request.nextUrl.searchParams.get('landing') === '1';
  if ((pathWithoutLocale === '/' || pathWithoutLocale === '') && token && !wantsLanding) {
    const dashboardUrl = new URL(`/${locale}/dashboard`, request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Vérifier l'authentification pour les routes protégées
  if (!isPublicPath(pathWithoutLocale)) {
    if (!token) {
      // Rediriger vers la page de login avec la locale
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     * - sitemap.xml and robots.txt
     */
    "/((?!_next/static|_next/image|favicon.ico|api|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|xml|txt)$).*)",
  ],
};
