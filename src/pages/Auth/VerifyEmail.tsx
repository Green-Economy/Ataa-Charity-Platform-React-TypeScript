
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { authApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/css/VerifyEmail.css';

// ─── OTP Input ────────────────────────────────────────────────────────────────

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  hasError?: boolean;
}

function OtpInput({ length = 6, value, onChange, disabled, hasError }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length }, (_, i) => value[i] || '');
  const focus = (i: number) => refs.current[i]?.focus();

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.map((d, idx) => (idx === i ? '' : d)).join('');
      onChange(next);
      if (i > 0) focus(i - 1);
    } else if (e.key === 'ArrowRight') {
      focus(i - 1);
    } else if (e.key === 'ArrowLeft') {
      focus(i + 1);
    }
  };

  const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    const chars = raw.slice(0, length - i).split('');
    const next = digits.map((d, idx) => {
      if (idx < i) return d;
      return chars[idx - i] ?? d;
    });
    onChange(next.join(''));
    const nextFocus = Math.min(i + chars.length, length - 1);
    focus(nextFocus);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!raw) return;
    onChange(raw.padEnd(length, '').slice(0, length));
    focus(Math.min(raw.length, length - 1));
  };

  return (
    <div className="vep-otp-wrap" dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => {
            refs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          disabled={disabled}
          className={`vep-otp-digit${d ? ' filled' : ''}${hasError ? ' error' : ''}`}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}

// ─── Countdown Hook ───────────────────────────────────────────────────────────

function useCountdown(initial: number) {
  const [secs, setSecs] = useState(initial);
  const reset = useCallback(() => setSecs(initial), [initial]);
  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  return { secs, reset, done: secs <= 0 };
}

// ─── Success Screen (user / admin) ────────────────────────────────────────────

function SuccessScreen({ userName, onGo }: { userName: string; onGo: () => void }) {
  const [count, setCount] = useState(4);

  useEffect(() => {
    if (count <= 0) {
      onGo();
      return;
    }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, onGo]);

  return (
    <div className="vep-result-card vep-success-anim">
      <div className="vep-success-circle">
        <svg viewBox="0 0 52 52" className="vep-checkmark">
          <circle cx="26" cy="26" r="25" fill="none" className="vep-checkmark-circle" />
          <path fill="none" d="M14 27 l7 7 l16-16" className="vep-checkmark-check" />
        </svg>
      </div>

      <div className="vep-result-text">
        <h2 className="vep-result-title">تم التحقق بنجاح! 🎉</h2>
        <p className="vep-result-sub">
          أهلاً <strong>{userName || 'بك'}</strong>، حسابك مفعَّل الآن وجاهز للاستخدام.
        </p>
      </div>

      <div className="vep-countdown-chip">
        <span className="vep-countdown-num">{count}</span>
        <span>ثانية وسيتم تحويلك لتسجيل الدخول</span>
      </div>

      <button className="vep-btn-primary" onClick={onGo}>
        <i className="fa-solid fa-right-to-bracket" />
        تسجيل الدخول الآن
      </button>
    </div>
  );
}

// ─── Charity Pending Screen ───────────────────────────────────────────────────

function CharityPendingScreen({ charityName, onGo }: { charityName: string; onGo: () => void }) {
  return (
    <div className="vep-result-card vep-pending-anim">
      <div className="vep-pending-icon">
        <i className="fa-solid fa-hourglass-half vep-hourglass" />
        <div className="vep-pending-rings">
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className="vep-result-text">
        <h2 className="vep-result-title">طلبك قيد المراجعة ⏳</h2>
        <p className="vep-result-sub">
          تم التحقق من بريد <strong>{charityName || 'جمعيتك'}</strong> بنجاح!
        </p>
      </div>

      <div className="vep-warn-box">
        <i className="fa-solid fa-clock" />
        <span>
          سيتم مراجعة بياناتك في <strong>أسرع وقت</strong> من قبل الإدارة، وسيتم إشعارك عند الموافقة.
        </span>
      </div>

      <div className="vep-steps">
        {[
          { num: '١', text: 'مراجعة بيانات الجمعية ورقم الترخيص من قِبل الفريق' },
          { num: '٢', text: 'إشعارك بقرار القبول أو الرفض عبر بريدك الإلكتروني' },
          { num: '٣', text: 'عند الموافقة يمكنك تسجيل الدخول والبدء فوراً' },
        ].map((s, i) => (
          <div key={i} className="vep-step" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
            <div className="vep-step-num">{s.num}</div>
            <p className="vep-step-text">{s.text}</p>
          </div>
        ))}
      </div>

      <button className="vep-btn-primary vep-btn-amber" onClick={onGo}>
        <i className="fa-solid fa-check" />
        حسناً، فهمت
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
  const [, setLocation] = useLocation();
  const { pendingVerify, setPendingVerify } = useAuth();

  const [redirected, setRedirected] = useState(false);
  useEffect(() => {
    if (!pendingVerify && !redirected) {
      setRedirected(true);
      setLocation('/authModals');
    }
  }, [pendingVerify, redirected, setLocation]);

  const email = pendingVerify?.email ?? '';
  const userName = pendingVerify?.name ?? '';
  const role = pendingVerify?.role ?? 'user';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [charityDone, setCharityDone] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendOk, setResendOk] = useState(false);
  const countdown = useCountdown(60);

  const filledCount = otp.replace(/\s/g, '').length;
  const canSubmit = filledCount === 6 && !loading;

  const handleVerify = async () => {
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, code: otp });

      setPendingVerify(null);

      if (role === 'charity') {
        setCharityDone(true);
      } else {
        setDone(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'الرمز غير صحيح أو منتهي الصلاحية';
      setError(msg);
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!countdown.done || resending) return;
    setResending(true);
    setError('');
    try {
      await authApi.resendVerification({ email });
      setResendOk(true);
      countdown.reset();
      setTimeout(() => setResendOk(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى';
      setError(msg);
    } finally {
      setResending(false);
    }
  };

  // شاشة نجاح الجمعية
  if (charityDone) {
    return (
      <div className="vep-body">
        <CharityPendingScreen charityName={userName} onGo={() => setLocation('/authModals')} />
      </div>
    );
  }

  // شاشة نجاح المستخدم / الأدمن
  if (done) {
    return (
      <div className="vep-body">
        <SuccessScreen userName={userName} onGo={() => setLocation('/authModals')} />
      </div>
    );
  }

  // لو مفيش pendingVerify
  if (!pendingVerify) return null;

  return (
    <div className="vep-body">
      <button className="vep-back-btn" onClick={() => setLocation('/authModals')}>
        <i className="fa-solid fa-house" />
        <span>الرئيسية</span>
      </button>

      <div className="vep-card">
        <div className="vep-header">
          <div className="vep-icon-wrap">
            <i className="fa-solid fa-envelope-open-text" />
          </div>
          <h1 className="vep-title">تأكيد البريد الإلكتروني</h1>
          <p className="vep-sub">أرسلنا رمزاً مكوّناً من 6 أرقام إلى</p>
          <div className="vep-email-chip">
            <i className="fa-solid fa-envelope" />
            <span>{email || 'بريدك الإلكتروني'}</span>
          </div>
          {role === 'charity' && (
            <div className="vep-charity-badge">
              <i className="fa-solid fa-building" />
              <span>جاري مراجعة حساب الجمعية، وسيتم تفعيله بعد التحقق من البيانات.
    </span>
            </div>
          )}
        </div>

        <div className="vep-otp-section">
          <OtpInput
            value={otp}
            onChange={v => {
              setOtp(v);
              setError('');
            }}
            disabled={loading}
            hasError={!!error}
          />

          {error && (
            <div className="vep-error-msg">
              <i className="fa-solid fa-circle-exclamation" />
              {error}
            </div>
          )}

          <div className="vep-otp-progress">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className={`vep-dot${i < filledCount ? ' filled' : ''}`} />
            ))}
          </div>
        </div>

        <button className="vep-btn-primary" onClick={handleVerify} disabled={!canSubmit}>
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin" /> جاري التحقق...
            </>
          ) : (
            <>
              <i className="fa-solid fa-shield-check" /> تأكيد الرمز
            </>
          )}
        </button>

        <div className="vep-resend-row">
          {resendOk ? (
            <span className="vep-resend-ok">
              <i className="fa-solid fa-circle-check" /> تم إرسال رمز جديد!
            </span>
          ) : countdown.done ? (
            <button className="vep-resend-btn" onClick={handleResend} disabled={resending}>
              {resending ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" /> جاري الإرسال...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-rotate-right" /> إرسال رمز جديد
                </>
              )}
            </button>
          ) : (
            <span className="vep-resend-timer">
              <i className="fa-solid fa-clock" />
              إعادة الإرسال بعد <strong>{countdown.secs}</strong> ثانية
            </span>
          )}
        </div>

        <p className="vep-help">
          لم تستلم الرمز؟ تحقق من مجلد الـ Spam أو أعد الإرسال بعد انتهاء العداد.
        </p>
      </div>
    </div>
  );
}