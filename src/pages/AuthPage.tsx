// import React, { useState, useCallback, useEffect } from 'react';
// import { useLocation } from 'wouter';
// import { useAuth } from '../contexts/AuthContext';
// import { authApi } from '../services';
// import ForgotPasswordModal from '../features/auth/ForgotPasswordModal';
// import { getRedirectByRole } from '../utils/getRedirectByRole';

// // ─── Types ────────────────────────────────────────────────────────────────────

// type RoleType = 'user' | 'charity' | 'admin';
// type FieldState = 'valid' | 'invalid' | 'reset';
// type ToastType = 'error' | 'warn' | 'success';

// interface ToastState { message: string; type: ToastType; }
// interface ToastProps { toast: ToastState | null; onClose: () => void; }
// interface WelcomeScreenProps { userName: string; roleType: string; onDone: () => void; }

// interface RegisterForm {
//   userName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   phone: string;
//   address: string;
//   roleType: RoleType | '';
//   charityName: string;
//   licenseNumber: string;
//   charityDescription: string;
//   nationalID: string;
// }

// // ─── Validation rules ─────────────────────────────────────────────────────────

// const rules = {
//   userName:      { re: /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/, msg: 'اسم المستخدم: يبدأ بحرف، 3-30 حرف، بدون رموز خاصة', ok: 'اسم المستخدم مقبول ✓' },
//   email:         { re: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|net|edu|org|io)$/, msg: 'صيغة البريد غير صحيحة — يجب أن ينتهي بـ .com أو .net أو .edu', ok: 'البريد الإلكتروني صالح ✓' },
//   password:      { re: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, msg: 'يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل', ok: 'كلمة المرور قوية ✓' },
//   phone:         { re: /^(002|\+2)?01[0125][0-9]{8}$/, msg: 'رقم غير صالح — أدخل رقماً مصرياً صحيحاً (مثال: 01012345678)', ok: 'رقم الهاتف صالح ✓' },
//   address:       { fn: (v: string) => v.length >= 5 && v.length <= 100, msg: 'العنوان يجب أن يكون بين 5 و 100 حرف', ok: 'العنوان مقبول ✓' },
//   charityName:   { fn: (v: string) => v.length >= 3, msg: 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل', ok: 'اسم الجمعية مقبول ✓' },
//   licenseNumber: { re: /^(?=.{6,20}$)[A-Z0-9]{2,5}[-]?[A-Z0-9]{3,10}[-]?[0-9]{2,6}$/, msg: 'رقم الترخيص غير صالح — يجب أن يكون بصيغة: AB-12345-2023', ok: 'رقم الترخيص صالح ✓' },
//   nationalID:    { re: /^\d{14}$/, msg: 'الرقم القومي غير صالح — تأكد من إدخال 14 رقماً صحيحاً', ok: 'الرقم القومي صالح ✓' },
// };

// const isValidRule = (value: string, rule: { re?: RegExp; fn?: (v: string) => boolean }): boolean =>
//   rule.fn ? rule.fn(value) : (rule.re?.test(value) ?? false);

// // ─── Password Strength ────────────────────────────────────────────────────────

// const strengthConfigs = [
//   { label: 'ضعيفة جداً', color: '#ef4444', pct: 16 },
//   { label: 'ضعيفة',      color: '#f97316', pct: 33 },
//   { label: 'مقبولة',     color: '#eab308', pct: 50 },
//   { label: 'جيدة',       color: '#84cc16', pct: 66 },
//   { label: 'قوية',       color: '#22c55e', pct: 83 },
//   { label: 'قوية جداً',  color: '#16a34a', pct: 100 },
// ];

// function getStrengthScore(pw: string): number {
//   let score = 0;
//   if (pw.length >= 8)          score++;
//   if (pw.length >= 12)         score++;
//   if (/[A-Z]/.test(pw))        score++;
//   if (/[a-z]/.test(pw))        score++;
//   if (/\d/.test(pw))           score++;
//   if (/[^a-zA-Z0-9]/.test(pw)) score++;
//   return Math.max(0, Math.min(5, score - 1));
// }

// // ─── Toast ────────────────────────────────────────────────────────────────────

// function Toast({ toast, onClose }: ToastProps) {
//   const [progress, setProgress] = useState(100);
//   const duration = 4500;

//   useEffect(() => {
//     if (!toast?.message) return;
//     setProgress(100);
//     const step = 100 / (duration / 50);
//     const interval = setInterval(() => {
//       setProgress(p => { const next = p - step; if (next <= 0) { clearInterval(interval); return 0; } return next; });
//     }, 50);
//     const t = setTimeout(onClose, duration);
//     return () => { clearTimeout(t); clearInterval(interval); };
//   }, [toast, onClose]);

//   if (!toast?.message) return null;

//   const configs: Record<ToastType, { icon: string; accent: string; bg: string; textColor: string; border: string }> = {
//     error:   { icon: 'fa-circle-xmark',        accent: '#ef4444', bg: '#fff5f5', textColor: '#991b1b', border: '#fecaca' },
//     warn:    { icon: 'fa-triangle-exclamation', accent: '#f59e0b', bg: '#fffbeb', textColor: '#92400e', border: '#fde68a' },
//     success: { icon: 'fa-circle-check',         accent: '#22c55e', bg: '#f0fdf4', textColor: '#166534', border: '#bbf7d0' },
//   };
//   const c = configs[toast.type];

//   return (
//     <div style={{
//       position: 'fixed', top: '20px', right: '20px', zIndex: 99999,
//       background: c.bg, borderRadius: '16px', border: `1px solid ${c.border}`,
//       boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '340px',
//       fontFamily: 'Tajawal, sans-serif', direction: 'rtl', overflow: 'hidden',
//       animation: 'lp-toastSlide 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
//     }}>
//       <div style={{ padding: '14px 16px 12px' }}>
//         <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//           <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${c.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//             <i className={`fa-solid ${c.icon}`} style={{ color: c.accent, fontSize: '14px' }} />
//           </div>
//           <p style={{ margin: 0, flex: 1, fontSize: '13.5px', fontWeight: 600, color: c.textColor, lineHeight: 1.55 }}>{toast.message}</p>
//           <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '13px', width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             <i className="fa-solid fa-xmark" />
//           </button>
//         </div>
//       </div>
//       <div style={{ height: '3px', background: `${c.accent}25` }}>
//         <div style={{ height: '100%', width: `${progress}%`, background: c.accent, transition: 'width 0.05s linear', borderRadius: '0 2px 2px 0' }} />
//       </div>
//     </div>
//   );
// }

// // ─── Welcome Screen ───────────────────────────────────────────────────────────

// function WelcomeScreen({ userName, roleType, onDone }: WelcomeScreenProps) {
//   const roleLabel: Record<string, { label: string; icon: string; color: string }> = {
//     user:    { label: 'متبرع',        icon: 'fa-heart',         color: '#22c55e' },
//     charity: { label: 'جمعية خيرية',  icon: 'fa-building',      color: '#3ba8b4' },
//     admin:   { label: 'مسؤول النظام', icon: 'fa-shield-halved', color: '#f59e0b' },
//   };
//   const role = roleLabel[roleType] ?? roleLabel['user'];
//   useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
//   return (
//     <div className="lp-welcome-screen">
//       <div className="lp-welcome-avatar">
//         <i className={`fa-solid ${role.icon}`} style={{ color: role.color }} />
//         <div className="lp-welcome-pulse" style={{ background: `${role.color}30` }} />
//       </div>
//       <div className="lp-welcome-text">
//         <span className="lp-welcome-greeting">أهلاً وسهلاً</span>
//         <h2 className="lp-welcome-name">{userName || 'بك'} 👋</h2>
//       </div>
//       <div className="lp-welcome-role-chip" style={{ borderColor: `${role.color}50`, background: `${role.color}10` }}>
//         <i className={`fa-solid ${role.icon}`} style={{ color: role.color }} />
//         <span style={{ color: role.color }}>{role.label}</span>
//       </div>
//       <p className="lp-welcome-msg">سيتم تسجيل دخولك الآن...</p>
//       <div className="lp-welcome-bar-track"><div className="lp-welcome-bar-fill" style={{ background: role.color }} /></div>
//     </div>
//   );
// }

// // ─── Shared UI Atoms ──────────────────────────────────────────────────────────

// function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
//   return (
//     <button type="button" className="lp-eye-btn" onClick={onToggle}>
//       <i className={`fa-solid fa-eye${show ? '-slash' : ''}`} />
//     </button>
//   );
// }

// function FieldHint({ state, validMsg = '', invalidMsg = '' }: { state: FieldState | null; validMsg?: string; invalidMsg?: string }) {
//   if (!state || state === 'reset') return <div className="lp-field-hint" />;
//   if (state === 'valid') return <div className="lp-field-hint lp-hint-success"><i className="fa-solid fa-circle-check" /> {validMsg}</div>;
//   return <div className="lp-field-hint lp-hint-error"><i className="fa-solid fa-circle-exclamation" /> {invalidMsg}</div>;
// }

// function InputGroup({ type = 'text', id, placeholder, value, onChange, onBlur, fieldIcon, fieldState, showEye, eyeShow, onEyeToggle, autoComplete, maxLength, inputMode, required }: {
//   type?: string; id: string; placeholder: string; value: string;
//   onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
//   fieldIcon: string; fieldState: FieldState | null;
//   showEye?: boolean; eyeShow?: boolean; onEyeToggle?: () => void;
//   autoComplete?: string; maxLength?: number;
//   inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
//   required?: boolean;
// }) {
//   const stateClass = fieldState === 'valid' ? ' lp-input-valid' : fieldState === 'invalid' ? ' lp-input-invalid' : '';
//   return (
//     <div className="lp-input-group">
//       <input type={showEye ? (eyeShow ? 'text' : 'password') : type} id={id} placeholder={placeholder} value={value}
//         onChange={onChange} onBlur={onBlur} required={required} autoComplete={autoComplete}
//         maxLength={maxLength} inputMode={inputMode}
//         className={`lp-field-input${stateClass}${showEye ? ' lp-has-eye' : ''}`} />
//       <i className={`${fieldIcon} lp-field-icon`} />
//       {showEye && onEyeToggle && <EyeBtn show={!!eyeShow} onToggle={onEyeToggle} />}
//       <i className={`fa-solid ${fieldState === 'invalid' ? 'fa-circle-xmark' : 'fa-circle-check'} lp-status-icon`} />
//     </div>
//   );
// }

// // ─── Step Progress ────────────────────────────────────────────────────────────

// const stepLabels = ['نوع الحساب', 'بياناتك', 'بيانات التواصل'];

// function StepProgress({ currentStep, totalSteps = 3 }: { currentStep: number; totalSteps?: number }) {
//   return (
//     <div className="lp-step-progress">
//       <div className="lp-step-dots">
//         {Array.from({ length: totalSteps }, (_, i) => {
//           const n = i + 1;
//           return <div key={n} className={`lp-step-dot${n === currentStep ? ' active' : n < currentStep ? ' done' : ''}`} />;
//         })}
//       </div>
//       <div className="lp-step-labels">
//         {stepLabels.map((label, i) => {
//           const n = i + 1;
//           return <span key={n} className={`lp-step-label${n === currentStep ? ' active' : n < currentStep ? ' done' : ''}`}>{label}</span>;
//         })}
//       </div>
//       <div className="lp-progress-track">
//         <div className="lp-progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
//       </div>
//     </div>
//   );
// }

