// import { useEffect, useState, useCallback } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { formatDate } from '../../lib/utils';
// import { Link } from 'wouter';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend,
// } from 'recharts';

// import '../../styles/css/AdminPanel.css';

// import {
//   apiFetch, fetchPage,
//   User, Charity, Report, Tab, ApprovalStatus,
//   APPROVAL_CFG, ROLE_CFG,
//   TEAL, TEAL2, AMBER, GREEN, RED, BORDER,
//   fmt,
// } from './adminTypes';

// // ─── Premium pulse-dots spinner ───────────────────────────────────────────────
// function Spinner({ label }: { label?: string }) {
//   return (
//     <div className="ap-loading-center">
//       <div className="ap-spinner">
//         <div className="ap-spinner-dot" />
//         <div className="ap-spinner-dot" />
//         <div className="ap-spinner-dot" />
//       </div>
//       {label && <span>{label}</span>}
//     </div>
//   );
// }

// // Small inline spinner for buttons / drawers
// function MiniSpinner() {
//   return (
//     <div className="ap-spinner" style={{ gap: 4 }}>
//       <div className="ap-spinner-dot" style={{ width: 7, height: 7 }} />
//       <div className="ap-spinner-dot" style={{ width: 7, height: 7 }} />
//       <div className="ap-spinner-dot" style={{ width: 7, height: 7 }} />
//     </div>
//   );
// }

// // ─── Shared badge components ──────────────────────────────────────────────────
// function StatusBadge({ status }: { status: string }) {
//   const cfg = APPROVAL_CFG[status as ApprovalStatus] ?? {
//     label: status, bg: '#F1EFE8', color: '#444', dot: '#888',
//   };
//   return (
//     <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
//       <span className="dot" style={{ background: cfg.dot }} />
//       {cfg.label}
//     </span>
//   );
// }

// function RoleBadge({ role }: { role: string }) {
//   const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? {
//     label: role, bg: '#f3f4f6', color: '#374151', icon: '',
//   };
//   return (
//     <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
//       {cfg.icon} {cfg.label}
//     </span>
//   );
// }

// // ─── Toast ────────────────────────────────────────────────────────────────────
// function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
//   if (!msg) return null;
//   return (
//     <div className={`ap-toast ${msg.type}`}>
//       <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
//       {msg.text}
//     </div>
//   );
// }

// // ─── Confirm Modal ────────────────────────────────────────────────────────────
// interface ConfirmState {
//   title: string;
//   message: string;
//   confirmLabel?: string;
//   variant?: 'danger' | 'ok';
//   icon?: string;
//   onConfirm: () => void;
// }

// function ConfirmModal({ opts, loading, onClose }: {
//   opts: ConfirmState | null;
//   loading: boolean;
//   onClose: () => void;
// }) {
//   if (!opts) return null;
//   const isDanger = opts.variant !== 'ok';
//   const accent = isDanger ? RED : TEAL2;
//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: accent + '18' }}>
//             <i className={`ti ${opts.icon ?? (isDanger ? 'ti-trash' : 'ti-check')}`} style={{ color: accent }} />
//           </div>
//           <h3 className="ap-modal-title">{opts.title}</h3>
//           <p className="ap-modal-msg">{opts.message}</p>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={loading}
//               style={{ background: accent }}
//               onClick={opts.onConfirm}
//             >
//               {loading && <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />}
//               {opts.confirmLabel ?? 'تأكيد'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Reject Modal ─────────────────────────────────────────────────────────────
// function RejectModal({ target, loading, onClose, onConfirm }: {
//   target: { id: string; name: string } | null;
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: (reason: string) => void;
// }) {
//   const [reason, setReason] = useState('');
//   useEffect(() => { if (target) setReason(''); }, [target]);
//   if (!target) return null;
//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget && !loading) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: RED + '18' }}>
//             <i className="ti ti-x" style={{ color: RED }} />
//           </div>
//           <h3 className="ap-modal-title">رفض جمعية</h3>
//           <p className="ap-modal-msg">
//             رفض <strong>"{target.name}"</strong> — يمكنك إضافة سبب يصل للجمعية بالبريد الإلكتروني.
//           </p>
//           <div className="ap-form-group" style={{ marginBottom: 20 }}>
//             <label className="ap-form-label">سبب الرفض <span style={{ color: 'var(--text-4)', fontWeight: 400 }}>(اختياري)</span></label>
//             <textarea
//               className="ap-form-textarea"
//               rows={3}
//               value={reason}
//               onChange={e => setReason(e.target.value)}
//               placeholder="اكتب سبب الرفض هنا..."
//             />
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={loading}
//               style={{ background: RED }}
//               onClick={() => onConfirm(reason)}
//             >
//               {loading && <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />}
//               تأكيد الرفض
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Edit Charity Modal ───────────────────────────────────────────────────────
// function EditCharityModal({ target, loading, setLoading, onClose, onSaved, showMsg }: {
//   target: Charity | null;
//   loading: string | null;
//   setLoading: (v: string | null) => void;
//   onClose: () => void;
//   onSaved: (id: string, form: { charityName: string; address: string; description: string }) => void;
//   showMsg: (type: 'success' | 'error', text: string) => void;
// }) {
//   const [form, setForm] = useState({ charityName: '', address: '', description: '' });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (target) {
//       setForm({
//         charityName: target.charityName ?? '',
//         address:     target.address ?? '',
//         description: target.description ?? '',
//       });
//       setErrors({});
//     }
//   }, [target]);

//   if (!target) return null;

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!form.charityName.trim() || form.charityName.trim().length < 3)
//       e.charityName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
//     if (!form.address.trim() || form.address.trim().length < 5)
//       e.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
//     return e;
//   };

//   const isBusy = loading === 'edit-' + target._id;
//   const changed =
//     form.charityName !== (target.charityName ?? '') ||
//     form.address     !== (target.address ?? '') ||
//     form.description !== (target.description ?? '');

//   const handleSave = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setLoading('edit-' + target._id);
//     try {
//       await apiFetch(`/charity/${target._id}`, {
//         method: 'PATCH',
//         body: JSON.stringify({
//           charityName: form.charityName.trim(),
//           address:     form.address.trim(),
//           description: form.description.trim(),
//         }),
//       });
//       onSaved(target._id, form);
//       showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
//       onClose();
//     } catch (err: any) {
//       showMsg('error', err?.message || 'فشل التحديث');
//     } finally {
//       setLoading(null);
//     }
//   };

//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget && !isBusy) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: TEAL2 + '18' }}>
//             <i className="ti ti-edit" style={{ color: TEAL2 }} />
//           </div>
//           <h3 className="ap-modal-title">تعديل بيانات الجمعية</h3>
//           <p className="ap-modal-msg" style={{ marginBottom: 16 }}>{target.charityName}</p>

//           <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
//             <div className="ap-form-group">
//               <label className="ap-form-label">اسم الجمعية <span style={{ color: RED }}>*</span></label>
//               <input
//                 className={`ap-form-input${errors.charityName ? ' error' : ''}`}
//                 value={form.charityName}
//                 onChange={e => { setForm(f => ({ ...f, charityName: e.target.value })); setErrors(er => ({ ...er, charityName: '' })); }}
//                 placeholder="اسم الجمعية"
//               />
//               {errors.charityName && (
//                 <div className="ap-form-err"><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.charityName}</div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">العنوان <span style={{ color: RED }}>*</span></label>
//               <input
//                 className={`ap-form-input${errors.address ? ' error' : ''}`}
//                 value={form.address}
//                 onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setErrors(er => ({ ...er, address: '' })); }}
//                 placeholder="عنوان الجمعية"
//               />
//               {errors.address && (
//                 <div className="ap-form-err"><i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.address}</div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">الوصف</label>
//               <textarea
//                 className="ap-form-textarea"
//                 rows={3}
//                 value={form.description}
//                 onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
//                 placeholder="وصف مختصر..."
//               />
//             </div>
//           </div>

//           <div className="ap-info-box" style={{ marginBottom: 18 }}>
//             <div className="ap-info-row">
//               <span className="lbl">البريد:</span>
//               <span className="val">{target.email}</span>
//             </div>
//             <div className="ap-info-row">
//               <span className="lbl">الحالة:</span>
//               <span className="val"><StatusBadge status={target.approvalStatus} /></span>
//             </div>
//             {target.licenseNumber && (
//               <div className="ap-info-row">
//                 <span className="lbl">الترخيص:</span>
//                 <span className="val">{target.licenseNumber}</span>
//               </div>
//             )}
//           </div>

//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={isBusy || !changed}
//               style={{ background: TEAL2 }}
//               onClick={handleSave}
//             >
//               {isBusy && <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />}
//               {isBusy ? 'جاري الحفظ...' : 'حفظ التغييرات'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── User Detail Drawer ───────────────────────────────────────────────────────
// function UserDrawer({
//   userId, onClose, onDelete, actionLoading,
// }: {
//   userId: string | null;
//   onClose: () => void;
//   onDelete: (id: string, name: string) => void;
//   actionLoading: string | null;
// }) {
//   const [data, setData]   = useState<User | null>(null);
//   const [busy, setBusy]   = useState(false);
//   const [err,  setErr]    = useState(false);

//   useEffect(() => {
//     if (!userId) { setData(null); setErr(false); return; }
//     setBusy(true); setErr(false);
//     apiFetch(`/users/${userId}`)
//       .then(res => setData(res.user ?? res.finder ?? res.data ?? res))
//       .catch(() => setErr(true))
//       .finally(() => setBusy(false));
//   }, [userId]);

//   if (!userId) return null;

//   const cfg      = data ? (ROLE_CFG[data.roleType] ?? ROLE_CFG.user) : null;
//   const initials = data?.userName?.slice(0, 2).toUpperCase() ?? '..';
//   const verified = data ? (data.isVerified || data.verify) : false;

//   return (
//     <>
//       <div className="ap-drawer-overlay" onClick={onClose} />
//       <div className="ap-drawer">

//         {/* Header */}
//         <div className="ap-drawer-header">
//           <div className="ap-drawer-header-left">
//             <div className="ap-drawer-header-icon" style={{ background: '#eff6ff' }}>
//               <i className="ti ti-user" style={{ color: '#3b82f6' }} />
//             </div>
//             <div>
//               <div className="ap-drawer-title">تفاصيل المستخدم</div>
//               {data && <div className="ap-drawer-subtitle">{data.email}</div>}
//             </div>
//           </div>
//           <button className="ap-drawer-close" onClick={onClose}>
//             <i className="ti ti-x" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="ap-drawer-body">
//           {busy ? (
//             <div className="ap-drawer-loading">
//               <MiniSpinner />
//               <span>جاري تحميل البيانات...</span>
//             </div>
//           ) : err ? (
//             <div className="ap-drawer-error">
//               <i className="ti ti-user-off" />
//               <div style={{ fontWeight: 700, color: 'var(--text-2)' }}>تعذّر تحميل بيانات المستخدم</div>
//               <div style={{ fontSize: 12 }}>تحقق من الاتصال وحاول مرة أخرى</div>
//               <button
//                 onClick={() => { setBusy(true); setErr(false); apiFetch(`/users/${userId}`).then(r => setData(r.user ?? r.finder ?? r.data ?? r)).catch(() => setErr(true)).finally(() => setBusy(false)); }}
//                 className="action-btn view"
//                 style={{ marginTop: 8 }}
//               >
//                 <i className="ti ti-refresh" />إعادة المحاولة
//               </button>
//             </div>
//           ) : data ? (
//             <>
//               {/* Hero */}
//               <div className="ap-drawer-hero">
//                 <div
//                   className="drawer-avatar"
//                   style={{ background: cfg ? `linear-gradient(135deg, ${cfg.color}cc, ${cfg.color})` : `linear-gradient(135deg, ${TEAL}, ${TEAL2})` }}
//                 >
//                   {initials}
//                 </div>
//                 <div className="drawer-name">{data.userName}</div>
//                 <div className="drawer-email">{data.email}</div>
//                 <div className="drawer-badges-row">
//                   <RoleBadge role={data.roleType} />
//                   <span className="badge" style={{
//                     background: verified ? '#EAF3DE' : '#FCEBEB',
//                     color:      verified ? '#27500A' : '#791F1F',
//                   }}>
//                     <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
//                     {verified ? 'حساب موثق' : 'غير موثق'}
//                   </span>
//                 </div>
//               </div>

//               {/* Sections */}
//               <div className="ap-drawer-sections">

