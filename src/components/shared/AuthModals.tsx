// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation } from 'wouter';
// import { useAuth } from '../../contexts/AuthContext';
// import { authApi } from '../../services';
// import ForgotPasswordModal from '../../features/auth/ForgotPasswordModal';
// import { getRedirectByRole } from '../../utils/getRedirectByRole';
// import {
//   validateEmail, validatePhone,
//   validatePassword, validateLicense, validateAddress,
// } from '../../lib/validation';
// import '../../styles/css/AuthModals.css';

// interface Props {
//   showLogin: boolean;
//   showSignup: boolean;
//   onCloseLogin: () => void;
//   onCloseSignup: () => void;
//   onSwitchToSignup: () => void;
//   onSwitchToLogin: () => void;
// }

// type Step = 'form' | 'verify';

// export default function AuthModals(props: Props) {
//   const [showForgot, setShowForgot] = useState(false);

//   // ✅ BUG #1 FIX: onForgot يغلق اللوجن أولاً ثم يفتح Forgot بشكل مستقل
//   const handleForgot = () => {
//     props.onCloseLogin();
//     setShowForgot(true);
//   };

//   return (
//     <>
//       {props.showLogin && !showForgot && (
//         <LoginModal
//           onClose={props.onCloseLogin}
//           onSwitch={props.onSwitchToSignup}
//           onForgot={handleForgot}
//         />
//       )}
//       {props.showSignup && (
//         <SignupModal onClose={props.onCloseSignup} onSwitch={props.onSwitchToLogin} />
//       )}
//       {/* ✅ BUG #1 FIX: showForgot مستقل تماماً — لا يعتمد على showLogin */}
//       {showForgot && (
//         <ForgotPasswordModal
//           onClose={() => setShowForgot(false)}
//           onSwitchToLogin={() => {
//             setShowForgot(false);
//             // نفتح اللوجن تاني بعد إغلاق Forgot
//             // الـ parent بيتحكم في showLogin عن طريق onSwitchToLogin
//           }}
//         />
//       )}
//     </>
//   );
// }

// // ─── Helper Functions ─────────────────────────────────────────────────────────

// function isPendingError(msg: string) {
//   const lower = msg.toLowerCase();
//   return (
//     lower.includes('pending') ||
//     lower.includes('قيد الانتظار') ||
//     lower.includes('انتظار الموافقة') ||
//     lower.includes('not approved') ||
//     lower.includes('not yet approved')
//   );
// }

// function isRejectedError(msg: string) {
//   const lower = msg.toLowerCase();
//   return lower.includes('reject') || lower.includes('مرفوض') || lower.includes('refused');
// }

// function isVerifyError(msg: string) {
//   const lower = msg.toLowerCase();
//   return lower.includes('verif') || lower.includes('تحقق') || lower.includes('verify') || lower.includes('not verified');
// }

// // ─── Shared UI ────────────────────────────────────────────────────────────────

// function EyeIcon({ show, toggle }: { show: boolean; toggle: () => void }) {
//   return (
//     <button type="button" onClick={toggle} className="eye-toggle" aria-label={show ? 'إخفاء' : 'إظهار'}>
//       {show ? <i className="fas fa-eye-slash" /> : <i className="fas fa-eye" />}
//     </button>
//   );
// }

// function FieldError({ msg }: { msg?: string }) {
//   if (!msg) return null;
//   return (
//     <span className="field-error">
//       <i className="fas fa-exclamation-circle" />
//       {msg}
//     </span>
//   );
// }

// function PasswordStrength({ password }: { password: string }) {
//   if (!password) return null;
//   let score = 0;
//   if (password.length >= 8) score++;
//   if (/[A-Z]/.test(password)) score++;
//   if (/[a-z]/.test(password)) score++;
//   if (/\d/.test(password)) score++;
//   if (/[^A-Za-z0-9]/.test(password)) score++;
//   const labels = ['', 'ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];
//   const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
//   return (
//     <div className="pw-strength">
//       <div className="pw-bars">
//         {[1, 2, 3, 4, 5].map(i => (
//           <div
//             key={i}
//             className="pw-bar"
//             style={{ background: i <= score ? colors[score] : 'var(--neutral-200)' }}
//           />
//         ))}
//       </div>
//       <span className="pw-label" style={{ color: colors[score] }}>{labels[score]}</span>
//     </div>
//   );
// }

// function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
//   const inputs = useRef<(HTMLInputElement | null)[]>([]);
//   const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

//   const handleChange = (i: number, v: string) => {
//     const clean = v.replace(/\D/g, '').slice(-1);
//     const arr = [...digits];
//     arr[i] = clean;
//     onChange(arr.join(''));
//     if (clean && i < 5) inputs.current[i + 1]?.focus();
//   };

//   const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Backspace') {
//       if (digits[i]) {
//         const arr = [...digits];
//         arr[i] = '';
//         onChange(arr.join(''));
//       } else if (i > 0) {
//         inputs.current[i - 1]?.focus();
//         const arr = [...digits];
//         arr[i - 1] = '';
//         onChange(arr.join(''));
//       }
//     }
//   };

//   const handlePaste = (e: React.ClipboardEvent) => {
//     const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
//     if (paste) {
//       const arr = Array.from({ length: 6 }, (_, i) => paste[i] ?? '');
//       onChange(arr.join(''));
//       inputs.current[Math.min(paste.length, 5)]?.focus();
//     }
//     e.preventDefault();
//   };

//   return (
//     <div className="otp-wrap" dir="ltr">
//       {[0, 1, 2, 3, 4, 5].map(i => (
//         <input
//           key={i}
//           ref={el => { inputs.current[i] = el; }}
//           type="text"
//           inputMode="numeric"
//           maxLength={1}
//           value={digits[i]}
//           onChange={e => handleChange(i, e.target.value)}
//           onKeyDown={e => handleKeyDown(i, e)}
//           onPaste={handlePaste}
//           className={`otp-digit${digits[i] ? ' filled' : ''}`}
//           autoComplete="off"
//         />
//       ))}
//     </div>
//   );
// }

// function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
//   const [visible, setVisible] = useState(false);
//   useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
//   const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };
//   return (
//     <div
//       className={`modal-overlay${visible ? ' open' : ''}`}
//       onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
//     >
//       <div className={`modal-box auth-modal${visible ? ' modal-in' : ''}`}>
//         <button className="modal-close" onClick={handleClose} aria-label="إغلاق">
//           <i className="fas fa-times" />
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }

// // ─── LoginModal ───────────────────────────────────────────────────────────────

// function LoginModal({
//   onClose,
//   onSwitch,
//   onForgot,
// }: {
//   onClose: () => void;
//   onSwitch: () => void;
//   onForgot: () => void;
// }) {
//   const [email, setEmail]       = useState('');
//   const [password, setPassword] = useState('');
//   const [showPw, setShowPw]     = useState(false);
//   const [errors, setErrors]     = useState<Record<string, string>>({});
//   const [serverError, setServerError] = useState('');
//   const [pendingMsg, setPendingMsg]   = useState('');
//   const [rejectedMsg, setRejectedMsg] = useState('');
//   const [loading, setLoading]         = useState(false);
//   const [step, setStep]               = useState<Step>('form');
//   const [verifyCode, setVerifyCode]   = useState('');
//   const [verifyLoading, setVerifyLoading] = useState(false);

//   const { login, user } = useAuth();
//   const [, setLocation] = useLocation();
//   const hasRedirected = useRef(false);

//   useEffect(() => {
//     if (user?.roleType && !hasRedirected.current) {
//       hasRedirected.current = true;
//       setLocation(getRedirectByRole(user.roleType));
//     }
//   }, [user, setLocation]);

//   const validate = () => {
//     const errs: Record<string, string> = {};
//     const emailErr = validateEmail(email);
//     if (emailErr) errs.email = emailErr;
//     if (!password) errs.password = 'كلمة المرور مطلوبة';
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setServerError('');
//     setPendingMsg('');
//     setRejectedMsg('');
//     if (!validate()) return;
//     setLoading(true);
//     try {
//       const res = await authApi.login({ email, password });
//       if (!res.tokens?.accessToken || !res.tokens?.refreshToken) {
//         throw new Error('بيانات التوكن غير كاملة');
//       }
//       await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
//       onClose();
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : 'خطأ في البيانات';
//       if (isVerifyError(msg)) {
//         setStep('verify');
//       } else if (isPendingError(msg)) {
//         setPendingMsg('حسابك قيد المراجعة. سيتم إعلامك بالبريد الإلكتروني عند الموافقة على طلبك.');
//       } else if (isRejectedError(msg)) {
//         setRejectedMsg('تم رفض طلب تسجيل حسابك. للاستفسار يرجى التواصل مع الإدارة.');
//       } else {
//         setServerError(msg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const code = verifyCode.replace(/\D/g, '');
//     if (code.length < 6) {
//       setServerError('أدخل رمز التحقق المكوّن من 6 أرقام');
//       return;
//     }
//     setServerError('');
//     setVerifyLoading(true);
//     try {
//       await authApi.verifyEmail({ email, code });
//       const res = await authApi.login({ email, password });
//       await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
//       onClose();
//     } catch (err: unknown) {
//       setServerError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح');
//     } finally {
//       setVerifyLoading(false);
//     }
//   };

//   const realDigitCount = verifyCode.replace(/\D/g, '').length;

//   return (
//     <ModalOverlay onClose={onClose}>
//       {step === 'form' ? (
//         <form onSubmit={handleLogin} noValidate className="auth-form">
//           <div className="auth-header">
//             <div className="auth-icon-wrap"><i className="fas fa-sign-in-alt" /></div>
//             <h2 className="modal-title">مرحبًا بعودتك</h2>
//             <p className="modal-sub">سجّل دخولك لمتابعة تبرعاتك</p>
//           </div>

//           {serverError && (
//             <div className="modal-error animate-shake">
//               <i className="fas fa-exclamation-triangle" />{serverError}
//             </div>
//           )}
//           {pendingMsg && (
//             <div className="modal-error" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>
//               <i className="fas fa-hourglass-half" />{pendingMsg}
//             </div>
//           )}
//           {rejectedMsg && (
//             <div className="modal-error" style={{ background: '#fff5f5', color: '#9b2c2c', borderColor: '#fed7d7' }}>
//               <i className="fas fa-ban" />{rejectedMsg}
//             </div>
//           )}

