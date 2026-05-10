// ─── DONATIONS ENDPOINTS ─────────────────────────────────────────────────────

import { request } from '../api.client';
import type { Donation } from '../types';

export const donorApi = {
  /**
   * POST /donor — FormData
   * Fields: type, size, quantity, condition, description?, images[]
   * Donation is distributed to all charities — no charityId required
   */
  create: (formData: FormData) =>
    request('/donor', { method: 'POST', body: formData }, true),

  /** GET /donor — Returns { success, donations } */
  getMyDonations: () =>
    request<{ success: boolean; donations: Donation[] }>('/donor'),
};