// // ─── Role Selector Cards ──────────────────────────────────────────────────────

// const roleCards = [
//   { value: 'user' as RoleType, label: 'متبرع', sublabel: 'Donor', icon: 'fa-heart', color: '#22c55e', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', features: ['تقديم تبرعات', 'متابعة التبرعات', 'الوصول للجمعيات'] },
//   { value: 'charity' as RoleType, label: 'جمعية خيرية', sublabel: 'Charity', icon: 'fa-building-columns', color: '#3ba8b4', gradient: 'linear-gradient(135deg,#267880,#3ba8b4)', features: ['إدارة التبرعات', 'لوحة تحكم', 'تحتاج موافقة إدارة'] },
//   { value: 'admin' as RoleType, label: 'مسؤول النظام', sublabel: 'Admin', icon: 'fa-shield-halved', color: '#f59e0b', gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', features: ['إدارة المنصة', 'الموافقة على الجمعيات', 'صلاحيات مطلقة'] },
// ];

// function RoleSelector({ selected, onSelect }: { selected: RoleType | ''; onSelect: (r: RoleType) => void }) {
//   return (
//     <div className="lp-role-selector">
//       <p className="lp-role-prompt">اختر نوع حسابك للمتابعة</p>
//       <div className="lp-role-cards">
//         {roleCards.map(card => {
//           const isSel = selected === card.value;
//           return (
//             <button key={card.value} type="button"
//               className={`lp-role-card${isSel ? ' lp-role-card--selected' : ''}`}
//               onClick={() => onSelect(card.value)}
//               style={{ '--card-color': card.color, '--card-gradient': card.gradient } as React.CSSProperties}>
//               {isSel && <div className="lp-role-check"><i className="fa-solid fa-check" /></div>}
//               <div className="lp-role-icon-wrap"><i className={`fa-solid ${card.icon} lp-role-icon`} /></div>
//               <div className="lp-role-labels">
//                 <span className="lp-role-label-ar">{card.label}</span>
//                 <span className="lp-role-label-en">{card.sublabel}</span>
//               </div>
//               <ul className="lp-role-features">
//                 {card.features.map((f, i) => (
//                   <li key={i}><i className="fa-solid fa-circle-check lp-feat-icon" /><span>{f}</span></li>
//                 ))}
//               </ul>
//               <div className="lp-role-bar" />
//             </button>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ─── Login Section ────────────────────────────────────────────────────────────

// function LoginSection({ onSwitch, onForgot, onToast }: { onSwitch: () => void; onForgot: () => void; onToast: (msg: string, type?: ToastType) => void }) {
//   const { login } = useAuth();
//   const [, setLocation] = useLocation();
//   const [email, setEmail]       = useState('');
//   const [password, setPassword] = useState('');
//   const [showPw, setShowPw]     = useState(false);
//   const [emailState, setEmailState] = useState<FieldState | null>(null);
//   const [pwState, setPwState]       = useState<FieldState | null>(null);
//   const [loading, setLoading]       = useState(false);
//   const [welcome, setWelcome]       = useState<{ name: string; role: string } | null>(null);
//   const [pendingRedirect, setPendingRedirect] = useState('');

//   const validateEmailFn = (v: string) => isValidRule(v, rules.email);
//   const validatePw      = (v: string) => isValidRule(v, rules.password);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const emailOk = validateEmailFn(email.trim());
//     const pwOk    = validatePw(password);
//     setEmailState(emailOk ? 'valid' : 'invalid');
//     setPwState(pwOk ? 'valid' : 'invalid');
//     if (!emailOk) { onToast(rules.email.msg, 'error'); return; }
//     if (!pwOk)    { onToast(rules.password.msg, 'error'); return; }
//     setLoading(true);
//     try {
//       const res = await authApi.login({ email: email.trim(), password });
//       if (!res.tokens?.accessToken) throw new Error('بيانات التوكن غير مكتملة');
//       const loggedUser = await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
//       const role     = loggedUser?.roleType || res.user?.roleType || 'user';
//       const name     = loggedUser?.userName || res.user?.userName || loggedUser?.charityName || '';
//       const redirect = getRedirectByRole(role);
//       setPendingRedirect(redirect);
//       setWelcome({ name, role });
//     } catch (err: unknown) {
//       const msg = err instanceof Error ? err.message : 'خطأ في البيانات';
//       if (/pending|قيد الانتظار|not approved/i.test(msg)) {
//         onToast('حسابك قيد المراجعة. سيتم إعلامك عبر البريد عند الموافقة.', 'warn');
//       } else if (/reject|مرفوض|refused/i.test(msg)) {
//         onToast('تم رفض حسابك. تواصل مع الإدارة للاستفسار.', 'error');
//       } else {
//         onToast(msg, 'error');
//       }
//     } finally { setLoading(false); }
//   };

//   if (welcome) return <WelcomeScreen userName={welcome.name} roleType={welcome.role} onDone={() => setLocation(pendingRedirect)} />;

//   return (
//     <form onSubmit={handleSubmit} noValidate>
//       <h2 className="lp-sec-title">تسجيل الدخول</h2>
//       <p className="lp-sec-sub">مرحباً بعودتك! سجل دخولك للمتابعة</p>
//       <InputGroup type="email" id="login-email" placeholder="البريد الإلكتروني"
//         value={email} onChange={e => { setEmail(e.target.value); setEmailState(null); }}
//         onBlur={() => setEmailState(validateEmailFn(email.trim()) ? 'valid' : 'invalid')}
//         fieldIcon="fa-solid fa-envelope" fieldState={emailState} autoComplete="email" required />
//       <FieldHint state={emailState} validMsg={rules.email.ok} invalidMsg={rules.email.msg} />
//       <InputGroup id="login-password" placeholder="كلمة المرور"
//         value={password} onChange={e => { setPassword(e.target.value); setPwState(null); }}
//         onBlur={() => setPwState(validatePw(password) ? 'valid' : 'invalid')}
//         fieldIcon="fa-solid fa-lock" fieldState={pwState}
//         showEye eyeShow={showPw} onEyeToggle={() => setShowPw(v => !v)}
//         autoComplete="current-password" required />
//       <FieldHint state={pwState} validMsg={rules.password.ok} invalidMsg={rules.password.msg} />
//       <a href="#" className="lp-forgot-password" onClick={e => { e.preventDefault(); onForgot(); }}>نسيت كلمة المرور؟</a>
//       <button type="submit" className="lp-btn-primary lp-full-width" disabled={loading}>
//         {loading ? <><i className="fa-solid fa-spinner fa-spin" /> جاري الدخول...</> : <><i className="fa-solid fa-right-to-bracket" /> تسجيل الدخول</>}
//       </button>
//       <p className="lp-social-text">أو سجل الدخول عبر</p>
//       <div className="lp-social-icons">
//         <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-google" /></a>
//         <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-facebook-f" /></a>
//         <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-twitter" /></a>
//       </div>
//     </form>
//   );
// }

// // ─── Register Section ─────────────────────────────────────────────────────────

// function RegisterSection({ onSwitch, onToast }: { onSwitch: () => void; onToast: (msg: string, type?: ToastType) => void }) {
//   const [, setLocation] = useLocation();
//   const { setPendingVerify } = useAuth();
//   const [currentStep, setCurrentStep] = useState(1);
//   const [form, setForm] = useState<RegisterForm>({
//     userName: '', email: '', password: '', confirmPassword: '',
//     phone: '', address: '', roleType: '',
//     charityName: '', licenseNumber: '', charityDescription: '', nationalID: '',
//   });
//   const [fieldStates, setFieldStates] = useState<Record<string, FieldState | null>>({});
//   const [showPw, setShowPw]           = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);
//   const [hintMsg, setHintMsg]         = useState<Record<string, string>>({});
//   const [loading, setLoading]         = useState(false);

//   const strengthScore  = getStrengthScore(form.password);
//   const strengthConfig = strengthConfigs[strengthScore];

//   const setField = useCallback((k: keyof RegisterForm) =>
//     (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//       setForm(f => ({ ...f, [k]: e.target.value }));
//       setFieldStates(p => ({ ...p, [k]: null }));
//     }, []);

//   const setFieldState = useCallback((id: string, state: FieldState, customMsg = '') => {
//     setFieldStates(p => ({ ...p, [id]: state }));
//     if (customMsg) setHintMsg(p => ({ ...p, [id]: customMsg }));
//   }, []);

//   const validate = (id: string, value: string, ruleKey: keyof typeof rules): boolean => {
//     const ok = isValidRule(value, rules[ruleKey]);
//     setFieldState(id, ok ? 'valid' : 'invalid');
//     return ok;
//   };

//   const validateStep1 = () => {
//     if (!form.roleType) { onToast('اختر نوع الحساب أولاً', 'error'); return false; }
//     return true;
//   };

//   const validateStep2 = () => {
//     let ok = true; const errors: string[] = [];
//     if (form.roleType !== 'charity') {
//       if (!validate('userName', form.userName.trim(), 'userName')) { ok = false; errors.push(rules.userName.msg); }
//     }
//     if (!validate('email', form.email.trim(), 'email')) { ok = false; errors.push(rules.email.msg); }
//     if (!validate('password', form.password, 'password')) { ok = false; errors.push(rules.password.msg); }
//     const pwMatch = form.password === form.confirmPassword && !!form.confirmPassword;
//     if (!pwMatch) {
//       setFieldState('confirmPassword', 'invalid', 'كلمتا المرور غير متطابقتين');
//       ok = false; errors.push('كلمتا المرور غير متطابقتين');
//     } else { setFieldState('confirmPassword', 'valid', 'كلمتا المرور متطابقتان ✓'); }
//     if (!ok) onToast(errors[0], 'error');
//     return ok;
//   };

//   const validateStep3 = () => {
//     let ok = true; const errors: string[] = [];
//     if (!validate('phone', form.phone.trim(), 'phone'))       { ok = false; errors.push(rules.phone.msg); }
//     if (!validate('address', form.address.trim(), 'address')) { ok = false; errors.push(rules.address.msg); }
//     if (form.roleType === 'charity') {
//       if (!validate('charityName', form.charityName.trim(), 'charityName')) { ok = false; errors.push(rules.charityName.msg); }
//       if (!validate('licenseNumber', form.licenseNumber.trim().toUpperCase(), 'licenseNumber')) { ok = false; errors.push(rules.licenseNumber.msg); }
//     }
//     if (form.roleType === 'admin') {
//       if (!validate('nationalID', form.nationalID.trim(), 'nationalID')) { ok = false; errors.push(rules.nationalID.msg); }
//     }
//     if (!ok) onToast(errors[0], 'error');
//     return ok;
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateStep3()) return;
//     setLoading(true);
//     try {
//       const base = {
//         email: form.email.trim(),
//         password: form.password,
//         confirmPassword: form.confirmPassword,
//         phone: form.phone.trim(),
//         address: form.address.trim(),
//       };

