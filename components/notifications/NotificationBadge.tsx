'use client';

import React from 'react';
import { IoNotificationsOutline } from 'react-icons/io5';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationBadge({ count, onClick, className }: NotificationBadgeProps) {
  if (count === 0) {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={onClick}
        className={cn("relative", className)}
        aria-label="Notifications"
      >
        <IoNotificationsOutline className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn("relative", className)}
      aria-label={`${count} notification${count > 1 ? 's' : ''} non lue${count > 1 ? 's' : ''}`}
    >
      <IoNotificationsOutline className="h-5 w-5" />
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold"
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </Button>
  );
}

