// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useLocation } from 'wouter';
// import { authApi } from '../../services';
// import { useAuth } from '../../contexts/AuthContext';

// // ─── OTP Input ────────────────────────────────────────────────────────────────

// interface OtpInputProps {
//   length?: number;
//   value: string;
//   onChange: (val: string) => void;
//   disabled?: boolean;
//   hasError?: boolean;
// }

// function OtpInput({ length = 6, value, onChange, disabled, hasError }: OtpInputProps) {
//   const refs = useRef<(HTMLInputElement | null)[]>([]);
//   const digits = Array.from({ length }, (_, i) => value[i] || '');
//   const focus = (i: number) => refs.current[i]?.focus();

//   const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Backspace') {
//       e.preventDefault();
//       const next = digits.map((d, idx) => (idx === i ? '' : d)).join('');
//       onChange(next);
//       if (i > 0) focus(i - 1);
//     } else if (e.key === 'ArrowRight') { focus(i - 1); }
//     else if (e.key === 'ArrowLeft')    { focus(i + 1); }
//   };

//   const handleChange = (i: number, e: React.ChangeEvent<HTMLInputElement>) => {
//     const raw = e.target.value.replace(/\D/g, '');
//     if (!raw) return;
//     const chars = raw.slice(0, length - i).split('');
//     const next = digits.map((d, idx) => {
//       if (idx < i) return d;
//       return chars[idx - i] ?? d;
//     });
//     onChange(next.join(''));
//     const nextFocus = Math.min(i + chars.length, length - 1);
//     focus(nextFocus);
//   };

//   const handlePaste = (e: React.ClipboardEvent) => {
//     e.preventDefault();
//     const raw = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
//     if (!raw) return;
//     onChange(raw.padEnd(length, '').slice(0, length));
//     focus(Math.min(raw.length, length - 1));
//   };

//   return (
//     <div className="vep-otp-wrap" dir="ltr">
//       {digits.map((d, i) => (
//         <input
//           key={i}
//           ref={el => { refs.current[i] = el; }}
//           type="text" inputMode="numeric" maxLength={1} value={d}
//           disabled={disabled}
//           className={`vep-otp-digit${d ? ' filled' : ''}${hasError ? ' error' : ''}`}
//           onChange={e => handleChange(i, e)}
//           onKeyDown={e => handleKey(i, e)}
//           onPaste={handlePaste}
//           onFocus={e => e.target.select()}
//           autoComplete="one-time-code"
//         />
//       ))}
//     </div>
//   );
// }

// // ─── Countdown Hook ───────────────────────────────────────────────────────────

// function useCountdown(initial: number) {
//   const [secs, setSecs] = useState(initial);
//   const reset = useCallback(() => setSecs(initial), [initial]);
//   useEffect(() => {
//     if (secs <= 0) return;
//     const t = setTimeout(() => setSecs(s => s - 1), 1000);
//     return () => clearTimeout(t);
//   }, [secs]);
//   return { secs, reset, done: secs <= 0 };
// }

// // ─── Success Screen (user / admin) ────────────────────────────────────────────

// function SuccessScreen({ userName, onGo }: { userName: string; onGo: () => void }) {
//   const [count, setCount] = useState(4);

//   useEffect(() => {
//     if (count <= 0) { onGo(); return; }
//     const t = setTimeout(() => setCount(c => c - 1), 1000);
//     return () => clearTimeout(t);
//   }, [count, onGo]);

//   return (
//     <div className="vep-result-card vep-success-anim">
//       <div className="vep-success-circle">
//         <svg viewBox="0 0 52 52" className="vep-checkmark">
//           <circle cx="26" cy="26" r="25" fill="none" className="vep-checkmark-circle" />
//           <path fill="none" d="M14 27 l7 7 l16-16" className="vep-checkmark-check" />
//         </svg>
//       </div>