//       if (form.roleType === 'charity') {
//         const charityDesc = form.charityDescription.trim();
//         await authApi.register({
//           ...base,
//           charityName: form.charityName.trim(),
//           roleType: 'charity',
//           licenseNumber: form.licenseNumber.trim().toUpperCase(),
//           ...(charityDesc ? { charityDescription: charityDesc } : {}),
//         });
//         setPendingVerify({ email: form.email.trim(), name: form.charityName.trim(), role: 'charity' });
//         setLocation('/verify-email');
//       } else if (form.roleType === 'admin') {
//         await authApi.register({ ...base, userName: form.userName.trim(), roleType: 'admin', nationalID: form.nationalID.trim() });
//         setPendingVerify({ email: form.email.trim(), name: form.userName.trim(), role: 'admin' });
//         setLocation('/verify-email');
//       } else {
//         await authApi.register({ ...base, userName: form.userName.trim(), roleType: 'user' });
//         setPendingVerify({ email: form.email.trim(), name: form.userName.trim(), role: 'user' });
//         setLocation('/verify-email');
//       }
//     } catch (err: unknown) {
//       onToast(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى', 'error');
//     } finally { setLoading(false); }
//   };

//   return (
//     <>
//       <h2 className="lp-sec-title">إنشاء حساب جديد</h2>
//       <p className="lp-sec-sub">انضم إلينا وابدأ رحلة العطاء</p>
//       <StepProgress currentStep={currentStep} />

//       <form onSubmit={handleSubmit} style={{ width: '100%' }}>
//         <div className="lp-wizard-steps">

//           {/* Step 1: Role */}
//           {currentStep === 1 && (
//             <div className="lp-wizard-step active">
//               <RoleSelector selected={form.roleType} onSelect={role => {
//                 setForm(f => ({ ...f, roleType: role, userName: '', charityName: '', licenseNumber: '', charityDescription: '', nationalID: '' }));
//                 setFieldStates({});
//               }} />
//               <button type="button" className="lp-btn-gold lp-full-width" onClick={() => { if (validateStep1()) setCurrentStep(2); }} style={{ marginTop: '14px' }}>
//                 التالي <i className="fa-solid fa-arrow-left" />
//               </button>
//             </div>
//           )}

//           {/* Step 2: Basic info */}
//           {currentStep === 2 && (
//             <div className="lp-wizard-step active">
//               {form.roleType && (() => {
//                 const card = roleCards.find(c => c.value === form.roleType)!;
//                 return (
//                   <div className="lp-selected-role-badge" style={{ background: `${card.color}12`, borderColor: `${card.color}40` }}>
//                     <i className={`fa-solid ${card.icon}`} style={{ color: card.color }} />
//                     <span style={{ color: card.color, fontWeight: 700 }}>{card.label}</span>
//                     <button type="button" onClick={() => setCurrentStep(1)} className="lp-change-role-btn">تغيير</button>
//                   </div>
//                 );
//               })()}

//               {form.roleType !== 'charity' && (
//                 <>
//                   <InputGroup id="reg-username" placeholder="اسم المستخدم"
//                     value={form.userName} onChange={setField('userName')}
//                     onBlur={() => validate('userName', form.userName.trim(), 'userName')}
//                     fieldIcon="fa-solid fa-user" fieldState={fieldStates['userName'] ?? null}
//                     autoComplete="username" required />
//                   <FieldHint state={fieldStates['userName'] ?? null} validMsg={rules.userName.ok} invalidMsg={rules.userName.msg} />
//                 </>
//               )}

//               <InputGroup type="email" id="reg-email" placeholder="البريد الإلكتروني"
//                 value={form.email} onChange={setField('email')}
//                 onBlur={() => validate('email', form.email.trim(), 'email')}
//                 fieldIcon="fa-solid fa-envelope" fieldState={fieldStates['email'] ?? null}
//                 autoComplete="email" required />
//               <FieldHint state={fieldStates['email'] ?? null} validMsg={rules.email.ok} invalidMsg={rules.email.msg} />

//               <InputGroup id="reg-password" placeholder="كلمة المرور"
//                 value={form.password} onChange={e => setField('password')(e)}
//                 onBlur={() => validate('password', form.password, 'password')}
//                 fieldIcon="fa-solid fa-lock" fieldState={fieldStates['password'] ?? null}
//                 showEye eyeShow={showPw} onEyeToggle={() => setShowPw(v => !v)}
//                 autoComplete="new-password" required />
//               {form.password && (
//                 <div className="lp-password-strength">
//                   <div className="lp-strength-track"><div className="lp-strength-fill" style={{ width: `${strengthConfig.pct}%`, background: strengthConfig.color }} /></div>
//                   <div className="lp-strength-text" style={{ color: strengthConfig.color }}>قوة كلمة المرور: {strengthConfig.label}</div>
//                 </div>
//               )}
//               <FieldHint state={fieldStates['password'] ?? null} validMsg={rules.password.ok} invalidMsg={rules.password.msg} />

//               <InputGroup id="reg-confirmPassword" placeholder="تأكيد كلمة المرور"
//                 value={form.confirmPassword} onChange={setField('confirmPassword')}
//                 onBlur={() => {
//                   if (!form.confirmPassword) { setFieldState('confirmPassword', 'reset'); return; }
//                   if (form.password === form.confirmPassword) setFieldState('confirmPassword', 'valid', 'كلمتا المرور متطابقتان ✓');
//                   else setFieldState('confirmPassword', 'invalid', 'كلمتا المرور غير متطابقتين');
//                 }}
//                 fieldIcon="fa-solid fa-lock" fieldState={fieldStates['confirmPassword'] ?? null}
//                 showEye eyeShow={showConfirm} onEyeToggle={() => setShowConfirm(v => !v)}
//                 autoComplete="new-password" required />
//               <FieldHint state={fieldStates['confirmPassword'] ?? null}
//                 validMsg={hintMsg['confirmPassword'] || 'كلمتا المرور متطابقتان ✓'}
//                 invalidMsg={hintMsg['confirmPassword'] || 'كلمتا المرور غير متطابقتين'} />

//               <div className="lp-wizard-nav">
//                 <button type="button" className="lp-btn-outline" onClick={() => setCurrentStep(1)}><i className="fa-solid fa-arrow-right" /> السابق</button>
//                 <button type="button" className="lp-btn-gold" onClick={() => { if (validateStep2()) setCurrentStep(3); }}>التالي <i className="fa-solid fa-arrow-left" /></button>
//               </div>
//             </div>
//           )}

//           {/* Step 3: Contact + role-specific */}
//           {currentStep === 3 && (
//             <div className="lp-wizard-step active">
//               <InputGroup type="tel" id="reg-phone" placeholder="رقم الهاتف (مثال: 01012345678)"
//                 value={form.phone} onChange={setField('phone')}
//                 onBlur={() => validate('phone', form.phone.trim(), 'phone')}
//                 fieldIcon="fa-solid fa-phone" fieldState={fieldStates['phone'] ?? null}
//                 autoComplete="tel" required />
//               <FieldHint state={fieldStates['phone'] ?? null} validMsg={rules.phone.ok} invalidMsg={rules.phone.msg} />

//               <InputGroup id="reg-address" placeholder="العنوان (المدينة والمنطقة)"
//                 value={form.address} onChange={setField('address')}
//                 onBlur={() => validate('address', form.address.trim(), 'address')}
//                 fieldIcon="fa-solid fa-location-dot" fieldState={fieldStates['address'] ?? null}
//                 autoComplete="street-address" required />
//               <FieldHint state={fieldStates['address'] ?? null} validMsg={rules.address.ok} invalidMsg={rules.address.msg} />

//               {form.roleType === 'charity' && (
//                 <div className="lp-conditional-field lp-show">
//                   <div className="lp-section-divider"><span>بيانات الجمعية</span></div>
//                   <InputGroup id="reg-charityName" placeholder="اسم الجمعية"
//                     value={form.charityName} onChange={setField('charityName')}
//                     onBlur={() => validate('charityName', form.charityName.trim(), 'charityName')}
//                     fieldIcon="fa-solid fa-building-columns" fieldState={fieldStates['charityName'] ?? null} />
//                   <FieldHint state={fieldStates['charityName'] ?? null} validMsg={rules.charityName.ok} invalidMsg={rules.charityName.msg} />
//                   <InputGroup id="reg-licenseNumber" placeholder="رقم الترخيص (مثال: AB-12345-2023)"
//                     value={form.licenseNumber} onChange={setField('licenseNumber')}
//                     onBlur={() => validate('licenseNumber', form.licenseNumber.trim().toUpperCase(), 'licenseNumber')}
//                     fieldIcon="fa-solid fa-id-card" fieldState={fieldStates['licenseNumber'] ?? null} />
//                   <FieldHint state={fieldStates['licenseNumber'] ?? null} validMsg={rules.licenseNumber.ok} invalidMsg={rules.licenseNumber.msg} />
//                   {/* ✅ charityDescription — اختياري، مش بيتبعت لو فاضي */}
//                   <div className="lp-input-group">
//                     <input type="text" placeholder="وصف الجمعية (اختياري)" value={form.charityDescription}
//                       onChange={e => setForm(f => ({ ...f, charityDescription: e.target.value }))} className="lp-field-input" />
//                     <i className="fa-solid fa-align-left lp-field-icon" />
//                   </div>
//                 </div>
//               )}

//               {form.roleType === 'admin' && (
//                 <div className="lp-conditional-field lp-show">
//                   <div className="lp-section-divider"><span>التحقق من الهوية</span></div>
//                   <InputGroup id="reg-nationalID" placeholder="الرقم القومي (14 رقم)"
//                     value={form.nationalID} onChange={setField('nationalID')}
//                     onBlur={() => validate('nationalID', form.nationalID.trim(), 'nationalID')}
//                     fieldIcon="fa-solid fa-fingerprint" fieldState={fieldStates['nationalID'] ?? null}
//                     maxLength={14} inputMode="numeric" />
//                   <FieldHint state={fieldStates['nationalID'] ?? null} validMsg={rules.nationalID.ok} invalidMsg={rules.nationalID.msg} />
//                 </div>
//               )}

//               {form.roleType === 'user' && (
//                 <div className="lp-user-ready-msg">
//                   <i className="fa-solid fa-circle-check" />
//                   <span>كل شيء جاهز! اضغط سجل الآن للإنهاء</span>
//                 </div>
//               )}

//               <div className="lp-wizard-nav">
//                 <button type="button" className="lp-btn-outline" onClick={() => setCurrentStep(2)}><i className="fa-solid fa-arrow-right" /> السابق</button>
//                 <button type="submit" className="lp-btn-gold" disabled={loading}>
//                   {loading ? <><i className="fa-solid fa-spinner fa-spin" /> جاري التسجيل...</> : <><i className="fa-solid fa-user-plus" /> سجل الآن</>}
//                 </button>
//               </div>
//             </div>
//           )}

//         </div>
//       </form>
//     </>
//   );
// }

// // ─── ROOT PAGE ────────────────────────────────────────────────────────────────

// export default function AuthPage() {
//   const [, setLocation] = useLocation();
//   const initialMode = (): 'login' | 'signup' => {
//     const params = new URLSearchParams(window.location.search);
//     return params.get('mode') === 'signup' ? 'signup' : 'login';
//   };
//   const [mode, setMode]             = useState<'login' | 'signup'>(initialMode);
//   const [showForgot, setShowForgot] = useState(false);
//   const [toast, setToast]           = useState<ToastState | null>(null);
//   const showToast  = useCallback((msg: string, type: ToastType = 'error') => setToast({ message: msg, type }), []);
//   const closeToast = useCallback(() => setToast(null), []);
//   const isSignup = mode === 'signup' && !showForgot;