//           <div className="form-group">
//             <label>البريد الإلكتروني</label>
//             <div className="input-icon-wrap">
//               <i className="fas fa-envelope input-icon" />
//               <input
//                 type="email"
//                 placeholder="example@email.com"
//                 value={email}
//                 dir="ltr"
//                 onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
//                 className={errors.email ? 'input-error' : ''}
//                 autoComplete="email"
//               />
//             </div>
//             <FieldError msg={errors.email} />
//           </div>

//           <div className="form-group">
//             <div className="form-label-row">
//               <label>كلمة المرور</label>
//               <a onClick={onForgot} className="forgot-link">نسيت كلمة المرور؟</a>
//             </div>
//             <div className="input-icon-wrap">
//               <i className="fas fa-lock input-icon" />
//               <input
//                 type={showPw ? 'text' : 'password'}
//                 placeholder="كلمة المرور"
//                 value={password}
//                 onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
//                 className={errors.password ? 'input-error' : ''}
//                 autoComplete="current-password"
//               />
//               <EyeIcon show={showPw} toggle={() => setShowPw(v => !v)} />
//             </div>
//             <FieldError msg={errors.password} />
//           </div>

//           <button type="submit" className="btn-form" disabled={loading}>
//             {loading
//               ? <><i className="fas fa-spinner fa-spin" /> جاري الدخول...</>
//               : <><i className="fas fa-sign-in-alt" /> دخول</>
//             }
//           </button>
//           <p className="modal-login-link">
//             ليس لديك حساب؟ <a onClick={onSwitch} className="modal-switch-link">سجّل الآن</a>
//           </p>
//         </form>
//       ) : (
//         // ── Verify step (from login) ──
//         <form onSubmit={handleVerify} className="auth-form">
//           <div className="verify-header">
//             <span className="verify-icon-big">📧</span>
//             <h2 className="modal-title">تحقق من بريدك</h2>
//             <p className="modal-sub">
//               أرسلنا رمز تحقق إلى<br /><strong dir="ltr">{email}</strong>
//             </p>
//           </div>

//           {serverError && (
//             <div className="modal-error animate-shake">
//               <i className="fas fa-exclamation-triangle" />{serverError}
//             </div>
//           )}

//           <div className="form-group">
//             <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>رمز التحقق</label>
//             <OTPInput value={verifyCode} onChange={setVerifyCode} />
//           </div>

//           <div className="form-actions-row" style={{ marginTop: 12 }}>
//             <button
//               type="button"
//               className="btn-back"
//               onClick={() => { setStep('form'); setVerifyCode(''); setServerError(''); }}
//             >
//               <i className="fas fa-arrow-right" /> رجوع
//             </button>
//             <button
//               type="submit"
//               className="btn-form"
//               style={{ flex: 1 }}
//               disabled={verifyLoading || realDigitCount < 6}
//             >
//               {verifyLoading
//                 ? <><i className="fas fa-spinner fa-spin" /> جاري التحقق...</>
//                 : <><i className="fas fa-check-circle" /> تأكيد الرمز</>
//               }
//             </button>
//           </div>
//         </form>
//       )}
//     </ModalOverlay>
//   );
// }

// // ─── SignupModal ──────────────────────────────────────────────────────────────

// function SignupModal({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
//   const { login } = useAuth();
//   const [, setLocation] = useLocation();

//   const [currentStep, setCurrentStep] = useState(1);

//   const [form, setForm] = useState({
//     roleType: 'user' as 'user' | 'charity' | 'admin',
//     userName: '',
//     charityName: '',
//     email: '',
//     phone: '',
//     address: '',
//     password: '',
//     confirmPassword: '',
//     licenseNumber: '',
//     charityDescription: '',
//   });

//   const [showPw, setShowPw]               = useState(false);
//   const [showConfirm, setShowConfirm]     = useState(false);
//   const [errors, setErrors]               = useState<Record<string, string>>({});
//   const [serverError, setServerError]     = useState('');
//   const [loading, setLoading]             = useState(false);
//   const [verifyCode, setVerifyCode]       = useState('');
//   const [verifyLoading, setVerifyLoading] = useState(false);
//   const [success, setSuccess]             = useState('');
//   const [pendingApproval, setPendingApproval] = useState(false);

//   const set = (k: string) => (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//   ) => {
//     setForm(f => ({ ...f, [k]: e.target.value }));
//     setErrors(p => ({ ...p, [k]: '' }));
//     setServerError('');
//   };

//   const switchRole = (role: 'user' | 'charity' | 'admin') => {
//     setForm(f => ({
//       ...f,
//       roleType: role,
//       userName: '',
//       charityName: '',
//       licenseNumber: '',
//       charityDescription: '',
//     }));
//     setErrors({});
//     setServerError('');
//   };

