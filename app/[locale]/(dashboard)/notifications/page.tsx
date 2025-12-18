'use client';

import React, { useState } from 'react';
import { useGetNotificationsQuery, useGetUnreadNotificationsCountQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation, NotificationType, NotificationPriority } from '@/services/facturlyApi';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/ui/breadcrumb';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const commonT = useTranslations('common');
  const dashboardT = useTranslations('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    read?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
  }>({});

  const { data: notificationsResponse, isLoading, error } = useGetNotificationsQuery(
    { page: currentPage, limit: 20, ...filters },
    {
      pollingInterval: 30000,
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
  const totalPages = notificationsResponse?.meta?.totalPages ?? 1;

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
      toast.success(t('toasts.markedAsRead'));
    } catch (error) {
      toast.error(t('toasts.updateError'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success(t('toasts.deleted'));
    } catch (error) {
      toast.error(t('toasts.deleteError'));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success(t('toasts.allMarkedAsRead'));
    } catch (error) {
      toast.error(t('toasts.updateError'));
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              {t('toasts.loadError')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Breadcrumb
        items={[
          { label: dashboardT('title'), href: '/dashboard' },
          { label: t('title') },
        ]}
        className="text-xs"
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-foreground/60 mt-1">
            {t('description')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationBadge count={unreadCount} />
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="gap-2"
            >
              <IoCheckmarkDoneOutline className="h-4 w-4" />
              {t('actions.markAsRead')}
            </Button>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={Object.keys(filters).length === 0 ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange({})}
        >
          {t('filters.all')}
        </Button>
        <Button
          variant={filters.read === false ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange({ read: false })}
        >
          {t('filters.unread')}
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </Button>
        <Button
          variant={filters.read === true ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange({ read: true })}
        >
          {t('filters.read')}
        </Button>
      </div>

      {/* Liste des notifications */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filters.read === false
              ? t('list.title.unread')
              : filters.read === true
              ? t('list.title.read')
              : t('list.title.all')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationList
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onDelete={handleDelete}
            onMarkAllAsRead={handleMarkAllAsRead}
            loading={isLoading}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-foreground/60">
                {t('pagination.page', { current: currentPage, total: totalPages })}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  {t('pagination.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  {t('pagination.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

