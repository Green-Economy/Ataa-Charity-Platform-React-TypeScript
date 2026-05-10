
// ─── CHARITIES ENDPOINTS ─────────────────────────────────────────────────────

import { request } from '../api.client';
import type { Charity } from '../types';

export const charityApi = {

  getAll: () =>
    request<{ success: boolean; charities: Charity[] }>('/charity/charities'),

  getById: (id: string) =>
    request<{ success: boolean; charity: Charity }>(`/charity/${id}`),

  // ── Admin only — محتاجين auth ────────────────────────────────────────────
  create: (body: {
    charityName: string;
    email: string;
    phone: string;
    address: string;
    description: string;
  }) =>
    request('/charity', {
      method: 'POST',
      body: JSON.stringify(body),
    }, false, true),

  update: (
    id: string,
    body: Partial<{
      charityName: string;
      address: string;
      description: string;
    }>
  ) =>
    request(`/charity/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }, false, true),

  delete: (id: string) =>
    request(`/charity/${id}`, { method: 'DELETE' }, false, true),

  approve: (id: string) =>
    request(`/charity/${id}/approve`, { method: 'PATCH' }, false, true),

  reject: (id: string, reason: string) =>
    request(`/charity/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }, false, true),
};