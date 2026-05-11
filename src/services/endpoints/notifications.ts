// ─── NOTIFICATIONS ENDPOINTS ─────────────────────────────────────────────────

import { request } from '../api.client';
import type { Notification } from '../types';

export const notificationApi = {
  /** GET /notification — returns { success, notifications } */
  getAll: () =>
    request<{ success: boolean; notifications: Notification[] }>('/notification'),

  /** PATCH /notification/:id — mark as read */
  markRead: (id: string) =>
    request(`/notification/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'read' }),
    }),

  /** PATCH /notification/:id — mark as unread */
  markUnread: (id: string) =>
    request(`/notification/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'unread' }),
    }),

  /** DELETE /notification/:id */
  delete: (id: string) =>
    request(`/notification/${id}`, { method: 'DELETE' }),
};
