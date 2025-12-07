'use client';

import React, { useState } from 'react';
import { Notification } from '@/services/facturlyApi';
import { Info, CheckCircle2, AlertTriangle, XCircle, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
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

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const config = priorityConfig[notification.priority];
  const Icon = config.icon;

  const handleClick = async () => {
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
    locale: fr,
  });

  return (
    <div
      className={cn(
        "group relative px-4 py-3 border-b border-border/50",
        "transition-all duration-200 cursor-pointer",
        "hover:bg-muted/50",
        notification.read && "opacity-70",
        isDeleting && "opacity-50 pointer-events-none"
      )}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        {/* Icon avec indicateur non lu */}
        <div className="relative flex-shrink-0 mt-0.5">
          <div className={cn(
            "rounded-lg p-2",
            config.bgColor
          )}>
            <Icon className={cn("h-4 w-4", config.iconColor)} />
          </div>
          {!notification.read && (
            <div className={cn(
              "absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-background",
              config.dotColor
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "text-sm font-medium leading-tight",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0",
                "text-muted-foreground hover:text-destructive",
                "hover:bg-destructive/10"
              )}
              onClick={handleDelete}
              aria-label="Supprimer la notification"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>

      {/* Barre latérale pour les non lues */}
      {!notification.read && (
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1 rounded-r-full",
          config.dotColor
        )} />
      )}
    </div>
  );
}

