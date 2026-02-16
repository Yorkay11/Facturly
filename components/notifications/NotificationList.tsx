'use client';

import React from 'react';
import { Notification } from '@/services/facturlyApi';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FuryMascot } from '@/components/mascot';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  onNavigate?: (invoiceId: string) => void;
  loading?: boolean;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  onNavigate,
  loading,
}: NotificationListProps) {
  const t = useTranslations('notifications.list');
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="py-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-3 py-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-md shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center">
        <FuryMascot mood="smile" size="lg" className="mb-4" />
        <p className="text-[15px] font-semibold text-foreground tracking-tight mb-1">{t('empty.title')}</p>
        <p className="text-[13px] text-muted-foreground max-w-xs">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && onMarkAllAsRead && (
        <div className="flex justify-end px-3 py-1.5 border-b border-border/50 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-[11px] h-6 gap-1 text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="h-3 w-3" />
            {t('markAllAsRead')}
          </Button>
        </div>
      )}
      <div>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={onMarkAsRead}
            onDelete={onDelete}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

