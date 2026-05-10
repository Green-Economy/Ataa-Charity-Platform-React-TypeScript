// ─── DASHBOARD ENDPOINTS (Charity role) ─────────────────────────────────────

import { request } from '../api.client';
import type { Donation, DashboardStats } from '../types';

export const dashboardApi = {
  getStats: (license: string) =>
    request<{ success: boolean; stats: DashboardStats }>(`/dashboard/stats/${license}`),

  getDonations: (license: string) =>
    request<{ success: boolean; donations: Donation[] }>(`/dashboard/donations/${license}`),

  getRequests: (license: string) =>
    request<{ success: boolean; donations: Donation[] }>(`/dashboard/requests/${license}`),

  // FIX: endpoint is PATCH /dashboard/request/:donationId/:license — license is required
  changeRequest: (donationId: string, status: 'accepted' | 'rejected', license: string) =>
    request(`/dashboard/request/${donationId}/${license}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
