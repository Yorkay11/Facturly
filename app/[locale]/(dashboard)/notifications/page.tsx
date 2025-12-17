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

export default function NotificationsPage() {
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
      toast.success('Notification marquée comme lue');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap();
      toast.success('Notification supprimée');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap();
      toast.success('Toutes les notifications ont été marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">
              Erreur lors du chargement des notifications. Veuillez réessayer.
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
          { label: 'Tableau de bord', href: '/dashboard' },
          { label: 'Notifications' },
        ]}
        className="text-xs"
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-foreground/60 mt-1">
            Gérez vos notifications et restez informé de l'activité de votre compte
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
              Tout marquer comme lu
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
          Toutes
        </Button>
        <Button
          variant={filters.read === false ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleFilterChange({ read: false })}
        >
          Non lues
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
          Lues
        </Button>
      </div>

      {/* Liste des notifications */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filters.read === false
              ? 'Notifications non lues'
              : filters.read === true
              ? 'Notifications lues'
              : 'Toutes les notifications'}
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
                Page {currentPage} sur {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Suivant
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

