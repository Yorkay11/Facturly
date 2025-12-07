# Intégration des Notifications - Frontend Next.js/TypeScript

Ce document explique comment intégrer le système de notifications dans une application Next.js avec TypeScript utilisant RTK Query.

## Vue d'ensemble

Le système de notifications permet d'afficher les notifications aux utilisateurs connectés. Les notifications sont récupérées via l'API RTK Query et peuvent être affichées en temps réel.

## Architecture recommandée

1. **Endpoints RTK Query** : Intégration dans `facturlyApi.ts`
2. **Composant de notification** : Affichage des notifications
3. **Badge de compteur** : Afficher le nombre de notifications non lues
4. **Polling RTK Query** : Mise à jour en temps réel avec `pollingInterval`

## 1. Types TypeScript

Les types sont définis dans `services/facturlyApi.ts` :

```typescript
export type NotificationType =
  | 'invoice_paid'
  | 'invoice_overdue'
  | 'invoice_sent'
  | 'invoice_rejected'
  | 'payment_received'
  | 'reminder_sent'
  | 'client_created'
  | 'system_alert';

export type NotificationPriority = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface NotificationListQueryParams {
  page?: number;
  limit?: number;
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
}
```

## 2. Intégration RTK Query

Ajoutez les endpoints dans `services/facturlyApi.ts` :

```typescript
// Dans services/facturlyApi.ts, ajoutez dans tagTypes :
tagTypes: ["Invoice", "Client", "Product", "User", "Company", "Settings", "Subscription", "Payment", "Dashboard", "Bill", "Notification"],

// Puis ajoutez les endpoints dans la section endpoints :
// ==================== Notifications ====================
getNotifications: builder.query<PaginatedResponse<Notification>, NotificationListQueryParams | void>({
  query: (params) => {
    const searchParams = new URLSearchParams();
    if (params && params.page) searchParams.append("page", params.page.toString());
    if (params && params.limit) searchParams.append("limit", params.limit.toString());
    if (params && params.read !== undefined) searchParams.append("read", params.read.toString());
    if (params && params.type) searchParams.append("type", params.type);
    if (params && params.priority) searchParams.append("priority", params.priority);
    const queryString = searchParams.toString();
    return `/notifications${queryString ? `?${queryString}` : ""}`;
  },
  providesTags: ["Notification"],
}),
getUnreadNotificationsCount: builder.query<UnreadCountResponse, void>({
  query: () => "/notifications/unread-count",
  providesTags: ["Notification"],
}),
markNotificationAsRead: builder.mutation<Notification, string>({
  query: (id) => ({
    url: `/notifications/${id}/read`,
    method: "PATCH",
  }),
  invalidatesTags: ["Notification"],
}),
markAllNotificationsAsRead: builder.mutation<{ success: boolean; updatedCount: number }, void>({
  query: () => ({
    url: "/notifications/read-all",
    method: "PATCH",
  }),
  invalidatesTags: ["Notification"],
}),
deleteNotification: builder.mutation<void, string>({
  query: (id) => ({
    url: `/notifications/${id}`,
    method: "DELETE",
  }),
  invalidatesTags: ["Notification"],
}),
```

## 3. Utilisation avec RTK Query

Utilisez directement les hooks générés par RTK Query :

```typescript
'use client';

import { useGetNotificationsQuery, useGetUnreadNotificationsCountQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation } from '@/services/facturlyApi';

// Exemple d'utilisation dans un composant
export function NotificationComponent() {
  const { data: notificationsResponse, isLoading, refetch } = useGetNotificationsQuery({ 
    page: 1, 
    limit: 20 
  }, {
    pollingInterval: 30000, // Polling toutes les 30 secondes
  });
  
  const { data: unreadCountResponse } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 30000,
  });
  
  const [markAsRead] = useMarkNotificationAsReadMutation();
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  const notifications = notificationsResponse?.data ?? [];
  const unreadCount = unreadCountResponse?.count ?? 0;

  // ... votre logique
}
```

## 4. Composant de notification

Créez un fichier `components/NotificationItem.tsx` :

```typescript
'use client';

import React from 'react';
import { Notification } from '@/services/facturlyApi';
import { IoInformationCircleOutline, IoCheckmarkCircleOutline, IoWarningOutline, IoCloseCircleOutline, IoCloseOutline } from 'react-icons/io5';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const priorityConfig = {
  info: {
    icon: IoInformationCircleOutline,
    className: 'bg-blue-50 text-blue-700',
    border: 'border-blue-200',
  },
  success: {
    icon: IoCheckmarkCircleOutline,
    className: 'bg-green-50 text-green-700',
    border: 'border-green-200',
  },
  warning: {
    icon: IoWarningOutline,
    className: 'bg-yellow-50 text-yellow-700',
    border: 'border-yellow-200',
  },
  error: {
    icon: IoCloseCircleOutline,
    className: 'bg-red-50 text-red-700',
    border: 'border-red-200',
  },
};

export function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const config = priorityConfig[notification.priority];
  const Icon = config.icon;

  const handleClick = async () => {
    if (!notification.read) {
      await onMarkAsRead(notification.id);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await onDelete(notification.id);
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:bg-primary/5",
        notification.read ? "opacity-60" : "",
        config.border
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", config.className)} />
              <h3 className="font-semibold text-sm">{notification.title}</h3>
              {!notification.read && (
                <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full bg-primary" />
              )}
            </div>
            <p className="text-sm text-foreground/70">{notification.message}</p>
            <p className="text-xs text-foreground/50">
              {new Date(notification.createdAt).toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-foreground/40 hover:text-destructive"
            onClick={handleDelete}
            aria-label="Supprimer la notification"
          >
            <IoCloseOutline className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## 5. Liste des notifications

Créez un fichier `components/notifications/NotificationList.tsx` :

```typescript
'use client';

