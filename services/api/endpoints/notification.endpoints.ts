// ==================== Notification Endpoints ====================

import type { EndpointBuilder } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type {
  Notification,
  PaginatedResponse,
  NotificationListQueryParams,
  UnreadCountResponse,
  MarkAllAsReadResponse,
} from '../types';
import type { TagTypes } from '../base';

export interface VapidPublicKeyResponse {
  vapidPublicKey: string | null;
}

export interface RegisterPushSubscriptionPayload {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  locale?: string;
}

export interface UnregisterPushSubscriptionPayload {
  endpoint: string;
}

export const notificationEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
  getVapidPublicKey: builder.query<VapidPublicKeyResponse, void>({
    query: () => '/notifications/vapid-public-key',
  }),
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
  markAllNotificationsAsRead: builder.mutation<MarkAllAsReadResponse, void>({
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
  registerPushSubscription: builder.mutation<{ success: boolean }, RegisterPushSubscriptionPayload>({
    query: (body) => ({
      url: '/notifications/push-subscribe',
      method: 'POST',
      body,
    }),
  }),
  unregisterPushSubscription: builder.mutation<{ success: boolean }, UnregisterPushSubscriptionPayload>({
    query: (body) => ({
      url: '/notifications/push-unsubscribe',
      method: 'POST',
      body,
    }),
  }),
});