//   return (
//     <>
//       <AuthCSS />
//       <div className="lp-body">
//         <Toast toast={toast} onClose={closeToast} />
//         <button className="lp-home-btn" onClick={() => setLocation('/')}>
//           <i className="fa-solid fa-house" /><span className="lp-home-btn-text">الرئيسية</span>
//         </button>
//         <div className={`lp-container${isSignup ? ' active' : ''}`}>
//           <div className="lp-forms-container">
//             <div className="lp-form-wrapper lp-login-form">
//               {showForgot
//                 ? <ForgotPasswordModal onClose={() => setShowForgot(false)} onSwitchToLogin={() => { setShowForgot(false); setMode('login'); }} />
//                 : <LoginSection onSwitch={() => setMode('signup')} onForgot={() => setShowForgot(true)} onToast={showToast} />}
//             </div>
//             <div className="lp-form-wrapper lp-register-form">
//               <RegisterSection onSwitch={() => setMode('login')} onToast={showToast} />
//             </div>
//           </div>
//           <div className="lp-side-panel">
//             <div className="lp-panel-content lp-panel-login-mode">
//               <h1>مرحباً بعودتك!</h1>
//               <p>ليس لديك حساب بعد؟<br />انضم إلينا اليوم لبدء رحلة العطاء.</p>
//               <button className="lp-ghost-btn" onClick={() => setMode('signup')}>إنشاء حساب</button>
//             </div>
//             <div className="lp-panel-content lp-panel-register-mode">
//               <h1>أهلاً بك في عطاء!</h1>
//               <p>لديك حساب بالفعل؟<br />سجل دخولك للمتابعة.</p>
//               <button className="lp-ghost-btn" onClick={() => setMode('login')}>تسجيل الدخول</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// // ─── CSS ─────────────────────────────────────────────────────────────────────

