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

// Debug wrapper — في dev بيطبع كل response عشان نعرف شكل البيانات
export const apiFetch: typeof request = async (path: string, opts?: any) => {
  const res = await request(path, opts);
  if (import.meta.env?.DEV) {
    console.log(`[apiFetch] ${path}`, res);
  }
  return res;
};

export async function fetchPage<T extends { _id?: string }>(
  basePath: string,
  page: number,
  limit = 10,
): Promise<{ data: T[]; total: number; hasMore: boolean }> {
  try {
    const sep = basePath.includes('?') ? '&' : '?';
    const res = await request<any>(
      `${basePath}${sep}page=${page}&limit=${limit}`
    );

    // ── Deep-search for the array in any nested structure ─────────────────────
    function findArray(obj: any, depth = 0): T[] | null {
      if (depth > 4) return null;
      if (Array.isArray(obj)) return obj as T[];
      if (!obj || typeof obj !== 'object') return null;
      // Priority keys first
      const priorityKeys = ['Data','data','users','charities','reports','items','list','results','records'];
      for (const key of priorityKeys) {
        if (Array.isArray(obj[key])) return obj[key] as T[];
      }
      // Then recurse into object values
      for (const key of Object.keys(obj)) {
        const found = findArray(obj[key], depth + 1);
        if (found && found.length > 0) return found;
      }
      return null;
    }

    // ── Deep-search for the total count ──────────────────────────────────────
    function findTotal(obj: any, depth = 0): number {
      if (depth > 4) return 0;
      if (!obj || typeof obj !== 'object') return 0;
      const totalKeys = ['Total_Items','totalItems','totalCount','total','count','Total','total_count','TotalItems'];
      for (const key of totalKeys) {
        if (typeof obj[key] === 'number' && obj[key] > 0) return obj[key];
      }
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) continue; // skip arrays
        const found = findTotal(obj[key], depth + 1);
        if (found > 0) return found;
      }
      return 0;
    }

    const rawData: T[] = findArray(res) ?? [];
    const total: number = findTotal(res) || rawData.length;

    const loadedSoFar = (page - 1) * limit + rawData.length;
    const hasMore = total > rawData.length ? loadedSoFar < total : rawData.length === limit;

    // Debug in dev
    if (import.meta.env?.DEV) {
      console.log(`[fetchPage] ${basePath} → found ${rawData.length} items, total=${total}, hasMore=${hasMore}`);
    }

    return { data: rawData, total: total || rawData.length, hasMore };
  } catch (error) {
    console.error(`[fetchPage] Error fetching ${basePath}:`, error);
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