// ─── USERS ENDPOINTS ─────────────────────────────────────────────────────────

import { request } from '../api.client';
import type { User } from '../types';

export const usersApi = {
  /** Get current user profile — backend returns { success, user } or { success, finder } */
  getProfile: () => request<any>('/users/profile'),

  updateProfile: (body: {
    userName?: string;
    phone?: string;
    address?: string;
  }) =>
    request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  changePassword: (body: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    request('/users/changePassword', {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  deleteAccount: () => request('/users/account', { method: 'DELETE' }),

  // ── Admin only ──────────────────────────────────────────────────────────────
  getAllUsers: () =>
    request<{ success: boolean; users: User[] }>('/users'),

  getUserById: (id: string) =>
    request<{ success: boolean; user: User }>(`/users/${id}`),

  deleteUser: (id: string) =>
    request(`/users/${id}`, { method: 'DELETE' }),
};
