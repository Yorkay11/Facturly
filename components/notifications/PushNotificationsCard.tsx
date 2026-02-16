'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { IoNotificationsOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useWebPushSubscribe } from '@/hooks/useWebPushSubscribe';

export type PushNotificationsCardVariant = 'default' | 'compact';

/**
 * Carte permettant d'activer les notifications push (permission navigateur + abonnement).
 * - default : affiche tous les états (non supporté, VAPID manquant, activées, refusées) + bouton si pertinent.
 * - compact : une seule ligne (icône + texte + bouton), affichée uniquement quand la permission n'a pas encore été demandée.
 */
export function PushNotificationsCard({ variant = 'default' }: { variant?: PushNotificationsCardVariant }) {
  const t = useTranslations('notifications');
  const locale = useLocale();
  const { requestAndSubscribe, vapidReady } = useWebPushSubscribe(locale);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | null>(null);
  const [pushEnabling, setPushEnabling] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const pushSupported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;
  const showEnablePush =
    pushSupported && vapidReady && pushPermission === 'default';

  const handleEnablePush = async () => {
    if (!requestAndSubscribe) return;
    setPushEnabling(true);
    try {
      const ok = await requestAndSubscribe();
      setPushPermission(typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : null);
      if (ok) toast.success(t('push.enableSuccess'));
      else toast.error(t('push.enableError'));
    } catch {
      toast.error(t('push.enableError'));
    } finally {
      setPushEnabling(false);
    }
  };

  // Variante compacte (dashboard) — une ligne type Apple
  if (variant === 'compact') {
    if (!showEnablePush) return null;
    return (
      <div className="rounded-2xl border border-border/40 bg-muted/40 dark:bg-muted/20 overflow-hidden mb-6">
        <div className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/80 dark:bg-background/60 text-primary shadow-sm">
            <IoNotificationsOutline className="h-5 w-5" />
          </div>
          <p className="flex-1 min-w-0 text-[15px] text-foreground">
            {t('push.sectionDescription')}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleEnablePush}
            disabled={pushEnabling}
            className="h-9 rounded-full px-4 text-[15px] font-medium shrink-0 border-0 bg-background/80 dark:bg-background/60 hover:bg-background shadow-sm"
          >
            {t('push.enable')}
          </Button>
        </div>
      </div>
    );
  }

  // Variante complète — style liste groupée Apple
  return (
    <div className="rounded-2xl border border-border/40 bg-muted/40 dark:bg-muted/20 overflow-hidden mb-6">
      <div className="px-4 py-3.5 sm:px-5 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/80 dark:bg-background/60 text-primary">
            <IoNotificationsOutline className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-foreground tracking-tight">
              {t('push.sectionTitle')}
            </h3>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {t('push.sectionDescription')}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-3">
        {!pushSupported && (
          <p className="text-[15px] text-muted-foreground">{t('push.unsupported')}</p>
        )}
        {pushSupported && !vapidReady && (
          <p className="text-[15px] text-amber-600 dark:text-amber-400">{t('push.vapidNotConfigured')}</p>
        )}
        {pushSupported && vapidReady && pushPermission === 'granted' && (
          <p className="text-[15px] text-emerald-600 dark:text-emerald-400">{t('push.statusEnabled')}</p>
        )}
        {pushSupported && vapidReady && pushPermission === 'denied' && (
          <p className="text-[15px] text-muted-foreground">{t('push.statusDenied')}</p>
        )}
        {showEnablePush && (
          <Button
            variant="default"
            size="sm"
            onClick={handleEnablePush}
            disabled={pushEnabling}
            className="h-9 rounded-full px-4 text-[15px] font-medium"
          >
            <IoNotificationsOutline className="h-4 w-4 mr-1.5" />
            {t('push.enable')}
          </Button>
        )}
      </div>
    </div>
  );
}