//       <div className="vep-result-text">
//         <h2 className="vep-result-title">تم التحقق بنجاح! 🎉</h2>
//         <p className="vep-result-sub">
//           أهلاً <strong>{userName || 'بك'}</strong>، حسابك مفعَّل الآن وجاهز للاستخدام.
//         </p>
//       </div>

//       <div className="vep-countdown-chip">
//         <span className="vep-countdown-num">{count}</span>
//         <span>ثانية وسيتم تحويلك لتسجيل الدخول</span>
//       </div>

//       <button className="vep-btn-primary" onClick={onGo}>
//         <i className="fa-solid fa-right-to-bracket" />
//         تسجيل الدخول الآن
//       </button>
//     </div>
//   );
// }

// // ─── Charity Pending Screen ───────────────────────────────────────────────────

// function CharityPendingScreen({ charityName, onGo }: { charityName: string; onGo: () => void }) {
//   return (
//     <div className="vep-result-card vep-pending-anim">
//       <div className="vep-pending-icon">
//         <i className="fa-solid fa-hourglass-half vep-hourglass" />
//         <div className="vep-pending-rings">
//           <span /><span /><span />
//         </div>
//       </div>

//       <div className="vep-result-text">
//         <h2 className="vep-result-title">طلبك قيد المراجعة ⏳</h2>
//         <p className="vep-result-sub">
//           تم التحقق من بريد <strong>{charityName || 'جمعيتك'}</strong> بنجاح!
//           سيراجع فريقنا البيانات في أقرب وقت ممكن.
//         </p>
//       </div>

//       <div className="vep-steps">
//         {[
//           { num: '١', text: 'مراجعة بيانات الجمعية ورقم الترخيص من قِبل الفريق' },
//           { num: '٢', text: 'إشعارك بقرار القبول أو الرفض عبر بريدك الإلكتروني' },
//           { num: '٣', text: 'عند الموافقة يمكنك تسجيل الدخول والبدء فوراً' },
//         ].map((s, i) => (
//           <div key={i} className="vep-step" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
//             <div className="vep-step-num">{s.num}</div>
//             <p className="vep-step-text">{s.text}</p>
//           </div>
//         ))}
//       </div>

//       <div className="vep-warn-box">
//         <i className="fa-solid fa-clock" />
//         <span>المراجعة تستغرق عادةً من <strong>24</strong> إلى <strong>48</strong> ساعة. شكراً لصبرك!</span>
//       </div>

//       <button className="vep-btn-primary vep-btn-amber" onClick={onGo}>
//         <i className="fa-solid fa-check" />
//         حسناً، فهمت
//       </button>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────

// export default function VerifyEmailPage() {
//   const [, setLocation] = useLocation();
//   const { pendingVerify, setPendingVerify } = useAuth();

//   // ✅ الـ redirect يحصل بس لو مفيش pendingVerify خالص — مش عند أول render
//   const [redirected, setRedirected] = useState(false);
//   useEffect(() => {
//     if (!pendingVerify && !redirected) {
//       setRedirected(true);
//       setLocation('/authModals');
//     }
//   }, [pendingVerify, redirected, setLocation]);

//   const email    = pendingVerify?.email ?? '';
//   const userName = pendingVerify?.name  ?? '';
//   const role     = pendingVerify?.role  ?? 'user';

//   const [otp, setOtp]                 = useState('');
//   const [loading, setLoading]         = useState(false);
//   const [error, setError]             = useState('');
//   const [done, setDone]               = useState(false);
//   const [charityDone, setCharityDone] = useState(false);
//   const [resending, setResending]     = useState(false);
//   const [resendOk, setResendOk]       = useState(false);
//   const countdown = useCountdown(60);

//   const filledCount = otp.replace(/\s/g, '').length;
//   const canSubmit   = filledCount === 6 && !loading;

//   const handleVerify = async () => {
//     if (!canSubmit) return;
//     setError('');
//     setLoading(true);
//     try {
//       await authApi.verifyEmail({ email, code: otp });

