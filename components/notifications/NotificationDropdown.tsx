'use client';

import React, { useState } from 'react';
import { useGetNotificationsQuery, useGetUnreadNotificationsCountQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation } from '@/services/facturlyApi';
import { NotificationList } from './NotificationList';
import { NotificationBadge } from './NotificationBadge';
import { StaggeredDropdown } from '@/components/ui/staggered-dropdown';
import { useTranslations, useLocale } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';

export function NotificationDropdown() {
  const t = useTranslations('notifications.dropdown');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const { data: notificationsResponse, isLoading } = useGetNotificationsQuery(
    { page: 1, limit: 10 },
    { skip: !isOpen }
  );

  const { data: unreadCountResponse } = useGetUnreadNotificationsCountQuery(undefined);

  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = unreadCountResponse?.count ?? 0;

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // When open becomes true, skip becomes false and the query runs automatically — no refetch needed
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

  const handleNavigateToInvoice = (invoiceId: string) => {
    setIsOpen(false);
    router.push(`/invoices/${invoiceId}`);
  };

  return (
    <StaggeredDropdown open={isOpen} onOpenChange={handleOpenChange}>
      <StaggeredDropdown.Trigger className="rounded-full">
        <NotificationBadge count={unreadCount} className="h-9 w-9 rounded-full" />
      </StaggeredDropdown.Trigger>
      <StaggeredDropdown.Content
        align="right"
        sideOffset={8}
        className="w-[420px] max-h-[600px] flex flex-col p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30 shrink-0">
          <h3 className="font-semibold text-xs">{t('title')}</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] text-muted-foreground">
              {t('unread', { count: unreadCount })}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onMarkAllAsRead={handleMarkAllAsRead}
            onNavigate={handleNavigateToInvoice}
            loading={isLoading}
          />
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-3 py-2 bg-muted/20 shrink-0">
            <Link
              href="/notifications"
              className="text-xs text-primary hover:underline font-medium block text-center"
              onClick={() => handleOpenChange(false)}
            >
              {t('viewAll')}
            </Link>
          </div>
        )}
      </StaggeredDropdown.Content>
    </StaggeredDropdown>
  );
}

