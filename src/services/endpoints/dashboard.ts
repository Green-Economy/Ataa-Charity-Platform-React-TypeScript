// // ─── DASHBOARD ENDPOINTS (Charity role) ─────────────────────────────────────

// import { request } from '../api.client';
// import type { Donation, DashboardStats } from '../types';

// export const dashboardApi = {
//   getStats: (license: string) =>
//     request<{ success: boolean; stats: DashboardStats }>(`/dashboard/stats/${license}`),

//   getDonations: (license: string) =>
//     request<{ success: boolean; donations: Donation[] }>(`/dashboard/donations/${license}`),

//   getRequests: (license: string) =>
//     request<{ success: boolean; donations: Donation[] }>(`/dashboard/requests/${license}`),

//   // FIX: endpoint is PATCH /dashboard/request/:donationId/:license — license is required
//   changeRequest: (donationId: string, status: 'accepted' | 'rejected', license: string) =>
//     request(`/dashboard/request/${donationId}/${license}`, {
//       method: 'PATCH',
//       body: JSON.stringify({ status }),
//     }),
// };

// ─── DASHBOARD ENDPOINTS (Charity role) ─────────────────────────────────────

import { request } from '../api.client';
import type { Donation, DashboardStats } from '../types';

export const dashboardApi = {
  /** GET /dashboard/stats */
  getStats: (license: string) =>
    request<{ success: boolean; stats: DashboardStats }>(`/dashboard/stats`),

  /** GET /dashboard/donations */
  getDonations: (license: string) =>
    request<{ success: boolean; donations: Donation[] }>(`/dashboard/donations`),

  /** GET /dashboard/requests/:license */
  getRequests: (license: string) =>
    request<{ success: boolean; donations: Donation[] }>(`/dashboard/requests`),

  /**
   * PATCH /dashboard/request/:donationId
   * license is REQUIRED as a path param — not a query string
   */
  changeRequest: (donationId: string, status: 'accepted' | 'rejected', license: string) =>
    request(`/dashboard/request/${donationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
