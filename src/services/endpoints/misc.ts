// ─── RATING ENDPOINTS ────────────────────────────────────────────────────────

import { request } from '../api.client';
import type { Rating, Report } from '../types';

export const ratingApi = {
  /** POST /rating/:donationId */
  create: (donationId: string, body: { rating: number; comment?: string }) =>
    request(`/rating/${donationId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** GET /rating/:donationId */
  get: (donationId: string) =>
    request<{ success: boolean; rating: Rating }>(`/rating/${donationId}`),
};


// ─── REPORTS ENDPOINTS ───────────────────────────────────────────────────────

export const reportApi = {
  /** POST /report/addReport — { description } */
  create: (body: { description: string }) =>
    request('/report/addReport', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** GET /report/allReports — Admin only */
  getAll: () =>
    request<{ success: boolean; reports: Report[] }>('/report/allReports'),
};


// ─── AI ENDPOINTS ────────────────────────────────────────────────────────────

export const aiApi = {
  /** POST /ai/chat — { message } */
  chat: (message: string) =>
    request<{ success: boolean; reply: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  /** POST /ai/analysis — FormData with image(s) */
  analysis: (formData: FormData) =>
    request<{ success: boolean; result: string }>(
      '/ai/analysis',
      { method: 'POST', body: formData },
      true
    ),
};
