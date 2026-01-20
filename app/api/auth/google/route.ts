import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const locale = searchParams.get('locale') || 'fr';

  // Construire l'URL de callback frontend
  // Note: la route est /[locale]/callback, pas /[locale]/auth/callback (le groupe (auth) n'apparaît pas dans l'URL)
  const frontendUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const callbackUrl = `${frontendUrl}/${locale}/callback?redirect=${encodeURIComponent(redirectTo)}`;

  // Construire l'URL de redirection Google OAuth du backend
  // Le backend redirigera vers callbackUrl avec le token
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://facturlybackend-production.up.railway.app';
  const googleAuthUrl = `${baseUrl}/auth/google?redirect=${encodeURIComponent(callbackUrl)}`;

  return NextResponse.redirect(googleAuthUrl);
}

