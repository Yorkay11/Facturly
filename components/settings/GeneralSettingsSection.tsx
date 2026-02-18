'use client';

import { useTranslations } from 'next-intl';
import { FaPlayCircle } from 'react-icons/fa';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

export function GeneralSettingsSection() {
  const t = useTranslations('settings');

  return (
    <Card className="rounded-2xl border border-border/50 bg-card/50 shadow-sm backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t('onboarding.title')}
        </h2>
        <CardDescription className="mt-1 text-[15px]">
          {t('onboarding.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Link href="/dashboard?showIntro=1">
          <Button type="button" variant="outline" className="rounded-full gap-2">
            <FaPlayCircle className="h-4 w-4" />
            {t('onboarding.relaunch')}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