// function AuthCSS() {
//   return (
//     <style>{`
// .lp-body {
//   --lp-teal-900:#0d3d3f;--lp-teal-800:#164e52;--lp-teal-700:#1e6268;
//   --lp-teal-600:#267880;--lp-teal-500:#2e8e98;--lp-teal-400:#3ba8b4;
//   --lp-teal-100:#d0eff2;--lp-teal-50:#eaf8f9;
//   --lp-gold-600:#b8920a;--lp-gold-500:#c9a227;--lp-gold-400:#d4af37;
//   --lp-success:#22c55e;--lp-success-bg:#f0fdf4;--lp-success-border:#86efac;
//   --lp-error:#ef4444;--lp-error-bg:#fff1f2;--lp-error-border:#fca5a5;
//   --lp-neutral-900:#111827;--lp-neutral-700:#374151;--lp-neutral-500:#6b7280;
//   --lp-neutral-300:#d1d5db;--lp-neutral-200:#e5e7eb;--lp-neutral-100:#f3f4f6;
//   --lp-neutral-50:#f9fafb;--lp-white:#ffffff;
//   --lp-font:'Tajawal',sans-serif;
//   --lp-r-sm:8px;--lp-r-md:14px;--lp-r-full:9999px;--lp-transition:0.6s;
//   --lp-shadow-lg:0 15px 40px rgba(13,61,63,0.15);
// }
// @keyframes lp-toastSlide{from{opacity:0;transform:translateX(80px) scale(0.9)}to{opacity:1;transform:translateX(0) scale(1)}}
// .lp-body{font-family:var(--lp-font);background:linear-gradient(135deg,var(--lp-teal-50),var(--lp-neutral-50));display:flex;justify-content:center;align-items:center;min-height:100vh;overflow:hidden;direction:rtl;position:relative}
// .lp-body::before{content:'';width:100%;height:100%;position:absolute;background:linear-gradient(to right,var(--lp-teal-900),var(--lp-teal-100));clip-path:circle(30% at left top);animation:lp-sca 2s infinite;pointer-events:none}
// .lp-body::after{content:'';width:100%;height:100%;position:absolute;background-color:var(--lp-teal-600);clip-path:circle(30% at right bottom);animation:lp-scar 2s infinite;z-index:0;pointer-events:none}
// @keyframes lp-scar{0%,100%{transform:translateY(0)}50%{transform:translateY(10%)}}
// @keyframes lp-sca{0%,100%{transform:translateY(0)}50%{transform:translateY(-10%)}}
// .lp-home-btn{position:fixed;top:16px;right:16px;z-index:9999;background:#1a1a1a;border:1.5px solid rgba(255,255,255,0.45);border-radius:var(--lp-r-full);padding:9px 18px 9px 14px;color:#fff;font-family:var(--lp-font);font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:8px;backdrop-filter:blur(12px);box-shadow:0 4px 16px rgba(0,0,0,0.18);transition:background 0.2s,transform 0.15s}
// .lp-home-btn:hover{background:#000;transform:translateY(-1px)}
// .lp-container{position:relative;width:900px;max-width:95%;height:600px;background:var(--lp-white);border-radius:20px;box-shadow:var(--lp-shadow-lg);overflow:hidden;z-index:1}
// .lp-forms-container{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;transition:transform var(--lp-transition) ease-in-out}
// .lp-form-wrapper{width:50%;padding:28px 32px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;background:var(--lp-white);overflow:hidden;height:100%}
// .lp-register-form{justify-content:flex-start;overflow-y:auto;scrollbar-width:none;padding-top:20px;padding-bottom:20px}
// .lp-register-form::-webkit-scrollbar{display:none}
// .lp-role-selector{width:100%}
// .lp-role-prompt{font-size:0.8em;color:var(--lp-neutral-500);margin:0 0 10px;font-weight:500}
// .lp-role-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;width:100%}
// .lp-role-card{position:relative;display:flex;flex-direction:column;align-items:center;gap:7px;padding:12px 7px 10px;border:2px solid var(--lp-neutral-200);border-radius:14px;background:var(--lp-neutral-50);cursor:pointer;transition:all 0.25s cubic-bezier(0.4,0,0.2,1);text-align:center;overflow:hidden;font-family:var(--lp-font)}
// .lp-role-card:hover{border-color:var(--card-color,var(--lp-teal-400));background:color-mix(in srgb,var(--card-color,#3ba8b4) 6%,white);transform:translateY(-3px);box-shadow:0 8px 20px color-mix(in srgb,var(--card-color,#3ba8b4) 22%,transparent)}
// .lp-role-card--selected{border-color:var(--card-color,var(--lp-teal-400));background:color-mix(in srgb,var(--card-color,#3ba8b4) 8%,white);box-shadow:0 4px 16px color-mix(in srgb,var(--card-color,#3ba8b4) 28%,transparent)}
// .lp-role-check{position:absolute;top:7px;left:7px;width:18px;height:18px;border-radius:50%;background:var(--card-color,var(--lp-teal-400));display:flex;align-items:center;justify-content:center;animation:lp-checkPop 0.3s cubic-bezier(0.34,1.56,0.64,1)}
// .lp-role-check i{color:#fff;font-size:9px}
// @keyframes lp-checkPop{from{transform:scale(0)}to{transform:scale(1)}}
// .lp-role-icon-wrap{width:40px;height:40px;border-radius:11px;background:var(--card-gradient,var(--lp-teal-600));display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px color-mix(in srgb,var(--card-color,#3ba8b4) 38%,transparent);flex-shrink:0;transition:transform 0.2s}
// .lp-role-card:hover .lp-role-icon-wrap,.lp-role-card--selected .lp-role-icon-wrap{transform:scale(1.1)}
// .lp-role-icon{color:#fff;font-size:16px}
// .lp-role-labels{display:flex;flex-direction:column;gap:1px}
// .lp-role-label-ar{font-size:0.78em;font-weight:800;color:var(--lp-neutral-900);line-height:1.2}
// .lp-role-label-en{font-size:0.6em;font-weight:500;color:var(--lp-neutral-500);text-transform:uppercase;letter-spacing:0.5px}
// .lp-role-card--selected .lp-role-label-ar{color:var(--card-color,var(--lp-teal-600))}
// .lp-role-features{list-style:none;padding:0;margin:0;width:100%;display:flex;flex-direction:column;gap:2px}
// .lp-role-features li{display:flex;align-items:flex-start;gap:4px;text-align:right;font-size:0.6em;color:#4b5563;line-height:1.4}
// .lp-feat-icon{color:var(--card-color,var(--lp-teal-400));font-size:0.78em;margin-top:2px;flex-shrink:0}
// .lp-role-bar{position:absolute;bottom:0;left:0;right:0;height:3px;background:var(--card-gradient,var(--lp-teal-600));transform:scaleX(0);transform-origin:center;transition:transform 0.3s ease;border-radius:0 0 14px 14px}
// .lp-role-card:hover .lp-role-bar,.lp-role-card--selected .lp-role-bar{transform:scaleX(1)}
// .lp-selected-role-badge{display:flex;align-items:center;gap:8px;border:1.5px solid;border-radius:var(--lp-r-full);padding:6px 12px;font-size:0.8em;margin-bottom:10px;width:100%;box-sizing:border-box}
// .lp-change-role-btn{margin-right:auto;background:none;border:none;cursor:pointer;color:var(--lp-neutral-500);font-size:0.82em;font-family:var(--lp-font);padding:2px 8px;border-radius:var(--lp-r-full);transition:background 0.2s}
// .lp-change-role-btn:hover{background:rgba(0,0,0,0.06);color:var(--lp-neutral-900)}
// .lp-section-divider{display:flex;align-items:center;gap:10px;margin:6px 0 8px;font-size:0.73em;color:var(--lp-neutral-500);font-weight:600}
// .lp-section-divider::before,.lp-section-divider::after{content:'';flex:1;height:1px;background:var(--lp-neutral-200)}
// .lp-user-ready-msg{display:flex;align-items:center;gap:8px;background:var(--lp-success-bg);border:1px solid var(--lp-success-border);border-radius:10px;padding:9px 12px;font-size:0.8em;color:#166534;font-weight:600;margin:3px 0 6px}
// .lp-user-ready-msg i{color:var(--lp-success)}
// .lp-step-progress{width:100%;margin-bottom:14px}
// .lp-step-labels{display:flex;justify-content:space-between;margin-bottom:7px}
// .lp-step-label{font-size:0.66em;color:var(--lp-neutral-500);flex:1;text-align:center;transition:color 0.3s}
// .lp-step-label.active{color:var(--lp-teal-600);font-weight:700}
// .lp-step-label.done{color:var(--lp-success);font-weight:600}
// .lp-progress-track{width:100%;height:4px;background:var(--lp-neutral-200);border-radius:var(--lp-r-full);overflow:hidden}
// .lp-progress-fill{height:100%;background:linear-gradient(90deg,var(--lp-teal-600),var(--lp-teal-400));border-radius:var(--lp-r-full);transition:width 0.4s cubic-bezier(0.4,0,0.2,1)}
// .lp-step-dots{display:flex;justify-content:center;gap:6px;margin-bottom:8px}
// .lp-step-dot{width:8px;height:8px;border-radius:50%;background:var(--lp-neutral-300);transition:all 0.3s}
// .lp-step-dot.active{background:var(--lp-teal-600);width:22px;border-radius:4px}
// .lp-step-dot.done{background:var(--lp-success)}
// .lp-wizard-steps{width:100%}
// .lp-wizard-step{width:100%;animation:lp-slideIn 0.35s ease forwards}
// @keyframes lp-slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
// .lp-sec-title{font-size:1.55em;color:var(--lp-teal-800);margin-bottom:3px;font-weight:800}
// .lp-sec-sub{font-size:0.83em;color:var(--lp-neutral-500);margin-bottom:12px}
// .lp-input-group{position:relative;width:100%;margin-bottom:7px}
// .lp-field-input{width:100%;padding:10px 42px 10px 38px;box-sizing:border-box;border:1.5px solid var(--lp-neutral-200);border-radius:var(--lp-r-md);font-family:var(--lp-font);font-size:0.87em;color:var(--lp-neutral-900);background:var(--lp-neutral-50);transition:border-color 0.25s,box-shadow 0.25s,background 0.25s;outline:none;text-align:right}
// .lp-field-input:focus{border-color:var(--lp-teal-400);background:var(--lp-white);box-shadow:0 0 0 3px rgba(59,168,180,0.12)}
// .lp-field-input.lp-input-valid{border-color:var(--lp-success-border);background:var(--lp-success-bg)}
// .lp-field-input.lp-input-valid:focus{box-shadow:0 0 0 3px rgba(34,197,94,0.12);border-color:var(--lp-success)}
// .lp-field-input.lp-input-invalid{border-color:var(--lp-error-border);background:var(--lp-error-bg);animation:lp-shake 0.35s ease}
// .lp-field-input.lp-input-invalid:focus{box-shadow:0 0 0 3px rgba(239,68,68,0.12);border-color:var(--lp-error)}
// @keyframes lp-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
// .lp-field-input.lp-has-eye{padding-left:62px}
// .lp-field-icon{position:absolute;right:12px;top:50%;transform:translateY(-50%);color:var(--lp-teal-600);pointer-events:none;font-size:0.85em}
// .lp-status-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:0.83em;pointer-events:none;opacity:0;transition:opacity 0.2s,color 0.2s}
// .lp-field-input.lp-input-valid~.lp-status-icon{opacity:1;color:var(--lp-success)}
// .lp-field-input.lp-input-invalid~.lp-status-icon{opacity:1;color:var(--lp-error)}
// .lp-eye-btn{position:absolute;left:32px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:0 4px;color:var(--lp-neutral-500);font-size:0.86em;z-index:2}
// .lp-eye-btn:hover{color:var(--lp-teal-600)}
// .lp-field-hint{font-size:0.71em;margin-top:2px;padding:0 3px;min-height:14px;text-align:right;display:flex;align-items:center;gap:4px;margin-bottom:2px}
// .lp-hint-error{color:var(--lp-error)}
// .lp-hint-success{color:var(--lp-success)}
// .lp-password-strength{width:100%;margin-top:-1px;margin-bottom:5px}
// .lp-strength-track{height:3px;background:var(--lp-neutral-200);border-radius:var(--lp-r-full);overflow:hidden;margin-bottom:3px}
// .lp-strength-fill{height:100%;border-radius:var(--lp-r-full);transition:width 0.3s,background-color 0.3s}
// .lp-strength-text{font-size:0.68em;text-align:right}
// .lp-conditional-field{width:100%}
// .lp-show{display:block;animation:lp-fadeInDown 0.3s ease}
// @keyframes lp-fadeInDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
// .lp-full-width{width:100%}
// .lp-btn-primary{background:var(--lp-teal-600);color:#fff;padding:11px;border-radius:var(--lp-r-full);font-family:var(--lp-font);font-size:0.9em;font-weight:700;border:none;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;justify-content:center;gap:8px}
// .lp-btn-primary:hover:not(:disabled){background:var(--lp-teal-700);transform:translateY(-2px);box-shadow:0 6px 20px rgba(38,120,128,0.3)}
// .lp-btn-primary:disabled{opacity:0.65;cursor:not-allowed}
// .lp-btn-gold{background:linear-gradient(135deg,var(--lp-gold-500),var(--lp-gold-400));color:#fff;padding:11px;border-radius:var(--lp-r-full);font-family:var(--lp-font);font-size:0.9em;font-weight:700;border:none;cursor:pointer;transition:all 0.25s;display:flex;align-items:center;justify-content:center;gap:8px}
// .lp-btn-gold:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 20px rgba(201,162,39,0.35)}
// .lp-btn-gold:disabled{opacity:0.65;cursor:not-allowed}
// .lp-btn-outline{background:transparent;color:var(--lp-teal-700);padding:9px;border-radius:var(--lp-r-full);font-family:var(--lp-font);font-size:0.86em;font-weight:600;border:1.5px solid var(--lp-teal-400);cursor:pointer;transition:all 0.25s;display:flex;align-items:center;justify-content:center;gap:8px}
// .lp-btn-outline:hover{background:var(--lp-teal-50);border-color:var(--lp-teal-600)}
// .lp-wizard-nav{display:flex;gap:10px;width:100%;margin-top:6px}
// .lp-wizard-nav .lp-btn-outline{flex:1}
// .lp-wizard-nav .lp-btn-gold{flex:2}
// .lp-forgot-password{color:var(--lp-teal-600);font-size:0.79em;text-decoration:none;margin-bottom:12px;display:block;width:100%;text-align:left;transition:color 0.2s;cursor:pointer}
// .lp-forgot-password:hover{color:var(--lp-teal-800);text-decoration:underline}
// .lp-social-text{margin:11px 0 8px;color:var(--lp-neutral-500);font-size:0.79em}
// .lp-social-icons{display:flex;gap:10px;justify-content:center}
// .lp-social-icon{width:32px;height:32px;border-radius:50%;border:1.5px solid var(--lp-neutral-200);display:flex;justify-content:center;align-items:center;color:var(--lp-neutral-700);text-decoration:none;transition:0.25s;font-size:0.9em}
// .lp-social-icon:hover{background:var(--lp-teal-50);border-color:var(--lp-teal-400);color:var(--lp-teal-600);transform:translateY(-2px)}
// .lp-welcome-screen{width:100%;display:flex;flex-direction:column;align-items:center;gap:14px;padding:20px 8px;animation:lp-slideIn 0.4s ease forwards}
// .lp-welcome-avatar{position:relative;width:72px;height:72px;border-radius:50%;background:var(--lp-neutral-100);display:flex;align-items:center;justify-content:center;font-size:28px}
// .lp-welcome-pulse{position:absolute;inset:-8px;border-radius:50%;animation:lp-pulse 1.5s ease-in-out infinite}
// @keyframes lp-pulse{0%,100%{transform:scale(1);opacity:0.7}50%{transform:scale(1.15);opacity:0.3}}
// .lp-welcome-text{text-align:center}
// .lp-welcome-greeting{display:block;font-size:0.85em;color:var(--lp-neutral-500);margin-bottom:4px}
// .lp-welcome-name{font-size:1.5em;font-weight:800;color:var(--lp-teal-800);margin:0}
// .lp-welcome-role-chip{display:inline-flex;align-items:center;gap:8px;border:1.5px solid;border-radius:var(--lp-r-full);padding:7px 18px;font-size:0.88em;font-weight:700}
// .lp-welcome-msg{font-size:0.85em;color:var(--lp-neutral-500);margin:0}
// .lp-welcome-bar-track{width:100%;height:4px;background:var(--lp-neutral-200);border-radius:var(--lp-r-full);overflow:hidden}
// .lp-welcome-bar-fill{height:100%;border-radius:var(--lp-r-full);animation:lp-barFill 2.2s linear forwards}
// @keyframes lp-barFill{from{width:0%}to{width:100%}}
// .lp-side-panel{position:absolute;top:0;right:0;width:50%;height:100%;background:linear-gradient(150deg,var(--lp-teal-800) 0%,var(--lp-teal-600) 60%,var(--lp-teal-500) 100%);color:#fff;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 28px;z-index:100;transition:transform var(--lp-transition) ease-in-out;border-bottom-left-radius:30%;border-top-left-radius:30%}
// .lp-panel-content{position:relative;width:100%}
// .lp-panel-content h1{font-size:1.75em;margin-bottom:10px;font-weight:800}
// .lp-panel-content p{font-size:0.87em;margin-bottom:20px;opacity:0.88;line-height:1.6}
// .lp-ghost-btn{background:transparent;border:2px solid rgba(255,255,255,0.8);color:#fff;padding:10px 26px;border-radius:var(--lp-r-full);font-family:var(--lp-font);font-weight:700;cursor:pointer;transition:0.25s;font-size:0.92em}
// .lp-ghost-btn:hover{background:#fff;color:var(--lp-teal-700)}
// .lp-panel-register-mode{position:absolute;opacity:0;visibility:hidden;transition:0.4s}
// .lp-container.active .lp-side-panel{transform:translateX(-100%);border-radius:0;border-bottom-right-radius:30%;border-top-right-radius:30%}
// .lp-container.active .lp-panel-login-mode{opacity:0;visibility:hidden}
// .lp-container.active .lp-panel-register-mode{opacity:1;visibility:visible}
// @media(max-width:768px){
//   .lp-body{overflow-y:auto;padding:60px 0 20px;align-items:flex-start}
//   .lp-home-btn{top:12px;right:12px;padding:8px 14px;font-size:13px}
//   .lp-container{width:95%;height:auto;min-height:unset}
//   .lp-side-panel{position:relative;width:100%;height:auto;padding:22px;border-radius:15px 15px 0 0;transform:none!important;order:1}
//   .lp-forms-container{position:relative;width:100%;transform:none!important;order:2;height:auto;overflow:visible}
//   .lp-form-wrapper{width:100%;padding:18px 14px;height:auto;overflow-y:visible}
//   .lp-register-form{overflow-y:visible;display:none}
//   .lp-container.active .lp-login-form{display:none}
//   .lp-container.active .lp-register-form{display:flex}
//   .lp-panel-register-mode{opacity:0;visibility:hidden}
//   .lp-container.active .lp-panel-register-mode{opacity:1;visibility:visible}
//   .lp-panel-login-mode{opacity:1;visibility:visible}
//   .lp-container.active .lp-panel-login-mode{opacity:0;visibility:hidden}
//   .lp-wizard-nav{flex-direction:column-reverse}
//   .lp-wizard-nav .lp-btn-outline,.lp-wizard-nav .lp-btn-gold{flex:none;width:100%}
//   .lp-role-cards{grid-template-columns:1fr;gap:7px}
//   .lp-role-card{flex-direction:row;padding:11px 13px;text-align:right;gap:11px;align-items:center}
//   .lp-role-features{display:none}
//   .lp-role-icon-wrap{width:38px;height:38px;flex-shrink:0}
//   .lp-role-icon{font-size:15px}
//   .lp-role-labels{align-items:flex-start}
//   .lp-role-bar{width:3px;height:auto;right:auto;top:0;left:0;bottom:0;transform:scaleY(0);transform-origin:center;border-radius:14px 0 0 14px}
//   .lp-role-card:hover .lp-role-bar,.lp-role-card--selected .lp-role-bar{transform:scaleY(1)}
// }
// @media(max-width:420px){
//   .lp-home-btn-text{display:none}
//   .lp-home-btn{padding:9px 12px}
// }
// `}</style>
//   );
// }

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services';
import ForgotPasswordModal from '../features/auth/ForgotPasswordModal';
import { getRedirectByRole } from '../utils/getRedirectByRole';
import '../styles/css/AuthPage.css';
import VerifyEmailPage from './Auth/VerifyEmail';

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleType    = 'user' | 'charity' | 'admin';
type FieldState  = 'valid' | 'invalid' | 'reset';
type ToastType   = 'error' | 'warn' | 'success';