//   const validateStep1 = () => {
//     const errs: Record<string, string> = {};
//     if (form.roleType === 'charity') {
//       if (!form.charityName.trim()) errs.charityName = 'اسم الجمعية مطلوب';
//       else if (form.charityName.trim().length < 2) errs.charityName = 'اسم الجمعية يجب أن يكون حرفين على الأقل';
//       const licErr = validateLicense(form.licenseNumber);
//       if (licErr) errs.licenseNumber = licErr;
//       if (!form.charityDescription || form.charityDescription.trim().length < 10) {
//         errs.charityDescription = 'وصف الجمعية يجب أن يكون 10 أحرف على الأقل';
//       }
//     } else {
//       if (!form.userName.trim()) errs.userName = 'الاسم مطلوب';
//       else if (form.userName.trim().length < 2) errs.userName = 'الاسم يجب أن يكون حرفين على الأقل';
//     }
//     const emailErr = validateEmail(form.email);
//     if (emailErr) errs.email = emailErr;
//     const phoneErr = validatePhone(form.phone);
//     if (phoneErr) errs.phone = phoneErr;
//     const addrErr = validateAddress(form.address);
//     if (addrErr) errs.address = addrErr;
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const validateStep2 = () => {
//     const errs: Record<string, string> = {};
//     const pwErr = validatePassword(form.password);
//     if (pwErr) errs.password = pwErr;
//     if (!form.confirmPassword) errs.confirmPassword = 'تأكيد كلمة المرور مطلوب';
//     else if (form.password !== form.confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleNext = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (validateStep1()) setCurrentStep(2);
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setServerError('');
//     if (!validateStep2()) return;
//     setLoading(true);
//     try {
//       if (form.roleType === 'charity') {
//         await authApi.register({
//           charityName: form.charityName,
//           email: form.email,
//           phone: form.phone,
//           password: form.password,
//           confirmPassword: form.confirmPassword,
//           address: form.address,
//           roleType: 'charity',
//           licenseNumber: form.licenseNumber,
//           charityDescription: form.charityDescription,
//         });
//       } else {
//         await authApi.register({
//           userName: form.userName,
//           email: form.email,
//           phone: form.phone,
//           password: form.password,
//           confirmPassword: form.confirmPassword,
//           address: form.address,
//           roleType: form.roleType,
//         });
//       }
//       setCurrentStep(3);
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى';
//       setServerError(msg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const code = verifyCode.replace(/\D/g, '');
//     if (code.length < 6) {
//       setServerError('أدخل رمز التحقق المكوّن من 6 أرقام');
//       return;
//     }
//     setServerError('');
//     setVerifyLoading(true);

//     try {
//       await authApi.verifyEmail({ email: form.email, code });
//     } catch (err: unknown) {
//       setServerError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح');
//       setVerifyLoading(false);
//       return;
//     }

//     if (form.roleType === 'charity') {
//       setPendingApproval(true);
//       setVerifyLoading(false);
//       return;
//     }

//     try {
//       const res = await authApi.login({ email: form.email, password: form.password });
//       setSuccess('🎉 تم تأكيد حسابك بنجاح! جاري تحويلك...');
//       setTimeout(() => {
//         login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
//         onClose();
//         setLocation(getRedirectByRole(res.user.roleType));
//       }, 1200);
//     } catch (err: unknown) {
//       setServerError(err instanceof Error ? err.message : 'حدث خطأ، حاول تسجيل الدخول يدوياً');
//     } finally {
//       setVerifyLoading(false);
//     }
//   };

//   const realDigitCount = verifyCode.replace(/\D/g, '').length;

//   return (
//     <ModalOverlay onClose={onClose}>
//       <div className="auth-form">

//         {currentStep < 3 && (
//           <div className="signup-steps">
//             {[1, 2].map(s => (
//               <div
//                 key={s}
//                 className={`signup-step${s < currentStep ? ' done' : s === currentStep ? ' active' : ''}`}
//               >
//                 <div className="step-circle">
//                   {s < currentStep ? <i className="fas fa-check" /> : s}
//                 </div>
//                 <span>{s === 1 ? 'البيانات الأساسية' : 'كلمة المرور'}</span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* STEP 1 */}
//         {currentStep === 1 && (
//           <form onSubmit={handleNext} noValidate>
//             <div className="auth-header">
//               <div className="auth-icon-wrap secondary"><i className="fas fa-user-plus" /></div>
//               <h2 className="modal-title">إنشاء حساب جديد</h2>
//               <p className="modal-sub">أدخل بياناتك الأساسية للبدء</p>
//             </div>

//             <div className="form-group">
//               <label>نوع الحساب</label>
//               <div className="role-picker">
//                 <button type="button" className={`role-option${form.roleType === 'user' ? ' active' : ''}`} onClick={() => switchRole('user')}>
//                   <span className="role-icon">👤</span>
//                   <span className="role-label">متبرع</span>
//                   <span className="role-desc">أريد التبرع للجمعيات</span>
//                 </button>
//                 <button type="button" className={`role-option${form.roleType === 'charity' ? ' active' : ''}`} onClick={() => switchRole('charity')}>
//                   <span className="role-icon">🏛️</span>
//                   <span className="role-label">جمعية خيرية</span>
//                   <span className="role-desc">أمثّل جمعية أو منظمة</span>
//                 </button>
//               </div>
//             </div>

//             {form.roleType !== 'charity' ? (
//               <div className="form-group">
//                 <label>الاسم بالكامل</label>
//                 <div className="input-icon-wrap">
//                   <i className="fas fa-user input-icon" />
//                   <input type="text" placeholder="أدخل اسمك الكامل" value={form.userName} onChange={set('userName')} className={errors.userName ? 'input-error' : ''} autoComplete="name" />
//                 </div>
//                 <FieldError msg={errors.userName} />
//               </div>
//             ) : (
//               <div className="form-group">
//                 <label>اسم الجمعية</label>
//                 <div className="input-icon-wrap">
//                   <i className="fas fa-building input-icon" />
//                   <input type="text" placeholder="الاسم الرسمي للجمعية" value={form.charityName} onChange={set('charityName')} className={errors.charityName ? 'input-error' : ''} />
//                 </div>
//                 <FieldError msg={errors.charityName} />
//               </div>
//             )}

//             <div className="form-group">
//               <label>البريد الإلكتروني</label>
//               <div className="input-icon-wrap">
//                 <i className="fas fa-envelope input-icon" />
//                 <input type="email" placeholder="example@email.com" value={form.email} onChange={set('email')} dir="ltr" className={errors.email ? 'input-error' : ''} autoComplete="email" />
//               </div>
//               <FieldError msg={errors.email} />
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label>رقم الهاتف</label>
//                 <div className="input-icon-wrap">
//                   <i className="fas fa-phone input-icon" />
//                   <input type="tel" placeholder="01xxxxxxxxx" value={form.phone} onChange={set('phone')} dir="ltr" className={errors.phone ? 'input-error' : ''} autoComplete="tel" />
//                 </div>
//                 <FieldError msg={errors.phone} />
//               </div>
//               <div className="form-group">
//                 <label>المنطقة / المدينة</label>
//                 <div className="input-icon-wrap">
//                   <i className="fas fa-map-marker-alt input-icon" />
//                   <input type="text" placeholder="مثال: القاهرة" value={form.address} onChange={set('address')} className={errors.address ? 'input-error' : ''} />
//                 </div>
//                 <FieldError msg={errors.address} />
//               </div>
//             </div>

//             {form.roleType === 'charity' && (
//               <>
//                 <div className="form-group">
//                   <label>رقم الترخيص <span className="label-hint"> للجمعيات المسجلة رسمياً</span></label>
//                   <div className="input-icon-wrap">
//                     <i className="fas fa-id-card input-icon" />
//                     <input type="text" placeholder="مثال: AB-CDE12-2024" value={form.licenseNumber} onChange={set('licenseNumber')} dir="ltr" className={errors.licenseNumber ? 'input-error' : ''} />
//                   </div>
//                   <FieldError msg={errors.licenseNumber} />
//                   <span className="input-hint">الصيغة: 2-5 أحرف + فاصل + 3-10 أحرف + فاصل + 2-6 أرقام</span>
//                 </div>
//                 <div className="form-group">
//                   <label>وصف الجمعية</label>
//                   <textarea placeholder="اكتب وصفاً موجزاً عن أهداف الجمعية ونشاطها..." value={form.charityDescription} onChange={set('charityDescription')} rows={3} className={errors.charityDescription ? 'input-error' : ''} style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }} />
//                   <FieldError msg={errors.charityDescription} />
//                 </div>
//                 <div style={{ padding: '10px 14px', background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
//                   ⚠️ طلبك سيُراجع من قِبل الإدارة بعد تأكيد بريدك الإلكتروني.
//                 </div>
//               </>
//             )}

//             <button type="submit" className="btn-form">
//               التالي <i className="fas fa-arrow-left" />
//             </button>
//             <p className="modal-login-link">
//               لديك حساب بالفعل؟ <a onClick={onSwitch} className="modal-switch-link">سجّل دخولك</a>
//             </p>
//           </form>
//         )}

//         {/* STEP 2 */}
//         {currentStep === 2 && (
//           <form onSubmit={handleSignup} noValidate>
//             <div className="auth-header">
//               <div className="auth-icon-wrap"><i className="fas fa-lock" /></div>
//               <h2 className="modal-title">أنشئ كلمة مرور</h2>
//               <p className="modal-sub">اختر كلمة مرور قوية لحماية حسابك</p>
//             </div>

//             {serverError && (
//               <div className="modal-error animate-shake">
//                 <i className="fas fa-exclamation-triangle" />{serverError}
//               </div>
//             )}

//             <div className="form-group">
//               <label>كلمة المرور</label>
//               <div className="input-icon-wrap">
//                 <i className="fas fa-lock input-icon" />
//                 <input type={showPw ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={set('password')} className={errors.password ? 'input-error' : ''} autoComplete="new-password" />
//                 <EyeIcon show={showPw} toggle={() => setShowPw(v => !v)} />
//               </div>
//               <PasswordStrength password={form.password} />
//               <FieldError msg={errors.password} />
//             </div>

//             <div className="form-group">
//               <label>تأكيد كلمة المرور</label>
//               <div className="input-icon-wrap">
//                 <i className="fas fa-lock input-icon" />
//                 <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} className={errors.confirmPassword ? 'input-error' : ''} autoComplete="new-password" />
//                 <EyeIcon show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
//               </div>
//               {form.confirmPassword && form.password === form.confirmPassword && (
//                 <span className="field-success"><i className="fas fa-check-circle" /> كلمتا المرور متطابقتان</span>
//               )}
//               <FieldError msg={errors.confirmPassword} />
//             </div>

//             <div className="pw-rules">
//               <p className="pw-rules-title"><i className="fas fa-info-circle" /> متطلبات كلمة المرور:</p>
//               {[
//                 { label: '8 أحرف على الأقل', ok: form.password.length >= 8 },
//                 { label: 'حرف كبير (A-Z)', ok: /[A-Z]/.test(form.password) },
//                 { label: 'حرف صغير (a-z)', ok: /[a-z]/.test(form.password) },
//                 { label: 'رقم واحد على الأقل', ok: /\d/.test(form.password) },
//               ].map(r => (
//                 <span key={r.label} className={`pw-rule${r.ok ? ' ok' : ''}`}>
//                   <i className={`fas fa-${r.ok ? 'check-circle' : 'circle'}`} />{r.label}
//                 </span>
//               ))}
//             </div>

//             <div className="form-actions-row">
//               <button type="button" className="btn-back" onClick={() => { setCurrentStep(1); setErrors({}); setServerError(''); }}>
//                 <i className="fas fa-arrow-right" /> رجوع
//               </button>
//               <button type="submit" className="btn-form" style={{ flex: 1 }} disabled={loading}>
//                 {loading
//                   ? <><i className="fas fa-spinner fa-spin" /> جاري التسجيل...</>
//                   : <><i className="fas fa-user-check" /> تسجيل الحساب</>
//                 }
//               </button>
//             </div>
//           </form>
//         )}

//         {/* STEP 3 */}
//         {currentStep === 3 && !pendingApproval && (
//           <form onSubmit={handleVerify}>
//             <div className="verify-header">
//               <span className="verify-icon-big">📧</span>
//               <h2 className="modal-title">تحقق من بريدك</h2>
//               <p className="modal-sub">
//                 أرسلنا رمز تحقق إلى<br /><strong dir="ltr">{form.email}</strong>
//               </p>
//             </div>

//             {serverError && (
//               <div className="modal-error animate-shake">
//                 <i className="fas fa-exclamation-triangle" />{serverError}
//               </div>
//             )}
//             {success && <div className="modal-success">{success}</div>}

//             <div className="form-group">
//               <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>أدخل رمز التحقق</label>
//               <OTPInput value={verifyCode} onChange={setVerifyCode} />
//             </div>

//             <div className="form-actions-row" style={{ marginTop: 12 }}>
//               <button type="button" className="btn-back" onClick={() => { setCurrentStep(2); setVerifyCode(''); setServerError(''); }}>
//                 <i className="fas fa-arrow-right" /> رجوع
//               </button>
//               <button type="submit" className="btn-form" style={{ flex: 1 }} disabled={verifyLoading || !!success || realDigitCount < 6}>
//                 {verifyLoading
//                   ? <><i className="fas fa-spinner fa-spin" /> جاري التحقق...</>
//                   : <><i className="fas fa-check-circle" /> تأكيد الحساب</>
//                 }
//               </button>
//             </div>
//           </form>
//         )}

//         {/* انتظار موافقة الأدمن */}
//         {pendingApproval && (
//           <div className="pending-approval">
//             <span className="pending-icon">⏳</span>
//             <h2>طلبك قيد المراجعة</h2>
//             <p>
//               تم تأكيد بريدك الإلكتروني بنجاح.<br />
//               طلب تسجيل جمعيتك الآن قيد مراجعة الإدارة.<br />
//               ستتلقى إشعارًا على بريدك الإلكتروني عند اتخاذ القرار.
//             </p>
//             <button className="btn-form" onClick={onClose}>
//               <i className="fas fa-check" /> حسنًا، فهمت
//             </button>
//           </div>
//         )}

//       </div>
//     </ModalOverlay>
//   );
// }
// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation } from 'wouter';
// import { useAuth } from '../../contexts/AuthContext';
// import { authApi } from '../../services';
// import ForgotPasswordModal from '../../features/auth/ForgotPasswordModal';
// import { getRedirectByRole } from '../../utils/getRedirectByRole';
// import {
//   validateName, validateEmail, validatePhone,
//   validatePassword, validateLicense, validateAddress, validateNationalId,
// } from '../../lib/validation';

// interface Props {
//   showLogin: boolean;
//   showSignup: boolean;
//   onCloseLogin: () => void;
//   onCloseSignup: () => void;
//   onSwitchToSignup: () => void;
//   onSwitchToLogin: () => void;
// }

// type Step = 'form' | 'verify';

// export default function AuthModals(props: Props) {
//   const [showForgot, setShowForgot] = useState(false);
//   return (
//     <>
//       {props.showLogin && !showForgot && (
//         <LoginModal
//           onClose={props.onCloseLogin}
//           onSwitch={props.onSwitchToSignup}
//           onForgot={() => setShowForgot(true)}
//         />
//       )}
//       {props.showSignup && (
//         <SignupModal onClose={props.onCloseSignup} onSwitch={props.onSwitchToLogin} />
//       )}
//       {showForgot && (
//         <ForgotPasswordModal
//           onClose={() => setShowForgot(false)}
//           onSwitchToLogin={() => { setShowForgot(false); }}
//         />
//       )}
//     </>
//   );
// }

// // ─── Helper Functions ─────────────────────────────────────────────────────────

// function isPendingError(msg: string) {
//   const lower = msg.toLowerCase();
//   return (
//     lower.includes('pending') ||
//     lower.includes('قيد الانتظار') ||
//     lower.includes('انتظار الموافقة') ||
//     lower.includes('not approved') ||
//     lower.includes('not yet approved')
//   );
// }

// function isRejectedError(msg: string) {
//   const lower = msg.toLowerCase();
//   return lower.includes('reject') || lower.includes('مرفوض') || lower.includes('refused');
// }

// // ─── Shared UI ────────────────────────────────────────────────────────────────

// function EyeIcon({ show, toggle }: { show: boolean; toggle: () => void }) {
//   return (
//     <button type="button" onClick={toggle} className="eye-toggle" aria-label={show ? 'إخفاء' : 'إظهار'}>
//       {show ? <i className="fas fa-eye-slash" /> : <i className="fas fa-eye" />}
//     </button>
//   );
// }

// function FieldError({ msg }: { msg?: string }) {
//   if (!msg) return null;
//   return (
//     <span className="field-error">
//       <i className="fas fa-exclamation-circle" />
//       {msg}
//     </span>
//   );
// }

// function PasswordStrength({ password }: { password: string }) {
//   if (!password) return null;
//   let score = 0;
//   if (password.length >= 8) score++;
//   if (/[A-Z]/.test(password)) score++;
//   if (/[a-z]/.test(password)) score++;
//   if (/\d/.test(password)) score++;
//   if (/[^A-Za-z0-9]/.test(password)) score++;
//   const labels = ['', 'ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];
//   const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
//   return (
//     <div className="pw-strength">
//       <div className="pw-bars">
//         {[1, 2, 3, 4, 5].map(i => (
//           <div key={i} className="pw-bar" style={{ background: i <= score ? colors[score] : 'var(--neutral-200)' }} />
//         ))}
//       </div>
//       <span className="pw-label" style={{ color: colors[score] }}>{labels[score]}</span>
//     </div>
//   );
// }

// function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
//   const inputs = useRef<(HTMLInputElement | null)[]>([]);
//   const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

//   const handleChange = (i: number, v: string) => {
//     const clean = v.replace(/\D/g, '').slice(-1);
//     const arr = [...digits];
//     arr[i] = clean;
//     onChange(arr.join(''));
//     if (clean && i < 5) inputs.current[i + 1]?.focus();
//   };

//   const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === 'Backspace') {
//       if (digits[i]) {
//         const arr = [...digits];
//         arr[i] = '';
//         onChange(arr.join(''));
//       } else if (i > 0) {
//         inputs.current[i - 1]?.focus();
//         const arr = [...digits];
//         arr[i - 1] = '';
//         onChange(arr.join(''));
//       }
//     }
//   };

//   const handlePaste = (e: React.ClipboardEvent) => {
//     const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
//     if (paste) {
//       const arr = Array.from({ length: 6 }, (_, i) => paste[i] ?? '');
//       onChange(arr.join(''));
//       inputs.current[Math.min(paste.length, 5)]?.focus();
//     }
//     e.preventDefault();
//   };

//   return (
//     <div className="otp-wrap" dir="ltr">
//       {[0, 1, 2, 3, 4, 5].map(i => (
//         <input
//           key={i}
//           ref={el => { inputs.current[i] = el; }}
//           type="text"
//           inputMode="numeric"
//           maxLength={1}
//           value={digits[i]}
//           onChange={e => handleChange(i, e.target.value)}
//           onKeyDown={e => handleKeyDown(i, e)}
//           onPaste={handlePaste}
//           className={`otp-digit${digits[i] ? ' filled' : ''}`}
//           style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
//           autoComplete="off"
//         />
//       ))}
//     </div>
//   );
// }

// function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
//   const [visible, setVisible] = useState(false);
//   useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
//   const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };
//   return (
//     <div
//       className={`modal-overlay${visible ? ' open' : ''}`}
//       onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
//     >
//       <div className={`modal-box auth-modal${visible ? ' modal-in' : ''}`}>
//         <button className="modal-close" onClick={handleClose} aria-label="إغلاق">
//           <i className="fas fa-times" />
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }

