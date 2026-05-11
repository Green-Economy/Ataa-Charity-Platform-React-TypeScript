// src/pages/ForgotPasswordPage.tsx
// ✅ BUG #1 FIX: صفحة مستقلة تعرض الـ ForgotPasswordModal للوصول المباشر عبر /forgot-password
// بتستخدم الـ Modal الموجود مباشرة بدون تكرار الـ logic

import { useLocation } from 'wouter';
import ForgotPasswordModal from '../features/auth/ForgotPasswordModal';

export default function ForgotPasswordPage() {
  const [, setLocation] = useLocation();

  return (
    <ForgotPasswordModal
      onClose={() => setLocation('/')}
      onSwitchToLogin={() => setLocation('/')}
    />
  );
}