//       // ✅ امسح pendingVerify بعد نجاح التحقق (بيمسحه من sessionStorage كمان)
//       setPendingVerify(null);

//       if (role === 'charity') {
//         setCharityDone(true);
//       } else {
//         setDone(true);
//       }
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : 'الرمز غير صحيح أو منتهي الصلاحية';
//       setError(msg);
//       setOtp('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     if (!countdown.done || resending) return;
//     setResending(true);
//     setError('');
//     try {
//       // ✅ استخدم resendVerification مش forgotPassword
//       await authApi.resendVerification({ email });
//       setResendOk(true);
//       countdown.reset();
//       setTimeout(() => setResendOk(false), 3000);
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى';
//       setError(msg);
//     } finally {
//       setResending(false);
//     }
//   };

//   // شاشة نجاح الجمعية
//   if (charityDone) {
//     return (
//       <>
//         <VerifyCSS />
//         <div className="vep-body">
//           <CharityPendingScreen
//             charityName={userName}
//             onGo={() => setLocation('/authModals')}
//           />
//         </div>
//       </>
//     );
//   }

//   // شاشة نجاح المستخدم / الأدمن
//   if (done) {
//     return (
//       <>
//         <VerifyCSS />
//         <div className="vep-body">
//           <SuccessScreen
//             userName={userName}
//             onGo={() => setLocation('/authModals')}
//           />
//         </div>
//       </>
//     );
//   }

//   // لو مفيش pendingVerify — عرض فاضي ريثما يحصل الـ redirect
//   if (!pendingVerify) return <VerifyCSS />;

//   return (
//     <>
//       <VerifyCSS />
//       <div className="vep-body">

//         <button className="vep-back-btn" onClick={() => setLocation('/authModals')}>
//           <i className="fa-solid fa-house" />
//           <span>الرئيسية</span>
//         </button>

//         <div className="vep-card">

//           <div className="vep-header">
//             <div className="vep-icon-wrap">
//               <i className="fa-solid fa-envelope-open-text" />
//             </div>
//             <h1 className="vep-title">تأكيد البريد الإلكتروني</h1>
//             <p className="vep-sub">أرسلنا رمزاً مكوّناً من 6 أرقام إلى</p>
//             <div className="vep-email-chip">
//               <i className="fa-solid fa-envelope" />
//               <span>{email || 'بريدك الإلكتروني'}</span>
//             </div>
//             {role === 'charity' && (
//               <div className="vep-charity-badge">
//                 <i className="fa-solid fa-building" />
//                 <span>جمعية خيرية — بعد التحقق ستنتظر موافقة الإدارة</span>
//               </div>
//             )}
//           </div>

//           <div className="vep-otp-section">
//             <OtpInput
//               value={otp}
//               onChange={v => { setOtp(v); setError(''); }}
//               disabled={loading}
//               hasError={!!error}
//             />

//             {error && (
//               <div className="vep-error-msg">
//                 <i className="fa-solid fa-circle-exclamation" />
//                 {error}
//               </div>
//             )}

//             <div className="vep-otp-progress">
//               {Array.from({ length: 6 }, (_, i) => (
//                 <div key={i} className={`vep-dot${i < filledCount ? ' filled' : ''}`} />
//               ))}
//             </div>
//           </div>

//           <button className="vep-btn-primary" onClick={handleVerify} disabled={!canSubmit}>
//             {loading
//               ? <><i className="fa-solid fa-spinner fa-spin" /> جاري التحقق...</>
//               : <><i className="fa-solid fa-shield-check" /> تأكيد الرمز</>}
//           </button>

