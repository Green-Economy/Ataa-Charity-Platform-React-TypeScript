// ─── NOTIFICATIONS ENDPOINTS ─────────────────────────────────────────────────

import { request } from '../api.client';
import type { Notification } from '../types';

export const notificationApi = {
  getAll: () =>
    request<{ success: boolean; notifications: Notification[] }>('/notification'),

  markRead: (id: string) =>
    request(`/notification/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'read' }),
    }),

  delete: (id: string) =>
    request(`/notification/${id}`, { method: 'DELETE' }),
};
