'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGetNotificationsQuery, useGetUnreadNotificationsCountQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation } from '@/services/facturlyApi';
import { NotificationList } from './NotificationList';
import { NotificationBadge } from './NotificationBadge';
import { cn } from '@/lib/utils';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: notificationsResponse, isLoading, refetch } = useGetNotificationsQuery(
    { page: 1, limit: 10 },
    {
      pollingInterval: 30000, // Polling toutes les 30 secondes
      skip: !isOpen, // Ne pas charger si le dropdown est fermé
    }
  );

  const { data: unreadCountResponse } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 30000,
  });

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = unreadCountResponse?.count ?? 0;

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      refetch();
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <NotificationBadge count={unreadCount} onClick={handleToggle} />
      
      {isOpen && (
        <div className={cn(
          "absolute right-0 mt-2 w-[420px] z-50",
          "bg-background border rounded-lg shadow-lg",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
          "max-h-[600px] flex flex-col overflow-hidden"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {unreadCount} non {unreadCount > 1 ? 'lues' : 'lue'}
              </span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onMarkAllAsRead={handleMarkAllAsRead}
              loading={isLoading}
            />
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-2.5 bg-muted/20">
              <a
                href="/notifications"
                className="text-xs text-primary hover:underline font-medium block text-center"
                onClick={() => setIsOpen(false)}
              >
                Voir toutes les notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