//           <div className="vep-resend-row">
//             {resendOk ? (
//               <span className="vep-resend-ok">
//                 <i className="fa-solid fa-circle-check" /> تم إرسال رمز جديد!
//               </span>
//             ) : countdown.done ? (
//               <button className="vep-resend-btn" onClick={handleResend} disabled={resending}>
//                 {resending
//                   ? <><i className="fa-solid fa-spinner fa-spin" /> جاري الإرسال...</>
//                   : <><i className="fa-solid fa-rotate-right" /> إرسال رمز جديد</>}
//               </button>
//             ) : (
//               <span className="vep-resend-timer">
//                 <i className="fa-solid fa-clock" />
//                 إعادة الإرسال بعد <strong>{countdown.secs}</strong> ثانية
//               </span>
//             )}
//           </div>

//           <p className="vep-help">
//             لم تستلم الرمز؟ تحقق من مجلد الـ Spam أو أعد الإرسال بعد انتهاء العداد.
//           </p>

//         </div>
//       </div>
//     </>
//   );
// }

// // ─── CSS ──────────────────────────────────────────────────────────────────────

// function VerifyCSS() {
//   return (
//     <style>{`
// .vep-body {
//   --vep-teal-900: #0d3d3f; --vep-teal-800: #164e52; --vep-teal-700: #1e6268;
//   --vep-teal-600: #267880; --vep-teal-500: #2e8e98; --vep-teal-400: #3ba8b4;
//   --vep-teal-50:  #eaf8f9;
//   --vep-gold-500: #c9a227; --vep-gold-400: #d4af37;
//   --vep-success:  #22c55e; --vep-error: #ef4444; --vep-amber: #f59e0b;
//   --vep-n900: #111827; --vep-n700: #374151; --vep-n500: #6b7280;
//   --vep-n300: #d1d5db; --vep-n200: #e5e7eb; --vep-n50: #f9fafb;
//   --vep-white: #ffffff;
//   --vep-font: 'Tajawal', sans-serif;
//   --vep-r-full: 9999px;

//   font-family: var(--vep-font);
//   direction: rtl;
//   min-height: 100vh;
//   display: flex; align-items: center; justify-content: center;
//   background: linear-gradient(135deg, var(--vep-teal-50), #f0f9fa);
//   position: relative; overflow: hidden; padding: 20px;
// }
// .vep-body::before {
//   content: ''; position: absolute; inset: 0;
//   background: linear-gradient(to right, var(--vep-teal-900), var(--vep-teal-400));
//   clip-path: circle(28% at 0% 0%);
//   animation: vep-blob1 3s ease-in-out infinite alternate; pointer-events: none;
// }
// .vep-body::after {
//   content: ''; position: absolute; inset: 0;
//   background: var(--vep-teal-600); clip-path: circle(22% at 100% 100%);
//   animation: vep-blob2 3s ease-in-out infinite alternate; pointer-events: none; z-index: 0;
// }
// @keyframes vep-blob1 { from { clip-path: circle(28% at 0% 0%); } to { clip-path: circle(32% at 4% 6%); } }
// @keyframes vep-blob2 { from { clip-path: circle(22% at 100% 100%); } to { clip-path: circle(26% at 96% 94%); } }

// .vep-back-btn {
//   position: fixed; top: 16px; right: 16px; z-index: 9999;
//   background: #1a1a1a; border: 1.5px solid rgba(255,255,255,0.4);
//   border-radius: var(--vep-r-full); padding: 9px 18px 9px 14px;
//   color: #fff; font-family: var(--vep-font); font-size: 14px; font-weight: 700;
//   cursor: pointer; display: flex; align-items: center; gap: 8px;
//   backdrop-filter: blur(10px); box-shadow: 0 4px 16px rgba(0,0,0,0.2);
//   transition: background 0.2s, transform 0.15s;
// }
// .vep-back-btn:hover { background: #000; transform: translateY(-1px); }

