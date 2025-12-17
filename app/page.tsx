import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// Cette page redirige automatiquement vers la locale par défaut
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