interface ToastState { message: string; type: ToastType; }
interface ToastProps { toast: ToastState | null; onClose: () => void; }
interface WelcomeScreenProps { userName: string; roleType: string; onDone: () => void; }

interface RegisterForm {
  userName:           string;
  email:              string;
  password:           string;
  confirmPassword:    string;
  phone:              string;
  address:            string;
  roleType:           RoleType | '';
  charityName:        string;
  licenseNumber:      string;
  charityDescription: string;
  nationalID:         string;
}

// ─── Validation Rules ─────────────────────────────────────────────────────────

const rules = {
  userName:      { re: /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/, msg: 'اسم المستخدم: يبدأ بحرف، 3-30 حرف، بدون رموز خاصة',              ok: 'اسم المستخدم مقبول ✓' },
  email:         { re: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|net|edu|org|io)$/, msg: 'صيغة البريد غير صحيحة — يجب أن ينتهي بـ .com أو .net أو .edu', ok: 'البريد الإلكتروني صالح ✓' },
  password:      { re: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, msg: 'يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل', ok: 'كلمة المرور قوية ✓' },
  phone:         { re: /^(002|\+2)?01[0125][0-9]{8}$/, msg: 'رقم غير صالح — أدخل رقماً مصرياً صحيحاً (مثال: 01012345678)',                  ok: 'رقم الهاتف صالح ✓' },
  address:       { fn: (v: string) => v.length >= 5 && v.length <= 100, msg: 'العنوان يجب أن يكون بين 5 و 100 حرف',                          ok: 'العنوان مقبول ✓' },
  charityName:   { fn: (v: string) => v.length >= 3,  msg: 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل',                                      ok: 'اسم الجمعية مقبول ✓' },
  licenseNumber: { re: /^(?=.{6,20}$)[A-Z0-9]{2,5}[-]?[A-Z0-9]{3,10}[-]?[0-9]{2,6}$/, msg: 'رقم الترخيص غير صالح — يجب أن يكون بصيغة: AB-12345-2023', ok: 'رقم الترخيص صالح ✓' },
  nationalID:    { re: /^\d{14}$/, msg: 'الرقم القومي غير صالح — تأكد من إدخال 14 رقماً صحيحاً',                                             ok: 'الرقم القومي صالح ✓' },
};

const isValidRule = (value: string, rule: { re?: RegExp; fn?: (v: string) => boolean }): boolean =>
  rule.fn ? rule.fn(value) : (rule.re?.test(value) ?? false);

// ─── Password Strength ────────────────────────────────────────────────────────

const strengthConfigs = [
  { label: 'ضعيفة جداً', color: '#ef4444', pct: 16  },
  { label: 'ضعيفة',      color: '#f97316', pct: 33  },
  { label: 'مقبولة',     color: '#eab308', pct: 50  },
  { label: 'جيدة',       color: '#84cc16', pct: 66  },
  { label: 'قوية',       color: '#22c55e', pct: 83  },
  { label: 'قوية جداً',  color: '#16a34a', pct: 100 },
];

function getStrengthScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[a-z]/.test(pw))         score++;
  if (/\d/.test(pw))            score++;
  if (/[^a-zA-Z0-9]/.test(pw))  score++;
  return Math.max(0, Math.min(5, score - 1));
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const duration = 4500;

  useEffect(() => {
    if (!toast?.message) return;
    setProgress(100);
    const step = 100 / (duration / 50);
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p - step;
        if (next <= 0) { clearInterval(interval); return 0; }
        return next;
      });
    }, 50);
    const t = setTimeout(onClose, duration);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [toast, onClose]);

  if (!toast?.message) return null;

  const configs: Record<ToastType, { icon: string; accent: string; bg: string; textColor: string; border: string }> = {
    error:   { icon: 'fa-circle-xmark',        accent: '#ef4444', bg: '#fff5f5', textColor: '#991b1b', border: '#fecaca' },
    warn:    { icon: 'fa-triangle-exclamation', accent: '#f59e0b', bg: '#fffbeb', textColor: '#92400e', border: '#fde68a' },
    success: { icon: 'fa-circle-check',         accent: '#22c55e', bg: '#f0fdf4', textColor: '#166534', border: '#bbf7d0' },
  };
  const c = configs[toast.type];

  return (
    <div
      className="lp-toast-wrap"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="lp-toast-inner">
        <div className="lp-toast-row">
          <div
            className="lp-toast-icon-wrap"
            style={{ background: `${c.accent}20` }}
          >
            <i className={`fa-solid ${c.icon}`} style={{ color: c.accent, fontSize: '14px' }} />
          </div>
          <p className="lp-toast-msg" style={{ color: c.textColor }}>{toast.message}</p>
          <button className="lp-toast-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>
      <div className="lp-toast-bar-track" style={{ background: `${c.accent}25` }}>
        <div
          className="lp-toast-bar-fill"
          style={{ width: `${progress}%`, background: c.accent }}
        />
      </div>
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ userName, roleType, onDone }: WelcomeScreenProps) {
  const roleLabel: Record<string, { label: string; icon: string; color: string }> = {
    user:    { label: 'متبرع',        icon: 'fa-heart',         color: '#22c55e' },
    charity: { label: 'جمعية خيرية',  icon: 'fa-building',      color: '#3ba8b4' },
    admin:   { label: 'مسؤول النظام', icon: 'fa-shield-halved', color: '#f59e0b' },
  };
  const role = roleLabel[roleType] ?? roleLabel['user'];
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);

  return (
    <div className="lp-welcome-screen">
      <div className="lp-welcome-avatar">
        <i className={`fa-solid ${role.icon}`} style={{ color: role.color }} />
        <div className="lp-welcome-pulse" style={{ background: `${role.color}30` }} />
      </div>
      <div className="lp-welcome-text">
        <span className="lp-welcome-greeting">أهلاً وسهلاً</span>
        <h2 className="lp-welcome-name">{userName || 'بك'} 👋</h2>
      </div>
      <div
        className="lp-welcome-role-chip"
        style={{ borderColor: `${role.color}50`, background: `${role.color}10` }}
      >
        <i className={`fa-solid ${role.icon}`} style={{ color: role.color }} />
        <span style={{ color: role.color }}>{role.label}</span>
      </div>
      <p className="lp-welcome-msg">سيتم تسجيل دخولك الآن...</p>
      <div className="lp-welcome-bar-track">
        <div className="lp-welcome-bar-fill" style={{ background: role.color }} />
      </div>
    </div>
  );
}

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="lp-eye-btn" onClick={onToggle}>
      <i className={`fa-solid fa-eye${show ? '-slash' : ''}`} />
    </button>
  );
}

function FieldHint({ state, validMsg = '', invalidMsg = '' }: { state: FieldState | null; validMsg?: string; invalidMsg?: string }) {
  if (!state || state === 'reset') return <div className="lp-field-hint" />;
  if (state === 'valid')   return <div className="lp-field-hint lp-hint-success"><i className="fa-solid fa-circle-check" /> {validMsg}</div>;
  return <div className="lp-field-hint lp-hint-error"><i className="fa-solid fa-circle-exclamation" /> {invalidMsg}</div>;
}

function InputGroup({
  type = 'text', id, placeholder, value, onChange, onBlur,
  fieldIcon, fieldState, showEye, eyeShow, onEyeToggle,
  autoComplete, maxLength, inputMode, required,
}: {
  type?: string; id: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  fieldIcon: string; fieldState: FieldState | null;
  showEye?: boolean; eyeShow?: boolean; onEyeToggle?: () => void;
  autoComplete?: string; maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
}) {
  const stateClass = fieldState === 'valid' ? ' lp-input-valid' : fieldState === 'invalid' ? ' lp-input-invalid' : '';
  return (
    <div className="lp-input-group">
      <input
        type={showEye ? (eyeShow ? 'text' : 'password') : type}
        id={id} placeholder={placeholder} value={value}
        onChange={onChange} onBlur={onBlur}
        required={required} autoComplete={autoComplete}
        maxLength={maxLength} inputMode={inputMode}
        className={`lp-field-input${stateClass}${showEye ? ' lp-has-eye' : ''}`}
      />
      <i className={`${fieldIcon} lp-field-icon`} />
      {showEye && onEyeToggle && <EyeBtn show={!!eyeShow} onToggle={onEyeToggle} />}
      <i className={`fa-solid ${fieldState === 'invalid' ? 'fa-circle-xmark' : 'fa-circle-check'} lp-status-icon`} />
    </div>
  );
}

// ─── Step Progress ────────────────────────────────────────────────────────────

const stepLabels = ['نوع الحساب', 'بياناتك', 'بيانات التواصل'];

