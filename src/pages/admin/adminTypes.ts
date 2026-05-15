// // ─── Base URL ────────────────────────────────────────────────────────────────
// export const BASE_URL = 'https://ataa-charity-platform.vercel.app';

// // ─── Types ───────────────────────────────────────────────────────────────────
// export interface User {
//   _id: string;
//   userName: string;
//   email: string;
//   phone?: string;
//   address?: string;
//   roleType: 'admin' | 'charity' | 'user';
//   isVerified?: boolean;
//   verify?: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface Charity {
//   _id: string;
//   charityName: string;
//   email: string;
//   phone?: string;
//   address: string;
//   description?: string;
//   approvalStatus: 'pending' | 'approved' | 'rejected';
//   licenseNumber?: string;
//   rejectionReason?: string;
//   createdAt?: string;
//   userId?: string;
// }

// export interface Report {
//   _id: string;
//   userId?: string;
//   userName?: string;
//   charityName?: string;
//   description: string;
//   senderType?: string;
//   createdAt: string;
// }

// export interface ConfirmOptions {
//   title: string;
//   message: string;
//   confirmLabel?: string;
//   variant?: 'danger' | 'ok';
//   icon?: string;
//   onConfirm: () => void;
// }

// export type Tab = 'overview' | 'users' | 'charities' | 'reports' | 'automation' | 'chat';
// export type ViewMode = 'table' | 'cards';
// export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// // ─── Config maps ──────────────────────────────────────────────────────────────
// export const APPROVAL_CFG = {
//   pending:  { label: 'معلق',    bg: '#FAEEDA', color: '#633806', dot: '#f59e0b'  },
//   approved: { label: 'مقبول',  bg: '#EAF3DE', color: '#27500A', dot: '#10b981'  },
//   rejected: { label: 'مرفوض', bg: '#FCEBEB', color: '#791F1F', dot: '#ef4444'   },
// } as const;

// export const ROLE_CFG = {
//   admin:   { label: 'أدمن',  bg: '#EEF2FF', color: '#3730a3', icon: '🛡️' },
//   charity: { label: 'جمعية', bg: '#F0FDF4', color: '#14532d', icon: '🏛️' },
//   user:    { label: 'متبرع', bg: '#F8FAFC', color: '#475569', icon: '👤' },
// } as const;

// // ─── Design tokens ────────────────────────────────────────────────────────────
// export const TEAL   = '#0F6E56';
// export const TEAL2  = '#1D9E75';
// export const AMBER  = '#f59e0b';
// export const GREEN  = '#10b981';
// export const RED    = '#ef4444';
// export const BORDER = '#e5e7eb';

// // ─── API helper ───────────────────────────────────────────────────────────────
// export async function apiFetch(path: string, options: RequestInit = {}) {
//   const token =
//     localStorage.getItem('accessToken') ||
//     localStorage.getItem('token') ||
//     '';
//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: token,
//       ...(options.headers || {}),
//     },
//   });
//   const json = await res.json().catch(() => ({}));
//   if (!res.ok)
//     throw Object.assign(new Error(json.message || `HTTP ${res.status}`), {
//       status: res.status,
//     });
//   return json;
// }

// // ─── Paginated fetch (single page, returns { data, total, hasMore }) ──────────
// export async function fetchPage<T>(
//   basePath: string,
//   page: number,
//   limit = 10
// ): Promise<{ data: T[]; total: number; hasMore: boolean }> {
//   const sep = basePath.includes('?') ? '&' : '?';
//   const res = await apiFetch(`${basePath}${sep}page=${page}&limit=${limit}`);

//   const arr: T[] =
//     res?.data?.Data ??
//     res?.result?.Data ??
//     res?.data ??
//     res?.users ??
//     res?.charities ??
//     res?.reports ??
//     [];

//   // Try to get total from response meta
//   const total: number =
//     res?.data?.totalCount ??
//     res?.result?.totalCount ??
//     res?.totalCount ??
//     arr.length;

//   return { data: arr, total, hasMore: arr.length === limit };
// }

// // ─── Fetch single user ────────────────────────────────────────────────────────
// export async function fetchUser(id: string): Promise<User> {
//   const res = await apiFetch(`/users/${id}`);
//   return res.user ?? res.data ?? res;
// }

