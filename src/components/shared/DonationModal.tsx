import React from 'react';
import { Link } from 'wouter';
import DonationForm from './DonationForm';
import '../../styles/css/DonationModal.css';

/* ------------------------------------------------------------------ */
/* Props for the overlay modal (used in Home.tsx and CharityDetail.tsx) */
/* ------------------------------------------------------------------ */
interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/* ------------------------------------------------------------------ */
/* Default export: overlay modal wrapper                                */
/* ------------------------------------------------------------------ */
export default function DonationModal({ isOpen, onClose, onSuccess }: DonationModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay open"
      style={{ zIndex: 9000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="modal-box"
        style={{ maxWidth: 680, width: '95%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--neutral-100)',
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>إضافة تبرع جديد</h2>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ position: 'static' }}
            aria-label="إغلاق"
          >
            ×
          </button>
        </div>
        <div style={{ padding: '0 24px 24px' }}>
          <DonationForm onSuccess={onSuccess} onCancel={onClose} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Named export: standalone page for the /donate route (used in App.tsx) */
/* ------------------------------------------------------------------ */
export function DonationPage(): JSX.Element {
  return (
    <div style={{ background: 'var(--bg, #f7fafb)', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div className="donation-page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 className="dp-title" style={{ margin: 0 }}>إضافة منتج للتبرع</h2>
            <p className="dp-sub" style={{ margin: 0, color: 'var(--neutral-500)', fontSize: 14 }}>
              صفحة مخصصة لإضافة تبرعات جديدة مع تجربة سلسة على الهاتف والكمبيوتر
            </p>
          </div>
          <Link href="/user-dashboard">
            <button className="btn btn-ghost" style={{ marginLeft: 8 }}>العودة للوحة التحكم</button>
          </Link>
        </div>
        <DonationForm />
      </div>
    </div>
  );
}