// // ─── LoginModal ───────────────────────────────────────────────────────────────

// function LoginModal({
//   onClose,
//   onSwitch,
//   onForgot,
// }: {
//   onClose: () => void;
//   onSwitch: () => void;
//   onForgot: () => void;
// }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPw, setShowPw] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [serverError, setServerError] = useState('');
//   const [pendingMsg, setPendingMsg] = useState('');
//   const [rejectedMsg, setRejectedMsg] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [step, setStep] = useState<Step>('form');
//   const [verifyCode, setVerifyCode] = useState('');
//   const [verifyLoading, setVerifyLoading] = useState(false);

//   const { login, user } = useAuth();
//   const [, setLocation] = useLocation();
//   const hasRedirected = useRef(false);

//   useEffect(() => {
//     if (user?.roleType && !hasRedirected.current) {
//       hasRedirected.current = true;
//       setLocation(getRedirectByRole(user.roleType));
//     }
//   }, [user, setLocation]);

//   const validate = () => {
//     const errs: Record<string, string> = {};
//     const emailErr = validateEmail(email);
//     if (emailErr) errs.email = emailErr;
//     if (!password) errs.password = 'كلمة المرور مطلوبة';
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setServerError(''); setPendingMsg(''); setRejectedMsg('');
//     if (!validate()) return;
//     setLoading(true);
//     try {
//       const res = await authApi.login({ email, password });
//       if (!res.tokens?.accessToken || !res.tokens?.refreshToken) {
//         throw new Error('بيانات التوكن غير كاملة');
//       }
//       await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
//       onClose();
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : 'خطأ في البيانات';
//       if (msg.toLowerCase().includes('verif') || msg.includes('تحقق') || msg.includes('verify')) {
//         setStep('verify');
//       } else if (isPendingError(msg)) {
//         setPendingMsg('حسابك قيد المراجعة. سيتم إعلامك بالبريد الإلكتروني عند الموافقة على طلبك.');
//       } else if (isRejectedError(msg)) {
//         setRejectedMsg('تم رفض طلب تسجيل حسابك. للاستفسار يرجى التواصل مع الإدارة.');
//       } else {
//         setServerError(msg);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const realDigitCount = verifyCode.replace(/[^0-9]/g, '').length;

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const realDigits = verifyCode.replace(/[^0-9]/g, '');
//     if (realDigits.length < 6) { setServerError('أدخل رمز التحقق المكوّن من 6 أرقام'); return; }
//     setServerError('');
//     setVerifyLoading(true);
//     try {
//       await authApi.verifyEmail({ email, code: realDigits });
//       setStep('form');
//     } catch (err: unknown) {
//       setServerError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح');
//     } finally {
//       setVerifyLoading(false);
//     }
//   };

//   return (
//     <ModalOverlay onClose={onClose}>
//       {step === 'form' ? (
//         <form onSubmit={handleLogin} noValidate className="auth-form">
//           <div className="auth-header">
//             <div className="auth-icon-wrap"><i className="fas fa-sign-in-alt" /></div>
//             <h2 className="modal-title">مرحبًا بعودتك</h2>
//             <p className="modal-sub">سجّل دخولك لمتابعة تبرعاتك</p>
//           </div>

//           {serverError && (
//             <div className="modal-error animate-shake">
//               <i className="fas fa-exclamation-triangle" />{serverError}
//             </div>
//           )}
//           {pendingMsg && (
//             <div className="modal-error" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>
//               <i className="fas fa-hourglass-half" style={{ marginLeft: 6 }} />{pendingMsg}
//             </div>
//           )}
//           {rejectedMsg && (
//             <div className="modal-error" style={{ background: '#fff5f5', color: '#9b2c2c', borderColor: '#fed7d7' }}>
//               <i className="fas fa-ban" style={{ marginLeft: 6 }} />{rejectedMsg}
//             </div>
//           )}

//           <div className="form-group">
//             <label>البريد الإلكتروني</label>
//             <div className="input-icon-wrap">
//               <i className="fas fa-envelope input-icon" />
//               <input
//                 type="email"
//                 placeholder="example@email.com"
//                 value={email}
//                 dir="ltr"
//                 onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
//                 className={errors.email ? 'input-error' : ''}
//                 autoComplete="email"
//               />
//             </div>
//             <FieldError msg={errors.email} />
//           </div>

//           <div className="form-group">
//             <div className="form-label-row">
//               <label>كلمة المرور</label>
//               <a onClick={onForgot} className="forgot-link">نسيت كلمة المرور؟</a>
//             </div>
//             <div className="input-icon-wrap">
//               <i className="fas fa-lock input-icon" />
//               <input
//                 type={showPw ? 'text' : 'password'}
//                 placeholder="كلمة المرور"
//                 value={password}
//                 onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
//                 className={errors.password ? 'input-error' : ''}
//                 style={{ paddingLeft: 40 }}
//                 autoComplete="current-password"
//               />
//               <EyeIcon show={showPw} toggle={() => setShowPw(v => !v)} />
//             </div>
//             <FieldError msg={errors.password} />
//           </div>

//           <button type="submit" className="btn-form" disabled={loading}>
//             {loading
//               ? <><i className="fas fa-spinner fa-spin" /> جاري الدخول...</>
//               : <><i className="fas fa-sign-in-alt" /> دخول</>
//             }
//           </button>
//           <p className="modal-login-link">
//             ليس لديك حساب؟ <a onClick={onSwitch} className="modal-switch-link">سجّل الآن</a>
//           </p>
//         </form>
//       ) : (
//         <form onSubmit={handleVerify} className="auth-form">
//           <div className="verify-header">
//             <div className="verify-icon-big">📧</div>
//             <h2 className="modal-title">تحقق من بريدك</h2>
//             <p className="modal-sub">أرسلنا رمز تحقق إلى<br /><strong dir="ltr">{email}</strong></p>
//           </div>
//           {serverError && (
//             <div className="modal-error animate-shake">
//               <i className="fas fa-exclamation-triangle" />{serverError}
//             </div>
//           )}
//           <div className="form-group">
//             <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>رمز التحقق</label>
//             <OTPInput value={verifyCode} onChange={setVerifyCode} />
//           </div>
//           <button type="submit" className="btn-form" disabled={verifyLoading || realDigitCount < 6}>
//             {verifyLoading
//               ? <><i className="fas fa-spinner fa-spin" /> جاري التحقق...</>
//               : <><i className="fas fa-check-circle" /> تأكيد الرمز</>
//             }
//           </button>
//           <p className="modal-login-link">
//             <a onClick={() => setStep('form')} className="modal-switch-link">
//               <i className="fas fa-arrow-right" style={{ fontSize: 12 }} /> العودة لتسجيل الدخول
//             </a>
//           </p>
//         </form>
//       )}
//     </ModalOverlay>
//   );
// }

// // ─── SignupModal ──────────────────────────────────────────────────────────────