// .vep-card {
//   position: relative; z-index: 1;
//   background: var(--vep-white); border-radius: 24px;
//   box-shadow: 0 20px 60px rgba(13,61,63,0.15), 0 4px 16px rgba(0,0,0,0.06);
//   padding: 40px 36px 32px;
//   width: 100%; max-width: 460px;
//   display: flex; flex-direction: column; align-items: center; gap: 20px;
//   animation: vep-cardIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
// }
// @keyframes vep-cardIn {
//   from { opacity: 0; transform: translateY(32px) scale(0.96); }
//   to   { opacity: 1; transform: translateY(0)   scale(1); }
// }

// .vep-header { text-align: center; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; }

// .vep-icon-wrap {
//   width: 68px; height: 68px; border-radius: 20px;
//   background: linear-gradient(135deg, var(--vep-teal-600), var(--vep-teal-400));
//   display: flex; align-items: center; justify-content: center;
//   font-size: 28px; color: #fff;
//   box-shadow: 0 10px 30px rgba(46,142,152,0.4);
//   animation: vep-iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both;
// }
// @keyframes vep-iconBounce {
//   from { transform: scale(0.5) rotate(-10deg); opacity: 0; }
//   to   { transform: scale(1)   rotate(0deg);   opacity: 1; }
// }

// .vep-title { font-size: 1.55em; font-weight: 800; color: var(--vep-teal-800); margin: 0; }
// .vep-sub   { font-size: 0.9em;  color: var(--vep-n500); margin: 0; }

// .vep-email-chip {
//   display: inline-flex; align-items: center; gap: 8px;
//   background: var(--vep-teal-50); border: 1.5px solid #b2e8ed;
//   border-radius: var(--vep-r-full); padding: 7px 16px;
//   font-size: 0.88em; font-weight: 700; color: var(--vep-teal-700);
//   max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
// }
// .vep-email-chip i { color: var(--vep-teal-500); flex-shrink: 0; }

// .vep-charity-badge {
//   display: inline-flex; align-items: center; gap: 7px;
//   background: #fffbeb; border: 1.5px solid #fde68a;
//   border-radius: var(--vep-r-full); padding: 6px 14px;
//   font-size: 0.8em; font-weight: 600; color: #92400e;
// }
// .vep-charity-badge i { color: #f59e0b; flex-shrink: 0; }

// .vep-otp-section { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 14px; }
// .vep-otp-wrap    { display: flex; gap: 10px; justify-content: center; }

// .vep-otp-digit {
//   width: 52px; height: 60px; border-radius: 12px;
//   border: 2px solid var(--vep-n300); background: var(--vep-n50);
//   font-size: 24px; font-weight: 800; color: var(--vep-n900);
//   -webkit-text-fill-color: var(--vep-n900);
//   caret-color: var(--vep-teal-600); text-align: center;
//   font-family: var(--vep-font); outline: none; transition: all 0.2s;
// }
// .vep-otp-digit:focus {
//   border-color: var(--vep-teal-500); background: #fff;
//   box-shadow: 0 0 0 3px rgba(46,142,152,0.18); transform: scale(1.06);
// }
// .vep-otp-digit.filled {
//   border-color: var(--vep-teal-500); background: #f0fdfe;
//   color: var(--vep-teal-700); -webkit-text-fill-color: var(--vep-teal-700);
// }
// .vep-otp-digit.error {
//   border-color: var(--vep-error); background: #fff5f5;
//   animation: vep-shake 0.35s ease;
// }
// .vep-otp-digit:disabled { opacity: 0.55; cursor: not-allowed; }
// @keyframes vep-shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }

// .vep-error-msg {
//   display: flex; align-items: center; gap: 7px;
//   color: var(--vep-error); font-size: 0.84em; font-weight: 600;
//   background: #fff5f5; border: 1px solid #fca5a5;
//   border-radius: 10px; padding: 9px 14px; width: 100%;
//   animation: vep-cardIn 0.3s ease;
// }

