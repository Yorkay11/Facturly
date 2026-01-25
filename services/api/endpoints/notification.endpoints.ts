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

export const notificationEndpoints = (
  builder: EndpointBuilder<BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>, TagTypes, 'facturlyApi'>
) => ({
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
});
