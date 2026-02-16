'use client';

import React, { useState } from 'react';
import { useGetNotificationsQuery, useGetUnreadNotificationsCountQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation, NotificationType, NotificationPriority } from '@/services/facturlyApi';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Breadcrumb from '@/components/ui/breadcrumb';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { PushNotificationsCard } from '@/components/notifications/PushNotificationsCard';
import { cn } from '@/lib/utils';

export default function NotificationsPage() {
  const t = useTranslations('notifications');
  const dashboardT = useTranslations('dashboard');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<{
    read?: boolean;
    type?: NotificationType;
    priority?: NotificationPriority;
  }>({});

  const { data: notificationsResponse, isLoading, error } = useGetNotificationsQuery(
    { page: currentPage, limit: 20, ...filters }
  );

  const { data: unreadCountResponse } = useGetUnreadNotificationsCountQuery(undefined);

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
      <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
        <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
          <nav className="mb-8">
            <Breadcrumb
              items={[
                { label: dashboardT('title'), href: '/dashboard' },
                { label: t('title') },
              ]}
              className="text-xs text-muted-foreground"
            />
          </nav>
          <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6">
            <p className="text-[15px] font-semibold text-destructive">{t('toasts.loadError')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-muted/30 to-background">
      <div className="w-full px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-8">
          <Breadcrumb
            items={[
              { label: dashboardT('title'), href: '/dashboard' },
              { label: t('title') },
            ]}
            className="text-xs text-muted-foreground"
          />
        </nav>

        <header className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">{t('description')}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <NotificationBadge count={unreadCount} />
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  className="gap-2 rounded-xl h-9 border-border/60"
                >
                  <IoCheckmarkDoneOutline className="h-4 w-4" />
                  {t('actions.markAsRead')}
                </Button>
              )}
            </div>
          </div>
        </header>

        <PushNotificationsCard />

        {/* Filtres */}
        <div className="flex gap-2 flex-wrap mb-6">
          <Button
            variant={Object.keys(filters).length === 0 ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange({})}
            className="rounded-xl h-9 text-[13px] font-medium"
          >
            {t('filters.all')}
          </Button>
          <Button
            variant={filters.read === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange({ read: false })}
            className="rounded-xl h-9 text-[13px] font-medium gap-1.5"
          >
            {t('filters.unread')}
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-0.5 h-5 min-w-5 px-1.5 rounded-md text-[11px]">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <Button
            variant={filters.read === true ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange({ read: true })}
            className="rounded-xl h-9 text-[13px] font-medium"
          >
            {t('filters.read')}
          </Button>
        </div>

        {/* Liste des notifications */}
        <div className="rounded-2xl border border-border/40 bg-muted/40 dark:bg-muted/20 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border/40">
            <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
              {filters.read === false
                ? t('list.title.unread')
                : filters.read === true
                ? t('list.title.read')
                : t('list.title.all')}
            </h2>
          </div>
          <div>
            <NotificationList
              key={`notif-list-${filters.read === undefined ? 'all' : filters.read ? 'read' : 'unread'}-${currentPage}`}
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
              onMarkAllAsRead={handleMarkAllAsRead}
              loading={isLoading}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-border/40">
                <span className="text-[13px] text-muted-foreground">
                  {t('pagination.page', { current: currentPage, total: totalPages })}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="rounded-xl h-9 text-[13px]"
                  >
                    {t('pagination.previous')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className="rounded-xl h-9 text-[13px]"
                  >
                    {t('pagination.next')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

