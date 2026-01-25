// ==================== Notification Types ====================

import { ListQueryParams, PaginatedResponse } from './common.types';

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

export interface NotificationListQueryParams extends ListQueryParams {
  read?: boolean;
  type?: NotificationType;
  priority?: NotificationPriority;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  updatedCount: number;
}