// function SignupModal({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
//   const { login } = useAuth();
//   const [, setLocation] = useLocation();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [form, setForm] = useState({
//     userName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: '',
//     address: '',
//     roleType: 'user' as 'user' | 'charity' | 'admin',
//     licenseNumber: '',
//     charityDescription: '',
//     nationalID: '', // ✅ capital D — يطابق الـ API
//   });
//   const [showPw, setShowPw] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [serverError, setServerError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [verifyCode, setVerifyCode] = useState('');
//   const [verifyLoading, setVerifyLoading] = useState(false);
//   const [success, setSuccess] = useState('');
//   const [pendingApproval, setPendingApproval] = useState(false);

//   const set = (k: string) => (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
//   ) => {
//     setForm(f => ({ ...f, [k]: e.target.value }));
//     setErrors(p => ({ ...p, [k]: '' }));
//     setServerError('');
//   };

//   const validateStep1 = () => {
//     const errs: Record<string, string> = {};
//     const nameLabel = form.roleType === 'charity' ? 'اسم الجمعية' : 'الاسم';
//     const nameErr = validateName(form.userName);
//     if (nameErr) errs.userName = nameErr.replace('الاسم', nameLabel);
//     const emailErr = validateEmail(form.email);
//     if (emailErr) errs.email = emailErr;
//     const phoneErr = validatePhone(form.phone);
//     if (phoneErr) errs.phone = phoneErr;
//     const addrErr = validateAddress(form.address);
//     if (addrErr) errs.address = addrErr;
//     if (form.roleType === 'charity') {
//       const licErr = validateLicense(form.licenseNumber);
//       if (licErr) errs.licenseNumber = licErr;
//       if (!form.charityDescription || form.charityDescription.trim().length < 10) {
//         errs.charityDescription = 'وصف الجمعية يجب أن يكون 10 أحرف على الأقل';
//       }
//     }
//     if (form.roleType === 'admin') {
//       const natErr = validateNationalId(form.nationalID);
//       if (natErr) errs.nationalID = natErr;
//     }
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const validateStep2 = () => {
//     const errs: Record<string, string> = {};
//     const pwErr = validatePassword(form.password);
//     if (pwErr) errs.password = pwErr;
//     if (!form.confirmPassword) errs.confirmPassword = 'تأكيد كلمة المرور مطلوب';
//     else if (form.password !== form.confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
//     setErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleNext = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (validateStep1()) setCurrentStep(2);
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setServerError('');
//     if (!validateStep2()) return;
//     setLoading(true);
//     try {
//       // ✅ بنبني الـ payload الصح حسب نوع الحساب
//       if (form.roleType === 'charity') {
//         await authApi.register({
//           charityName: form.userName,
//           email: form.email,
//           phone: form.phone,
//           password: form.password,
//           confirmPassword: form.confirmPassword,
//           address: form.address,
//           roleType: 'charity',
//           licenseNumber: form.licenseNumber,
//           charityDescription: form.charityDescription,
//         });
//       } else if (form.roleType === 'admin') {
//         await authApi.register({
//           userName: form.userName,
//           email: form.email,
//           phone: form.phone,
//           password: form.password,
//           confirmPassword: form.confirmPassword,
//           address: form.address,
//           roleType: 'admin',
//           nationalID: form.nationalID, // ✅ capital D
//         });
//       } else {
//         await authApi.register({
//           userName: form.userName,
//           email: form.email,
//           phone: form.phone,
//           password: form.password,
//           confirmPassword: form.confirmPassword,
//           address: form.address,
//           roleType: 'user',
//         });
//       }
//       setCurrentStep(3);
//     } catch (err: unknown) {
//       setServerError(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const realDigitCount = verifyCode.replace(/[^0-9]/g, '').length;

//   const handleVerify = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const realDigits = verifyCode.replace(/[^0-9]/g, '');
//     if (realDigits.length < 6) { setServerError('أدخل رمز التحقق المكوّن من 6 أرقام'); return; }
//     setServerError('');
//     setVerifyLoading(true);
//     try {
//       await authApi.verifyEmail({ email: form.email, code: realDigits });
//     } catch (err: unknown) {
//       setServerError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح');
//       setVerifyLoading(false);
//       return;
//     }

//     // الجمعيات تنتظر موافقة الأدمن
//     if (form.roleType === 'charity') {
//       setPendingApproval(true);
//       setVerifyLoading(false);
//       return;
//     }

//     try {
//       const res = await authApi.login({ email: form.email, password: form.password });
//       setSuccess('🎉 تم تأكيد حسابك بنجاح! جاري تحويلك...');
//       setTimeout(() => {
//         login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
//         onClose();
//         setLocation(getRedirectByRole(res.user.roleType));
//       }, 1200);
//     } catch (err: unknown) {
//       setServerError(err instanceof Error ? err.message : 'حدث خطأ، حاول تسجيل الدخول يدوياً');
//     } finally {
//       setVerifyLoading(false);
//     }
//   };

//   return (
//     <ModalOverlay onClose={onClose}>
//       <div className="auth-form">
//         {currentStep < 3 && (
//           <div className="signup-steps">
//             {[1, 2].map(s => (
//               <div
//                 key={s}
//                 className={`signup-step${s < currentStep ? ' done' : s === currentStep ? ' active' : ''}`}
//               >
//                 <div className="step-circle">
//                   {s < currentStep ? <i className="fas fa-check" /> : s}
//                 </div>
//                 <span>{s === 1 ? 'البيانات الأساسية' : 'كلمة المرور'}</span>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* ── Step 1 ── */}
//         {currentStep === 1 && (
//           <form onSubmit={handleNext} noValidate>
//             <div className="auth-header">
//               <div className="auth-icon-wrap secondary"><i className="fas fa-user-plus" /></div>
//               <h2 className="modal-title">إنشاء حساب جديد</h2>
//               <p className="modal-sub">أدخل بياناتك الأساسية للبدء</p>
//             </div>

//             <div className="form-group">
//               <label>نوع الحساب</label>
//               <div className="role-picker">
//                 <button
//                   type="button"
//                   className={`role-option${form.roleType === 'user' ? ' active' : ''}`}
//                   onClick={() => { setForm(f => ({ ...f, roleType: 'user', licenseNumber: '', charityDescription: '', nationalID: '' })); setErrors({}); }}
//                 >
//                   <span className="role-icon">👤</span>
//                   <span className="role-label">متبرع</span>
//                   <span className="role-desc">أريد التبرع للجمعيات</span>
//                 </button>
//                 <button
//                   type="button"
//                   className={`role-option${form.roleType === 'charity' ? ' active' : ''}`}
//                   onClick={() => { setForm(f => ({ ...f, roleType: 'charity', nationalID: '' })); setErrors({}); }}
//                 >
//                   <span className="role-icon">🏛️</span>
//                   <span className="role-label">جمعية خيرية</span>
//                   <span className="role-desc">أمثّل جمعية أو منظمة</span>
//                 </button>
//                 <button
//                   type="button"
//                   className={`role-option${form.roleType === 'admin' ? ' active' : ''}`}
//                   onClick={() => { setForm(f => ({ ...f, roleType: 'admin', licenseNumber: '', charityDescription: '' })); setErrors({}); }}
//                 >
//                   <span className="role-icon">🛡️</span>
//                   <span className="role-label">مدير</span>
//                   <span className="role-desc">إدارة المنصة والإشراف</span>
//                 </button>
//               </div>
//             </div>

//             <div className="form-group">
//               <label>{form.roleType === 'charity' ? 'اسم الجمعية' : 'الاسم بالكامل'}</label>
//               <div className="input-icon-wrap">
//                 <i className="fas fa-user input-icon" />
//                 <input
//                   type="text"
//                   placeholder={form.roleType === 'charity' ? 'اسم الجمعية الرسمي' : 'أدخل اسمك الكامل'}
//                   value={form.userName}
//                   onChange={set('userName')}
//                   className={errors.userName ? 'input-error' : ''}
//                   autoComplete="name"
//                 />
//               </div>
//               <FieldError msg={errors.userName} />
//             </div>

//             <div className="form-group">
//               <label>البريد الإلكتروني</label>
//               <div className="input-icon-wrap">
//                 <i className="fas fa-envelope input-icon" />
//                 <input
//                   type="email"
//                   placeholder="example@email.com"
//                   value={form.email}
//                   onChange={set('email')}
//                   dir="ltr"
//                   className={errors.email ? 'input-error' : ''}
//                   autoComplete="email"
//                 />
//               </div>
//               <FieldError msg={errors.email} />
//             </div>

//             <div className="form-row">
//               <div className="form-group">
//                 <label>رقم الهاتف</label>
//                 <div className="input-icon-wrap">
//                   <i className="fas fa-phone input-icon" />
//                   <input
//                     type="tel"
//                     placeholder="01xxxxxxxxx"
//                     value={form.phone}
//                     onChange={set('phone')}
//                     dir="ltr"
//                     className={errors.phone ? 'input-error' : ''}
//                     autoComplete="tel"
//                   />
//                 </div>
//                 <FieldError msg={errors.phone} />
//               </div>
//               <div className="form-group">
//                 <label>المنطقة / المدينة</label>
//                 <div className="input-icon-wrap">
//                   <i className="fas fa-map-marker-alt input-icon" />
//                   <input
//                     type="text"
//                     placeholder="مثال: القاهرة"
//                     value={form.address}
//                     onChange={set('address')}
//                     className={errors.address ? 'input-error' : ''}
//                   />
//                 </div>
//                 <FieldError msg={errors.address} />
//               </div>
//             </div>

//             {/* Charity fields */}
//             {form.roleType === 'charity' && (
//               <>
//                 <div className="form-group">
//                   <label>رقم الترخيص <span className="label-hint">للجمعيات المسجلة رسمياً</span></label>
//                   <div className="input-icon-wrap">
//                     <i className="fas fa-id-card input-icon" />
//                     <input
//                       type="text"
//                       placeholder="مثال: AB-CDE12-2024"
//                       value={form.licenseNumber}
//                       onChange={set('licenseNumber')}
//                       dir="ltr"
//                       className={errors.licenseNumber ? 'input-error' : ''}
//                     />
//                   </div>
//                   <FieldError msg={errors.licenseNumber} />
//                   <span className="input-hint">الصيغة: 2-5 أحرف + فاصل + 3-10 أحرف + فاصل + 2-6 أرقام</span>
//                 </div>
//                 <div className="form-group">
//                   <label>وصف الجمعية</label>
//                   <textarea
//                     placeholder="اكتب وصفاً موجزاً عن أهداف الجمعية ونشاطها..."
//                     value={form.charityDescription}
//                     onChange={set('charityDescription')}
//                     rows={3}
//                     className={errors.charityDescription ? 'input-error' : ''}
//                     style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
//                   />
//                   <FieldError msg={errors.charityDescription} />
//                 </div>
//                 <div style={{ padding: '10px 14px', background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
//                   ⚠️ طلبك سيُراجع من قِبل الإدارة قبل تفعيل الحساب. ستصلك رسالة بريد إلكتروني عند اتخاذ القرار.
//                 </div>
//               </>
//             )}

//             {/* Admin field */}
//             {form.roleType === 'admin' && (
//               <div className="form-group">
//                 <label>الرقم القومي <span className="label-hint">مطلوب للتحقق من هوية المدير</span></label>
//                 <div className="input-icon-wrap">
//                   <i className="fas fa-fingerprint input-icon" />
//                   <input
//                     type="text"
//                     placeholder="14 رقم"
//                     value={form.nationalID}
//                     onChange={set('nationalID')} // ✅ capital D
//                     dir="ltr"
//                     maxLength={14}
//                     className={errors.nationalID ? 'input-error' : ''}
//                   />
//                 </div>
//                 <FieldError msg={errors.nationalID} />
//                 <span className="input-hint">أدخل رقمك القومي المكوّن من 14 رقم بالضبط</span>
//               </div>
//             )}

//             <button type="submit" className="btn-form">
//               التالي <i className="fas fa-arrow-left" />
//             </button>
//             <p className="modal-login-link">
//               لديك حساب بالفعل؟ <a onClick={onSwitch} className="modal-switch-link">سجّل دخولك</a>
//             </p>
//           </form>
//         )}

//         {/* ── Step 2 ── */}
//         {currentStep === 2 && (
//           <form onSubmit={handleSignup} noValidate>
//             <div className="auth-header">
//               <div className="auth-icon-wrap"><i className="fas fa-lock" /></div>
//               <h2 className="modal-title">أنشئ كلمة مرور</h2>
//               <p className="modal-sub">اختر كلمة مرور قوية لحماية حسابك</p>
//             </div>
//             {serverError && (
//               <div className="modal-error animate-shake">
//                 <i className="fas fa-exclamation-triangle" />{serverError}
//               </div>
//             )}
//             <div className="form-group">
//               <label>كلمة المرور</label>
//               <div className="input-icon-wrap">
//                 <i className="fas fa-lock input-icon" />
//                 <input
//                   type={showPw ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   value={form.password}
//                   onChange={set('password')}
//                   className={errors.password ? 'input-error' : ''}
//                   style={{ paddingLeft: 40 }}
//                   autoComplete="new-password"
//                 />
//                 <EyeIcon show={showPw} toggle={() => setShowPw(v => !v)} />
//               </div>
//               <PasswordStrength password={form.password} />
//               <FieldError msg={errors.password} />
//             </div>
//             <div className="form-group">
//               <label>تأكيد كلمة المرور</label>
//               <div className="input-icon-wrap">
//                 <i className="fas fa-lock input-icon" />
//                 <input
//                   type={showConfirm ? 'text' : 'password'}
//                   placeholder="••••••••"
//                   value={form.confirmPassword}
//                   onChange={set('confirmPassword')}
//                   className={errors.confirmPassword ? 'input-error' : ''}
//                   style={{ paddingLeft: 40 }}
//                   autoComplete="new-password"
//                 />
//                 <EyeIcon show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
//               </div>
//               {form.confirmPassword && form.password === form.confirmPassword && (
//                 <span className="field-success">
//                   <i className="fas fa-check-circle" /> كلمتا المرور متطابقتان
//                 </span>
//               )}
//               <FieldError msg={errors.confirmPassword} />
//             </div>
//             <div className="pw-rules">
//               <p className="pw-rules-title"><i className="fas fa-info-circle" /> متطلبات كلمة المرور:</p>
//               {[
//                 { label: '8 أحرف على الأقل', ok: form.password.length >= 8 },
//                 { label: 'حرف كبير (A-Z)', ok: /[A-Z]/.test(form.password) },
//                 { label: 'حرف صغير (a-z)', ok: /[a-z]/.test(form.password) },
//                 { label: 'رقم واحد على الأقل', ok: /\d/.test(form.password) },
//               ].map(r => (
//                 <span key={r.label} className={`pw-rule${r.ok ? ' ok' : ''}`}>
//                   <i className={`fas fa-${r.ok ? 'check-circle' : 'circle'}`} />{r.label}
//                 </span>
//               ))}
//             </div>
//             <div className="form-actions-row">
//               <button
//                 type="button"
//                 className="btn-back"
//                 onClick={() => { setCurrentStep(1); setErrors({}); setServerError(''); }}
//               >
//                 <i className="fas fa-arrow-right" /> رجوع
//               </button>
//               <button type="submit" className="btn-form" style={{ flex: 1 }} disabled={loading}>
//                 {loading
//                   ? <><i className="fas fa-spinner fa-spin" /> جاري التسجيل...</>
//                   : <><i className="fas fa-user-check" /> تسجيل الحساب</>
//                 }
//               </button>
//             </div>
//           </form>
//         )}

//         {/* ── Step 3: Verify ── */}
//         {currentStep === 3 && !pendingApproval && (
//           <form onSubmit={handleVerify}>
//             <div className="verify-header">
//               <div className="verify-icon-big">📧</div>
//               <h2 className="modal-title">تحقق من بريدك</h2>
//               <p className="modal-sub">
//                 أرسلنا رمز تحقق إلى<br /><strong dir="ltr">{form.email}</strong>
//               </p>
//             </div>
//             {serverError && (
//               <div className="modal-error animate-shake">
//                 <i className="fas fa-exclamation-triangle" />{serverError}
//               </div>
//             )}
//             {success && <div className="modal-success">{success}</div>}
//             <div className="form-group">
//               <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>
//                 أدخل رمز التحقق
//               </label>
//               <OTPInput value={verifyCode} onChange={setVerifyCode} />
//             </div>
//             <button
//               type="submit"
//               className="btn-form"
//               disabled={verifyLoading || !!success || realDigitCount < 6}
//             >
//               {verifyLoading
//                 ? <><i className="fas fa-spinner fa-spin" /> جاري التحقق...</>
//                 : <><i className="fas fa-check-circle" /> تأكيد الحساب</>
//               }
//             </button>
//             <p className="modal-login-link">
//               <a
//                 onClick={() => { setCurrentStep(2); setVerifyCode(''); setServerError(''); }}
//                 className="modal-switch-link"
//               >
//                 <i className="fas fa-arrow-right" style={{ fontSize: 12 }} /> العودة للتسجيل
//               </a>
//             </p>
//           </form>
//         )}

//         {/* ── Pending Approval ── */}
//         {pendingApproval && (
//           <div style={{ textAlign: 'center', padding: '32px 16px' }}>
//             <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
//             <h2 className="modal-title">طلبك قيد المراجعة</h2>
//             <p style={{ fontSize: 15, color: 'var(--neutral-600)', lineHeight: 1.8, marginBottom: 24 }}>
//               تم تأكيد بريدك الإلكتروني بنجاح.<br />
//               طلب تسجيل جمعيتك الآن قيد مراجعة الإدارة.<br />
//               ستتلقى إشعارًا على بريدك الإلكتروني عند اتخاذ القرار.
//             </p>
//             <button className="btn-form" onClick={onClose}>
//               <i className="fas fa-check" /> حسنًا، فهمت
//             </button>
//           </div>
//         )}
//       </div>
//     </ModalOverlay>
//   );
// }

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../services';
import ForgotPasswordModal from '../../features/auth/ForgotPasswordModal';
import { getRedirectByRole } from '../../utils/getRedirectByRole';
import {
  validateName, validateEmail, validatePhone,
  validatePassword, validateLicense, validateAddress, validateNationalId,
} from '../../lib/validation';

interface Props {
  showLogin: boolean;
  showSignup: boolean;
  onCloseLogin: () => void;
  onCloseSignup: () => void;
  onSwitchToSignup: () => void;
  onSwitchToLogin: () => void;
}

type Step = 'form' | 'verify';

export default function AuthModals(props: Props) {
  const [showForgot, setShowForgot] = useState(false);
  return (
    <>
      {props.showLogin && !showForgot && (
        <LoginModal
          onClose={props.onCloseLogin}
          onSwitch={props.onSwitchToSignup}
          onForgot={() => setShowForgot(true)}
        />
      )}
      {props.showSignup && (
        <SignupModal onClose={props.onCloseSignup} onSwitch={props.onSwitchToLogin} />
      )}
      {showForgot && (
        <ForgotPasswordModal
          onClose={() => setShowForgot(false)}
          onSwitchToLogin={() => { setShowForgot(false); }}
        />
      )}
    </>
  );
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function isPendingError(msg: string) {
  const lower = msg.toLowerCase();
  return (
    lower.includes('pending') ||
    lower.includes('قيد الانتظار') ||
    lower.includes('انتظار الموافقة') ||
    lower.includes('not approved') ||
    lower.includes('not yet approved')
  );
}

function isRejectedError(msg: string) {
  const lower = msg.toLowerCase();
  return lower.includes('reject') || lower.includes('مرفوض') || lower.includes('refused');
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function EyeIcon({ show, toggle }: { show: boolean; toggle: () => void }) {
  return (
    <button type="button" onClick={toggle} className="eye-toggle" aria-label={show ? 'إخفاء' : 'إظهار'}>
      {show ? <i className="fas fa-eye-slash" /> : <i className="fas fa-eye" />}
    </button>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <span className="field-error">
      <i className="fas fa-exclamation-circle" />
      {msg}
    </span>
  );
}

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ['', 'ضعيفة جداً', 'ضعيفة', 'متوسطة', 'قوية', 'قوية جداً'];
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="pw-bar" style={{ background: i <= score ? colors[score] : 'var(--neutral-200)' }} />
        ))}
      </div>
      <span className="pw-label" style={{ color: colors[score] }}>{labels[score]}</span>
    </div>
  );
}