//                 {/* Contact */}
//                 <div className="drawer-section">
//                   <div className="drawer-section-header">
//                     <i className="ti ti-address-book" />
//                     <span className="drawer-section-title">بيانات التواصل</span>
//                   </div>
//                   <div className="drawer-fields">
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">البريد الإلكتروني</span>
//                       <span className="drawer-field-value">{data.email}</span>
//                     </div>
//                     {data.phone && (
//                       <div className="drawer-field">
//                         <span className="drawer-field-label">الهاتف</span>
//                         <span className="drawer-field-value">{data.phone}</span>
//                       </div>
//                     )}
//                     {data.address && (
//                       <div className="drawer-field">
//                         <span className="drawer-field-label">العنوان</span>
//                         <span className="drawer-field-value">{data.address}</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Account */}
//                 <div className="drawer-section">
//                   <div className="drawer-section-header">
//                     <i className="ti ti-settings" />
//                     <span className="drawer-section-title">بيانات الحساب</span>
//                   </div>
//                   <div className="drawer-fields">
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">الدور</span>
//                       <span className="drawer-field-value"><RoleBadge role={data.roleType} /></span>
//                     </div>
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">التوثيق</span>
//                       <span className="drawer-field-value">
//                         <span style={{ color: verified ? GREEN : RED, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
//                           <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} />
//                           {verified ? 'موثق' : 'غير موثق'}
//                         </span>
//                       </span>
//                     </div>
//                     {data.createdAt && (
//                       <div className="drawer-field">
//                         <span className="drawer-field-label">تاريخ الإنشاء</span>
//                         <span className="drawer-field-value">{fmt(data.createdAt)}</span>
//                       </div>
//                     )}
//                     {data.updatedAt && (
//                       <div className="drawer-field">
//                         <span className="drawer-field-label">آخر تعديل</span>
//                         <span className="drawer-field-value">{fmt(data.updatedAt)}</span>
//                       </div>
//                     )}
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">المعرّف</span>
//                       <span className="drawer-field-value mono">{data._id}</span>
//                     </div>
//                   </div>
//                 </div>

//               </div>
//             </>
//           ) : null}
//         </div>

//         {/* Footer actions */}
//         {data && (
//           <div className="drawer-footer">
//             {data.roleType !== 'admin' && (
//               <button
//                 className="action-btn delete"
//                 style={{ flex: 1, justifyContent: 'center' }}
//                 disabled={!!actionLoading}
//                 onClick={() => { onDelete(data._id, data.userName); onClose(); }}
//               >
//                 <i className="ti ti-trash" />حذف الحساب
//               </button>
//             )}
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // ─── Charity Detail Drawer ────────────────────────────────────────────────────
// function CharityDrawer({
//   charityId, onClose, onApprove, onReject, onEdit, onDelete, actionLoading,
// }: {
//   charityId: string | null;
//   onClose: () => void;
//   onApprove: (id: string, name: string) => void;
//   onReject:  (target: { id: string; name: string }) => void;
//   onEdit:    (c: Charity) => void;
//   onDelete:  (id: string, name: string) => void;
//   actionLoading: string | null;
// }) {
//   const [data, setData] = useState<Charity | null>(null);
//   const [busy, setBusy] = useState(false);
//   const [err,  setErr]  = useState(false);

//   const load = useCallback(() => {
//     if (!charityId) return;
//     setBusy(true); setErr(false);
//     apiFetch(`/charity/${charityId}`)
//       .then(res => setData(res.charity ?? res.data ?? res))
//       .catch(() => setErr(true))
//       .finally(() => setBusy(false));
//   }, [charityId]);

//   useEffect(() => {
//     if (charityId) load();
//     else { setData(null); setErr(false); }
//   }, [charityId, load]);

//   if (!charityId) return null;

//   const sCfg    = data ? (APPROVAL_CFG[data.approvalStatus] ?? APPROVAL_CFG.pending) : null;
//   const initials = data?.charityName?.slice(0, 2).toUpperCase() ?? '..';

//   return (
//     <>
//       <div className="ap-drawer-overlay" onClick={onClose} />
//       <div className="ap-drawer">

//         {/* Header */}
//         <div className="ap-drawer-header">
//           <div className="ap-drawer-header-left">
//             <div className="ap-drawer-header-icon" style={{ background: '#ecfdf5' }}>
//               <i className="ti ti-building-community" style={{ color: TEAL2 }} />
//             </div>
//             <div>
//               <div className="ap-drawer-title">تفاصيل الجمعية</div>
//               {data && <div className="ap-drawer-subtitle">{data.email}</div>}
//             </div>
//           </div>
//           <button className="ap-drawer-close" onClick={onClose}>
//             <i className="ti ti-x" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="ap-drawer-body">
//           {busy ? (
//             <div className="ap-drawer-loading">
//               <MiniSpinner />
//               <span>جاري تحميل البيانات...</span>
//             </div>
//           ) : err ? (
//             <div className="ap-drawer-error">
//               <i className="ti ti-building-off" />
//               <div style={{ fontWeight: 700, color: 'var(--text-2)' }}>تعذّر تحميل بيانات الجمعية</div>
//               <button onClick={load} className="action-btn view" style={{ marginTop: 8 }}>
//                 <i className="ti ti-refresh" />إعادة المحاولة
//               </button>
//             </div>
//           ) : data ? (
//             <>
//               {/* Hero */}
//               <div className="ap-drawer-hero">
//                 <div
//                   className="drawer-avatar"
//                   style={{ background: `linear-gradient(135deg, ${sCfg!.dot}, ${TEAL2})` }}
//                 >
//                   {initials}
//                 </div>
//                 <div className="drawer-name">{data.charityName}</div>
//                 <div className="drawer-email">{data.email}</div>
//                 <div className="drawer-badges-row">
//                   <StatusBadge status={data.approvalStatus} />
//                   {data.licenseNumber && (
//                     <span className="badge" style={{ background: '#f3f4f6', color: 'var(--text-2)' }}>
//                       <i className="ti ti-certificate" style={{ fontSize: 11 }} />
//                       {data.licenseNumber}
//                     </span>
//                   )}
//                 </div>
//               </div>

//               {/* Sections */}
//               <div className="ap-drawer-sections">

//                 {/* Contact */}
//                 <div className="drawer-section">
//                   <div className="drawer-section-header">
//                     <i className="ti ti-address-book" />
//                     <span className="drawer-section-title">بيانات التواصل</span>
//                   </div>
//                   <div className="drawer-fields">
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">البريد</span>
//                       <span className="drawer-field-value">{data.email}</span>
//                     </div>
//                     {data.phone && (
//                       <div className="drawer-field">
//                         <span className="drawer-field-label">الهاتف</span>
//                         <span className="drawer-field-value">{data.phone}</span>
//                       </div>
//                     )}
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">العنوان</span>
//                       <span className="drawer-field-value">{data.address || '—'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* About */}
//                 <div className="drawer-section">
//                   <div className="drawer-section-header">
//                     <i className="ti ti-info-circle" />
//                     <span className="drawer-section-title">عن الجمعية</span>
//                   </div>
//                   <div className="drawer-fields">
//                     {data.description && (
//                       <div className="drawer-field">
//                         <span className="drawer-field-label">الوصف</span>
//                         <span className="drawer-field-value" style={{ lineHeight: 1.7 }}>{data.description}</span>
//                       </div>
//                     )}
//                     {data.licenseNumber && (
//                       <div className="drawer-field">
//                         <span className="drawer-field-label">رقم الترخيص</span>
//                         <span className="drawer-field-value">{data.licenseNumber}</span>
//                       </div>
//                     )}
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">تاريخ الإنشاء</span>
//                       <span className="drawer-field-value">{fmt(data.createdAt)}</span>
//                     </div>
//                     <div className="drawer-field">
//                       <span className="drawer-field-label">المعرّف</span>
//                       <span className="drawer-field-value mono">{data._id}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Rejection reason */}
//                 {data.rejectionReason && (
//                   <div className="drawer-section" style={{ borderColor: '#fecaca' }}>
//                     <div className="drawer-section-header" style={{ background: '#fef2f2', borderBottomColor: '#fecaca' }}>
//                       <i className="ti ti-alert-triangle" style={{ color: RED }} />
//                       <span className="drawer-section-title" style={{ color: RED }}>سبب الرفض</span>
//                     </div>
//                     <div className="drawer-fields">
//                       <div className="drawer-field">
//                         <span className="drawer-field-value danger">{data.rejectionReason}</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Quick actions inline */}
//                 {data.approvalStatus === 'pending' && (
//                   <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
//                     <button
//                       className="action-btn approve"
//                       style={{ flex: 1, justifyContent: 'center' }}
//                       disabled={!!actionLoading}
//                       onClick={() => { onApprove(data._id, data.charityName); onClose(); }}
//                     >
//                       <i className="ti ti-check" />موافقة
//                     </button>
//                     <button
//                       className="action-btn reject"
//                       style={{ flex: 1, justifyContent: 'center' }}
//                       disabled={!!actionLoading}
//                       onClick={() => { onReject({ id: data._id, name: data.charityName }); onClose(); }}
//                     >
//                       <i className="ti ti-x" />رفض
//                     </button>
//                   </div>
//                 )}

//               </div>
//             </>
//           ) : null}
//         </div>

//         {/* Footer */}
//         {data && (
//           <div className="drawer-footer">
//             <button className="action-btn edit" onClick={() => { onEdit(data); onClose(); }} disabled={!!actionLoading}>
//               <i className="ti ti-edit" />تعديل
//             </button>
//             <Link href={`/charities/${data._id}`} className="action-btn view" style={{ textDecoration: 'none' }} onClick={onClose}>
//               <i className="ti ti-external-link" />الصفحة العامة
//             </Link>
//             <button
//               className="action-btn delete"
//               style={{ marginRight: 'auto' }}
//               disabled={!!actionLoading}
//               onClick={() => { onDelete(data._id, data.charityName); onClose(); }}
//             >
//               <i className="ti ti-trash" />حذف
//             </button>
//           </div>
//         )}
//       </div>
//     </>
//   );
// }

// // ─── Section title ────────────────────────────────────────────────────────────
// function SectionTitle({ icon, color, title, badge }: {
//   icon: string; color: string; title: string; badge?: number;
// }) {
//   return (
//     <div className="ap-section-title" style={{ marginBottom: 0 }}>
//       <i className={`ti ${icon}`} style={{ color }} />
//       {title}
//       {badge != null && badge > 0 && (
//         <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
//       )}
//     </div>
//   );
// }

// // ─── Recharts tooltip style ───────────────────────────────────────────────────
// const tooltipStyle = {
//   background: '#fff',
//   border: `1px solid ${BORDER}`,
//   borderRadius: 9,
//   padding: '8px 14px',
//   fontSize: 13,
//   fontFamily: 'Tajawal, sans-serif',
//   direction: 'rtl' as const,
// };

// // ─── CronCard ─────────────────────────────────────────────────────────────────
// function CronCard({ emoji, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: any) {
//   return (
//     <div className="cron-card">
//       <div className="cron-emoji">{emoji}</div>
//       <div className="cron-title">{title}</div>
//       <p className="cron-desc">{desc}</p>
//       <div className="cron-code" style={{ background: codeBg, borderColor: codeBorder, color: codeColor }}>{code}</div>
//       <button
//         className="cron-run-btn"
//         disabled={loading}
//         style={{ background: loading ? undefined : btnColor }}
//         onClick={onRun}
//       >
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />جاري التشغيل...</>
//           : <><i className="ti ti-player-play" style={{ fontSize: 14 }} />تشغيل الآن</>
//         }
//       </button>
//     </div>
//   );
// }

// // ═══════════════════════════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ═══════════════════════════════════════════════════════════════════════════════
// export default function AdminPanel() {
//   const { user, isLoading, logout } = useAuth() as any;

//   // ── UI state ───────────────────────────────────────────────────────────────
//   const [tab,           setTab]           = useState<Tab>('overview');
//   const [search,        setSearch]        = useState('');
//   const [charityFilter, setCharityFilter] = useState<'all' | ApprovalStatus>('all');
//   const [userView,      setUserView]      = useState<'table' | 'cards'>('table');
//   const [charityView,   setCharityView]   = useState<'table' | 'cards'>('table');

//   // ── Data state ─────────────────────────────────────────────────────────────
//   const [users,     setUsers]     = useState<User[]>([]);
//   const [charities, setCharities] = useState<Charity[]>([]);
//   const [reports,   setReports]   = useState<Report[]>([]);

//   const [usersTotal,     setUsersTotal]     = useState(0);
//   const [charitiesTotal, setCharitiesTotal] = useState(0);
//   const [reportsTotal,   setReportsTotal]   = useState(0);

//   const [usersPage,     setUsersPage]     = useState(1);
//   const [charitiesPage, setCharitiesPage] = useState(1);
//   const [reportsPage,   setReportsPage]   = useState(1);

//   const [hasMoreUsers,     setHasMoreUsers]     = useState(false);
//   const [hasMoreCharities, setHasMoreCharities] = useState(false);
//   const [hasMoreReports,   setHasMoreReports]   = useState(false);

//   const [loading,     setLoading]     = useState(true);
//   const [pageError,   setPageError]   = useState<string | null>(null);
//   const [loadingMore, setLoadingMore] = useState<string | null>(null);