// .vep-otp-progress { display: flex; gap: 6px; }
// .vep-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--vep-n300); transition: all 0.2s; }
// .vep-dot.filled { background: var(--vep-teal-500); transform: scale(1.2); }

// .vep-btn-primary {
//   width: 100%; padding: 13px;
//   background: linear-gradient(135deg, var(--vep-teal-600), var(--vep-teal-500));
//   color: #fff; border: none; border-radius: var(--vep-r-full);
//   font-family: var(--vep-font); font-size: 1em; font-weight: 700;
//   cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 9px;
//   transition: all 0.25s; box-shadow: 0 4px 16px rgba(38,120,128,0.25);
// }
// .vep-btn-primary:hover:not(:disabled) {
//   background: linear-gradient(135deg, var(--vep-teal-700), var(--vep-teal-600));
//   transform: translateY(-2px); box-shadow: 0 8px 24px rgba(38,120,128,0.35);
// }
// .vep-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

// .vep-btn-amber {
//   background: linear-gradient(135deg, #d97706, #f59e0b) !important;
//   box-shadow: 0 4px 16px rgba(245,158,11,0.3) !important;
// }
// .vep-btn-amber:hover:not(:disabled) {
//   background: linear-gradient(135deg, #b45309, #d97706) !important;
//   box-shadow: 0 8px 24px rgba(245,158,11,0.4) !important;
// }

// .vep-resend-row { display: flex; align-items: center; justify-content: center; font-size: 0.85em; font-family: var(--vep-font); }
// .vep-resend-timer { color: var(--vep-n500); display: flex; align-items: center; gap: 6px; }
// .vep-resend-timer strong { color: var(--vep-teal-600); }
// .vep-resend-btn {
//   background: none; border: none; cursor: pointer;
//   color: var(--vep-teal-600); font-family: var(--vep-font);
//   font-size: 0.85em; font-weight: 700;
//   display: flex; align-items: center; gap: 6px;
//   padding: 6px 12px; border-radius: var(--vep-r-full); transition: background 0.2s;
// }
// .vep-resend-btn:hover:not(:disabled) { background: var(--vep-teal-50); }
// .vep-resend-btn:disabled { opacity: 0.5; cursor: not-allowed; }
// .vep-resend-ok { color: var(--vep-success); font-weight: 700; display: flex; align-items: center; gap: 6px; animation: vep-cardIn 0.3s ease; }
// .vep-help { font-size: 0.78em; color: var(--vep-n500); text-align: center; line-height: 1.6; margin: 0; }

// .vep-result-card {
//   position: relative; z-index: 1;
//   background: var(--vep-white); border-radius: 28px;
//   box-shadow: 0 24px 64px rgba(13,61,63,0.14), 0 4px 16px rgba(0,0,0,0.06);
//   padding: 48px 40px 40px;
//   width: 100%; max-width: 460px;
//   display: flex; flex-direction: column; align-items: center; gap: 22px;
//   text-align: center;
// }
// .vep-success-anim { animation: vep-cardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }
// .vep-pending-anim { animation: vep-cardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) forwards; }

// .vep-success-circle { width: 88px; height: 88px; }
// .vep-checkmark      { width: 88px; height: 88px; }
// .vep-checkmark-circle {
//   stroke: var(--vep-success); stroke-width: 2;
//   stroke-dasharray: 166; stroke-dashoffset: 166;
//   animation: vep-stroke 0.65s cubic-bezier(0.65,0,.45,1) forwards;
// }
// .vep-checkmark-check {
//   stroke: var(--vep-success); stroke-width: 3;
//   stroke-linecap: round; stroke-linejoin: round;
//   stroke-dasharray: 48; stroke-dashoffset: 48;
//   animation: vep-stroke 0.4s cubic-bezier(0.65,0,.45,1) 0.55s forwards;
// }
// @keyframes vep-stroke { to { stroke-dashoffset: 0; } }

