'use client';

import React from 'react';
import { Notification } from '@/services/facturlyApi';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCheck } from 'lucide-react';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMarkAllAsRead?: () => Promise<void>;
  loading?: boolean;
}

export function NotificationList({
  notifications,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  loading,
}: NotificationListProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-4 py-3 border-b border-border/50">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="rounded-full bg-muted p-3 mb-3">
          <CheckCheck className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">Aucune notification</p>
        <p className="text-xs text-muted-foreground">
          Vous êtes à jour !
        </p>
      </div>
    );
  }

  return (
    <div>
      {unreadCount > 0 && onMarkAllAsRead && (
        <div className="flex justify-end px-4 py-2 border-b border-border/50 bg-muted/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs h-7 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tout marquer comme lu
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
          />
        ))}
      </div>
    </div>
  );
}