//   // ── Action / modal state ───────────────────────────────────────────────────
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [msg,           setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
//   const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
//   const [confirmBusy,   setConfirmBusy]   = useState(false);
//   const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
//   const [editTarget,    setEditTarget]    = useState<Charity | null>(null);
//   const [userDrawerId,  setUserDrawerId]  = useState<string | null>(null);
//   const [charDrawerId,  setCharDrawerId]  = useState<string | null>(null);

//   // ── Cron state ─────────────────────────────────────────────────────────────
//   const [cronLoading, setCronLoading] = useState(false);
//   const [cronLog,     setCronLog]     = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
//   const [lastRun,     setLastRun]     = useState(0);

//   // ── Helpers ────────────────────────────────────────────────────────────────
//   const showMsg = (type: 'success' | 'error', text: string) => {
//     setMsg({ type, text });
//     setTimeout(() => setMsg(null), 3200);
//   };

//   const confirm = (opts: ConfirmState) => setConfirmOpts(opts);

//   // ── Initial load ───────────────────────────────────────────────────────────
//   const loadData = useCallback(async () => {
//     setLoading(true); setPageError(null);
//     setUsersPage(1); setCharitiesPage(1); setReportsPage(1);
//     try {
//       const [uRes, cRes, rRes] = await Promise.allSettled([
//         fetchPage<User>('/users', 1, 10),
//         fetchPage<Charity>('/charity/charities', 1, 10),
//         fetchPage<Report>('/report', 1, 10),
//       ]);
//       if (uRes.status === 'fulfilled') { setUsers(uRes.value.data); setUsersTotal(uRes.value.total); setHasMoreUsers(uRes.value.hasMore); }
//       if (cRes.status === 'fulfilled') { setCharities(cRes.value.data); setCharitiesTotal(cRes.value.total); setHasMoreCharities(cRes.value.hasMore); }
//       if (rRes.status === 'fulfilled') { setReports(rRes.value.data); setReportsTotal(rRes.value.total); setHasMoreReports(rRes.value.hasMore); }
//     } catch (err: any) {
//       setPageError(err?.message || 'فشل تحميل البيانات');
//       if (err?.status === 401) setTimeout(() => logout?.(), 2000);
//     } finally { setLoading(false); }
//   }, [logout]);

//   useEffect(() => { if (user?.roleType === 'admin') loadData(); }, [user, loadData]);

//   // ── Load more ──────────────────────────────────────────────────────────────
//   const loadMoreUsers = async () => {
//     const next = usersPage + 1;
//     setLoadingMore('users');
//     try {
//       const res = await fetchPage<User>('/users', next, 10);
//       setUsers(prev => [...prev, ...res.data]);
//       setUsersPage(next); setHasMoreUsers(res.hasMore);
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreCharities = async () => {
//     const next = charitiesPage + 1;
//     setLoadingMore('charities');
//     try {
//       const res = await fetchPage<Charity>('/charity/charities', next, 10);
//       setCharities(prev => [...prev, ...res.data]);
//       setCharitiesPage(next); setHasMoreCharities(res.hasMore);
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreReports = async () => {
//     const next = reportsPage + 1;
//     setLoadingMore('reports');
//     try {
//       const res = await fetchPage<Report>('/report', next, 10);
//       setReports(prev => [...prev, ...res.data]);
//       setReportsPage(next); setHasMoreReports(res.hasMore);
//     } finally { setLoadingMore(null); }
//   };

//   // ── User actions ───────────────────────────────────────────────────────────
//   const handleDeleteUser = (id: string, name: string) => {
//     confirm({
//       title: `حذف المستخدم`,
//       message: `هل أنت متأكد من حذف "${name}"؟ لا يمكن التراجع عن هذا الإجراء.`,
//       confirmLabel: 'حذف المستخدم',
//       variant: 'danger', icon: 'ti-trash',
//       onConfirm: async () => {
//         setConfirmBusy(true);
//         try {
//           await apiFetch(`/users/${id}`, { method: 'DELETE' });
//           setUsers(prev => prev.filter(u => u._id !== id));
//           showMsg('success', `تم حذف "${name}"`);
//           setConfirmOpts(null);
//         } catch (e: any) { showMsg('error', e?.message || 'حدث خطأ'); }
//         finally { setConfirmBusy(false); }
//       },
//     });
//   };

//   // ── Charity actions ────────────────────────────────────────────────────────
//   const handleApprove = async (id: string, name: string) => {
//     setActionLoading('approve-' + id);
//     try {
//       await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
//       setCharities(prev => prev.map(c => c._id === id ? { ...c, approvalStatus: 'approved', rejectionReason: undefined } : c));
//       showMsg('success', `✅ تمت الموافقة على "${name}"`);
//     } catch (e: any) { showMsg('error', e?.message || 'حدث خطأ'); }
//     finally { setActionLoading(null); }
//   };

//   const handleReject = async (reason: string) => {
//     if (!rejectTarget) return;
//     const { id, name } = rejectTarget;
//     setActionLoading('reject-' + id);
//     try {
//       await apiFetch(`/charity/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ rejectionReason: reason }) });
//       setCharities(prev => prev.map(c => c._id === id ? { ...c, approvalStatus: 'rejected', rejectionReason: reason } : c));
//       showMsg('success', `تم رفض "${name}"`);
//     } catch (e: any) { showMsg('error', e?.message || 'حدث خطأ'); }
//     finally { setActionLoading(null); setRejectTarget(null); }
//   };

//   const handleEditSaved = (id: string, form: { charityName: string; address: string; description: string }) => {
//     setCharities(prev => prev.map(c => c._id === id ? { ...c, ...form } : c));
//   };

//   const handleDeleteCharity = (id: string, name: string) => {
//     confirm({
//       title: 'حذف الجمعية',
//       message: `هل أنت متأكد من حذف جمعية "${name}"؟ سيتم حذف جميع بياناتها نهائيًا.`,
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-trash',
//       onConfirm: async () => {
//         setConfirmBusy(true);
//         try {
//           await apiFetch(`/charity/${id}`, { method: 'DELETE' });
//           setCharities(prev => prev.filter(c => c._id !== id));
//           showMsg('success', `تم حذف "${name}"`);
//           setConfirmOpts(null);
//         } catch (e: any) { showMsg('error', e?.message || 'حدث خطأ'); }
//         finally { setConfirmBusy(false); }
//       },
//     });
//   };

//   // ── Cron ───────────────────────────────────────────────────────────────────
//   const runAdminReport = async () => {
//     if (Date.now() - lastRun < 30_000) { showMsg('error', 'انتظر 30 ثانية قبل إعادة التشغيل'); return; }
//     setCronLoading(true);
//     try {
//       await apiFetch('/cron/adminReport');
//       setLastRun(Date.now());
//       setCronLog(prev => [{ type: 'success', text: '✅ تم تشغيل تقرير الأدمن بنجاح', time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
//     } catch (err: any) {
//       setCronLog(prev => [{ type: 'error', text: `❌ ${err?.message || 'فشل التشغيل'}`, time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
//     } finally { setCronLoading(false); }
//   };

//   const runDonationReminder = async () => {
//     setCronLoading(true);
//     try {
//       await apiFetch('/cron/donationReminder');
//       setCronLog(prev => [{ type: 'success', text: '✅ تم إرسال تذكيرات التبرعات', time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
//     } catch (err: any) {
//       setCronLog(prev => [{ type: 'error', text: `❌ ${err?.message || 'فشل التشغيل'}`, time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
//     } finally { setCronLoading(false); }
//   };

//   // ── Derived data ───────────────────────────────────────────────────────────
//   const q = search.trim().toLowerCase();
//   const filteredUsers = users.filter(u =>
//     !q || u.userName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.roleType?.includes(q)
//   );
//   const filteredCharities = charities.filter(c => {
//     if (charityFilter !== 'all' && c.approvalStatus !== charityFilter) return false;
//     return !q || c.charityName?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
//   });
//   const filteredReports = reports.filter(r =>
//     !q || r.description?.toLowerCase().includes(q) || r.userName?.toLowerCase().includes(q) || r.senderType?.toLowerCase().includes(q)
//   );
//   const pendingCharities = charities.filter(c => c.approvalStatus === 'pending');
//   const sortedCharities  = [...filteredCharities].sort((a, b) => {
//     const o: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
//     return (o[a.approvalStatus] ?? 1) - (o[b.approvalStatus] ?? 1);
//   });

//   // ── Chart data ─────────────────────────────────────────────────────────────
//   const overviewBarData = [
//     { name: 'المستخدمون', value: usersTotal || users.length,         fill: '#3b82f6' },
//     { name: 'الجمعيات',   value: charitiesTotal || charities.length, fill: TEAL2    },
//     { name: 'التقارير',   value: reportsTotal || reports.length,     fill: AMBER    },
//   ];
//   const charityPieData = [
//     { name: 'معلقة',   value: charities.filter(c => c.approvalStatus === 'pending').length,  color: AMBER },
//     { name: 'مقبولة',  value: charities.filter(c => c.approvalStatus === 'approved').length, color: GREEN },
//     { name: 'مرفوضة', value: charities.filter(c => c.approvalStatus === 'rejected').length,  color: RED   },
//   ].filter(d => d.value > 0);
//   const rolePieData = [
//     { name: 'متبرعون', value: users.filter(u => u.roleType === 'user').length,    color: '#3b82f6' },
//     { name: 'جمعيات',  value: users.filter(u => u.roleType === 'charity').length, color: TEAL2    },
//     { name: 'أدمن',    value: users.filter(u => u.roleType === 'admin').length,   color: '#8b5cf6' },
//   ].filter(d => d.value > 0);

//   // ── Guards ─────────────────────────────────────────────────────────────────
//   if (isLoading) return <Spinner label="جاري التحقق من الصلاحيات..." />;

//   if (!user || user.roleType !== 'admin') return (
//     <div style={{ textAlign: 'center', padding: 100, direction: 'rtl' }}>
//       <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
//       <p style={{ marginBottom: 20, color: 'var(--text-2)' }}>هذه الصفحة للمسؤولين فقط</p>
//       <Link href="/" className="btn-primary">العودة للرئيسية</Link>
//     </div>
//   );

//   const TABS: { id: Tab; label: string; icon: string }[] = [
//     { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
//     { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
//     { id: 'charities',  label: 'الجمعيات',         icon: 'ti-building-community'  },
//     { id: 'reports',    label: 'التقارير',         icon: 'ti-alert-circle'        },
//     { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
//   ];

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="admin-panel">
//       <Toast msg={msg} />

//       {/* Modals */}
//       <ConfirmModal opts={confirmOpts} loading={confirmBusy} onClose={() => { if (!confirmBusy) setConfirmOpts(null); }} />
//       <RejectModal target={rejectTarget} loading={!!actionLoading?.startsWith('reject')} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
//       <EditCharityModal target={editTarget} loading={actionLoading} setLoading={setActionLoading} onClose={() => setEditTarget(null)} onSaved={handleEditSaved} showMsg={showMsg} />

//       {/* Drawers */}
//       <UserDrawer
//         userId={userDrawerId}
//         onClose={() => setUserDrawerId(null)}
//         onDelete={handleDeleteUser}
//         actionLoading={actionLoading}
//       />
//       <CharityDrawer
//         charityId={charDrawerId}
//         onClose={() => setCharDrawerId(null)}
//         onApprove={handleApprove}
//         onReject={setRejectTarget}
//         onEdit={setEditTarget}
//         onDelete={handleDeleteCharity}
//         actionLoading={actionLoading}
//       />

//       {/* ── Header ──────────────────────────────────────────────────────── */}
//       <header className="ap-header">
//         <div className="ap-logo">
//           <div className="ap-logo-icon">
//             <i className="ti ti-shield-check" />
//           </div>
//           <div className="ap-logo-text">
//             <div className="title">لوحة تحكم المسؤول</div>
//             <div className="subtitle">مرحبًا، {user.userName}</div>
//           </div>
//         </div>
//       </header>

//       {/* ── Body ────────────────────────────────────────────────────────── */}
//       <div className="ap-body">

//         {pageError && (
//           <div className="ap-error-banner">
//             <i className="ti ti-alert-triangle" style={{ fontSize: 16, flexShrink: 0 }} />
//             <span style={{ flex: 1 }}>{pageError}</span>
//             <button className="retry-btn" onClick={loadData}>إعادة المحاولة</button>
//           </div>
//         )}

//         {/* Tabs */}
//         <div className="ap-tabs">
//           {TABS.map(t => (
//             <button key={t.id} className={`ap-tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
//               <i className={`ti ${t.icon}`} />
//               {t.label}
//               {t.id === 'charities' && pendingCharities.length > 0 && (
//                 <span className="ap-tab-badge">{pendingCharities.length}</span>
//               )}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <Spinner label="جاري تحميل البيانات..." />
//         ) : (
//           <>
//             {/* ══════ OVERVIEW ══════ */}
//             {tab === 'overview' && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
//                 {/* Stats */}
//                 <div className="ap-stats-grid">
//                   {[
//                     { label: 'إجمالي المستخدمين',  value: usersTotal || users.length,         icon: 'ti-users',              color: '#3b82f6', bg: '#eff6ff' },
//                     { label: 'إجمالي الجمعيات',    value: charitiesTotal || charities.length,  icon: 'ti-building-community', color: TEAL2,     bg: '#ecfdf5' },
//                     { label: 'إجمالي التقارير',    value: reportsTotal || reports.length,      icon: 'ti-alert-circle',       color: AMBER,     bg: '#fffbeb' },
//                     { label: 'بانتظار الموافقة',   value: pendingCharities.length,             icon: 'ti-clock-exclamation',  color: RED,       bg: '#fef2f2' },
//                   ].map(s => (
//                     <div key={s.label} className="ap-stat-card" style={{ '--ap-stat-accent': s.color } as any}>
//                       <div className="ap-stat-icon" style={{ background: s.bg }}>
//                         <i className={`ti ${s.icon}`} style={{ color: s.color }} />
//                       </div>
//                       <div className="ap-stat-content">
//                         <div className="ap-stat-value" style={{ color: s.color }}>{s.value}</div>
//                         <div className="ap-stat-label">{s.label}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Charts */}
//                 <div className="ap-charts-grid">
//                   <div className="ap-chart-card">
//                     <SectionTitle icon="ti-chart-bar" color={TEAL2} title="إحصائيات المنصة" />
//                     <div style={{ marginTop: 14 }}>
//                       <ResponsiveContainer width="100%" height={180}>
//                         <BarChart data={overviewBarData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
//                           <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
//                           <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
//                           <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
//                           <Tooltip contentStyle={tooltipStyle} />
//                           <Bar dataKey="value" name="العدد" radius={[6, 6, 0, 0]}>
//                             {overviewBarData.map((e, i) => <Cell key={i} fill={e.fill} />)}
//                           </Bar>
//                         </BarChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>

//                   {charityPieData.length > 0 && (
//                     <div className="ap-chart-card">
//                       <SectionTitle icon="ti-chart-pie" color={TEAL2} title="حالة الجمعيات" />
//                       <div style={{ marginTop: 14 }}>
//                         <ResponsiveContainer width="100%" height={180}>
//                           <PieChart>
//                             <Pie data={charityPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
//                               {charityPieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
//                             </Pie>
//                             <Tooltip contentStyle={tooltipStyle} />
//                             <Legend iconType="circle" iconSize={9} formatter={(v: string) => <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>
//                   )}

//                   {rolePieData.length > 0 && (
//                     <div className="ap-chart-card">
//                       <SectionTitle icon="ti-users" color="#3b82f6" title="توزيع الأدوار" />
//                       <div style={{ marginTop: 14 }}>
//                         <ResponsiveContainer width="100%" height={180}>
//                           <PieChart>
//                             <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
//                               {rolePieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
//                             </Pie>
//                             <Tooltip contentStyle={tooltipStyle} />
//                             <Legend iconType="circle" iconSize={9} formatter={(v: string) => <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Pending quick view */}
//                 {pendingCharities.length > 0 && (
//                   <div className="ap-chart-card">
//                     <div className="ap-section-header">
//                       <SectionTitle icon="ti-clock-exclamation" color={AMBER} title="بانتظار الموافقة" badge={pendingCharities.length} />
//                       <button onClick={() => setTab('charities')} style={{ fontSize: 12, color: TEAL2, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
//                         عرض الكل ←
//                       </button>
//                     </div>
//                     <div className="ap-table-wrap" style={{ marginTop: 14 }}>
//                       <div className="ap-table-inner">
//                         <table className="ap-table">
//                           <thead><tr>{['الجمعية', 'البريد', 'التاريخ', 'إجراء'].map(h => <th key={h}>{h}</th>)}</tr></thead>
//                           <tbody>
//                             {pendingCharities.slice(0, 5).map(c => (
//                               <tr key={c._id} style={{ background: '#fffbeb', cursor: 'pointer' }} onClick={() => setCharDrawerId(c._id)}>
//                                 <td><strong style={{ color: TEAL }}>{c.charityName}</strong></td>
//                                 <td style={{ color: 'var(--text-3)' }}>{c.email}</td>
//                                 <td style={{ color: 'var(--text-3)' }}>{fmt(c.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <div style={{ display: 'flex', gap: 6 }}>
//                                     <button className="action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}>
//                                       <i className="ti ti-check" />{actionLoading === 'approve-' + c._id ? '...' : 'موافقة'}
//                                     </button>
//                                     <button className="action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                       <i className="ti ti-x" />رفض
//                                     </button>
//                                   </div>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ══════ USERS ══════ */}
//             {tab === 'users' && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
//                 <div className="ap-section-header">
//                   <div className="ap-section-title">
//                     <i className="ti ti-users" style={{ color: '#3b82f6' }} />
//                     المستخدمون
//                     <span className="ap-count-badge" style={{ background: '#3b82f6' }}>{usersTotal || users.length}</span>
//                   </div>
//                   <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
//                     <span className="ap-section-meta">يعرض <strong>{filteredUsers.length}</strong></span>
//                     <div className="view-toggle">
//                       <button className={`view-toggle-btn${userView === 'table' ? ' active' : ''}`} onClick={() => setUserView('table')}><i className="ti ti-layout-rows" />جدول</button>
//                       <button className={`view-toggle-btn${userView === 'cards' ? ' active' : ''}`} onClick={() => setUserView('cards')}><i className="ti ti-layout-grid" />بطاقات</button>
//                     </div>
//                   </div>
//                 </div>

//                 {userView === 'table' ? (
//                   <div className="ap-table-wrap">
//                     <div className="ap-table-inner">
//                       <table className="ap-table">
//                         <thead><tr>{['الاسم', 'البريد', 'الهاتف', 'الدور', 'موثّق', 'التاريخ', 'إجراء'].map(h => <th key={h}>{h}</th>)}</tr></thead>
//                         <tbody>
//                           {filteredUsers.length === 0 ? (
//                             <tr className="ap-table-empty"><td colSpan={7}><i className="ti ti-users-minus ap-table-empty-icon" />لا توجد نتائج</td></tr>
//                           ) : filteredUsers.map(u => (
//                             <tr key={u._id} style={{ cursor: 'pointer' }} onClick={() => setUserDrawerId(u._id)}>
//                               <td><strong>{u.userName}</strong></td>
//                               <td style={{ color: 'var(--text-3)' }}>{u.email}</td>
//                               <td style={{ color: 'var(--text-3)' }}>{u.phone || '—'}</td>
//                               <td><RoleBadge role={u.roleType} /></td>
//                               <td>
//                                 <span style={{ color: (u.isVerified || u.verify) ? GREEN : RED, fontWeight: 600, fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
//                                   <i className={`ti ${(u.isVerified || u.verify) ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 14 }} />
//                                   {(u.isVerified || u.verify) ? 'موثق' : 'غير موثق'}
//                                 </span>
//                               </td>
//                               <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{fmt(u.createdAt)}</td>
//                               <td onClick={e => e.stopPropagation()}>
//                                 {u.roleType !== 'admin' && (
//                                   <button className="action-btn delete" disabled={!!actionLoading} onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                     <i className="ti ti-trash" />حذف
//                                   </button>
//                                 )}
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 ) : (
//                   filteredUsers.length === 0 ? (
//                     <div className="ap-empty"><i className="ti ti-users-minus" />لا توجد نتائج</div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredUsers.map(u => {
//                         const cfg = ROLE_CFG[u.roleType] ?? ROLE_CFG.user;
//                         return (
//                           <div key={u._id} className="user-card" onClick={() => setUserDrawerId(u._id)}>
//                             <div className="user-card-header">
//                               <div className="user-avatar" style={{ background: cfg.color }}>
//                                 {u.userName?.slice(0, 2).toUpperCase() ?? '..'}
//                               </div>
//                               <div style={{ flex: 1, overflow: 'hidden' }}>
//                                 <div className="user-card-name">{u.userName}</div>
//                                 <div className="user-card-email">{u.email}</div>
//                               </div>
//                             </div>
//                             <div className="user-card-badges">
//                               <RoleBadge role={u.roleType} />
//                               <span className="badge" style={{ background: (u.isVerified || u.verify) ? '#EAF3DE' : '#FCEBEB', color: (u.isVerified || u.verify) ? '#27500A' : '#791F1F' }}>
//                                 <i className={`ti ${(u.isVerified || u.verify) ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
//                                 {(u.isVerified || u.verify) ? 'موثق' : 'غير موثق'}
//                               </span>
//                             </div>
//                             {u.phone && <div className="user-card-meta"><i className="ti ti-phone" />{u.phone}</div>}
//                             <div className="user-card-meta"><i className="ti ti-calendar" />{fmt(u.createdAt)}</div>
//                             {u.roleType !== 'admin' && (
//                               <div className="user-card-actions" onClick={e => e.stopPropagation()}>
//                                 <button className="action-btn delete" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                   <i className="ti ti-trash" />حذف
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )
//                 )}

//                 {hasMoreUsers && (
//                   <div className="load-more-wrap">
//                     <button className="load-more-btn" disabled={loadingMore === 'users'} onClick={loadMoreUsers}>
//                       {loadingMore === 'users' ? <><i className="ti ti-loader-2 ti-spin" />جاري التحميل...</> : <><i className="ti ti-chevron-down" />تحميل المزيد</>}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ══════ CHARITIES ══════ */}
//             {tab === 'charities' && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
//                 {/* Summary filter cards */}
//                 <div className="charity-summary-grid">
//                   {[
//                     { id: 'all',      label: 'الكل',    value: charities.length,                                               color: TEAL2, bg: '#ecfdf5' },
//                     { id: 'pending',  label: 'معلقة',   value: charities.filter(c => c.approvalStatus === 'pending').length,  color: AMBER, bg: '#fffbeb' },
//                     { id: 'approved', label: 'مقبولة',  value: charities.filter(c => c.approvalStatus === 'approved').length, color: GREEN, bg: '#f0fdf4' },
//                     { id: 'rejected', label: 'مرفوضة', value: charities.filter(c => c.approvalStatus === 'rejected').length,  color: RED,   bg: '#fef2f2' },
//                   ].map(s => (
//                     <div
//                       key={s.id}
//                       className={`charity-summary-card${charityFilter === s.id ? ' active' : ''}`}
//                       style={{ background: s.bg, color: s.color }}
//                       onClick={() => setCharityFilter(s.id as any)}
//                     >
//                       <div>
//                         <div className="charity-summary-value">{s.value}</div>
//                         <div className="charity-summary-label">{s.label}</div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="ap-section-header">
//                   <div className="ap-section-title">
//                     <i className="ti ti-building-community" style={{ color: TEAL2 }} />
//                     الجمعيات
//                   </div>
//                   <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
//                     <span className="ap-section-meta">يعرض <strong>{filteredCharities.length}</strong> من {charitiesTotal || charities.length}</span>
//                     <div className="view-toggle">
//                       <button className={`view-toggle-btn${charityView === 'table' ? ' active' : ''}`} onClick={() => setCharityView('table')}><i className="ti ti-layout-rows" />جدول</button>
//                       <button className={`view-toggle-btn${charityView === 'cards' ? ' active' : ''}`} onClick={() => setCharityView('cards')}><i className="ti ti-layout-grid" />بطاقات</button>
//                     </div>
//                   </div>
//                 </div>

//                 {charityView === 'table' ? (
//                   <div className="ap-table-wrap">
//                     <div className="ap-table-inner">
//                       <table className="ap-table">
//                         <thead><tr>{['الجمعية', 'البريد', 'الهاتف', 'العنوان', 'الحالة', 'التاريخ', 'الإجراءات'].map(h => <th key={h}>{h}</th>)}</tr></thead>
//                         <tbody>
//                           {sortedCharities.length === 0 ? (
//                             <tr className="ap-table-empty"><td colSpan={7}><i className="ti ti-building-off ap-table-empty-icon" />لا توجد جمعيات</td></tr>
//                           ) : sortedCharities.map(c => (
//                             <tr key={c._id} style={{ background: c.approvalStatus === 'pending' ? '#fffef7' : 'transparent', cursor: 'pointer' }} onClick={() => setCharDrawerId(c._id)}>
//                               <td><Link href={`/charities/${c._id}`} className="charity-card-name" onClick={e => e.stopPropagation()}>{c.charityName}</Link></td>
//                               <td style={{ color: 'var(--text-3)' }}>{c.email}</td>
//                               <td style={{ color: 'var(--text-3)' }}>{c.phone || '—'}</td>
//                               <td style={{ color: 'var(--text-3)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.address}>{c.address || '—'}</td>
//                               <td><StatusBadge status={c.approvalStatus} /></td>
//                               <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{fmt(c.createdAt)}</td>
//                               <td onClick={e => e.stopPropagation()}>
//                                 <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
//                                   <button className="action-btn edit" disabled={!!actionLoading} onClick={() => setEditTarget(c)}><i className="ti ti-edit" />تعديل</button>
//                                   {c.approvalStatus === 'pending' && (
//                                     <>
//                                       <button className="action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}><i className="ti ti-check" />{actionLoading === 'approve-' + c._id ? '...' : 'موافقة'}</button>
//                                       <button className="action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}><i className="ti ti-x" />رفض</button>
//                                     </>
//                                   )}
//                                   <button className="action-btn delete" disabled={!!actionLoading} onClick={() => handleDeleteCharity(c._id, c.charityName)}><i className="ti ti-trash" />{actionLoading === 'charity-' + c._id ? '...' : 'حذف'}</button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   </div>
//                 ) : (
//                   sortedCharities.length === 0 ? (
//                     <div className="ap-empty"><i className="ti ti-building-off" />لا توجد جمعيات</div>
//                   ) : (
//                     <div className="ap-card-grid charity">
//                       {sortedCharities.map(c => {
//                         const sCfg = APPROVAL_CFG[c.approvalStatus] ?? APPROVAL_CFG.pending;
//                         return (
//                           <div key={c._id} className="charity-card" onClick={() => setCharDrawerId(c._id)}>
//                             <div className="status-stripe" style={{ background: sCfg.dot }} />
//                             <div className="charity-card-header">
//                               <div>
//                                 <Link href={`/charities/${c._id}`} className="charity-card-name" onClick={e => e.stopPropagation()}>{c.charityName}</Link>
//                                 <div className="charity-card-email">{c.email}</div>
//                               </div>
//                               <StatusBadge status={c.approvalStatus} />
//                             </div>
//                             <div className="charity-card-info">
//                               {c.phone && <div className="charity-info-row"><i className="ti ti-phone" />{c.phone}</div>}
//                               <div className="charity-info-row"><i className="ti ti-map-pin" />{c.address || '—'}</div>
//                               {c.licenseNumber && <div className="charity-info-row"><i className="ti ti-certificate" />{c.licenseNumber}</div>}
//                               <div className="charity-info-row"><i className="ti ti-calendar" />{fmt(c.createdAt)}</div>
//                             </div>
//                             {c.description && <p className="charity-card-desc">{c.description}</p>}
//                             {c.rejectionReason && <div className="charity-rejection-reason"><strong>سبب الرفض:</strong> {c.rejectionReason}</div>}
//                             <div className="charity-card-actions" onClick={e => e.stopPropagation()}>
//                               <button className="action-btn edit" disabled={!!actionLoading} onClick={() => setEditTarget(c)}><i className="ti ti-edit" />تعديل</button>
//                               {c.approvalStatus === 'pending' && (
//                                 <>
//                                   <button className="action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}><i className="ti ti-check" />موافقة</button>
//                                   <button className="action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}><i className="ti ti-x" />رفض</button>
//                                 </>
//                               )}
//                               <button className="delete-full-btn" disabled={!!actionLoading} onClick={() => handleDeleteCharity(c._id, c.charityName)}><i className="ti ti-trash" />حذف</button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )
//                 )}

//                 {hasMoreCharities && (
//                   <div className="load-more-wrap">
//                     <button className="load-more-btn" disabled={loadingMore === 'charities'} onClick={loadMoreCharities}>
//                       {loadingMore === 'charities' ? <><i className="ti ti-loader-2 ti-spin" />جاري التحميل...</> : <><i className="ti ti-chevron-down" />تحميل المزيد</>}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ══════ REPORTS ══════ */}
//             {tab === 'reports' && (
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                 <div className="ap-section-header">
//                   <div className="ap-section-title">
//                     <i className="ti ti-alert-circle" style={{ color: AMBER }} />
//                     التقارير
//                     <span className="ap-count-badge" style={{ background: AMBER }}>{reportsTotal || reports.length}</span>
//                   </div>
//                 </div>

//                 {filteredReports.length === 0 ? (
//                   <div className="ap-empty"><i className="ti ti-mood-happy" />لا توجد تقارير</div>
//                 ) : (
//                   <div className="ap-card-grid reports">
//                     {filteredReports.map((r, i) => (
//                       <div key={r._id} className="report-card">
//                         <div className="report-card-header">
//                           <span className="report-card-num"><i className="ti ti-alert-triangle" />تقرير #{i + 1}</span>
//                           <span className="report-card-date"><i className="ti ti-calendar" />{fmt(r.createdAt)}</span>
//                         </div>
//                         <p className="report-card-body">{r.description}</p>
//                         <div className="report-card-footer">
//                           {r.senderType  && <span className="report-sender-tag"><i className="ti ti-user" style={{ fontSize: 12 }} />{r.senderType}</span>}
//                           {r.userName    && <span className="report-sender-tag"><i className="ti ti-at" style={{ fontSize: 12 }} />{r.userName}</span>}
//                           {r.charityName && <span className="report-sender-tag"><i className="ti ti-building" style={{ fontSize: 12 }} />{r.charityName}</span>}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {hasMoreReports && (
//                   <div className="load-more-wrap">
//                     <button className="load-more-btn" disabled={loadingMore === 'reports'} onClick={loadMoreReports}>
//                       {loadingMore === 'reports' ? <><i className="ti ti-loader-2 ti-spin" />جاري التحميل...</> : <><i className="ti ti-chevron-down" />تحميل المزيد</>}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ══════ AUTOMATION ══════ */}
//             {tab === 'automation' && (
//               <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
//                 <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>
//                   تشغيل المهام التلقائية يدويًا — تعمل أيضًا تلقائيًا بجدول زمني من الـ backend.
//                 </p>
//                 <div className="cron-grid">
//                   <CronCard emoji="📨" title="تذكير التبرعات" desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة." code="GET /cron/donationReminder" codeBg="#f0fdf4" codeBorder="#bbf7d0" codeColor="#166534" loading={cronLoading} btnColor={TEAL2} onRun={runDonationReminder} />
//                   <CronCard emoji="📊" title="تقرير الأدمن" desc="يولّد تقريرًا شاملًا ويرسله لجميع المسؤولين." code="GET /cron/adminReport" codeBg="#eff6ff" codeBorder="#bfdbfe" codeColor="#1e40af" loading={cronLoading} btnColor="#1e40af" onRun={runAdminReport} />
//                 </div>
//                 {cronLog.length > 0 && (
//                   <div className="cron-log-card">
//                     <div className="cron-log-header">
//                       <SectionTitle icon="ti-list-details" color={TEAL2} title="سجل التنفيذ" badge={cronLog.length} />
//                       <button className="cron-log-clear" onClick={() => setCronLog([])}>مسح السجل</button>
//                     </div>
//                     <div className="cron-log-list">
//                       {cronLog.map((log, i) => (
//                         <div key={i} className={`cron-log-item ${log.type}`}>
//                           <span>{log.text}</span>
//                           <span className="cron-log-time">{log.time}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../lib/utils';
import { Link } from 'wouter';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

import '../../styles/css/AdminPanel.css';
import AIChatEmbed from '../../components/shared/AIChatEmbed';

import {
  BASE_URL, apiFetch, fetchPage,
  User, Charity, Report, Tab, ApprovalStatus,
  APPROVAL_CFG, ROLE_CFG,
  TEAL, TEAL2, AMBER, GREEN, RED, BORDER,
  fmt,
} from './adminTypes';

// ─── Shared badge components ──────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cfg = APPROVAL_CFG[status as ApprovalStatus] ?? {
    label: status, bg: '#F1EFE8', color: '#444', dot: '#888',
  };
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? { label: role, bg: '#f3f4f6', color: '#374151', icon: '' };
  return (
    <span className="badge" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`ap-toast ${msg.type}`}>
      <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
      {msg.text}
    </div>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'ok';
  icon?: string;
  onConfirm: () => void;
}