// .vep-countdown-chip {
//   display: inline-flex; align-items: center; gap: 10px;
//   background: var(--vep-teal-50); border: 1.5px solid #b2e8ed;
//   border-radius: var(--vep-r-full); padding: 10px 20px;
//   font-size: 0.88em; font-weight: 600; color: var(--vep-teal-700);
// }
// .vep-countdown-num {
//   font-size: 1.4em; font-weight: 900; color: var(--vep-teal-600);
//   min-width: 24px; text-align: center;
//   animation: vep-numPop 0.25s ease;
// }
// @keyframes vep-numPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.3); } }

// .vep-pending-icon {
//   position: relative; width: 80px; height: 80px;
//   display: flex; align-items: center; justify-content: center;
// }
// .vep-hourglass {
//   font-size: 36px; color: #f59e0b; position: relative; z-index: 1;
//   animation: vep-hgFlip 2.5s ease-in-out infinite;
// }
// @keyframes vep-hgFlip {
//   0%,40%  { transform: rotate(0deg); }
//   50%,90% { transform: rotate(180deg); }
//   100%    { transform: rotate(180deg); }
// }
// .vep-pending-rings { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
// .vep-pending-rings span {
//   position: absolute; border-radius: 50%;
//   border: 2px solid rgba(245,158,11,0.25);
//   animation: vep-ringPulse 2s ease-out infinite;
// }
// .vep-pending-rings span:nth-child(1) { width: 56px; height: 56px; animation-delay: 0s; }
// .vep-pending-rings span:nth-child(2) { width: 70px; height: 70px; animation-delay: 0.4s; }
// .vep-pending-rings span:nth-child(3) { width: 84px; height: 84px; animation-delay: 0.8s; }
// @keyframes vep-ringPulse {
//   0%   { transform: scale(0.8); opacity: 0.8; }
//   100% { transform: scale(1.2); opacity: 0; }
// }

// .vep-result-text { display: flex; flex-direction: column; gap: 6px; }
// .vep-result-title { font-size: 1.55em; font-weight: 900; color: var(--vep-teal-800); margin: 0; }
// .vep-result-sub   { font-size: 0.9em; color: var(--vep-n500); margin: 0; line-height: 1.6; }
// .vep-result-sub strong { color: var(--vep-teal-700); }

// .vep-steps { width: 100%; display: flex; flex-direction: column; gap: 8px; }
// .vep-step {
//   display: flex; align-items: center; gap: 12px;
//   background: var(--vep-n50); border: 1px solid var(--vep-n200);
//   border-radius: 14px; padding: 11px 14px;
//   text-align: right;
//   opacity: 0; animation: vep-stepIn 0.4s ease forwards;
// }
// @keyframes vep-stepIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
// .vep-step-num {
//   width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
//   background: linear-gradient(135deg, #267880, #3ba8b4);
//   color: #fff; font-size: 0.85em; font-weight: 800;
//   display: flex; align-items: center; justify-content: center;
// }
// .vep-step-text { font-size: 0.83em; color: var(--vep-n700); line-height: 1.5; margin: 0; }

// .vep-warn-box {
//   width: 100%; display: flex; align-items: flex-start; gap: 10px;
//   background: #fffbeb; border: 1px solid #fde68a;
//   border-radius: 14px; padding: 12px 14px;
//   font-size: 0.84em; font-weight: 600; color: #92400e;
//   text-align: right;
// }
// .vep-warn-box i { color: #f59e0b; flex-shrink: 0; font-size: 15px; margin-top: 1px; }
// .vep-warn-box strong { color: #b45309; }

// @media (max-width: 480px) {
//   .vep-card, .vep-result-card { padding: 32px 20px 28px; }
//   .vep-otp-digit { width: 42px; height: 52px; font-size: 20px; }
//   .vep-otp-wrap  { gap: 7px; }
//   .vep-title, .vep-result-title { font-size: 1.3em; }
// }
// `}</style>
//   );
// }

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