import React from 'react';
import { Notification } from '@/services/facturlyApi';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';

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
      <div className="space-y-2 p-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-foreground/60">
        <p className="text-sm">Aucune notification</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {unreadCount > 0 && onMarkAllAsRead && (
        <div className="flex justify-end px-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs gap-1"
          >
            <IoCheckmarkDoneOutline className="h-3.5 w-3.5" />
            Tout marquer comme lu
          </Button>
        </div>
      )}
      <div className="space-y-2">
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
```

## 6. Badge de compteur

Créez un fichier `components/notifications/NotificationBadge.tsx` :

```typescript
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
```

## 7. Dropdown de notifications

Créez un fichier `components/notifications/NotificationDropdown.tsx` :

```typescript
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useGetNotificationsQuery, useGetUnreadNotificationsCountQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation } from '@/services/facturlyApi';
import { NotificationList } from './NotificationList';
import { NotificationBadge } from './NotificationBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
        <Card className="absolute right-0 mt-2 w-96 z-50 max-h-[500px] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Notifications</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-0">
              <NotificationList
                notifications={notifications}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                onMarkAllAsRead={handleMarkAllAsRead}
                loading={isLoading}
              />
            </CardContent>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}
```

## 8. Page de notifications complète

Créez un fichier `app/(dashboard)/notifications/page.tsx` :

```typescript
'use client';

import React, { useState } from 'react';
import { useGetNotificationsQuery, useGetUnreadNotificationsCountQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation, useDeleteNotificationMutation, NotificationType, NotificationPriority } from '@/services/facturlyApi';
import { NotificationList } from '@/components/notifications/NotificationList';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import Breadcrumb from '@/components/ui/breadcrumb';
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

  return (
    <div className="space-y-6">
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
```

## 9. Intégration dans le Topbar

Ajoutez le dropdown dans `components/layout/Topbar.tsx` :

```typescript
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

// Dans le composant Topbar, ajoutez dans la section des actions :
<div className="flex items-center gap-2">
  <NotificationDropdown />
  {/* Autres boutons */}
</div>
```

## 10. Notifications en temps réel (optionnel)

RTK Query gère déjà le polling avec `pollingInterval`. Pour des notifications vraiment en temps réel, vous pouvez utiliser Server-Sent Events (SSE) :

```typescript
// hooks/useNotificationStream.ts
'use client';

import { useEffect, useState } from 'react';
import { Notification } from '@/services/facturlyApi';

export function useNotificationStream(
  onNewNotification: (notification: Notification) => void,
  enabled: boolean = true
) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Récupérer le token depuis les cookies
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((cookie) => cookie.startsWith('facturly_access_token='));
    if (!tokenCookie) return;

    const token = tokenCookie.split('=')[1];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://facturlybackend-production.up.railway.app';
    
    const eventSource = new EventSource(
      `${apiUrl}/notifications/stream?token=${token}`
    );

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: Notification = JSON.parse(event.data);
        onNewNotification(notification);
      } catch (error) {
        console.error('Failed to parse notification:', error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [enabled, onNewNotification]);

  return { connected };
}
```

## 11. Variables d'environnement

Le projet utilise déjà `NEXT_PUBLIC_API_URL` dans `services/facturlyApi.ts`. Aucune configuration supplémentaire nécessaire.

## 12. Gestion du token d'authentification

RTK Query gère automatiquement l'authentification via les cookies dans `prepareHeaders` :

```typescript
// Déjà configuré dans services/facturlyApi.ts
baseQuery: fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((cookie) => cookie.startsWith("facturly_access_token="));
      if (tokenCookie) {
        const token = tokenCookie.split("=")[1];
        headers.set("authorization", `Bearer ${token}`);
      }
    }
    return headers;
  },
}),
```

## 13. Exemple d'utilisation complète

```typescript
'use client';

import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { useGetUnreadNotificationsCountQuery } from '@/services/facturlyApi';

export default function Dashboard() {
  const { data: unreadCountResponse } = useGetUnreadNotificationsCountQuery(undefined, {
    pollingInterval: 30000, // Polling toutes les 30 secondes
  });

  const unreadCount = unreadCountResponse?.count ?? 0;

  return (
    <div>
      <header>
        <NotificationDropdown />
        {unreadCount > 0 && (
          <span className="text-sm text-foreground/60">
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </span>
        )}
      </header>
      {/* Votre contenu */}
    </div>
  );
}
```

## Bonnes pratiques

1. **Polling intelligent** : RTK Query gère le polling avec `pollingInterval` (30 secondes est un bon compromis)
2. **Gestion d'erreurs** : RTK Query gère automatiquement les erreurs, utilisez `toast` pour les afficher
3. **Performance** : Limiter le nombre de notifications chargées initialement (limit: 10-20)
4. **Cache** : RTK Query invalide automatiquement le cache avec les tags
5. **Accessibilité** : Ajouter les attributs ARIA appropriés
6. **Mobile** : Adapter l'affichage pour les petits écrans

## Avantages de RTK Query

- ✅ Cache automatique et invalidation intelligente
- ✅ Polling intégré avec `pollingInterval`
- ✅ Gestion automatique des états (loading, error)
- ✅ Optimistic updates possibles
- ✅ Refetch automatique lors de la reconnexion
- ✅ Pas besoin de gérer manuellement les états

## Améliorations possibles

- [ ] Notifications push du navigateur
- [ ] Son de notification
- [ ] Animation lors de l'arrivée d'une nouvelle notification
- [ ] Groupement des notifications similaires
- [ ] Actions directes depuis les notifications (ex: "Voir la facture")
- [ ] Préférences de notifications par type
- [ ] Server-Sent Events pour le temps réel

