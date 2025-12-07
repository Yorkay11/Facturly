import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/auth/login", "/auth", "/"];
// Routes publiques avec paramètres dynamiques (ex: /invoice/[token], /pay/[token])
const PUBLIC_PATH_PATTERNS = [/^\/invoice\/[^/]+$/, /^\/pay\/[^/]+$/];

const isPublicPath = (pathname: string): boolean => {
  // Vérifier les chemins exacts ou qui commencent par un chemin public
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    return true;
  }
  // Vérifier les patterns pour les routes publiques avec paramètres
  return PUBLIC_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip proxy for static files, API routes, and public paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/public") ||
    isPublicPath(pathname)
  ) {
    return NextResponse.next();
  }

  // Check for authentication token
  const token = request.cookies.get("facturly_access_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

