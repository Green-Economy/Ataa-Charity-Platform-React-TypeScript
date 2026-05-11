// ─── USERS ENDPOINTS ─────────────────────────────────────────────────────────

import { request } from '../api.client';
import type { User } from '../types';

export const usersApi = {
  /** GET /users/profile — backend returns { success, user } or { success, finder } */
  getProfile: () => request<any>('/users/profile'),

  /** PATCH /users/profile */
  updateProfile: (body: {
    userName?: string;
    phone?: string;
    address?: string;
  }) =>
    request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  /** PATCH /users/changePassword */
  changePassword: (body: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    request('/users/changePassword', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  /** DELETE /users/account */
  deleteAccount: () => request('/users/account', { method: 'DELETE' }),

  // ── Admin only ──────────────────────────────────────────────────────────────

  /** GET /users — Admin only */
  getAllUsers: () =>
    request<{ success: boolean; users: User[] }>('/users'),

  /** GET /users/:id — Admin only */
  getUserById: (id: string) =>
    request<{ success: boolean; user: User }>(`/users/${id}`),

  /** DELETE /users/:id — Admin only */
  deleteUser: (id: string) =>
    request(`/users/${id}`, { method: 'DELETE' }),
};
