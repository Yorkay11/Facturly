'use client';

import React, { useState } from 'react';
import { Notification } from '@/services/facturlyApi';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { useLocale, useTranslations } from 'next-intl';
import { interpolateMessage } from '@/utils/interpolation';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNavigate?: (invoiceId: string) => void;
}

const priorityConfig = {
  info: {
    icon: Info,
    dotColor: 'bg-blue-500',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
  },
  success: {
    icon: CheckCircle2,
    dotColor: 'bg-green-500',
    iconColor: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
  },
  warning: {
    icon: AlertTriangle,
    dotColor: 'bg-yellow-500',
    iconColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  error: {
    icon: XCircle,
    dotColor: 'bg-red-500',
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950/20',
  },
};

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const t = useTranslations('notifications.item');
  const locale = useLocale();
  const [isDeleting, setIsDeleting] = useState(false);
  const config = priorityConfig[notification.priority];
  const Icon = config.icon;

  const handleClick = async () => {
    const invoiceId = notification.data?.invoiceId as string | undefined;
    if (invoiceId && onNavigate) {
      onNavigate(invoiceId);
    }
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    await onDelete(notification.id);
    setIsDeleting(false);
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: locale === 'fr' ? fr : enUS,
  });

  return (
    <div
      className={cn(
        "group relative px-3 py-2 border-b border-border/50",
        "transition-all duration-200 cursor-pointer",
        "hover:bg-muted/50",
        notification.read && "opacity-70",
        isDeleting && "opacity-50 pointer-events-none"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        {/* Icon avec indicateur non lu */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "rounded-md p-1.5",
            config.bgColor
          )}>
            <Icon className={cn("h-3 w-3", config.iconColor)} />
          </div>
          {!notification.read && (
            <div className={cn(
              "absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full border border-background",
              config.dotColor
            )} />
          )}
        </div>

        {/* Content : titre + date uniquement */}
        <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
          <h4 className={cn(
            "text-xs font-medium leading-tight truncate",
            !notification.read && "font-semibold"
          )}>
            {interpolateMessage(notification.title, notification.data, locale)}
          </h4>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] text-muted-foreground tabular-nums">{timeAgo}</span>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity",
                "text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10"
              )}
              onClick={handleDelete}
              aria-label={t('delete')}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Barre latérale pour les non lues */}
      {!notification.read && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full",
          config.dotColor
        )} />
      )}
    </div>
  );
}

export { NotificationItem };