function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? '');

  const handleChange = (i: number, v: string) => {
    const clean = v.replace(/\D/g, '').slice(-1);
    const arr = [...digits];
    arr[i] = clean;
    onChange(arr.join(''));
    if (clean && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const arr = [...digits];
        arr[i] = '';
        onChange(arr.join(''));
      } else if (i > 0) {
        inputs.current[i - 1]?.focus();
        const arr = [...digits];
        arr[i - 1] = '';
        onChange(arr.join(''));
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste) {
      const arr = Array.from({ length: 6 }, (_, i) => paste[i] ?? '');
      onChange(arr.join(''));
      inputs.current[Math.min(paste.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="otp-wrap" dir="ltr">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i]}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={`otp-digit${digits[i] ? ' filled' : ''}`}
          style={{ color: '#111827', WebkitTextFillColor: '#111827' }}
          autoComplete="off"
        />
      ))}
    </div>
  );
}

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  const handleClose = () => { setVisible(false); setTimeout(onClose, 280); };
  return (
    <div
      className={`modal-overlay${visible ? ' open' : ''}`}
      onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className={`modal-box auth-modal${visible ? ' modal-in' : ''}`}>
        <button className="modal-close" onClick={handleClose} aria-label="إغلاق">
          <i className="fas fa-times" />
        </button>
        {children}
      </div>
    </div>
  );
}