function ConfirmModal({ opts, loading, onClose }: {
  opts: ConfirmState | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (!opts) return null;
  const isDanger = opts.variant !== 'ok';
  const confirmBg = isDanger ? RED : TEAL2;
  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal">
        <div className="ap-modal-inner">
          <div className="ap-modal-icon" style={{ background: confirmBg + '18' }}>
            <i className={`ti ${opts.icon ?? (isDanger ? 'ti-trash' : 'ti-check')}`}
               style={{ color: confirmBg }} />
          </div>
          <h3 className="ap-modal-title">{opts.title}</h3>
          <p className="ap-modal-msg">{opts.message}</p>
          <div className="ap-modal-actions">
            <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
            <button
              className="ap-modal-confirm"
              disabled={loading}
              style={{ background: confirmBg }}
              onClick={opts.onConfirm}
            >
              {loading && <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />}
              {opts.confirmLabel ?? 'تأكيد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────────────────────────────

function RejectModal({ target, loading, onClose, onConfirm }: {
  target: { id: string; name: string } | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (target) setReason(''); }, [target]);
  if (!target) return null;

  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal">
        <div className="ap-modal-inner">
          <div className="ap-modal-icon" style={{ background: RED + '18' }}>
            <i className="ti ti-x" style={{ color: RED }} />
          </div>
          <h3 className="ap-modal-title">رفض جمعية "{target.name}"</h3>
          <p className="ap-modal-msg">يمكنك تحديد سبب الرفض ليصل للجمعية بالبريد الإلكتروني.</p>
          <div className="ap-form-group" style={{ marginBottom: 20 }}>
            <label className="ap-form-label">سبب الرفض</label>
            <textarea
              className="ap-form-textarea"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="سبب الرفض (اختياري)"
            />
          </div>
          <div className="ap-modal-actions">
            <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
            <button
              className="ap-modal-confirm"
              disabled={loading}
              style={{ background: RED }}
              onClick={() => onConfirm(reason)}
            >
              {loading && <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />}
              تأكيد الرفض
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Charity Modal ───────────────────────────────────────────────────────

function EditCharityModal({ target, loading, setLoading, onClose, onSaved, showMsg }: {
  target: Charity | null;
  loading: string | null;
  setLoading: (v: string | null) => void;
  onClose: () => void;
  onSaved: (id: string, form: { charityName: string; address: string; description: string }) => void;
  showMsg: (type: 'success' | 'error', text: string) => void;
}) {
  const [form, setForm] = useState({ charityName: '', address: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (target) {
      setForm({
        charityName: target.charityName ?? '',
        address: target.address ?? '',
        description: target.description ?? '',
      });
      setErrors({});
    }
  }, [target]);

  if (!target) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.charityName.trim() || form.charityName.trim().length < 3)
      e.charityName = 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل';
    if (!form.address.trim() || form.address.trim().length < 5)
      e.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
    return e;
  };

  const isBusy = loading === 'edit-' + target._id;
  const changed =
    form.charityName !== (target.charityName ?? '') ||
    form.address     !== (target.address ?? '') ||
    form.description !== (target.description ?? '');

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading('edit-' + target._id);
    try {
      await apiFetch(`/charity/${target._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          charityName: form.charityName.trim(),
          address:     form.address.trim(),
          description: form.description.trim(),
        }),
      });
      onSaved(target._id, form);
      showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
      onClose();
    } catch (err: any) {
      showMsg('error', err?.message || 'فشل التحديث');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal">
        <div className="ap-modal-inner">
          <div className="ap-modal-icon" style={{ background: TEAL2 + '18' }}>
            <i className="ti ti-edit" style={{ color: TEAL2 }} />
          </div>
          <h3 className="ap-modal-title">تعديل بيانات الجمعية</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
            {/* Charity Name */}
            <div className="ap-form-group">
              <label className="ap-form-label">
                اسم الجمعية <span style={{ color: RED }}>*</span>
              </label>
              <input
                className={`ap-form-input${errors.charityName ? ' error' : ''}`}
                value={form.charityName}
                onChange={e => { setForm(f => ({ ...f, charityName: e.target.value })); setErrors(er => ({ ...er, charityName: '' })); }}
                placeholder="اسم الجمعية"
              />
              {errors.charityName && (
                <div className="ap-form-err">
                  <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.charityName}
                </div>
              )}
            </div>

            {/* Address */}
            <div className="ap-form-group">
              <label className="ap-form-label">
                العنوان <span style={{ color: RED }}>*</span>
              </label>
              <input
                className={`ap-form-input${errors.address ? ' error' : ''}`}
                value={form.address}
                onChange={e => { setForm(f => ({ ...f, address: e.target.value })); setErrors(er => ({ ...er, address: '' })); }}
                placeholder="عنوان الجمعية"
              />
              {errors.address && (
                <div className="ap-form-err">
                  <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />{errors.address}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="ap-form-group">
              <label className="ap-form-label">
                الوصف <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 400 }}>(اختياري)</span>
              </label>
              <textarea
                className="ap-form-textarea"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="وصف مختصر عن الجمعية..."
              />
            </div>
          </div>

          {/* Read-only info */}
          <div className="ap-info-box" style={{ marginBottom: 18 }}>
            <div className="ap-info-row">
              <span className="lbl">البريد الإلكتروني:</span>
              <span className="val">{target.email}</span>
            </div>
            <div className="ap-info-row">
              <span className="lbl">حالة الجمعية:</span>
              <span className="val"><StatusBadge status={target.approvalStatus} /></span>
            </div>
            {target.licenseNumber && (
              <div className="ap-info-row">
                <span className="lbl">رقم الترخيص:</span>
                <span className="val">{target.licenseNumber}</span>
              </div>
            )}
          </div>

          <div className="ap-modal-actions">
            <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>إلغاء</button>
            <button
              className="ap-modal-confirm"
              disabled={isBusy || !changed}
              style={{ background: TEAL2 }}
              onClick={handleSave}
            >
              {isBusy && <i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />}
              {isBusy ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── User Drawer ──────────────────────────────────────────────────────────────

function UserDrawer({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setBusy(true);
    apiFetch(`/users/${userId}`)
      .then(res => setUser(res.user ?? res.data ?? res))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [userId]);

  if (!userId) return null;

  const cfg = user ? (ROLE_CFG[user.roleType] ?? ROLE_CFG.user) : null;
  const initials = user?.userName?.slice(0, 2).toUpperCase() ?? '..';

  return (
    <>
      <div className="ap-drawer-overlay" onClick={onClose} />
      <div className="ap-drawer">
        <div className="ap-drawer-header">
          <span className="ap-drawer-title">تفاصيل المستخدم</span>
          <button className="ap-drawer-close" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="ap-drawer-body">
          {busy ? (
            <div className="ap-drawer-loading">
              <div className="ap-spinner" />
              جاري التحميل...
            </div>
          ) : user ? (
            <>
              <div>
                <div
                  className="drawer-avatar"
                  style={{ background: `linear-gradient(135deg, ${TEAL}, ${TEAL2})` }}
                >
                  {initials}
                </div>
                <div className="drawer-name">{user.userName}</div>
                <div className="drawer-email">{user.email}</div>
                <div className="drawer-badges-row">
                  <RoleBadge role={user.roleType} />
                  <span
                    className="badge"
                    style={{
                      background: (user.isVerified || user.verify) ? '#EAF3DE' : '#FCEBEB',
                      color:      (user.isVerified || user.verify) ? '#27500A' : '#791F1F',
                    }}
                  >
                    <i className={`ti ${(user.isVerified || user.verify) ? 'ti-circle-check' : 'ti-circle-x'}`}
                       style={{ fontSize: 13 }} />
                    {(user.isVerified || user.verify) ? 'موثق' : 'غير موثق'}
                  </span>
                </div>
              </div>

              <div className="drawer-section">
                <div className="drawer-section-title">بيانات الحساب</div>
                <div className="drawer-field">
                  <span className="drawer-field-label">المعرّف</span>
                  <span className="drawer-field-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{user._id}</span>
                </div>
                {user.phone && (
                  <div className="drawer-field">
                    <span className="drawer-field-label">الهاتف</span>
                    <span className="drawer-field-value">{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="drawer-field">
                    <span className="drawer-field-label">العنوان</span>
                    <span className="drawer-field-value">{user.address}</span>
                  </div>
                )}
                <div className="drawer-field">
                  <span className="drawer-field-label">تاريخ الإنشاء</span>
                  <span className="drawer-field-value">{fmt(user.createdAt)}</span>
                </div>
                {user.updatedAt && (
                  <div className="drawer-field">
                    <span className="drawer-field-label">آخر تعديل</span>
                    <span className="drawer-field-value">{fmt(user.updatedAt)}</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-4)', padding: '40px 0' }}>
              <i className="ti ti-user-off" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
              تعذّر تحميل بيانات المستخدم
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Charity Drawer ───────────────────────────────────────────────────────────

function CharityDrawer({ charityId, onClose }: { charityId: string | null; onClose: () => void }) {
  const [charity, setCharity] = useState<Charity | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!charityId) return;
    setBusy(true);
    apiFetch(`/charity/${charityId}`)
      .then(res => setCharity(res.charity ?? res.data ?? res))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, [charityId]);

  if (!charityId) return null;

  const statusCfg = charity
    ? (APPROVAL_CFG[charity.approvalStatus] ?? APPROVAL_CFG.pending)
    : null;

  return (
    <>
      <div className="ap-drawer-overlay" onClick={onClose} />
      <div className="ap-drawer">
        <div className="ap-drawer-header">
          <span className="ap-drawer-title">تفاصيل الجمعية</span>
          <button className="ap-drawer-close" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="ap-drawer-body">
          {busy ? (
            <div className="ap-drawer-loading">
              <div className="ap-spinner" />
              جاري التحميل...
            </div>
          ) : charity ? (
            <>
              <div>
                <div
                  className="drawer-avatar"
                  style={{ background: `linear-gradient(135deg, ${statusCfg!.dot}, ${TEAL2})` }}
                >
                  {charity.charityName?.slice(0, 2).toUpperCase() ?? 'J'}
                </div>
                <div className="drawer-name">{charity.charityName}</div>
                <div className="drawer-email">{charity.email}</div>
                <div className="drawer-badges-row">
                  <StatusBadge status={charity.approvalStatus} />
                </div>
              </div>

              <div className="drawer-section">
                <div className="drawer-section-title">بيانات الجمعية</div>
                <div className="drawer-field">
                  <span className="drawer-field-label">المعرّف</span>
                  <span className="drawer-field-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{charity._id}</span>
                </div>
                {charity.phone && (
                  <div className="drawer-field">
                    <span className="drawer-field-label">الهاتف</span>
                    <span className="drawer-field-value">{charity.phone}</span>
                  </div>
                )}
                <div className="drawer-field">
                  <span className="drawer-field-label">العنوان</span>
                  <span className="drawer-field-value">{charity.address || '—'}</span>
                </div>
                {charity.licenseNumber && (
                  <div className="drawer-field">
                    <span className="drawer-field-label">رقم الترخيص</span>
                    <span className="drawer-field-value">{charity.licenseNumber}</span>
                  </div>
                )}
                {charity.description && (
                  <div className="drawer-field">
                    <span className="drawer-field-label">الوصف</span>
                    <span className="drawer-field-value">{charity.description}</span>
                  </div>
                )}
                {charity.rejectionReason && (
                  <div className="drawer-field">
                    <span className="drawer-field-label">سبب الرفض</span>
                    <span className="drawer-field-value" style={{ color: RED }}>{charity.rejectionReason}</span>
                  </div>
                )}
                <div className="drawer-field">
                  <span className="drawer-field-label">تاريخ الإنشاء</span>
                  <span className="drawer-field-value">{fmt(charity.createdAt)}</span>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-4)', padding: '40px 0' }}>
              <i className="ti ti-building-off" style={{ fontSize: 36, display: 'block', marginBottom: 10 }} />
              تعذّر تحميل بيانات الجمعية
            </div>
          )}
        </div>

        {charity && (
          <div className="ap-drawer-footer">
            <Link href={`/charities/${charity._id}`} className="action-btn view" style={{ flex: 1, justifyContent: 'center' }}>
              <i className="ti ti-external-link" />
              عرض الصفحة العامة
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Section title helper ─────────────────────────────────────────────────────

function SectionTitle({ icon, color, title, badge }: {
  icon: string; color: string; title: string; badge?: number;
}) {
  return (
    <div className="ap-section-title" style={{ color: 'var(--text-1)', marginBottom: 14 }}>
      <i className={`ti ${icon}`} style={{ color, fontSize: 16 }} />
      {title}
      {badge != null && badge > 0 && (
        <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
      )}
    </div>
  );
}

// ─── Recharts tooltip style ───────────────────────────────────────────────────

const tooltipStyle = {
  background: '#fff',
  border: `1px solid ${BORDER}`,
  borderRadius: 9,
  padding: '8px 14px',
  fontSize: 13,
  fontFamily: 'Tajawal, sans-serif',
  direction: 'rtl' as const,
};

// ─── CronCard component ───────────────────────────────────────────────────────

function CronCard({ emoji, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: {
  emoji: string; title: string; desc: string; code: string;
  codeBg: string; codeBorder: string; codeColor: string;
  loading: boolean; btnColor: string; onRun: () => void;
}) {
  return (
    <div className="cron-card">
      <div className="cron-emoji">{emoji}</div>
      <div className="cron-title">{title}</div>
      <p className="cron-desc">{desc}</p>
      <div className="cron-code" style={{ background: codeBg, borderColor: codeBorder, color: codeColor }}>
        {code}
      </div>
      <button
        className="cron-run-btn"
        disabled={loading}
        style={{ background: loading ? undefined : btnColor }}
        onClick={onRun}
      >
        {loading
          ? <><i className="ti ti-loader-2 ti-spin" style={{ fontSize: 14 }} />جاري التشغيل...</>
          : <><i className="ti ti-player-play" style={{ fontSize: 14 }} />تشغيل الآن</>
        }
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { user, isLoading, logout } = useAuth() as any;

  // ── UI state ───────────────────────────────────────────────────────────────
  const [tab,           setTab]           = useState<Tab>('overview');
  const [search,        setSearch]        = useState('');
  const [charityFilter, setCharityFilter] = useState<'all' | ApprovalStatus>('all');
  const [userView,      setUserView]      = useState<'table' | 'cards'>('table');
  const [charityView,   setCharityView]   = useState<'table' | 'cards'>('table');

  // ── Data state ─────────────────────────────────────────────────────────────
  const [users,     setUsers]     = useState<User[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [reports,   setReports]   = useState<Report[]>([]);

  const [usersTotal,     setUsersTotal]     = useState(0);
  const [charitiesTotal, setCharitiesTotal] = useState(0);
  const [reportsTotal,   setReportsTotal]   = useState(0);

  const [usersPage,     setUsersPage]     = useState(1);
  const [charitiesPage, setCharitiesPage] = useState(1);
  const [reportsPage,   setReportsPage]   = useState(1);

  const [hasMoreUsers,     setHasMoreUsers]     = useState(false);
  const [hasMoreCharities, setHasMoreCharities] = useState(false);
  const [hasMoreReports,   setHasMoreReports]   = useState(false);

  const [loading,     setLoading]     = useState(true);
  const [pageError,   setPageError]   = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState<string | null>(null);

  // ── Action / modal state ───────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg,           setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
  const [confirmBusy,   setConfirmBusy]   = useState(false);
  const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
  const [editTarget,    setEditTarget]    = useState<Charity | null>(null);
  const [userDrawerId,  setUserDrawerId]  = useState<string | null>(null);
  const [charDrawerId,  setCharDrawerId]  = useState<string | null>(null);

  // ── Cron state ─────────────────────────────────────────────────────────────
  const [cronLoading, setCronLoading] = useState(false);
  const [cronLog,     setCronLog]     = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
  const [lastRun,     setLastRun]     = useState(0);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3200);
  };

  const confirm = (opts: ConfirmState) => setConfirmOpts(opts);

  // ── Load first page of all data ────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setPageError(null);
    setUsersPage(1);
    setCharitiesPage(1);
    setReportsPage(1);

    try {
      const [uRes, cRes, rRes] = await Promise.allSettled([
        fetchPage<User>('/users', 1, 10),
        fetchPage<Charity>('/charity/charities', 1, 10),
        fetchPage<Report>('/report', 1, 10),
      ]);

      if (uRes.status === 'fulfilled') {
        setUsers(uRes.value.data);
        setUsersTotal(uRes.value.total);
        setHasMoreUsers(uRes.value.hasMore);
      }
      if (cRes.status === 'fulfilled') {
        setCharities(cRes.value.data);
        setCharitiesTotal(cRes.value.total);
        setHasMoreCharities(cRes.value.hasMore);
      }
      if (rRes.status === 'fulfilled') {
        setReports(rRes.value.data);
        setReportsTotal(rRes.value.total);
        setHasMoreReports(rRes.value.hasMore);
      }
    } catch (err: any) {
      setPageError(err?.message || 'فشل تحميل البيانات');
      if (err?.status === 401) setTimeout(() => logout?.(), 2000);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (user?.roleType === 'admin') loadData();
  }, [user, loadData]);

  // ── Load more pages ────────────────────────────────────────────────────────
  const loadMoreUsers = async () => {
    const next = usersPage + 1;
    setLoadingMore('users');
    try {
      const res = await fetchPage<User>('/users', next, 10);
      setUsers(prev => [...prev, ...res.data]);
      setUsersPage(next);
      setHasMoreUsers(res.hasMore);
    } finally {
      setLoadingMore(null);
    }
  };

  const loadMoreCharities = async () => {
    const next = charitiesPage + 1;
    setLoadingMore('charities');
    try {
      const res = await fetchPage<Charity>('/charity/charities', next, 10);
      setCharities(prev => [...prev, ...res.data]);
      setCharitiesPage(next);
      setHasMoreCharities(res.hasMore);
    } finally {
      setLoadingMore(null);
    }
  };

  const loadMoreReports = async () => {
    const next = reportsPage + 1;
    setLoadingMore('reports');
    try {
      const res = await fetchPage<Report>('/report', next, 10);
      setReports(prev => [...prev, ...res.data]);
      setReportsPage(next);
      setHasMoreReports(res.hasMore);
    } finally {
      setLoadingMore(null);
    }
  };

  // ── User actions ───────────────────────────────────────────────────────────
  const handleDeleteUser = (id: string, name: string) => {
    confirm({
      title: `حذف المستخدم "${name}"`,
      message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيًا.',
      confirmLabel: 'حذف',
      variant: 'danger',
      icon: 'ti-trash',
      onConfirm: async () => {
        setConfirmBusy(true);
        try {
          await apiFetch(`/users/${id}`, { method: 'DELETE' });
          setUsers(prev => prev.filter(u => u._id !== id));
          showMsg('success', `تم حذف "${name}"`);
          setConfirmOpts(null);
        } catch (e: any) {
          showMsg('error', e?.message || 'حدث خطأ');
        } finally {
          setConfirmBusy(false);
        }
      },
    });
  };

  // ── Charity actions ────────────────────────────────────────────────────────
  const handleApprove = async (id: string, name: string) => {
    setActionLoading('approve-' + id);
    try {
      await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
      setCharities(prev => prev.map(c =>
        c._id === id ? { ...c, approvalStatus: 'approved', rejectionReason: undefined } : c
      ));
      showMsg('success', `تمت الموافقة على "${name}"`);
    } catch (e: any) {
      showMsg('error', e?.message || 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    const { id, name } = rejectTarget;
    setActionLoading('reject-' + id);
    try {
      await apiFetch(`/charity/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejectionReason: reason }),
      });
      setCharities(prev => prev.map(c =>
        c._id === id ? { ...c, approvalStatus: 'rejected', rejectionReason: reason } : c
      ));
      showMsg('success', `تم رفض "${name}"`);
    } catch (e: any) {
      showMsg('error', e?.message || 'حدث خطأ');
    } finally {
      setActionLoading(null);
      setRejectTarget(null);
    }
  };

  const handleEditSaved = (id: string, form: { charityName: string; address: string; description: string }) => {
    setCharities(prev => prev.map(c =>
      c._id === id ? { ...c, ...form } : c
    ));
  };

  const handleDeleteCharity = (id: string, name: string) => {
    confirm({
      title: `حذف جمعية "${name}"`,
      message: 'هذا الإجراء لا يمكن التراجع عنه.',
      confirmLabel: 'حذف',
      variant: 'danger',
      icon: 'ti-trash',
      onConfirm: async () => {
        setConfirmBusy(true);
        try {
          await apiFetch(`/charity/${id}`, { method: 'DELETE' });
          setCharities(prev => prev.filter(c => c._id !== id));
          showMsg('success', `تم حذف "${name}"`);
          setConfirmOpts(null);
        } catch (e: any) {
          showMsg('error', e?.message || 'حدث خطأ');
        } finally {
          setConfirmBusy(false);
        }
      },
    });
  };

  // ── Cron actions ───────────────────────────────────────────────────────────
  const runAdminReport = async () => {
    if (Date.now() - lastRun < 30_000) {
      showMsg('error', 'انتظر 30 ثانية قبل إعادة التشغيل');
      return;
    }
    setCronLoading(true);
    try {
      await apiFetch('/cron/adminReport');
      setLastRun(Date.now());
      setCronLog(prev => [{ type: 'success', text: '✅ تم تشغيل تقرير الأدمن بنجاح', time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
    } catch (err: any) {
      setCronLog(prev => [{ type: 'error', text: `❌ ${err?.message || 'فشل التشغيل'}`, time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
    } finally {
      setCronLoading(false);
    }
  };

  const runDonationReminder = async () => {
    setCronLoading(true);
    try {
      await apiFetch('/cron/donationReminder');
      setCronLog(prev => [{ type: 'success', text: '✅ تم إرسال تذكيرات التبرعات', time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
    } catch (err: any) {
      setCronLog(prev => [{ type: 'error', text: `❌ ${err?.message || 'فشل التشغيل'}`, time: new Date().toLocaleTimeString('ar-EG') }, ...prev]);
    } finally {
      setCronLoading(false);
    }
  };

  // ── Derived / filtered data ────────────────────────────────────────────────
  const q = search.trim().toLowerCase();

  const filteredUsers = users.filter(u =>
    !q ||
    u.userName?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q) ||
    u.roleType?.includes(q)
  );

  const filteredCharities = charities.filter(c => {
    if (charityFilter !== 'all' && c.approvalStatus !== charityFilter) return false;
    return !q || c.charityName?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
  });

  const filteredReports = reports.filter(r =>
    !q ||
    r.description?.toLowerCase().includes(q) ||
    r.userName?.toLowerCase().includes(q) ||
    r.charityName?.toLowerCase().includes(q) ||
    r.senderType?.toLowerCase().includes(q)
  );

  const pendingCharities = charities.filter(c => c.approvalStatus === 'pending');

  const sortedCharities = [...filteredCharities].sort((a, b) => {
    const o: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
    return (o[a.approvalStatus] ?? 1) - (o[b.approvalStatus] ?? 1);
  });

  // ── Chart data ─────────────────────────────────────────────────────────────
  const overviewBarData = [
    { name: 'المستخدمون', value: usersTotal    || users.length,     fill: '#3b82f6' },
    { name: 'الجمعيات',   value: charitiesTotal || charities.length, fill: TEAL2    },
    { name: 'التقارير',   value: reportsTotal  || reports.length,   fill: AMBER    },
  ];

  const charityPieData = [
    { name: 'معلقة',   value: charities.filter(c => c.approvalStatus === 'pending').length,  color: AMBER },
    { name: 'مقبولة',  value: charities.filter(c => c.approvalStatus === 'approved').length, color: GREEN },
    { name: 'مرفوضة', value: charities.filter(c => c.approvalStatus === 'rejected').length, color: RED   },
  ].filter(d => d.value > 0);

  const rolePieData = [
    { name: 'متبرعون', value: users.filter(u => u.roleType === 'user').length,    color: '#3b82f6' },
    { name: 'جمعيات',  value: users.filter(u => u.roleType === 'charity').length, color: TEAL2    },
    { name: 'أدمن',    value: users.filter(u => u.roleType === 'admin').length,   color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="ap-loading-center">
      <div className="ap-spinner" />
      جاري التحقق من الصلاحيات...
    </div>
  );

  if (!user || user.roleType !== 'admin') return (
    <div style={{ textAlign: 'center', padding: 100, direction: 'rtl' }}>
      <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
      <p style={{ marginBottom: 20, color: 'var(--text-2)' }}>هذه الصفحة للمسؤولين فقط</p>
      <Link href="/" className="btn-primary">العودة للرئيسية</Link>
    </div>
  );

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
    { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
    { id: 'charities',  label: 'الجمعيات',         icon: 'ti-building-community'  },
    { id: 'reports',    label: 'التقارير',         icon: 'ti-alert-circle'        },
    { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
    { id: 'chat',       label: 'مساعد عطاء',       icon: 'ti-robot'               },
  ];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-panel">
      <Toast msg={msg} />

      {/* Modals */}
      <ConfirmModal
        opts={confirmOpts}
        loading={confirmBusy}
        onClose={() => { if (!confirmBusy) setConfirmOpts(null); }}
      />
      <RejectModal
        target={rejectTarget}
        loading={!!actionLoading?.startsWith('reject')}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
      />
      <EditCharityModal
        target={editTarget}
        loading={actionLoading}
        setLoading={setActionLoading}
        onClose={() => setEditTarget(null)}
        onSaved={handleEditSaved}
        showMsg={showMsg}
      />

      {/* Drawers */}
      <UserDrawer    userId={userDrawerId} onClose={() => setUserDrawerId(null)} />
      <CharityDrawer charityId={charDrawerId}  onClose={() => setCharDrawerId(null)}  />

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="ap-header">
        <div className="ap-logo">
          <div className="ap-logo-icon">
            <i className="ti ti-shield-check" />
          </div>
          <div className="ap-logo-text">
            <div className="title">لوحة تحكم المسؤول</div>
            <div className="subtitle">مرحبًا، {user.userName}</div>
          </div>
        </div>

        <div className="ap-header-actions">
          <div className="ap-search-box">
            <i className="ti ti-search" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في كل شيء..."
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--text-4)', display: 'flex' }}
              >
                <i className="ti ti-x" style={{ fontSize: 13 }} />
              </button>
            )}
          </div>

          <button className="ap-icon-btn" onClick={loadData} title="تحديث البيانات">
            <i className="ti ti-refresh" />
          </button>
        </div>
      </header>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="ap-body">

        {/* Error banner */}
        {pageError && (
          <div className="ap-error-banner">
            <i className="ti ti-alert-triangle" style={{ fontSize: 16, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{pageError}</span>
            <button className="retry-btn" onClick={loadData}>إعادة المحاولة</button>
          </div>
        )}

        {/* Tabs */}
        <div className="ap-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`ap-tab-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <i className={`ti ${t.icon}`} />
              {t.label}
              {t.id === 'charities' && pendingCharities.length > 0 && (
                <span className="ap-tab-badge">{pendingCharities.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="ap-loading-center">
            <div className="ap-spinner" />
            جاري تحميل البيانات...
          </div>
        ) : (
          <>

            {/* ══════════════════════ OVERVIEW TAB ══════════════════════════ */}
            {tab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                {/* Stat cards */}
                <div className="ap-stats-grid">
                  {[
                    { label: 'إجمالي المستخدمين',  value: usersTotal    || users.length,     icon: 'ti-users',              color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'إجمالي الجمعيات',    value: charitiesTotal || charities.length, icon: 'ti-building-community', color: TEAL2,     bg: '#ecfdf5' },
                    { label: 'إجمالي التقارير',    value: reportsTotal  || reports.length,   icon: 'ti-alert-circle',       color: AMBER,     bg: '#fffbeb' },
                    { label: 'بانتظار الموافقة',   value: pendingCharities.length,           icon: 'ti-clock-exclamation',  color: RED,       bg: '#fef2f2' },
                  ].map(s => (
                    <div key={s.label} className="ap-stat-card">
                      <div className="ap-stat-icon" style={{ background: s.bg }}>
                        <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                      </div>
                      <div className="ap-stat-value" style={{ color: s.color }}>{s.value}</div>
                      <div className="ap-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Charts */}
                <div className="ap-charts-grid">
                  <div className="ap-chart-card">
                    <SectionTitle icon="ti-chart-bar" color={TEAL2} title="إحصائيات المنصة" />
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={overviewBarData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={tooltipStyle} />
                        <Bar dataKey="value" name="العدد" radius={[6, 6, 0, 0]}>
                          {overviewBarData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {charityPieData.length > 0 && (
                    <div className="ap-chart-card">
                      <SectionTitle icon="ti-chart-pie" color={TEAL2} title="حالة الجمعيات" />
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={charityPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                            {charityPieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend iconType="circle" iconSize={9}
                            formatter={(v: string) => <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {rolePieData.length > 0 && (
                    <div className="ap-chart-card">
                      <SectionTitle icon="ti-users" color="#3b82f6" title="توزيع الأدوار" />
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={rolePieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                            {rolePieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend iconType="circle" iconSize={9}
                            formatter={(v: string) => <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Pending quick table */}
                {pendingCharities.length > 0 && (
                  <div className="ap-chart-card">
                    <div className="ap-section-header">
                      <SectionTitle icon="ti-clock-exclamation" color={AMBER} title="بانتظار الموافقة" badge={pendingCharities.length} />
                      <button
                        onClick={() => setTab('charities')}
                        style={{ fontSize: 12, color: TEAL2, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                      >
                        عرض الكل ←
                      </button>
                    </div>
                    <div className="ap-table-wrap">
                      <div className="ap-table-inner">
                        <table className="ap-table">
                          <thead>
                            <tr>
                              {['الجمعية', 'البريد', 'التاريخ', 'إجراء'].map(h => <th key={h}>{h}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {pendingCharities.slice(0, 5).map(c => (
                              <tr key={c._id} style={{ background: '#fffbeb' }}>
                                <td><strong style={{ color: TEAL }}>{c.charityName}</strong></td>
                                <td style={{ color: 'var(--text-3)' }}>{c.email}</td>
                                <td style={{ color: 'var(--text-3)' }}>{fmt(c.createdAt)}</td>
                                <td>
                                  <div style={{ display: 'flex', gap: 6 }}>
                                    <button className="action-btn approve" disabled={!!actionLoading}
                                      onClick={() => handleApprove(c._id, c.charityName)}>
                                      <i className="ti ti-check" />
                                      {actionLoading === 'approve-' + c._id ? '...' : 'موافقة'}
                                    </button>
                                    <button className="action-btn reject" disabled={!!actionLoading}
                                      onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
                                      <i className="ti ti-x" />رفض
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════ USERS TAB ═════════════════════════════ */}
            {tab === 'users' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Header row */}
                <div className="ap-section-header">
                  <div className="ap-section-title">
                    <i className="ti ti-users" style={{ color: '#3b82f6' }} />
                    المستخدمون
                    <span className="ap-count-badge" style={{ background: '#3b82f6' }}>
                      {usersTotal || users.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="view-toggle">
                      <button className={`view-toggle-btn${userView === 'table' ? ' active' : ''}`} onClick={() => setUserView('table')}>
                        <i className="ti ti-layout-rows" />جدول
                      </button>
                      <button className={`view-toggle-btn${userView === 'cards' ? ' active' : ''}`} onClick={() => setUserView('cards')}>
                        <i className="ti ti-layout-grid" />بطاقات
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table view */}
                {userView === 'table' && (
                  <div className="ap-table-wrap">
                    <div className="ap-table-inner">
                      <table className="ap-table">
                        <thead>
                          <tr>
                            {['الاسم', 'البريد الإلكتروني', 'الهاتف', 'الدور', 'موثّق', 'الإنشاء', 'الإجراء'].map(h => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.length === 0 ? (
                            <tr className="ap-table-empty">
                              <td colSpan={7}>
                                <i className="ti ti-users-minus ap-table-empty-icon" />
                                لا توجد نتائج
                              </td>
                            </tr>
                          ) : filteredUsers.map(u => (
                            <tr key={u._id} onClick={() => setUserDrawerId(u._id)} style={{ cursor: 'pointer' }}>
                              <td><strong style={{ color: 'var(--text-1)' }}>{u.userName}</strong></td>
                              <td style={{ color: 'var(--text-3)' }}>{u.email}</td>
                              <td style={{ color: 'var(--text-3)' }}>{u.phone || '—'}</td>
                              <td><RoleBadge role={u.roleType} /></td>
                              <td>
                                <span style={{
                                  color: (u.isVerified || u.verify) ? GREEN : RED,
                                  fontWeight: 600, fontSize: 12,
                                  display: 'inline-flex', alignItems: 'center', gap: 4,
                                }}>
                                  <i className={`ti ${(u.isVerified || u.verify) ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 14 }} />
                                  {(u.isVerified || u.verify) ? 'موثق' : 'غير موثق'}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{fmt(u.createdAt)}</td>
                              <td onClick={e => e.stopPropagation()}>
                                {u.roleType !== 'admin' && (
                                  <button
                                    className="action-btn delete"
                                    disabled={!!actionLoading}
                                    onClick={() => handleDeleteUser(u._id, u.userName)}
                                  >
                                    <i className="ti ti-trash" />حذف
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Cards view */}
                {userView === 'cards' && (
                  filteredUsers.length === 0 ? (
                    <div className="ap-empty">
                      <i className="ti ti-users-minus" />
                      لا توجد نتائج
                    </div>
                  ) : (
                    <div className="ap-card-grid">
                      {filteredUsers.map(u => {
                        const cfg = ROLE_CFG[u.roleType] ?? ROLE_CFG.user;
                        const initials = u.userName?.slice(0, 2).toUpperCase() ?? '..';
                        return (
                          <div key={u._id} className="user-card" onClick={() => setUserDrawerId(u._id)}>
                            <div className="user-card-header">
                              <div className="user-avatar" style={{ background: cfg.color }}>
                                {initials}
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div className="user-card-name">{u.userName}</div>
                                <div className="user-card-email">{u.email}</div>
                              </div>
                            </div>
                            <div className="user-card-badges">
                              <RoleBadge role={u.roleType} />
                              <span className="badge" style={{
                                background: (u.isVerified || u.verify) ? '#EAF3DE' : '#FCEBEB',
                                color:      (u.isVerified || u.verify) ? '#27500A' : '#791F1F',
                              }}>
                                <i className={`ti ${(u.isVerified || u.verify) ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
                                {(u.isVerified || u.verify) ? 'موثق' : 'غير موثق'}
                              </span>
                            </div>
                            {u.phone && (
                              <div className="user-card-meta">
                                <i className="ti ti-phone" />
                                {u.phone}
                              </div>
                            )}
                            <div className="user-card-meta">
                              <i className="ti ti-calendar" />
                              {fmt(u.createdAt)}
                            </div>
                            {u.roleType !== 'admin' && (
                              <div className="user-card-actions" onClick={e => e.stopPropagation()}>
                                <button
                                  className="action-btn delete"
                                  style={{ flex: 1, justifyContent: 'center' }}
                                  disabled={!!actionLoading}
                                  onClick={() => handleDeleteUser(u._id, u.userName)}
                                >
                                  <i className="ti ti-trash" />حذف
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Load more */}
                {hasMoreUsers && (
                  <div className="load-more-wrap">
                    <button
                      className="load-more-btn"
                      disabled={loadingMore === 'users'}
                      onClick={loadMoreUsers}
                    >
                      {loadingMore === 'users'
                        ? <><i className="ti ti-loader-2 ti-spin" />جاري التحميل...</>
                        : <><i className="ti ti-chevron-down" />تحميل المزيد</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════ CHARITIES TAB ════════════════════════ */}
            {tab === 'charities' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                {/* Summary mini cards */}
                <div className="charity-summary-grid">
                  {[
                    { id: 'all',      label: 'الكل',     value: charities.length,                                                color: TEAL2,  bg: '#ecfdf5' },
                    { id: 'pending',  label: 'معلقة',    value: charities.filter(c => c.approvalStatus === 'pending').length,  color: AMBER,  bg: '#fffbeb' },
                    { id: 'approved', label: 'مقبولة',   value: charities.filter(c => c.approvalStatus === 'approved').length, color: GREEN,  bg: '#f0fdf4' },
                    { id: 'rejected', label: 'مرفوضة',  value: charities.filter(c => c.approvalStatus === 'rejected').length,  color: RED,    bg: '#fef2f2' },
                  ].map(s => (
                    <div
                      key={s.id}
                      className={`charity-summary-card${charityFilter === s.id ? ' active' : ''}`}
                      style={{ background: s.bg, color: s.color }}
                      onClick={() => setCharityFilter(s.id as any)}
                    >
                      <div>
                        <div className="charity-summary-value">{s.value}</div>
                        <div className="charity-summary-label">{s.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Section header */}
                <div className="ap-section-header">
                  <div className="ap-section-title">
                    <i className="ti ti-building-community" style={{ color: TEAL2 }} />
                    الجمعيات
                  </div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="ap-section-meta">
                      يعرض <strong>{filteredCharities.length}</strong> من {charitiesTotal || charities.length}
                    </div>
                    <div className="view-toggle">
                      <button className={`view-toggle-btn${charityView === 'table' ? ' active' : ''}`} onClick={() => setCharityView('table')}>
                        <i className="ti ti-layout-rows" />جدول
                      </button>
                      <button className={`view-toggle-btn${charityView === 'cards' ? ' active' : ''}`} onClick={() => setCharityView('cards')}>
                        <i className="ti ti-layout-grid" />بطاقات
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table view */}
                {charityView === 'table' && (
                  <div className="ap-table-wrap">
                    <div className="ap-table-inner">
                      <table className="ap-table">
                        <thead>
                          <tr>
                            {['الجمعية', 'البريد', 'الهاتف', 'العنوان', 'الحالة', 'التاريخ', 'الإجراءات'].map(h => (
                              <th key={h}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sortedCharities.length === 0 ? (
                            <tr className="ap-table-empty">
                              <td colSpan={7}>
                                <i className="ti ti-building-off ap-table-empty-icon" />
                                لا توجد جمعيات
                              </td>
                            </tr>
                          ) : sortedCharities.map(c => (
                            <tr
                              key={c._id}
                              style={{ background: c.approvalStatus === 'pending' ? '#fffef7' : 'transparent' }}
                              onClick={() => setCharDrawerId(c._id)}
                              className="cursor-pointer"
                            >
                              <td>
                                <Link
                                  href={`/charities/${c._id}`}
                                  className="charity-card-name"
                                  onClick={e => e.stopPropagation()}
                                >
                                  {c.charityName}
                                </Link>
                              </td>
                              <td style={{ color: 'var(--text-3)' }}>{c.email}</td>
                              <td style={{ color: 'var(--text-3)' }}>{c.phone || '—'}</td>
                              <td style={{ color: 'var(--text-3)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={c.address}>
                                {c.address || '—'}
                              </td>
                              <td><StatusBadge status={c.approvalStatus} /></td>
                              <td style={{ color: 'var(--text-4)', fontSize: 12 }}>{fmt(c.createdAt)}</td>
                              <td onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                  <button className="action-btn edit" disabled={!!actionLoading}
                                    onClick={() => setEditTarget(c)}>
                                    <i className="ti ti-edit" />تعديل
                                  </button>
                                  {c.approvalStatus === 'pending' && (
                                    <>
                                      <button className="action-btn approve" disabled={!!actionLoading}
                                        onClick={() => handleApprove(c._id, c.charityName)}>
                                        <i className="ti ti-check" />
                                        {actionLoading === 'approve-' + c._id ? '...' : 'موافقة'}
                                      </button>
                                      <button className="action-btn reject" disabled={!!actionLoading}
                                        onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
                                        <i className="ti ti-x" />رفض
                                      </button>
                                    </>
                                  )}
                                  <button className="action-btn delete" disabled={!!actionLoading}
                                    onClick={() => handleDeleteCharity(c._id, c.charityName)}>
                                    <i className="ti ti-trash" />
                                    {actionLoading === 'charity-' + c._id ? '...' : 'حذف'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Cards view */}
                {charityView === 'cards' && (
                  sortedCharities.length === 0 ? (
                    <div className="ap-empty">
                      <i className="ti ti-building-off" />
                      لا توجد جمعيات
                    </div>
                  ) : (
                    <div className="ap-card-grid charity">
                      {sortedCharities.map(c => {
                        const sCfg = APPROVAL_CFG[c.approvalStatus] ?? APPROVAL_CFG.pending;
                        return (
                          <div key={c._id} className="charity-card" onClick={() => setCharDrawerId(c._id)}>
                            <div className="status-stripe" style={{ background: sCfg.dot }} />
                            <div className="charity-card-header">
                              <div>
                                <Link href={`/charities/${c._id}`} className="charity-card-name"
                                  onClick={e => e.stopPropagation()}>
                                  {c.charityName}
                                </Link>
                                <div className="charity-card-email">{c.email}</div>
                              </div>
                              <StatusBadge status={c.approvalStatus} />
                            </div>

                            <div className="charity-card-info">
                              {c.phone && (
                                <div className="charity-info-row">
                                  <i className="ti ti-phone" />
                                  {c.phone}
                                </div>
                              )}
                              <div className="charity-info-row">
                                <i className="ti ti-map-pin" />
                                {c.address || '—'}
                              </div>
                              {c.licenseNumber && (
                                <div className="charity-info-row">
                                  <i className="ti ti-certificate" />
                                  {c.licenseNumber}
                                </div>
                              )}
                              <div className="charity-info-row">
                                <i className="ti ti-calendar" />
                                {fmt(c.createdAt)}
                              </div>
                            </div>

                            {c.description && (
                              <p className="charity-card-desc">{c.description}</p>
                            )}

                            {c.rejectionReason && (
                              <div className="charity-rejection-reason">
                                <strong>سبب الرفض:</strong> {c.rejectionReason}
                              </div>
                            )}

                            <div className="charity-card-actions" onClick={e => e.stopPropagation()}>
                              <button className="action-btn edit" disabled={!!actionLoading}
                                onClick={() => setEditTarget(c)}>
                                <i className="ti ti-edit" />تعديل
                              </button>
                              {c.approvalStatus === 'pending' && (
                                <>
                                  <button className="action-btn approve" disabled={!!actionLoading}
                                    onClick={() => handleApprove(c._id, c.charityName)}>
                                    <i className="ti ti-check" />موافقة
                                  </button>
                                  <button className="action-btn reject" disabled={!!actionLoading}
                                    onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
                                    <i className="ti ti-x" />رفض
                                  </button>
                                </>
                              )}
                              <button
                                className="delete-full-btn"
                                disabled={!!actionLoading}
                                onClick={() => handleDeleteCharity(c._id, c.charityName)}
                              >
                                <i className="ti ti-trash" />حذف
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Load more */}
                {hasMoreCharities && (
                  <div className="load-more-wrap">
                    <button
                      className="load-more-btn"
                      disabled={loadingMore === 'charities'}
                      onClick={loadMoreCharities}
                    >
                      {loadingMore === 'charities'
                        ? <><i className="ti ti-loader-2 ti-spin" />جاري التحميل...</>
                        : <><i className="ti ti-chevron-down" />تحميل المزيد</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════ REPORTS TAB ══════════════════════════ */}
            {tab === 'reports' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                <div className="ap-section-header">
                  <div className="ap-section-title">
                    <i className="ti ti-alert-circle" style={{ color: AMBER }} />
                    التقارير
                    <span className="ap-count-badge" style={{ background: AMBER }}>
                      {reportsTotal || reports.length}
                    </span>
                  </div>
                </div>

                {filteredReports.length === 0 ? (
                  <div className="ap-empty">
                    <i className="ti ti-mood-happy" />
                    لا توجد تقارير حتى الآن
                  </div>
                ) : (
                  <div className="ap-card-grid reports">
                    {filteredReports.map((r, i) => (
                      <div key={r._id} className="report-card">
                        <div className="report-card-header">
                          <span className="report-card-num">
                            <i className="ti ti-alert-triangle" />
                            تقرير #{i + 1}
                          </span>
                          <span className="report-card-date">
                            <i className="ti ti-calendar" />
                            {fmt(r.createdAt)}
                          </span>
                        </div>

                        <p className="report-card-body">{r.description}</p>

                        <div className="report-card-footer">
                          {r.senderType && (
                            <span className="report-sender-tag">
                              <i className="ti ti-user" style={{ fontSize: 12 }} />
                              {r.senderType}
                            </span>
                          )}
                          {r.userName && (
                            <span className="report-sender-tag">
                              <i className="ti ti-at" style={{ fontSize: 12 }} />
                              {r.userName}
                            </span>
                          )}
                          {r.charityName && (
                            <span className="report-sender-tag">
                              <i className="ti ti-building" style={{ fontSize: 12 }} />
                              {r.charityName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Load more */}
                {hasMoreReports && (
                  <div className="load-more-wrap">
                    <button
                      className="load-more-btn"
                      disabled={loadingMore === 'reports'}
                      onClick={loadMoreReports}
                    >
                      {loadingMore === 'reports'
                        ? <><i className="ti ti-loader-2 ti-spin" />جاري التحميل...</>
                        : <><i className="ti ti-chevron-down" />تحميل المزيد</>
                      }
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════ AUTOMATION TAB ═══════════════════════ */}
            {tab === 'automation' && (
              <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)', lineHeight: 1.65 }}>
                  تشغيل المهام التلقائية يدويًا — تعمل أيضًا تلقائيًا بجدول زمني من الـ backend.
                </p>

                <div className="cron-grid">
                  <CronCard
                    emoji="📨"
                    title="تذكير التبرعات"
                    desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة."
                    code="GET /cron/donationReminder"
                    codeBg="#f0fdf4"   codeBorder="#bbf7d0" codeColor="#166534"
                    loading={cronLoading}
                    btnColor={TEAL2}
                    onRun={runDonationReminder}
                  />
                  <CronCard
                    emoji="📊"
                    title="تقرير الأدمن"
                    desc="يولّد تقريرًا شاملًا ويرسله لجميع المسؤولين."
                    code="GET /cron/adminReport"
                    codeBg="#eff6ff"   codeBorder="#bfdbfe" codeColor="#1e40af"
                    loading={cronLoading}
                    btnColor="#1e40af"
                    onRun={runAdminReport}
                  />
                </div>

                {cronLog.length > 0 && (
                  <div className="cron-log-card">
                    <div className="cron-log-header">
                      <SectionTitle icon="ti-list-details" color={TEAL2} title="سجل التنفيذ" badge={cronLog.length} />
                      <button className="cron-log-clear" onClick={() => setCronLog([])}>
                        مسح السجل
                      </button>
                    </div>
                    <div className="cron-log-list">
                      {cronLog.map((log, i) => (
                        <div key={i} className={`cron-log-item ${log.type}`}>
                          <span>{log.text}</span>
                          <span className="cron-log-time">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ══════════════════════ CHAT TAB ══════════════════════════════ */}
            {tab === 'chat' && (
              <div style={{ maxWidth: 860, margin: '0 auto', height: 620, display: 'flex', flexDirection: 'column', borderRadius: 12, overflow: 'hidden', border: '1.5px solid var(--bd, #e5e7eb)' }}>
                <AIChatEmbed />
              </div>
            )}

          </>
        )}
      </div>
    </div>
  );
}