// // ─── Fetch single charity ─────────────────────────────────────────────────────
// export async function fetchCharity(id: string): Promise<Charity> {
//   const res = await apiFetch(`/charity/${id}`);
//   return res.charity ?? res.data ?? res;
// }

// // ─── Date formatter ───────────────────────────────────────────────────────────
// export function fmt(dateStr?: string): string {
//   if (!dateStr) return '—';
//   return new Intl.DateTimeFormat('ar-EG', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//   }).format(new Date(dateStr));
// }
// ─── Admin Panel — Types & Config ────────────────────────────────────────────

import { request } from '../../services/api.client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  userName: string;
  email: string;
  phone?: string;
  address?: string;
  roleType: 'admin' | 'charity' | 'user';
  isVerified?: boolean;
  verify?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Charity {
  _id: string;
  charityName: string;
  email: string;
  phone?: string;
  address: string;
  description?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  licenseNumber?: string;
  rejectionReason?: string;
  createdAt?: string;
  userId?: string;
}

export interface Report {
  _id: string;
  userId?: string;
  userName?: string;
  charityName?: string;
  description: string;
  senderType?: string;
  createdAt: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'ok';
  icon?: string;
  onConfirm: () => void;
}

export type Tab           = 'overview' | 'users' | 'charities' | 'reports' | 'automation';
export type ViewMode      = 'table' | 'cards';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ── Config maps ───────────────────────────────────────────────────────────────

export const APPROVAL_CFG = {
  pending:  { label: 'معلق',   bg: '#FAEEDA', color: '#633806', dot: '#f59e0b' },
  approved: { label: 'مقبول',  bg: '#EAF3DE', color: '#27500A', dot: '#10b981' },
  rejected: { label: 'مرفوض', bg: '#FCEBEB', color: '#791F1F', dot: '#ef4444' },
} as const;

export const ROLE_CFG = {
  admin:   { label: 'أدمن',  bg: '#EEF2FF', color: '#3730a3', icon: '🛡️' },
  charity: { label: 'جمعية', bg: '#F0FDF4', color: '#14532d', icon: '🏛️' },
  user:    { label: 'متبرع', bg: '#F8FAFC', color: '#475569', icon: '👤' },
} as const;

// ── Design tokens ─────────────────────────────────────────────────────────────

export const TEAL   = '#0F6E56';
export const TEAL2  = '#1D9E75';
export const AMBER  = '#f59e0b';
export const GREEN  = '#10b981';
export const RED    = '#ef4444';
export const BORDER = '#e5e7eb';

// ── API helpers ───────────────────────────────────────────────────────────────

export const apiFetch = request;

export async function fetchPage<T extends { _id?: string }>(
  basePath: string,
  page: number,
  limit = 10,
): Promise<{ data: T[]; total: number; hasMore: boolean }> {
  try {
    const sep = basePath.includes('?') ? '&' : '?';
    const res = await request<{ success: boolean; data?: any; result?: any }>(
      `${basePath}${sep}page=${page}&limit=${limit}`
    );

    const container = res?.data ?? res?.result ?? res;

    let rawData: T[] = [];
    if (Array.isArray(container?.Data))       rawData = container.Data;
    else if (Array.isArray(container?.data))  rawData = container.data;
    else if (Array.isArray(container?.users)) rawData = container.users;
    else if (Array.isArray(container?.charities)) rawData = container.charities;
    else if (Array.isArray(container?.reports))   rawData = container.reports;
    else if (Array.isArray(container))        rawData = container;

    const total: number =
      container?.Total_Items ??
      container?.totalCount  ??
      container?.total       ??
      res?.totalCount        ??
      res?.total             ??
      0;

    const loadedSoFar = (page - 1) * limit + rawData.length;
    const hasMore = total > 0 ? loadedSoFar < total : rawData.length === limit;

    return { data: rawData, total: total || rawData.length, hasMore };
  } catch (error) {
    console.error(`fetchPage error [${basePath}]:`, error);
    return { data: [], total: 0, hasMore: false };
  }
}

// ── Date formatter ────────────────────────────────────────────────────────────

export function fmt(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(dateStr));
}