// ─── LoginModal ───────────────────────────────────────────────────────────────

function LoginModal({
  onClose,
  onSwitch,
  onForgot,
}: {
  onClose: () => void;
  onSwitch: () => void;
  onForgot: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [pendingMsg, setPendingMsg] = useState('');
  const [rejectedMsg, setRejectedMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (user?.roleType && !hasRedirected.current) {
      hasRedirected.current = true;
      setLocation(getRedirectByRole(user.roleType));
    }
  }, [user, setLocation]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    if (!password) errs.password = 'كلمة المرور مطلوبة';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(''); setPendingMsg(''); setRejectedMsg('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (!res.tokens?.accessToken || !res.tokens?.refreshToken) {
        throw new Error('بيانات التوكن غير كاملة');
      }
      await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ في البيانات';
      if (msg.toLowerCase().includes('verif') || msg.includes('تحقق') || msg.includes('verify')) {
        setStep('verify');
      } else if (isPendingError(msg)) {
        setPendingMsg('حسابك قيد المراجعة. سيتم إعلامك بالبريد الإلكتروني عند الموافقة على طلبك.');
      } else if (isRejectedError(msg)) {
        setRejectedMsg('تم رفض طلب تسجيل حسابك. للاستفسار يرجى التواصل مع الإدارة.');
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const realDigitCount = verifyCode.replace(/[^0-9]/g, '').length;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const realDigits = verifyCode.replace(/[^0-9]/g, '');
    if (realDigits.length < 6) { setServerError('أدخل رمز التحقق المكوّن من 6 أرقام'); return; }
    setServerError('');
    setVerifyLoading(true);
    try {
      await authApi.verifyEmail({ email, code: realDigits });
      setStep('form');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      {step === 'form' ? (
        <form onSubmit={handleLogin} noValidate className="auth-form">
          <div className="auth-header">
            <div className="auth-icon-wrap"><i className="fas fa-sign-in-alt" /></div>
            <h2 className="modal-title">مرحبًا بعودتك</h2>
            <p className="modal-sub">سجّل دخولك لمتابعة تبرعاتك</p>
          </div>

          {serverError && (
            <div className="modal-error animate-shake">
              <i className="fas fa-exclamation-triangle" />{serverError}
            </div>
          )}
          {pendingMsg && (
            <div className="modal-error" style={{ background: '#fffbeb', color: '#92400e', borderColor: '#fde68a' }}>
              <i className="fas fa-hourglass-half" style={{ marginLeft: 6 }} />{pendingMsg}
            </div>
          )}
          {rejectedMsg && (
            <div className="modal-error" style={{ background: '#fff5f5', color: '#9b2c2c', borderColor: '#fed7d7' }}>
              <i className="fas fa-ban" style={{ marginLeft: 6 }} />{rejectedMsg}
            </div>
          )}

          <div className="form-group">
            <label>البريد الإلكتروني</label>
            <div className="input-icon-wrap">
              <i className="fas fa-envelope input-icon" />
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                dir="ltr"
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                className={errors.email ? 'input-error' : ''}
                autoComplete="email"
              />
            </div>
            <FieldError msg={errors.email} />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label>كلمة المرور</label>
              <a onClick={onForgot} className="forgot-link">نسيت كلمة المرور؟</a>
            </div>
            <div className="input-icon-wrap">
              <i className="fas fa-lock input-icon" />
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }}
                className={errors.password ? 'input-error' : ''}
                style={{ paddingLeft: 40 }}
                autoComplete="current-password"
              />
              <EyeIcon show={showPw} toggle={() => setShowPw(v => !v)} />
            </div>
            <FieldError msg={errors.password} />
          </div>

          <button type="submit" className="btn-form" disabled={loading}>
            {loading
              ? <><i className="fas fa-spinner fa-spin" /> جاري الدخول...</>
              : <><i className="fas fa-sign-in-alt" /> دخول</>
            }
          </button>
          <p className="modal-login-link">
            ليس لديك حساب؟ <a onClick={onSwitch} className="modal-switch-link">سجّل الآن</a>
          </p>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="auth-form">
          <div className="verify-header">
            <div className="verify-icon-big">📧</div>
            <h2 className="modal-title">تحقق من بريدك</h2>
            <p className="modal-sub">أرسلنا رمز تحقق إلى<br /><strong dir="ltr">{email}</strong></p>
          </div>
          {serverError && (
            <div className="modal-error animate-shake">
              <i className="fas fa-exclamation-triangle" />{serverError}
            </div>
          )}
          <div className="form-group">
            <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>رمز التحقق</label>
            <OTPInput value={verifyCode} onChange={setVerifyCode} />
          </div>
          <button type="submit" className="btn-form" disabled={verifyLoading || realDigitCount < 6}>
            {verifyLoading
              ? <><i className="fas fa-spinner fa-spin" /> جاري التحقق...</>
              : <><i className="fas fa-check-circle" /> تأكيد الرمز</>
            }
          </button>
          <p className="modal-login-link">
            <a onClick={() => setStep('form')} className="modal-switch-link">
              <i className="fas fa-arrow-right" style={{ fontSize: 12 }} /> العودة لتسجيل الدخول
            </a>
          </p>
        </form>
      )}
    </ModalOverlay>
  );
}

// ─── SignupModal ──────────────────────────────────────────────────────────────

