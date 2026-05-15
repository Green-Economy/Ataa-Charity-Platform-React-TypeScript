import { useState } from 'react';
import { authApi } from '../../services';
import { validateEmail, validatePassword } from '../../lib/validation';

type Step = 'email' | 'code' | 'done';

interface Props {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span style={{ fontSize: 11, color: '#e53e3e', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
      <i className="fas fa-exclamation-circle" style={{ fontSize: 10 }} />
      {msg}
    </span>
  );
}

export default function ForgotPasswordModal({ onClose, onSwitchToLogin }: Props) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [confirm, setConfirm] = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const eErr = validateEmail(email);
    if (eErr) { setEmailErr(eErr); return; }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setStep('code');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let hasErr = false;
    if (!code.trim() || code.length < 4) { setCodeErr('أدخل رمز التحقق الصحيح'); hasErr = true; }
    const pwErr = validatePassword(password);
    if (pwErr) { setPasswordErr(pwErr); hasErr = true; }
    if (!confirm) { setConfirmErr('تأكيد كلمة المرور مطلوب'); hasErr = true; }
    else if (password !== confirm) { setConfirmErr('كلمتا المرور غير متطابقتين'); hasErr = true; }
    if (hasErr) return;
    setLoading(true);
    try {
      await authApi.resetPassword({ email, code, password, confirmPassword: confirm });
      setStep('done');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>×</button>

        {step === 'email' && (
          <form onSubmit={handleSendCode} noValidate>
            <div className="verify-box">
              <div className="verify-icon">🔐</div>
              <h2 className="modal-title">نسيت كلمة المرور؟</h2>
              <p className="modal-sub">أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق</p>
            </div>
            {error && <div className="modal-error"><i className="fas fa-exclamation-triangle" style={{ marginLeft: 6 }} />{error}</div>}
            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                dir="ltr"
                onChange={e => { setEmail(e.target.value); setEmailErr(''); }}
                style={{ borderColor: emailErr ? '#e53e3e' : undefined }}
              />
              <FieldError msg={emailErr} />
            </div>
            <button type="submit" className="btn-form" disabled={loading}>
              {loading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </button>
            <p className="modal-login-link">
              تذكرت كلمة المرور؟ <a onClick={onSwitchToLogin} style={{ cursor: 'pointer' }}>تسجيل الدخول</a>
            </p>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={handleReset} noValidate>
            <div className="verify-box">
              <div className="verify-icon">📧</div>
              <h2 className="modal-title">إعادة تعيين كلمة المرور</h2>
              <p className="modal-sub">أُرسل رمز تحقق إلى <strong>{email}</strong></p>
            </div>
            {error && <div className="modal-error"><i className="fas fa-exclamation-triangle" style={{ marginLeft: 6 }} />{error}</div>}
            <div className="form-group">
              <label>رمز التحقق</label>
              <input
                type="text"
                placeholder="— — — — — —"
                value={code}
                onChange={e => { setCode(e.target.value); setCodeErr(''); }}
                maxLength={6}
                dir="ltr"
                style={{ letterSpacing: 6, textAlign: 'center', fontSize: 20, borderColor: codeErr ? '#e53e3e' : undefined }}
              />
              <FieldError msg={codeErr} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>كلمة المرور الجديدة</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordErr(''); }}
                  style={{ borderColor: passwordErr ? '#e53e3e' : undefined }}
                />
                <FieldError msg={passwordErr} />
              </div>
              <div className="form-group">
                <label>تأكيد كلمة المرور</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setConfirmErr(''); }}
                  style={{ borderColor: confirmErr ? '#e53e3e' : undefined }}
                />
                <FieldError msg={confirmErr} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--neutral-500)', marginBottom: 12, padding: '8px 12px', background: 'var(--neutral-50)', borderRadius: 6 }}>
              💡 كلمة المرور: 8+ أحرف، أرقام، وأحرف كبيرة وصغيرة
            </div>
            <button type="submit" className="btn-form" disabled={loading}>
              {loading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
            <p className="modal-login-link">
              <a onClick={() => { setStep('email'); setError(''); }} style={{ cursor: 'pointer' }}>تغيير البريد الإلكتروني</a>
            </p>
          </form>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="verify-icon" style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h2 className="modal-title">تم تحديث كلمة المرور!</h2>
            <p className="modal-sub">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
            <button
              className="btn-form"
              style={{ marginTop: 24 }}
              onClick={() => { onClose(); onSwitchToLogin(); }}
            >
              تسجيل الدخول الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
