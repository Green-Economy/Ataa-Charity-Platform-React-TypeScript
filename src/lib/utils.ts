import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function statusLabel(s: string): { label: string; cls: string } {
  const map: Record<string, { label: string; cls: string }> = {
    pending:   { label: 'قيد الانتظار', cls: 'status-pending' },
    accepted:  { label: 'مقبول',        cls: 'status-accepted' },
    rejected:  { label: 'مرفوض',        cls: 'status-rejected' },
    delivered: { label: 'تم التسليم',   cls: 'status-delivered' },
  };
  return map[s] || { label: s, cls: '' };
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('ar-EG');
}