function StepProgress({ currentStep, totalSteps = 3 }: { currentStep: number; totalSteps?: number }) {
  return (
    <div className="lp-step-progress">
      <div className="lp-step-dots">
        {Array.from({ length: totalSteps }, (_, i) => {
          const n = i + 1;
          return <div key={n} className={`lp-step-dot${n === currentStep ? ' active' : n < currentStep ? ' done' : ''}`} />;
        })}
      </div>
      <div className="lp-step-labels">
        {stepLabels.map((label, i) => {
          const n = i + 1;
          return (
            <span key={n} className={`lp-step-label${n === currentStep ? ' active' : n < currentStep ? ' done' : ''}`}>
              {label}
            </span>
          );
        })}
      </div>
      <div className="lp-progress-track">
        <div className="lp-progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Role Selector Cards ──────────────────────────────────────────────────────

const roleCards = [
  { value: 'user'    as RoleType, label: 'متبرع',        sublabel: 'Donor',   icon: 'fa-heart',            color: '#22c55e', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', features: ['تقديم تبرعات', 'متابعة التبرعات', 'الوصول للجمعيات'] },
  { value: 'charity' as RoleType, label: 'جمعية خيرية',  sublabel: 'Charity', icon: 'fa-building-columns', color: '#3ba8b4', gradient: 'linear-gradient(135deg,#267880,#3ba8b4)', features: ['إدارة التبرعات', 'لوحة تحكم', 'تحتاج موافقة إدارة'] },
  { value: 'admin'   as RoleType, label: 'مسؤول النظام', sublabel: 'Admin',   icon: 'fa-shield-halved',    color: '#f59e0b', gradient: 'linear-gradient(135deg,#d97706,#f59e0b)', features: ['إدارة المنصة', 'الموافقة على الجمعيات', 'صلاحيات مطلقة'] },
];

function RoleSelector({ selected, onSelect }: { selected: RoleType | ''; onSelect: (r: RoleType) => void }) {
  return (
    <div className="lp-role-selector">
      <p className="lp-role-prompt">اختر نوع حسابك للمتابعة</p>
      <div className="lp-role-cards">
        {roleCards.map(card => {
          const isSel = selected === card.value;
          return (
            <button
              key={card.value} type="button"
              className={`lp-role-card${isSel ? ' lp-role-card--selected' : ''}`}
              onClick={() => onSelect(card.value)}
              style={{ '--card-color': card.color, '--card-gradient': card.gradient } as React.CSSProperties}
            >
              {isSel && <div className="lp-role-check"><i className="fa-solid fa-check" /></div>}
              <div className="lp-role-icon-wrap"><i className={`fa-solid ${card.icon} lp-role-icon`} /></div>
              <div className="lp-role-labels">
                <span className="lp-role-label-ar">{card.label}</span>
                <span className="lp-role-label-en">{card.sublabel}</span>
              </div>
              <ul className="lp-role-features">
                {card.features.map((f, i) => (
                  <li key={i}><i className="fa-solid fa-circle-check lp-feat-icon" /><span>{f}</span></li>
                ))}
              </ul>
              <div className="lp-role-bar" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Login Section ────────────────────────────────────────────────────────────

function LoginSection({
  onForgot,
  onToast,
}: {
  onForgot: () => void;
  onToast: (msg: string, type?: ToastType) => void;
}) {
  const { login }    = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [emailState, setEmailState] = useState<FieldState | null>(null);
  const [pwState, setPwState]       = useState<FieldState | null>(null);
  const [loading, setLoading]       = useState(false);
  const [welcome, setWelcome]       = useState<{ name: string; role: string } | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState('');

  const validateEmailFn = (v: string) => isValidRule(v, rules.email);
  const validatePw      = (v: string) => isValidRule(v, rules.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk = validateEmailFn(email.trim());
    const pwOk    = validatePw(password);
    setEmailState(emailOk ? 'valid' : 'invalid');
    setPwState(pwOk ? 'valid' : 'invalid');
    if (!emailOk) { onToast(rules.email.msg, 'error'); return; }
    if (!pwOk)    { onToast(rules.password.msg, 'error'); return; }
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      if (!res.tokens?.accessToken) throw new Error('بيانات التوكن غير مكتملة');
      const loggedUser = await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      const role       = loggedUser?.roleType || res.user?.roleType || 'user';
      const name       = loggedUser?.userName || res.user?.userName || loggedUser?.charityName || '';
      const redirect   = getRedirectByRole(role);
      setPendingRedirect(redirect);
      setWelcome({ name, role });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'خطأ في البيانات';
      if (/pending|قيد الانتظار|not approved/i.test(msg)) {
        onToast('حسابك قيد المراجعة. سيتم إعلامك عبر البريد عند الموافقة.', 'warn');
      } else if (/reject|مرفوض|refused/i.test(msg)) {
        onToast('تم رفض حسابك. تواصل مع الإدارة للاستفسار.', 'error');
      } else {
        onToast(msg, 'error');
      }
    } finally { setLoading(false); }
  };

  // ✅ رسالة الترحيب موجودة هنا فقط بعد تسجيل الدخول
  if (welcome) {
    return (
      <WelcomeScreen
        userName={welcome.name}
        roleType={welcome.role}
        onDone={() => setLocation(pendingRedirect)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <h2 className="lp-sec-title">تسجيل الدخول</h2>
      <p className="lp-sec-sub">مرحباً بعودتك! سجل دخولك للمتابعة</p>

      <InputGroup
        type="email" id="login-email" placeholder="البريد الإلكتروني"
        value={email} onChange={e => { setEmail(e.target.value); setEmailState(null); }}
        onBlur={() => setEmailState(validateEmailFn(email.trim()) ? 'valid' : 'invalid')}
        fieldIcon="fa-solid fa-envelope" fieldState={emailState}
        autoComplete="email" required
      />
      <FieldHint state={emailState} validMsg={rules.email.ok} invalidMsg={rules.email.msg} />

      <InputGroup
        id="login-password" placeholder="كلمة المرور"
        value={password} onChange={e => { setPassword(e.target.value); setPwState(null); }}
        onBlur={() => setPwState(validatePw(password) ? 'valid' : 'invalid')}
        fieldIcon="fa-solid fa-lock" fieldState={pwState}
        showEye eyeShow={showPw} onEyeToggle={() => setShowPw(v => !v)}
        autoComplete="current-password" required
      />
      <FieldHint state={pwState} validMsg={rules.password.ok} invalidMsg={rules.password.msg} />

      <a href="#" className="lp-forgot-password" onClick={e => { e.preventDefault(); onForgot(); }}>
        نسيت كلمة المرور؟
      </a>

      <button type="submit" className="lp-btn-primary lp-full-width" disabled={loading}>
        {loading
          ? <><i className="fa-solid fa-spinner fa-spin" /> جاري الدخول...</>
          : <><i className="fa-solid fa-right-to-bracket" /> تسجيل الدخول</>}
      </button>

      <p className="lp-social-text">أو سجل الدخول عبر</p>
      <div className="lp-social-icons">
        <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-google" /></a>
        <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-facebook-f" /></a>
        <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-twitter" /></a>
      </div>
    </form>
  );
}

// ─── Register Section ─────────────────────────────────────────────────────────
// ✅ الـ Fix الرئيسي: form و currentStep بتيجي من الـ parent (AuthPage)
//    عشان لو حصل re-render في الـ parent مش بيضيع الـ state

interface RegisterSectionProps {
  onToast:      (msg: string, type?: ToastType) => void;
  form:         RegisterForm;
  setForm:      React.Dispatch<React.SetStateAction<RegisterForm>>;
  currentStep:  number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

function RegisterSection({ onToast, form, setForm, currentStep, setCurrentStep }: RegisterSectionProps) {
  const [, setLocation]       = useLocation();
  const { setPendingVerify }   = useAuth();
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState | null>>({});
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hintMsg, setHintMsg]         = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);

  const strengthScore  = getStrengthScore(form.password);
  const strengthConfig = strengthConfigs[strengthScore];

  // ✅ setField لا تعتمد على form مباشرة — بتستخدم functional update
  const setField = useCallback(
    (k: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [k]: e.target.value }));
      setFieldStates(p => ({ ...p, [k]: null }));
    },
    [setForm],
  );

  const setFieldState = useCallback((id: string, state: FieldState, customMsg = '') => {
    setFieldStates(p => ({ ...p, [id]: state }));
    if (customMsg) setHintMsg(p => ({ ...p, [id]: customMsg }));
  }, []);

  const validate = (id: string, value: string, ruleKey: keyof typeof rules): boolean => {
    const ok = isValidRule(value, rules[ruleKey]);
    setFieldState(id, ok ? 'valid' : 'invalid');
    return ok;
  };

  // ─── Step Validators ──────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (!form.roleType) { onToast('اختر نوع الحساب أولاً', 'error'); return false; }
    return true;
  };

  const validateStep2 = () => {
    let ok = true;
    const errors: string[] = [];
    if (form.roleType !== 'charity') {
      if (!validate('userName', form.userName.trim(), 'userName')) { ok = false; errors.push(rules.userName.msg); }
    }
    if (!validate('email', form.email.trim(), 'email'))       { ok = false; errors.push(rules.email.msg); }
    if (!validate('password', form.password, 'password'))     { ok = false; errors.push(rules.password.msg); }
    const pwMatch = form.password === form.confirmPassword && !!form.confirmPassword;
    if (!pwMatch) {
      setFieldState('confirmPassword', 'invalid', 'كلمتا المرور غير متطابقتين');
      ok = false; errors.push('كلمتا المرور غير متطابقتين');
    } else {
      setFieldState('confirmPassword', 'valid', 'كلمتا المرور متطابقتان ✓');
    }
    if (!ok) onToast(errors[0], 'error');
    return ok;
  };

  const validateStep3 = () => {
    let ok = true;
    const errors: string[] = [];
    if (!validate('phone',   form.phone.trim(),   'phone'))   { ok = false; errors.push(rules.phone.msg); }
    if (!validate('address', form.address.trim(), 'address')) { ok = false; errors.push(rules.address.msg); }
    if (form.roleType === 'charity') {
      if (!validate('charityName',   form.charityName.trim(), 'charityName'))                         { ok = false; errors.push(rules.charityName.msg); }
      if (!validate('licenseNumber', form.licenseNumber.trim().toUpperCase(), 'licenseNumber'))       { ok = false; errors.push(rules.licenseNumber.msg); }
    }
    if (form.roleType === 'admin') {
      if (!validate('nationalID', form.nationalID.trim(), 'nationalID'))                              { ok = false; errors.push(rules.nationalID.msg); }
    }
    if (!ok) onToast(errors[0], 'error');
    return ok;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const base = {
        email:           form.email.trim(),
        password:        form.password,
        confirmPassword: form.confirmPassword,
        phone:           form.phone.trim(),
        address:         form.address.trim(),
      };

      if (form.roleType === 'charity') {
        const charityDesc = form.charityDescription.trim();
        await authApi.register({
          ...base,
          charityName:   form.charityName.trim(),
          roleType:      'charity',
          licenseNumber: form.licenseNumber.trim().toUpperCase(),
          ...(charityDesc ? { charityDescription: charityDesc } : {}),
        });
        setPendingVerify({ email: form.email.trim(), name: form.charityName.trim(), role: 'charity' });
      } else if (form.roleType === 'admin') {
        await authApi.register({ ...base, userName: form.userName.trim(), roleType: 'admin', nationalID: form.nationalID.trim() });
        setPendingVerify({ email: form.email.trim(), name: form.userName.trim(), role: 'admin' });
      } else {
        await authApi.register({ ...base, userName: form.userName.trim(), roleType: 'user' });
        setPendingVerify({ email: form.email.trim(), name: form.userName.trim(), role: 'user' });
      }
      setLocation('/verify-email');
    } catch (err: unknown) {
      onToast(err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <h2 className="lp-sec-title">إنشاء حساب جديد</h2>
      <p className="lp-sec-sub">انضم إلينا وابدأ رحلة العطاء</p>
      <StepProgress currentStep={currentStep} />

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="lp-wizard-steps">

          {/* ── Step 1: Role ── */}
          {currentStep === 1 && (
            <div className="lp-wizard-step active">
              <RoleSelector
                selected={form.roleType}
                onSelect={role => {
                  setForm(f => ({
                    ...f, roleType: role,
                    userName: '', charityName: '', licenseNumber: '', charityDescription: '', nationalID: '',
                  }));
                  setFieldStates({});
                }}
              />
              <button
                type="button" className="lp-btn-gold lp-full-width"
                onClick={() => { if (validateStep1()) setCurrentStep(2); }}
                style={{ marginTop: '14px' }}
              >
                التالي <i className="fa-solid fa-arrow-left" />
              </button>
            </div>
          )}

          {/* ── Step 2: Basic Info ── */}
          {currentStep === 2 && (
            <div className="lp-wizard-step active">
              {form.roleType && (() => {
                const card = roleCards.find(c => c.value === form.roleType)!;
                return (
                  <div
                    className="lp-selected-role-badge"
                    style={{ background: `${card.color}12`, borderColor: `${card.color}40` }}
                  >
                    <i className={`fa-solid ${card.icon}`} style={{ color: card.color }} />
                    <span style={{ color: card.color, fontWeight: 700 }}>{card.label}</span>
                    <button type="button" onClick={() => setCurrentStep(1)} className="lp-change-role-btn">تغيير</button>
                  </div>
                );
              })()}

              {form.roleType !== 'charity' && (
                <>
                  <InputGroup
                    id="reg-username" placeholder="اسم المستخدم"
                    value={form.userName} onChange={setField('userName')}
                    onBlur={() => validate('userName', form.userName.trim(), 'userName')}
                    fieldIcon="fa-solid fa-user" fieldState={fieldStates['userName'] ?? null}
                    autoComplete="username" required
                  />
                  <FieldHint state={fieldStates['userName'] ?? null} validMsg={rules.userName.ok} invalidMsg={rules.userName.msg} />
                </>
              )}

              <InputGroup
                type="email" id="reg-email" placeholder="البريد الإلكتروني"
                value={form.email} onChange={setField('email')}
                onBlur={() => validate('email', form.email.trim(), 'email')}
                fieldIcon="fa-solid fa-envelope" fieldState={fieldStates['email'] ?? null}
                autoComplete="email" required
              />
              <FieldHint state={fieldStates['email'] ?? null} validMsg={rules.email.ok} invalidMsg={rules.email.msg} />

              <InputGroup
                id="reg-password" placeholder="كلمة المرور"
                value={form.password} onChange={e => setField('password')(e)}
                onBlur={() => validate('password', form.password, 'password')}
                fieldIcon="fa-solid fa-lock" fieldState={fieldStates['password'] ?? null}
                showEye eyeShow={showPw} onEyeToggle={() => setShowPw(v => !v)}
                autoComplete="new-password" required
              />
              {form.password && (
                <div className="lp-password-strength">
                  <div className="lp-strength-track">
                    <div className="lp-strength-fill" style={{ width: `${strengthConfig.pct}%`, background: strengthConfig.color }} />
                  </div>
                  <div className="lp-strength-text" style={{ color: strengthConfig.color }}>
                    قوة كلمة المرور: {strengthConfig.label}
                  </div>
                </div>
              )}
              <FieldHint state={fieldStates['password'] ?? null} validMsg={rules.password.ok} invalidMsg={rules.password.msg} />

              <InputGroup
                id="reg-confirmPassword" placeholder="تأكيد كلمة المرور"
                value={form.confirmPassword} onChange={setField('confirmPassword')}
                onBlur={() => {
                  if (!form.confirmPassword) { setFieldState('confirmPassword', 'reset'); return; }
                  if (form.password === form.confirmPassword) setFieldState('confirmPassword', 'valid', 'كلمتا المرور متطابقتان ✓');
                  else setFieldState('confirmPassword', 'invalid', 'كلمتا المرور غير متطابقتين');
                }}
                fieldIcon="fa-solid fa-lock" fieldState={fieldStates['confirmPassword'] ?? null}
                showEye eyeShow={showConfirm} onEyeToggle={() => setShowConfirm(v => !v)}
                autoComplete="new-password" required
              />
              <FieldHint
                state={fieldStates['confirmPassword'] ?? null}
                validMsg={hintMsg['confirmPassword']  || 'كلمتا المرور متطابقتان ✓'}
                invalidMsg={hintMsg['confirmPassword'] || 'كلمتا المرور غير متطابقتين'}
              />

              <div className="lp-wizard-nav">
                <button type="button" className="lp-btn-outline" onClick={() => setCurrentStep(1)}>
                  <i className="fa-solid fa-arrow-right" /> السابق
                </button>
                <button type="button" className="lp-btn-gold" onClick={() => { if (validateStep2()) setCurrentStep(3); }}>
                  التالي <i className="fa-solid fa-arrow-left" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Contact + Role-Specific ── */}
          {currentStep === 3 && (
            <div className="lp-wizard-step active">
              <InputGroup
                type="tel" id="reg-phone" placeholder="رقم الهاتف (مثال: 01012345678)"
                value={form.phone} onChange={setField('phone')}
                onBlur={() => validate('phone', form.phone.trim(), 'phone')}
                fieldIcon="fa-solid fa-phone" fieldState={fieldStates['phone'] ?? null}
                autoComplete="tel" required
              />
              <FieldHint state={fieldStates['phone'] ?? null} validMsg={rules.phone.ok} invalidMsg={rules.phone.msg} />

              <InputGroup
                id="reg-address" placeholder="العنوان (المدينة والمنطقة)"
                value={form.address} onChange={setField('address')}
                onBlur={() => validate('address', form.address.trim(), 'address')}
                fieldIcon="fa-solid fa-location-dot" fieldState={fieldStates['address'] ?? null}
                autoComplete="street-address" required
              />
              <FieldHint state={fieldStates['address'] ?? null} validMsg={rules.address.ok} invalidMsg={rules.address.msg} />

              {form.roleType === 'charity' && (
                <div className="lp-conditional-field lp-show">
                  <div className="lp-section-divider"><span>بيانات الجمعية</span></div>
                  <InputGroup
                    id="reg-charityName" placeholder="اسم الجمعية"
                    value={form.charityName} onChange={setField('charityName')}
                    onBlur={() => validate('charityName', form.charityName.trim(), 'charityName')}
                    fieldIcon="fa-solid fa-building-columns" fieldState={fieldStates['charityName'] ?? null}
                  />
                  <FieldHint state={fieldStates['charityName'] ?? null} validMsg={rules.charityName.ok} invalidMsg={rules.charityName.msg} />
                  <InputGroup
                    id="reg-licenseNumber" placeholder="رقم الترخيص (مثال: AB-12345-2023)"
                    value={form.licenseNumber} onChange={setField('licenseNumber')}
                    onBlur={() => validate('licenseNumber', form.licenseNumber.trim().toUpperCase(), 'licenseNumber')}
                    fieldIcon="fa-solid fa-id-card" fieldState={fieldStates['licenseNumber'] ?? null}
                  />
                  <FieldHint state={fieldStates['licenseNumber'] ?? null} validMsg={rules.licenseNumber.ok} invalidMsg={rules.licenseNumber.msg} />
                  <div className="lp-input-group">
                    <input
                      type="text" placeholder="وصف الجمعية (اختياري)"
                      value={form.charityDescription}
                      onChange={e => setForm(f => ({ ...f, charityDescription: e.target.value }))}
                      className="lp-field-input"
                    />
                    <i className="fa-solid fa-align-left lp-field-icon" />
                  </div>
                </div>
              )}

              {form.roleType === 'admin' && (
                <div className="lp-conditional-field lp-show">
                  <div className="lp-section-divider"><span>التحقق من الهوية</span></div>
                  <InputGroup
                    id="reg-nationalID" placeholder="الرقم القومي (14 رقم)"
                    value={form.nationalID} onChange={setField('nationalID')}
                    onBlur={() => validate('nationalID', form.nationalID.trim(), 'nationalID')}
                    fieldIcon="fa-solid fa-fingerprint" fieldState={fieldStates['nationalID'] ?? null}
                    maxLength={14} inputMode="numeric"
                  />
                  <FieldHint state={fieldStates['nationalID'] ?? null} validMsg={rules.nationalID.ok} invalidMsg={rules.nationalID.msg} />
                </div>
              )}

              {form.roleType === 'user' && (
                <div className="lp-user-ready-msg">
                  <i className="fa-solid fa-circle-check" />
                  <span>كل شيء جاهز! اضغط سجل الآن للإنهاء</span>
                </div>
              )}

              <div className="lp-wizard-nav">
                <button type="button" className="lp-btn-outline" onClick={() => setCurrentStep(2)}>
                  <i className="fa-solid fa-arrow-right" /> السابق
                </button>
                <button type="submit" className="lp-btn-gold" disabled={loading}>
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin" /> جاري التسجيل...</>
                    : <><i className="fa-solid fa-user-plus" /> سجل الآن</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </form>
    </>
  );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────

const INITIAL_FORM: RegisterForm = {
  userName: '', email: '', password: '', confirmPassword: '',
  phone: '', address: '', roleType: '',
  charityName: '', licenseNumber: '', charityDescription: '', nationalID: '',
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const {pendingVerify} = useAuth();

  const initialMode = (): 'login' | 'signup' => {
    const params = new URLSearchParams(window.location.search);
    return params.get('mode') === 'signup' ? 'signup' : 'login';
  };

  const [mode, setMode]         = useState<'login' | 'signup'>(initialMode);
  const [showForgot, setShowForgot] = useState(false);
  const [toast, setToast]           = useState<ToastState | null>(null);

  // ✅ الـ Fix: form و currentStep رُفعوا هنا في الـ parent
  // بالتالي Toast re-render مش بيأثر عليهم
  const [registerForm, setRegisterForm]     = useState<RegisterForm>(INITIAL_FORM);
  const [registerStep, setRegisterStep]     = useState(1);

  const showToast  = useCallback((msg: string, type: ToastType = 'error') => setToast({ message: msg, type }), []);
  const closeToast = useCallback(() => setToast(null), []);
  const isSignup   = mode === 'signup' && !showForgot;

  // ✅ لما يتبدل الـ mode لـ login أو signup، نرجع للـ step 1
  const handleSetMode = useCallback((newMode: 'login' | 'signup') => {
    setMode(newMode);
    if (newMode === 'signup') {
      setRegisterStep(1);
    }
  }, []);
    if (pendingVerify) {
    return (
      <div className="lp-body">
        <button className="lp-home-btn" onClick={() => setLocation('/')}>
          <i className="fa-solid fa-house" />
          <span>الرئيسية</span>
        </button>
        <VerifyEmailPage />  {/* ✅ صفحة OTP */}
      </div>
    );
  }

  return (
    <div className="lp-body">
      <Toast toast={toast} onClose={closeToast} />

      <button className="lp-home-btn" onClick={() => setLocation('/')}>
        <i className="fa-solid fa-house" />
        <span className="lp-home-btn-text">الرئيسية</span>
      </button>

      <div className={`lp-container${isSignup ? ' active' : ''}`}>
        <div className="lp-forms-container">

          {/* ── Login Form ── */}
          <div className="lp-form-wrapper lp-login-form">
            {showForgot
              ? <ForgotPasswordModal
                  onClose={() => setShowForgot(false)}
                  onSwitchToLogin={() => { setShowForgot(false); handleSetMode('login'); }}
                />
              : <LoginSection
                  onForgot={() => setShowForgot(true)}
                  onToast={showToast}
                />
            }
          </div>

          {/* ── Register Form ── */}
          <div className="lp-form-wrapper lp-register-form">
            <RegisterSection
              onToast={showToast}
              form={registerForm}
              setForm={setRegisterForm}
              currentStep={registerStep}
              setCurrentStep={setRegisterStep}
            />
          </div>

        </div>

        {/* ── Side Panel ── */}
        <div className="lp-side-panel">
          <div className="lp-panel-content lp-panel-login-mode">
            <h1>مرحباً بعودتك!</h1>
            <p>ليس لديك حساب بعد؟<br />انضم إلينا اليوم لبدء رحلة العطاء.</p>
            <button className="lp-ghost-btn" onClick={() => handleSetMode('signup')}>إنشاء حساب</button>
          </div>
          <div className="lp-panel-content lp-panel-register-mode">
            <h1>أهلاً بك في عطاء!</h1>
            <p>لديك حساب بالفعل؟<br />سجل دخولك للمتابعة.</p>
            <button className="lp-ghost-btn" onClick={() => handleSetMode('login')}>تسجيل الدخول</button>
          </div>
        </div>

      </div>
    </div>
  );
}