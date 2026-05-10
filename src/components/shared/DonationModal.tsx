import React from 'react';
import { Link } from 'wouter';
import DonationForm from './DonationForm';
import '../../styles/css/DonationModal.css'; // تأكد أن هذا المسار صحيح في مشروعك

/**
 * DonationPage.tsx
 * - Simple page wrapper for DonationForm with breadcrumb/header
 */

export default function DonationPage(): JSX.Element {
  return (
    <div style={{ background: 'var(--bg, #f7fafb)', minHeight: '100vh', padding: 24 }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div className="donation-page-head">
          <div>
            <h2 className="dp-title">إضافة منتج للتبرع</h2>
            <p className="dp-sub">صفحة مخصصة لإضافة تبرعات جديدة مع تجربة سلسة على الهاتف والكمبيوتر</p>
          </div>
          <div>
            <Link href="/user-dashboard">
              <button className="btn btn-ghost" style={{ marginLeft: 8 }}>العودة للوحة التحكم</button>
            </Link>
          </div>
        </div>

        <DonationForm />
      </div>
    </div>
  );
}