function SignupModal({ onClose, onSwitch }: { onClose: () => void; onSwitch: () => void }) {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    userName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    roleType: 'user' as 'user' | 'charity' | 'admin',
    licenseNumber: '',
    charityDescription: '',
    nationalID: '', // ✅ capital D — يطابق الـ API
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [pendingApproval, setPendingApproval] = useState(false);

  const set = (k: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: '' }));
    setServerError('');
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    const nameLabel = form.roleType === 'charity' ? 'اسم الجمعية' : 'الاسم';
    const nameErr = validateName(form.userName);
    if (nameErr) errs.userName = nameErr.replace('الاسم', nameLabel);
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    const addrErr = validateAddress(form.address);
    if (addrErr) errs.address = addrErr;
    if (form.roleType === 'charity') {
      const licErr = validateLicense(form.licenseNumber);
      if (licErr) errs.licenseNumber = licErr;
      if (!form.charityDescription || form.charityDescription.trim().length < 10) {
        errs.charityDescription = 'وصف الجمعية يجب أن يكون 10 أحرف على الأقل';
      }
    }
    if (form.roleType === 'admin') {
      const natErr = validateNationalId(form.nationalID);
      if (natErr) errs.nationalID = natErr;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    const pwErr = validatePassword(form.password);
    if (pwErr) errs.password = pwErr;
    if (!form.confirmPassword) errs.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) setCurrentStep(2);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validateStep2()) return;
    setLoading(true);
    try {
      // ✅ بنبني الـ payload الصح حسب نوع الحساب
      if (form.roleType === 'charity') {
        await authApi.register({
          charityName: form.userName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          address: form.address,
          roleType: 'charity',
          licenseNumber: form.licenseNumber,
          charityDescription: form.charityDescription,
        });
      } else if (form.roleType === 'admin') {
        await authApi.register({
          userName: form.userName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          address: form.address,
          roleType: 'admin',
          nationalID: form.nationalID, // ✅ capital D
        });
      } else {
        await authApi.register({
          userName: form.userName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          confirmPassword: form.confirmPassword,
          address: form.address,
          roleType: 'user',
        });
      }
      setCurrentStep(3);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  const realDigitCount = verifyCode.replace(/[^0-9]/g, '').length;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const realDigits = verifyCode.replace(/[^0-9]/g, '');
    if (realDigits.length < 6) { setServerError('أدخل رمز التحقق المكوّن من 6 أرقام'); return; }
    setServerError('');
    setVerifyLoading(true);
    try {
      await authApi.verifyEmail({ email: form.email, code: realDigits });
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'رمز التحقق غير صحيح');
      setVerifyLoading(false);
      return;
    }

    // الجمعيات والأدمن ينتظرون موافقة
    if (form.roleType === 'charity' || form.roleType === 'admin') {
      setPendingApproval(true);
      setVerifyLoading(false);
      return;
    }

    try {
      const res = await authApi.login({ email: form.email, password: form.password });
      setSuccess('🎉 تم تأكيد حسابك بنجاح! جاري تحويلك...');
      setTimeout(() => {
        login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
        onClose();
        setLocation(getRedirectByRole(res.user.roleType));
      }, 1200);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'حدث خطأ، حاول تسجيل الدخول يدوياً');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="auth-form">
        {currentStep < 3 && (
          <div className="signup-steps">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`signup-step${s < currentStep ? ' done' : s === currentStep ? ' active' : ''}`}
              >
                <div className="step-circle">
                  {s < currentStep ? <i className="fas fa-check" /> : s}
                </div>
                <span>{s === 1 ? 'البيانات الأساسية' : 'كلمة المرور'}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Step 1 ── */}
        {currentStep === 1 && (
          <form onSubmit={handleNext} noValidate>
            <div className="auth-header">
              <div className="auth-icon-wrap secondary"><i className="fas fa-user-plus" /></div>
              <h2 className="modal-title">إنشاء حساب جديد</h2>
              <p className="modal-sub">أدخل بياناتك الأساسية للبدء</p>
            </div>

            <div className="form-group">
              <label>نوع الحساب</label>
              <div className="role-picker">
                <button
                  type="button"
                  className={`role-option${form.roleType === 'user' ? ' active' : ''}`}
                  onClick={() => { setForm(f => ({ ...f, roleType: 'user', licenseNumber: '', charityDescription: '', nationalID: '' })); setErrors({}); }}
                >
                  <span className="role-icon">👤</span>
                  <span className="role-label">متبرع</span>
                  <span className="role-desc">أريد التبرع للجمعيات</span>
                </button>
                <button
                  type="button"
                  className={`role-option${form.roleType === 'charity' ? ' active' : ''}`}
                  onClick={() => { setForm(f => ({ ...f, roleType: 'charity', nationalID: '' })); setErrors({}); }}
                >
                  <span className="role-icon">🏛️</span>
                  <span className="role-label">جمعية خيرية</span>
                  <span className="role-desc">أمثّل جمعية أو منظمة</span>
                </button>
                <button
                  type="button"
                  className={`role-option${form.roleType === 'admin' ? ' active' : ''}`}
                  onClick={() => { setForm(f => ({ ...f, roleType: 'admin', licenseNumber: '', charityDescription: '' })); setErrors({}); }}
                >
                  <span className="role-icon">🛡️</span>
                  <span className="role-label">مدير</span>
                  <span className="role-desc">إدارة المنصة والإشراف</span>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>{form.roleType === 'charity' ? 'اسم الجمعية' : 'الاسم بالكامل'}</label>
              <div className="input-icon-wrap">
                <i className="fas fa-user input-icon" />
                <input
                  type="text"
                  placeholder={form.roleType === 'charity' ? 'اسم الجمعية الرسمي' : 'أدخل اسمك الكامل'}
                  value={form.userName}
                  onChange={set('userName')}
                  className={errors.userName ? 'input-error' : ''}
                  autoComplete="name"
                />
              </div>
              <FieldError msg={errors.userName} />
            </div>

            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <div className="input-icon-wrap">
                <i className="fas fa-envelope input-icon" />
                <input
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={set('email')}
                  dir="ltr"
                  className={errors.email ? 'input-error' : ''}
                  autoComplete="email"
                />
              </div>
              <FieldError msg={errors.email} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>رقم الهاتف</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-phone input-icon" />
                  <input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    value={form.phone}
                    onChange={set('phone')}
                    dir="ltr"
                    className={errors.phone ? 'input-error' : ''}
                    autoComplete="tel"
                  />
                </div>
                <FieldError msg={errors.phone} />
              </div>
              <div className="form-group">
                <label>المنطقة / المدينة</label>
                <div className="input-icon-wrap">
                  <i className="fas fa-map-marker-alt input-icon" />
                  <input
                    type="text"
                    placeholder="مثال: القاهرة"
                    value={form.address}
                    onChange={set('address')}
                    className={errors.address ? 'input-error' : ''}
                  />
                </div>
                <FieldError msg={errors.address} />
              </div>
            </div>

            {/* Charity fields */}
            {form.roleType === 'charity' && (
              <>
                <div className="form-group">
                  <label>رقم الترخيص <span className="label-hint">للجمعيات المسجلة رسمياً</span></label>
                  <div className="input-icon-wrap">
                    <i className="fas fa-id-card input-icon" />
                    <input
                      type="text"
                      placeholder="مثال: AB-CDE12-2024"
                      value={form.licenseNumber}
                      onChange={set('licenseNumber')}
                      dir="ltr"
                      className={errors.licenseNumber ? 'input-error' : ''}
                    />
                  </div>
                  <FieldError msg={errors.licenseNumber} />
                  <span className="input-hint">الصيغة: 2-5 أحرف + فاصل + 3-10 أحرف + فاصل + 2-6 أرقام</span>
                </div>
                <div className="form-group">
                  <label>وصف الجمعية</label>
                  <textarea
                    placeholder="اكتب وصفاً موجزاً عن أهداف الجمعية ونشاطها..."
                    value={form.charityDescription}
                    onChange={set('charityDescription')}
                    rows={3}
                    className={errors.charityDescription ? 'input-error' : ''}
                    style={{ width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', fontSize: 14 }}
                  />
                  <FieldError msg={errors.charityDescription} />
                </div>
                <div style={{ padding: '10px 14px', background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
                  ⚠️ طلبك سيُراجع من قِبل الإدارة قبل تفعيل الحساب. ستصلك رسالة بريد إلكتروني عند اتخاذ القرار.
                </div>
              </>
            )}

            {/* Admin field */}
            {form.roleType === 'admin' && (
              <div className="form-group">
                <label>الرقم القومي <span className="label-hint">مطلوب للتحقق من هوية المدير</span></label>
                <div className="input-icon-wrap">
                  <i className="fas fa-fingerprint input-icon" />
                  <input
                    type="text"
                    placeholder="14 رقم"
                    value={form.nationalID}
                    onChange={set('nationalID')} // ✅ capital D
                    dir="ltr"
                    maxLength={14}
                    className={errors.nationalID ? 'input-error' : ''}
                  />
                </div>
                <FieldError msg={errors.nationalID} />
                <span className="input-hint">أدخل رقمك القومي المكوّن من 14 رقم بالضبط</span>
              </div>
            )}

            <button type="submit" className="btn-form">
              التالي <i className="fas fa-arrow-left" />
            </button>
            <p className="modal-login-link">
              لديك حساب بالفعل؟ <a onClick={onSwitch} className="modal-switch-link">سجّل دخولك</a>
            </p>
          </form>
        )}

        {/* ── Step 2 ── */}
        {currentStep === 2 && (
          <form onSubmit={handleSignup} noValidate>
            <div className="auth-header">
              <div className="auth-icon-wrap"><i className="fas fa-lock" /></div>
              <h2 className="modal-title">أنشئ كلمة مرور</h2>
              <p className="modal-sub">اختر كلمة مرور قوية لحماية حسابك</p>
            </div>
            {serverError && (
              <div className="modal-error animate-shake">
                <i className="fas fa-exclamation-triangle" />{serverError}
              </div>
            )}
            <div className="form-group">
              <label>كلمة المرور</label>
              <div className="input-icon-wrap">
                <i className="fas fa-lock input-icon" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  className={errors.password ? 'input-error' : ''}
                  style={{ paddingLeft: 40 }}
                  autoComplete="new-password"
                />
                <EyeIcon show={showPw} toggle={() => setShowPw(v => !v)} />
              </div>
              <PasswordStrength password={form.password} />
              <FieldError msg={errors.password} />
            </div>
            <div className="form-group">
              <label>تأكيد كلمة المرور</label>
              <div className="input-icon-wrap">
                <i className="fas fa-lock input-icon" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  style={{ paddingLeft: 40 }}
                  autoComplete="new-password"
                />
                <EyeIcon show={showConfirm} toggle={() => setShowConfirm(v => !v)} />
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <span className="field-success">
                  <i className="fas fa-check-circle" /> كلمتا المرور متطابقتان
                </span>
              )}
              <FieldError msg={errors.confirmPassword} />
            </div>
            <div className="pw-rules">
              <p className="pw-rules-title"><i className="fas fa-info-circle" /> متطلبات كلمة المرور:</p>
              {[
                { label: '8 أحرف على الأقل', ok: form.password.length >= 8 },
                { label: 'حرف كبير (A-Z)', ok: /[A-Z]/.test(form.password) },
                { label: 'حرف صغير (a-z)', ok: /[a-z]/.test(form.password) },
                { label: 'رقم واحد على الأقل', ok: /\d/.test(form.password) },
              ].map(r => (
                <span key={r.label} className={`pw-rule${r.ok ? ' ok' : ''}`}>
                  <i className={`fas fa-${r.ok ? 'check-circle' : 'circle'}`} />{r.label}
                </span>
              ))}
            </div>
            <div className="form-actions-row">
              <button
                type="button"
                className="btn-back"
                onClick={() => { setCurrentStep(1); setErrors({}); setServerError(''); }}
              >
                <i className="fas fa-arrow-right" /> رجوع
              </button>
              <button type="submit" className="btn-form" style={{ flex: 1 }} disabled={loading}>
                {loading
                  ? <><i className="fas fa-spinner fa-spin" /> جاري التسجيل...</>
                  : <><i className="fas fa-user-check" /> تسجيل الحساب</>
                }
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Verify ── */}
        {currentStep === 3 && !pendingApproval && (
          <form onSubmit={handleVerify}>
            <div className="verify-header">
              <div className="verify-icon-big">📧</div>
              <h2 className="modal-title">تحقق من بريدك</h2>
              <p className="modal-sub">
                أرسلنا رمز تحقق إلى<br /><strong dir="ltr">{form.email}</strong>
              </p>
            </div>
            {serverError && (
              <div className="modal-error animate-shake">
                <i className="fas fa-exclamation-triangle" />{serverError}
              </div>
            )}
            {success && <div className="modal-success">{success}</div>}
            <div className="form-group">
              <label style={{ textAlign: 'center', display: 'block', marginBottom: 12 }}>
                أدخل رمز التحقق
              </label>
              <OTPInput value={verifyCode} onChange={setVerifyCode} />
            </div>
            <button
              type="submit"
              className="btn-form"
              disabled={verifyLoading || !!success || realDigitCount < 6}
            >
              {verifyLoading
                ? <><i className="fas fa-spinner fa-spin" /> جاري التحقق...</>
                : <><i className="fas fa-check-circle" /> تأكيد الحساب</>
              }
            </button>
            <p className="modal-login-link">
              <a
                onClick={() => { setCurrentStep(2); setVerifyCode(''); setServerError(''); }}
                className="modal-switch-link"
              >
                <i className="fas fa-arrow-right" style={{ fontSize: 12 }} /> العودة للتسجيل
              </a>
            </p>
          </form>
        )}

        {/* ── Pending Approval ── */}
        {pendingApproval && (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
            <h2 className="modal-title">طلبك قيد المراجعة</h2>
            <p style={{ fontSize: 15, color: 'var(--neutral-600)', lineHeight: 1.8, marginBottom: 24 }}>
              تم تأكيد بريدك الإلكتروني بنجاح.<br />
              {form.roleType === 'admin'
                ? 'طلب تسجيل حسابك كمدير قيد مراجعة الإدارة.'
                : 'طلب تسجيل جمعيتك الآن قيد مراجعة الإدارة.'
              }<br />
              ستتلقى إشعارًا على بريدك الإلكتروني عند اتخاذ القرار.
            </p>
            <button className="btn-form" onClick={onClose}>
              <i className="fas fa-check" /> حسنًا، فهمت
            </button>
          </div>
        )}
      </div>
    </ModalOverlay>
  );
}