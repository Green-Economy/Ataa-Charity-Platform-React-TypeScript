// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────

import { request } from '../api.client';
import type { LoginResponse, RegisterResponse } from '../types';

export const authApi = {

  register: (body: {
    // common — مطلوبين دايماً
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address: string;
    roleType: 'user' | 'charity' | 'admin';
    // user + admin
    userName?: string;
    // charity فقط
    charityName?: string;
    charityDescription?: string;
    licenseNumber?: string;
    // admin فقط — capital D كما هو في الـ API
    nationalID?: string;
  }) =>
    request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  verifyEmail: (body: { email: string; code: string }) =>
    request('/auth/verifyEmail', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  forgetPassword: (body: { email: string }) =>
    request('/auth/forgetPassword', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resetPassword: (body: {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) =>
    request('/auth/resetPassword', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  refreshToken: (refreshToken: string) =>
    request('/auth/refreshToken', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};