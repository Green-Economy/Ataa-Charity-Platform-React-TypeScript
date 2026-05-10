// // ─── NOTIFICATIONS ENDPOINTS ─────────────────────────────────────────────────

// import { request } from '../api.client';
// import type { Notification } from '../types';

// export const notificationApi = {
//   getAll: () =>
//     request<{ success: boolean; notifications: Notification[] }>('/notification'),

//   markRead: (id: string) =>
//     request(`/notification/${id}`, {
//       method: 'PATCH',
//       body: JSON.stringify({ status: 'read' }),
//     }),

//   delete: (id: string) =>
//     request(`/notification/${id}`, { method: 'DELETE' }),
// };

// ═══════════════════════════════════════════════════════════════
// ФАЙЛ: src/services/endpoints/notifications.ts — مُصلَح
// الإصلاح: Warning #7 — أضف markUnread لمطابقة Postman
// ═══════════════════════════════════════════════════════════════

import { request } from '../api.client';
import type { Notification } from '../types';

export const notificationApi = {
  /** GET /notification — يرجع { success, notifications } */
  getAll: () =>
    request<{ success: boolean; notifications: Notification[] }>('/notification'),

  /** PATCH /notification/:id — { status: 'read' } */
  markRead: (id: string) =>
    request(`/notification/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'read' }),
    }),

  /** PATCH /notification/:id — { status: 'unread' }
   *  موجود في Postman Collection — أضفناه للاكتمال
   */
  markUnread: (id: string) =>
    request(`/notification/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'unread' }),
    }),

  /** DELETE /notification/:id */
  delete: (id: string) =>
    request(`/notification/${id}`, { method: 'DELETE' }),
};