// import { useEffect, useState } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { usersApi, charityApi, reportApi, authApi, request } from '../../services';
// import type { User, Charity, Report } from '../../services';
// import { formatDate } from '../../lib/utils';
// import { Link } from 'wouter';
// import {
//   validateName, validateEmail, validatePhone,
//   validateLicense, validateAddress, validateNationalId, validatePassword,
// } from '../../lib/validation';
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   PieChart, Pie, Cell, Legend,
// } from 'recharts';

// type Tab = 'users' | 'charities' | 'reports' | 'createAdmin' | 'automation';

// function FieldError({ msg }: { msg?: string }) {
//   if (!msg) return null;
//   return <span style={{ fontSize: 11, color: '#e53e3e', marginTop: 3, display: 'block' }}>{msg}</span>;
// }

// export default function AdminPanel() {
//   const { user, isLoading } = useAuth();
//   const [tab, setTab] = useState<Tab>('users');

//   const [users, setUsers] = useState<User[]>([]);
//   const [charities, setCharities] = useState<Charity[]>([]);
//   const [reports, setReports] = useState<Report[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

//   // Create charity form
//   const [showCreateCharity, setShowCreateCharity] = useState(false);
//   const [charityForm, setCharityForm] = useState({
//     charityName: '', email: '', phone: '', address: '', description: '', licenseNumber: '',
//   });
//   const [charityErrors, setCharityErrors] = useState<Record<string, string>>({});
//   const [charityLoading, setCharityLoading] = useState(false);

//   // Edit charity form
//   const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
//   const [editForm, setEditForm] = useState({ charityName: '', address: '', description: '' });
//   const [editErrors, setEditErrors] = useState<Record<string, string>>({});
//   const [editLoading, setEditLoading] = useState(false);

//   // Create admin form
//   const [adminForm, setAdminForm] = useState({
//     userName: '', email: '', phone: '', password: '', confirmPassword: '', address: '', nationalId: '',
//   });
//   const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
//   const [adminLoading, setAdminLoading] = useState(false);

//   // Cron / Automation state
//   const [cronLoading, setCronLoading] = useState<'reminder' | 'report' | null>(null);
//   const [cronLog, setCronLog] = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);

//   useEffect(() => {
//     if (!user || user.roleType !== 'admin') return;
//     setLoading(true);
//     Promise.allSettled([
//       usersApi.getAllUsers(),
//       charityApi.getAll(),
//       reportApi.getAll(),
//     ]).then(([u, c, r]) => {
//       if (u.status === 'fulfilled') setUsers(u.value.users || []);
//       if (c.status === 'fulfilled') setCharities(c.value.charities || []);
//       if (r.status === 'fulfilled') setReports(r.value.reports || []);
//     }).finally(() => setLoading(false));
//   }, [user]);

//   const showMsg = (type: 'success' | 'error', text: string) => {
//     setMsg({ type, text });
//     setTimeout(() => setMsg(null), 3500);
//   };

//   // ─── Cron handlers ────────────────────────────────────────────────────────
//   const runCron = async (type: 'reminder' | 'report') => {
//     const endpoint = type === 'reminder' ? '/cron/donationReminder' : '/cron/adminReport';
//     const label = type === 'reminder' ? 'تذكير التبرعات' : 'تقرير الأدمن';
//     setCronLoading(type);
//     try {
//       await request(endpoint);
//       setCronLog(prev => [{
//         type: 'success',
//         text: `✅ تم تشغيل "${label}" بنجاح`,
//         time: new Date().toLocaleTimeString('ar-EG'),
//       }, ...prev]);
//     } catch (err: unknown) {
//       setCronLog(prev => [{
//         type: 'error',
//         text: `❌ فشل تشغيل "${label}": ${err instanceof Error ? err.message : 'خطأ غير معروف'}`,
//         time: new Date().toLocaleTimeString('ar-EG'),
//       }, ...prev]);
//     } finally {
//       setCronLoading(null);
//     }
//   };

//   const handleDeleteUser = async (id: string, name: string) => {
//     if (!confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟`)) return;
//     setActionLoading('user-' + id);
//     try {
//       await usersApi.deleteUser(id);
//       setUsers(prev => prev.filter(u => u._id !== id));
//       showMsg('success', 'تم حذف المستخدم بنجاح');
//     } catch (e) {
//       showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleDeleteCharity = async (id: string, name: string) => {
//     if (!confirm(`هل أنت متأكد من حذف الجمعية "${name}"؟`)) return;
//     setActionLoading('charity-' + id);
//     try {
//       await charityApi.delete(id);
//       setCharities(prev => prev.filter(c => c._id !== id));
//       showMsg('success', 'تم حذف الجمعية بنجاح');
//     } catch (e) {
//       showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleApproveCharity = async (id: string, name: string) => {
//     if (!confirm(`هل أنت متأكد من الموافقة على جمعية "${name}"؟`)) return;
//     setActionLoading('approve-' + id);
//     try {
//       await charityApi.approve(id);
//       setCharities(prev => prev.map(c => c._id === id ? { ...c, status: 'approved' as const } : c));
//       showMsg('success', `✅ تمت الموافقة على جمعية "${name}" بنجاح`);
//     } catch (e) {
//       showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleRejectCharity = async (id: string, name: string) => {
//     const reason = prompt(`سبب رفض جمعية "${name}" (اختياري):`);
//     if (reason === null) return;
//     setActionLoading('reject-' + id);
//     try {
//       await charityApi.reject(id, reason);
//       setCharities(prev => prev.map(c => c._id === id ? { ...c, status: 'rejected' as const, rejectionReason: reason } : c));
//       showMsg('success', `تم رفض جمعية "${name}"`);
//     } catch (e) {
//       showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const validateCharityForm = () => {
//     const errs: Record<string, string> = {};
//     const nameErr = validateName(charityForm.charityName);
//     if (nameErr) errs.charityName = nameErr;
//     const emailErr = validateEmail(charityForm.email);
//     if (emailErr) errs.email = emailErr;
//     if (charityForm.phone) {
//       const phoneErr = validatePhone(charityForm.phone);
//       if (phoneErr) errs.phone = phoneErr;
//     }
//     const addrErr = validateAddress(charityForm.address);
//     if (addrErr) errs.address = addrErr;
//     if (!charityForm.description || charityForm.description.trim().length < 10) {
//       errs.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
//     }
//     if (charityForm.licenseNumber) {
//       const licErr = validateLicense(charityForm.licenseNumber);
//       if (licErr) errs.licenseNumber = licErr;
//     }
//     setCharityErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleCreateCharity = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateCharityForm()) return;
//     setCharityLoading(true);
//     try {
//       await charityApi.create({
//         charityName: charityForm.charityName,
//         email: charityForm.email,
//         phone: charityForm.phone,
//         address: charityForm.address,
//         description: charityForm.description,
//       });
//       const data = await charityApi.getAll();
//       setCharities(data.charities || []);
//       setCharityForm({ charityName: '', email: '', phone: '', address: '', description: '', licenseNumber: '' });
//       setCharityErrors({});
//       setShowCreateCharity(false);
//       showMsg('success', 'تم إنشاء الجمعية بنجاح');
//     } catch (e) {
//       showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
//     } finally {
//       setCharityLoading(false);
//     }
//   };

//   const startEditCharity = (c: Charity) => {
//     setEditingCharity(c);
//     setEditForm({ charityName: c.charityName, address: c.address, description: c.description });
//     setEditErrors({});
//     setShowCreateCharity(false);
//   };

//   const validateEditForm = () => {
//     const errs: Record<string, string> = {};
//     const nameErr = validateName(editForm.charityName);
//     if (nameErr) errs.charityName = nameErr;
//     const addrErr = validateAddress(editForm.address);
//     if (addrErr) errs.address = addrErr;
//     if (!editForm.description || editForm.description.trim().length < 10) {
//       errs.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
//     }
//     setEditErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleUpdateCharity = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!editingCharity || !validateEditForm()) return;
//     setEditLoading(true);
//     try {
//       await charityApi.update(editingCharity._id, editForm);
//       setCharities(prev => prev.map(c =>
//         c._id === editingCharity._id ? { ...c, ...editForm } : c
//       ));
//       setEditingCharity(null);
//       showMsg('success', 'تم تحديث الجمعية بنجاح');
//     } catch (e) {
//       showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
//     } finally {
//       setEditLoading(false);
//     }
//   };

//   if (isLoading) return (
//     <div className="page-wrapper" style={{ paddingTop: 72 }}>
//       <div className="spinner"><div className="spinner-ring" /></div>
//     </div>
//   );

//   if (!user || user.roleType !== 'admin') return (
//     <div className="page-wrapper" style={{ paddingTop: 72 }}>
//       <div className="empty-state">
//         <div className="empty-icon">🔒</div>
//         <p style={{ marginBottom: 20 }}>هذه الصفحة للمسؤولين فقط</p>
//         <Link href="/" className="btn-primary" style={{ display: 'inline-flex' }}>العودة للرئيسية</Link>
//       </div>
//     </div>
//   );

//   const setAdminField = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
//     setAdminForm(f => ({ ...f, [k]: e.target.value }));
//     setAdminErrors(p => ({ ...p, [k]: '' }));
//   };

//   const validateAdminForm = () => {
//     const errs: Record<string, string> = {};
//     const nameErr = validateName(adminForm.userName);
//     if (nameErr) errs.userName = nameErr;
//     const emailErr = validateEmail(adminForm.email);
//     if (emailErr) errs.email = emailErr;
//     if (adminForm.phone) {
//       const phoneErr = validatePhone(adminForm.phone);
//       if (phoneErr) errs.phone = phoneErr;
//     }
//     const pwErr = validatePassword(adminForm.password);
//     if (pwErr) errs.password = pwErr;
//     if (!adminForm.confirmPassword) errs.confirmPassword = 'تأكيد كلمة المرور مطلوب';
//     else if (adminForm.password !== adminForm.confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
//     const addrErr = validateAddress(adminForm.address);
//     if (addrErr) errs.address = addrErr;
//     const natErr = validateNationalId(adminForm.nationalId);
//     if (natErr) errs.nationalId = natErr;
//     setAdminErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const handleCreateAdmin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!validateAdminForm()) return;
//     setAdminLoading(true);
//     try {
//       await authApi.register({
//         userName: adminForm.userName,
//         email: adminForm.email,
//         phone: adminForm.phone,
//         password: adminForm.password,
//         confirmPassword: adminForm.confirmPassword,
//         address: adminForm.address,
//         roleType: 'admin',
//         nationalID: adminForm.nationalID,

//       } 
//       as Parameters<typeof authApi.register>[0]);
//       showMsg('success', `✅ تم إنشاء حساب الأدمن "${adminForm.userName}" بنجاح! يحتاج تفعيل البريد الإلكتروني.`);
//       setAdminForm({ userName: '', email: '', phone: '', password: '', confirmPassword: '', address: '', nationalId: '' });
//       setAdminErrors({});
//     } catch (e) {
//       showMsg('error', e instanceof Error ? e.message : 'حدث خطأ أثناء إنشاء الأدمن');
//     } finally {
//       setAdminLoading(false);
//     }
//   };

//   const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
//     { id: 'users',      label: 'المستخدمون',   icon: '👥', count: users.length },
//     { id: 'charities',  label: 'الجمعيات',      icon: '🏛️', count: charities.length },
//     { id: 'reports',    label: 'التقارير',       icon: '🚨', count: reports.length },
//     { id: 'createAdmin',label: 'إنشاء أدمن',    icon: '🛡️', count: 0 },
//     { id: 'automation', label: 'التشغيل التلقائي', icon: '⚙️', count: 0 },
//   ];

//   const setCharityField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setCharityForm(f => ({ ...f, [k]: e.target.value }));
//     setCharityErrors(p => ({ ...p, [k]: '' }));
//   };
//   const setEditField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setEditForm(f => ({ ...f, [k]: e.target.value }));
//     setEditErrors(p => ({ ...p, [k]: '' }));
//   };

//   return (
//     <div className="dashboard-wrapper">
//       {/* ─── Top Bar ─────────────────────────────────────────────── */}
//       <div className="dash-topbar">
//         <div className="dash-topbar-inner">
//           <div className="dash-topbar-left">
//             <div className="dash-topbar-icon">🛡️</div>
//             <div>
//               <h1>لوحة تحكم المسؤول</h1>
//               <p>مرحبًا، {user.userName} — إدارة المنصة بالكامل</p>
//             </div>
//           </div>
//           <div className="dash-topbar-date">
//             {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
//           </div>
//         </div>
//       </div>

//       <div className="dash-body">
//         {/* ─── Stats ───────────────────────────────────────────────── */}
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
//           {[
//             { label: 'إجمالي المستخدمين', value: users.length,    icon: '👥', cls: 'stat-card stat-blue'  },
//             { label: 'إجمالي الجمعيات',   value: charities.length, icon: '🏛️', cls: 'stat-card stat-green' },
//             { label: 'التقارير الواردة',  value: reports.length,   icon: '🚨', cls: 'stat-card stat-amber' },
//           ].map(s => (
//             <div key={s.label} className={s.cls} style={{ borderRadius: 12, padding: '20px 24px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
//               <div style={{ fontSize: 28 }}>{s.icon}</div>
//               <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px' }}>{s.value}</div>
//               <div style={{ fontSize: 14, opacity: .7 }}>{s.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* ─── Charts ─────────────────────────────────────────────── */}
//         {!loading && (users.length > 0 || charities.length > 0) && (() => {
//           const tooltipStyle = {
//             background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
//             padding: '8px 14px', fontSize: 13, fontFamily: 'Tajawal, sans-serif',
//             direction: 'rtl' as const,
//           };
//           const barData = [
//             { name: 'المستخدمون', value: users.length,     fill: '#3b82f6' },
//             { name: 'الجمعيات',   value: charities.length,  fill: '#10b981' },
//             { name: 'التقارير',   value: reports.length,    fill: '#f59e0b' },
//           ];
//           const pending  = charities.filter(c => (c as any).status === 'pending').length;
//           const approved = charities.filter(c => (c as any).status === 'approved').length;
//           const rejected = charities.filter(c => (c as any).status === 'rejected').length;
//           const pieData = [
//             { name: 'معلقة',   value: pending,  color: '#f59e0b' },
//             { name: 'مقبولة',  value: approved, color: '#10b981' },
//             { name: 'مرفوضة', value: rejected, color: '#ef4444' },
//           ].filter(d => d.value > 0);
//           return (
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
//               <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 12, padding: '18px 20px' }}>
//                 <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#2d3748', marginBottom: 16 }}>📊 إحصائيات المنصة</div>
//                 <ResponsiveContainer width="100%" height={180}>
//                   <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
//                     <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
//                     <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
//                     <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'عدد']} />
//                     <Bar dataKey="value" name="العدد" radius={[6, 6, 0, 0]}>
//                       {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//               {pieData.length > 0 && (
//                 <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 12, padding: '18px 20px' }}>
//                   <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#2d3748', marginBottom: 16 }}>🏛️ حالة الجمعيات</div>
//                   <ResponsiveContainer width="100%" height={180}>
//                     <PieChart>
//                       <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
//                         dataKey="value" nameKey="name" paddingAngle={3}>
//                         {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
//                       </Pie>
//                       <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'جمعية']} />
//                       <Legend iconType="circle" iconSize={10}
//                         formatter={(v: string) => <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>} />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               )}
//             </div>
//           );
//         })()}

//         {msg && (
//           <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: msg.type === 'success' ? '#f0fff4' : '#fff5f5', color: msg.type === 'success' ? '#38a169' : '#e53e3e', border: `1px solid ${msg.type === 'success' ? '#c6f6d5' : '#fed7d7'}` }}>
//             {msg.text}
//           </div>
//         )}

//         {/* ─── Tabs ────────────────────────────────────────────────── */}
//         <div className="dash-tabs">
//           {tabs.map(t => (
//             <button key={t.id} className={`dash-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
//               {t.icon} {t.label}
//               {t.count > 0 && <span className="dash-tab-count">{t.count}</span>}
//             </button>
//           ))}
//         </div>

//         {loading ? (
//           <div className="spinner"><div className="spinner-ring" /></div>
//         ) : (
//           <>
//             {/* ── USERS TAB ── */}
//             {tab === 'users' && (
//               <div className="dash-table-wrap">
//                 {users.length === 0 ? (
//                   <div className="empty-state"><div className="empty-icon">👥</div><p>لا يوجد مستخدمون</p></div>
//                 ) : (
//                   <table className="dash-table">
//                     <thead>
//                       <tr>
//                         <th>الاسم</th>
//                         <th>البريد الإلكتروني</th>
//                         <th>الهاتف</th>
//                         <th>الدور</th>
//                         <th>موثّق</th>
//                         <th>إجراء</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {users.map(u => (
//                         <tr key={u._id}>
//                           <td><strong>{u.userName}</strong></td>
//                           <td style={{ fontSize: 13 }}>{u.email}</td>
//                           <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
//                           <td>
//                             <span className={`role-badge role-${u.roleType}`}>
//                               {u.roleType === 'admin' ? '🛡️ أدمن' : u.roleType === 'charity' ? '🏛️ جمعية' : '👤 مستخدم'}
//                             </span>
//                           </td>
//                           <td>
//                             <span style={{ color: u.isVerified ? '#38a169' : '#e53e3e', fontSize: 13 }}>
//                               {u.isVerified ? '✓ موثق' : '✗ غير موثق'}
//                             </span>
//                           </td>
//                           <td>
//                             {u.roleType !== 'admin' && (
//                               <button
//                                 className="dash-btn-reject"
//                                 disabled={actionLoading === 'user-' + u._id}
//                                 onClick={() => handleDeleteUser(u._id, u.userName)}
//                               >
//                                 {actionLoading === 'user-' + u._id ? '...' : 'حذف'}
//                               </button>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             )}

//             {/* ── CHARITIES TAB ── */}
//             {tab === 'charities' && (
//               <div className="dash-table-wrap">
//                 <div style={{ marginBottom: 16 }}>
//                   <button className="btn-primary" onClick={() => { setShowCreateCharity(v => !v); setEditingCharity(null); }}>
//                     {showCreateCharity ? '✕ إغلاق' : '+ إضافة جمعية جديدة'}
//                   </button>
//                 </div>

//                 {showCreateCharity && (
//                   <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
//                     <h3 style={{ marginBottom: 16, fontSize: 16 }}>إضافة جمعية جديدة</h3>
//                     <form onSubmit={handleCreateCharity} noValidate>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                         <div className="form-group">
//                           <label className="form-label">اسم الجمعية *</label>
//                           <input className="form-input" type="text" required value={charityForm.charityName} onChange={setCharityField('charityName')}
//                             style={{ borderColor: charityErrors.charityName ? '#e53e3e' : undefined }} />
//                           <FieldError msg={charityErrors.charityName} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">البريد الإلكتروني *</label>
//                           <input className="form-input" type="email" required value={charityForm.email} onChange={setCharityField('email')} dir="ltr"
//                             style={{ borderColor: charityErrors.email ? '#e53e3e' : undefined }} />
//                           <FieldError msg={charityErrors.email} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">رقم الهاتف</label>
//                           <input className="form-input" type="text" value={charityForm.phone} onChange={setCharityField('phone')} dir="ltr"
//                             style={{ borderColor: charityErrors.phone ? '#e53e3e' : undefined }} />
//                           <FieldError msg={charityErrors.phone} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">العنوان *</label>
//                           <input className="form-input" type="text" required value={charityForm.address} onChange={setCharityField('address')}
//                             style={{ borderColor: charityErrors.address ? '#e53e3e' : undefined }} />
//                           <FieldError msg={charityErrors.address} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">رقم الترخيص <span style={{ fontSize: 11, opacity: .6 }}>(اختياري)</span></label>
//                           <input className="form-input" type="text" value={charityForm.licenseNumber} onChange={setCharityField('licenseNumber')} dir="ltr"
//                             placeholder="مثال: AB-CDE12-2024"
//                             style={{ borderColor: charityErrors.licenseNumber ? '#e53e3e' : undefined }} />
//                           <FieldError msg={charityErrors.licenseNumber} />
//                         </div>
//                       </div>
//                       <div className="form-group" style={{ marginTop: 12 }}>
//                         <label className="form-label">الوصف *</label>
//                         <textarea className="form-input" rows={3} required value={charityForm.description} onChange={setCharityField('description')}
//                           style={{ resize: 'vertical', borderColor: charityErrors.description ? '#e53e3e' : undefined }} />
//                         <FieldError msg={charityErrors.description} />
//                       </div>
//                       <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={charityLoading}>
//                         {charityLoading ? 'جاري الإنشاء...' : 'إنشاء الجمعية'}
//                       </button>
//                     </form>
//                   </div>
//                 )}

//                 {editingCharity && (
//                   <div style={{ background: '#f0fdfa', border: '2px solid #99f6e4', borderRadius: 12, padding: 24, marginBottom: 24 }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
//                       <h3 style={{ fontSize: 16, margin: 0 }}>✏️ تعديل: {editingCharity.charityName}</h3>
//                       <button type="button" onClick={() => setEditingCharity(null)} style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>✕ إلغاء</button>
//                     </div>
//                     <form onSubmit={handleUpdateCharity} noValidate>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                         <div className="form-group">
//                           <label className="form-label">اسم الجمعية *</label>
//                           <input type="text" required className="form-input" value={editForm.charityName} onChange={setEditField('charityName')}
//                             style={{ borderColor: editErrors.charityName ? '#e53e3e' : undefined }} />
//                           <FieldError msg={editErrors.charityName} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">العنوان *</label>
//                           <input type="text" required className="form-input" value={editForm.address} onChange={setEditField('address')}
//                             style={{ borderColor: editErrors.address ? '#e53e3e' : undefined }} />
//                           <FieldError msg={editErrors.address} />
//                         </div>
//                       </div>
//                       <div className="form-group" style={{ marginTop: 12 }}>
//                         <label className="form-label">الوصف *</label>
//                         <textarea rows={3} required className="form-input" value={editForm.description} onChange={setEditField('description')}
//                           style={{ resize: 'vertical', borderColor: editErrors.description ? '#e53e3e' : undefined }} />
//                         <FieldError msg={editErrors.description} />
//                       </div>
//                       <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={editLoading}>
//                         {editLoading ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
//                       </button>
//                     </form>
//                   </div>
//                 )}

//                 {charities.length === 0 ? (
//                   <div className="empty-state"><div className="empty-icon">🏛️</div><p>لا توجد جمعيات</p></div>
//                 ) : (
//                   <table className="dash-table">
//                     <thead>
//                       <tr>
//                         <th>اسم الجمعية</th>
//                         <th>البريد</th>
//                         <th>الهاتف</th>
//                         <th>العنوان</th>
//                         <th>الحالة</th>
//                         <th>تاريخ الإنشاء</th>
//                         <th>إجراء</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {[...charities].sort((a, b) => {
//                         const order = { pending: 0, approved: 1, rejected: 2 };
//                         return (order[a.status] ?? 1) - (order[b.status] ?? 1);
//                       }).map(c => (
//                         <tr key={c._id} style={{ background: editingCharity?._id === c._id ? '#f0fdfa' : c.status === 'pending' ? '#fffbeb' : undefined }}>
//                           <td>
//                             <Link href={`/charities/${c._id}`} style={{ color: 'var(--teal-600)', fontWeight: 700, textDecoration: 'none' }}>
//                               {c.charityName}
//                             </Link>
//                           </td>
//                           <td style={{ fontSize: 13 }}>{c.email}</td>
//                           <td style={{ fontSize: 13 }}>{c.phone || '—'}</td>
//                           <td style={{ fontSize: 13 }}>{c.address}</td>
//                           <td>
//                             {c.status === 'pending' && <span style={{ color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>⏳ قيد المراجعة</span>}
//                             {c.status === 'approved' && <span style={{ color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>✅ موافق عليه</span>}
//                             {c.status === 'rejected' && <span style={{ color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>❌ مرفوض</span>}
//                           </td>
//                           <td style={{ fontSize: 13 }}>{formatDate(c.createdAt || '')}</td>
//                           <td>
//                             <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
//                               <Link href={`/charities/${c._id}`} className="btn-sm" style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}>
//                                 👁️ عرض
//                               </Link>
//                               <button className="btn-sm" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => startEditCharity(c)}>
//                                 ✏️ تعديل
//                               </button>
//                               {c.status === 'pending' && (
//                                 <>
//                                   <button
//                                     className="dash-btn-approve"
//                                     style={{ fontSize: 12, padding: '4px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
//                                     disabled={!!actionLoading}
//                                     onClick={() => handleApproveCharity(c._id, c.charityName)}
//                                   >
//                                     {actionLoading === 'approve-' + c._id ? '...' : '✓ موافقة'}
//                                   </button>
//                                   <button
//                                     className="dash-btn-reject"
//                                     disabled={!!actionLoading}
//                                     onClick={() => handleRejectCharity(c._id, c.charityName)}
//                                   >
//                                     {actionLoading === 'reject-' + c._id ? '...' : '✕ رفض'}
//                                   </button>
//                                 </>
//                               )}
//                               <button
//                                 className="dash-btn-reject"
//                                 disabled={!!actionLoading}
//                                 onClick={() => handleDeleteCharity(c._id, c.charityName)}
//                               >
//                                 {actionLoading === 'charity-' + c._id ? '...' : 'حذف'}
//                               </button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             )}

//             {/* ── REPORTS TAB ── */}
//             {tab === 'reports' && (
//               <div className="dash-table-wrap">
//                 {reports.length === 0 ? (
//                   <div className="empty-state"><div className="empty-icon">🚨</div><p>لا توجد تقارير</p></div>
//                 ) : (
//                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//                     {reports.map((r, i) => (
//                       <div key={r._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
//                           <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>تقرير #{i + 1}</span>
//                           <span style={{ fontSize: 12, opacity: .6 }}>{formatDate(r.createdAt)}</span>
//                         </div>
//                         <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{r.description}</p>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* ── CREATE ADMIN TAB ── */}
//             {tab === 'createAdmin' && (
//               <div className="dash-table-wrap">
//                 <div style={{ maxWidth: 560, margin: '0 auto' }}>
//                   <div style={{ background: 'var(--card-bg)', border: '2px solid #99f6e4', borderRadius: 16, padding: 32 }}>
//                     <div style={{ marginBottom: 24 }}>
//                       <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 6 }}>🛡️ إنشاء حساب أدمن جديد</h3>
//                       <p style={{ fontSize: 14, color: 'var(--neutral-500)', margin: 0 }}>
//                         سيتم إرسال رمز تحقق على البريد الإلكتروني للأدمن الجديد لتفعيل الحساب
//                       </p>
//                     </div>
//                     <form onSubmit={handleCreateAdmin} noValidate>
//                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
//                         <div className="form-group">
//                           <label className="form-label">الاسم بالكامل *</label>
//                           <input className="form-input" type="text" placeholder="اسم الأدمن"
//                             value={adminForm.userName} onChange={setAdminField('userName')}
//                             style={{ borderColor: adminErrors.userName ? '#e53e3e' : undefined }} />
//                           <FieldError msg={adminErrors.userName} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">البريد الإلكتروني *</label>
//                           <input className="form-input" type="email" placeholder="admin@example.com" dir="ltr"
//                             value={adminForm.email} onChange={setAdminField('email')}
//                             style={{ borderColor: adminErrors.email ? '#e53e3e' : undefined }} />
//                           <FieldError msg={adminErrors.email} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">رقم الهاتف <span style={{ fontSize: 11, opacity: .6 }}>(اختياري)</span></label>
//                           <input className="form-input" type="tel" placeholder="01xxxxxxxxx" dir="ltr"
//                             value={adminForm.phone} onChange={setAdminField('phone')}
//                             style={{ borderColor: adminErrors.phone ? '#e53e3e' : undefined }} />
//                           <FieldError msg={adminErrors.phone} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">العنوان *</label>
//                           <input className="form-input" type="text" placeholder="المدينة / المنطقة"
//                             value={adminForm.address} onChange={setAdminField('address')}
//                             style={{ borderColor: adminErrors.address ? '#e53e3e' : undefined }} />
//                           <FieldError msg={adminErrors.address} />
//                         </div>
//                         <div className="form-group" style={{ gridColumn: '1 / -1' }}>
//                           <label className="form-label">الرقم القومي * <span style={{ fontSize: 11, opacity: .6, fontWeight: 400 }}>14 رقمًا</span></label>
//                           <input className="form-input" type="text" placeholder="00000000000000" dir="ltr"
//                             maxLength={14}
//                             value={adminForm.nationalId}
//                             onChange={e => { const v = e.target.value.replace(/\D/g, ''); setAdminForm(f => ({ ...f, nationalId: v })); setAdminErrors(p => ({ ...p, nationalId: '' })); }}
//                             style={{ borderColor: adminErrors.nationalId ? '#e53e3e' : undefined, letterSpacing: 2 }} />
//                           <FieldError msg={adminErrors.nationalId} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">كلمة المرور *</label>
//                           <input className="form-input" type="password" placeholder="••••••••" dir="ltr"
//                             value={adminForm.password} onChange={setAdminField('password')}
//                             style={{ borderColor: adminErrors.password ? '#e53e3e' : undefined }} />
//                           <FieldError msg={adminErrors.password} />
//                         </div>
//                         <div className="form-group">
//                           <label className="form-label">تأكيد كلمة المرور *</label>
//                           <input className="form-input" type="password" placeholder="••••••••" dir="ltr"
//                             value={adminForm.confirmPassword} onChange={setAdminField('confirmPassword')}
//                             style={{ borderColor: adminErrors.confirmPassword ? '#e53e3e' : undefined }} />
//                           <FieldError msg={adminErrors.confirmPassword} />
//                         </div>
//                       </div>
//                       <div style={{ marginTop: 6, padding: '10px 14px', background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 8, fontSize: 13 }}>
//                         ⚠️ كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وتشمل أرقامًا وأحرف كبيرة وصغيرة
//                       </div>
//                       <button type="submit" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={adminLoading}>
//                         {adminLoading ? 'جاري الإنشاء...' : '🛡️ إنشاء حساب الأدمن'}
//                       </button>
//                     </form>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ── AUTOMATION / CRON TAB ── */}
//             {tab === 'automation' && (
//               <div className="dash-table-wrap">
//                 <div style={{ maxWidth: 640, margin: '0 auto' }}>
//                   <div style={{ marginBottom: 24 }}>
//                     <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>⚙️ التشغيل التلقائي (Cron)</h3>
//                     <p style={{ fontSize: 14, color: 'var(--neutral-500)', margin: 0 }}>
//                       يمكنك تشغيل المهام التلقائية يدويًا من هنا. هذه المهام تعمل أيضًا تلقائيًا من الـ backend بجدول زمني محدد.
//                     </p>
//                   </div>

//                   {/* Cron Cards */}
//                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
//                     {/* Donation Reminder */}
//                     <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 14, padding: 24 }}>
//                       <div style={{ fontSize: 36, marginBottom: 12 }}>📨</div>
//                       <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>تذكير التبرعات</h4>
//                       <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '0 0 16px', lineHeight: 1.6 }}>
//                         يرسل تذكيرات تلقائية للجمعيات بشأن التبرعات المعلقة منذ فترة طويلة.
//                       </p>
//                       <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534', marginBottom: 16 }}>
//                         📡 Endpoint: <code style={{ fontFamily: 'monospace' }}>GET /cron/donationReminder</code>
//                       </div>
//                       <button
//                         className="btn-primary"
//                         style={{ width: '100%' }}
//                         disabled={cronLoading === 'reminder'}
//                         onClick={() => runCron('reminder')}
//                       >
//                         {cronLoading === 'reminder'
//                           ? <><i className="fas fa-spinner fa-spin" /> جاري التشغيل...</>
//                           : '▶ تشغيل الآن'
//                         }
//                       </button>
//                     </div>

//                     {/* Admin Report */}
//                     <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 14, padding: 24 }}>
//                       <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
//                       <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>تقرير الأدمن</h4>
//                       <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '0 0 16px', lineHeight: 1.6 }}>
//                         يولّد تقريرًا دوريًا شاملًا عن نشاط المنصة ويرسله للمسؤولين.
//                       </p>
//                       <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1e40af', marginBottom: 16 }}>
//                         📡 Endpoint: <code style={{ fontFamily: 'monospace' }}>GET /cron/adminReport</code>
//                       </div>
//                       <button
//                         className="btn-primary"
//                         style={{ width: '100%', background: '#1e40af' }}
//                         disabled={cronLoading === 'report'}
//                         onClick={() => runCron('report')}
//                       >
//                         {cronLoading === 'report'
//                           ? <><i className="fas fa-spinner fa-spin" /> جاري التشغيل...</>
//                           : '▶ تشغيل الآن'
//                         }
//                       </button>
//                     </div>
//                   </div>

//                   {/* Cron Log */}
//                   <div>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//                       <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>📋 سجل التنفيذ</h4>
//                       {cronLog.length > 0 && (
//                         <button
//                           onClick={() => setCronLog([])}
//                           style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--neutral-500)' }}
//                         >
//                           مسح السجل
//                         </button>
//                       )}
//                     </div>
//                     {cronLog.length === 0 ? (
//                       <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--neutral-400)', fontSize: 14 }}>
//                         لا يوجد سجل تنفيذ بعد. قم بتشغيل إحدى المهام أعلاه.
//                       </div>
//                     ) : (
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                         {cronLog.map((log, i) => (
//                           <div
//                             key={i}
//                             style={{
//                               display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//                               padding: '10px 14px', borderRadius: 8, fontSize: 13,
//                               background: log.type === 'success' ? '#f0fff4' : '#fff5f5',
//                               border: `1px solid ${log.type === 'success' ? '#c6f6d5' : '#fed7d7'}`,
//                               color: log.type === 'success' ? '#276749' : '#c53030',
//                             }}
//                           >
//                             <span>{log.text}</span>
//                             <span style={{ opacity: .6, fontSize: 12, flexShrink: 0, marginRight: 12 }}>{log.time}</span>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi, charityApi, reportApi, authApi, request } from '../../services';
import type { User, Charity, Report } from '../../services';
import { formatDate } from '../../lib/utils';
import { Link } from 'wouter';
import {
  validateName, validateEmail, validatePhone,
  validateLicense, validateAddress, validateNationalId, validatePassword,
} from '../../lib/validation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

type Tab = 'users' | 'charities' | 'reports' | 'createAdmin' | 'automation';

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span style={{ fontSize: 11, color: '#e53e3e', marginTop: 3, display: 'block' }}>{msg}</span>;
}

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  const [users, setUsers] = useState<User[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Create charity form
  const [showCreateCharity, setShowCreateCharity] = useState(false);
  const [charityForm, setCharityForm] = useState({
    charityName: '', email: '', phone: '', address: '', description: '', licenseNumber: '',
  });
  const [charityErrors, setCharityErrors] = useState<Record<string, string>>({});
  const [charityLoading, setCharityLoading] = useState(false);

  // Edit charity form
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [editForm, setEditForm] = useState({ charityName: '', address: '', description: '' });
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Create admin form
  const [adminForm, setAdminForm] = useState({
    userName: '', email: '', phone: '', password: '', confirmPassword: '', address: '', nationalId: '',
  });
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
  const [adminLoading, setAdminLoading] = useState(false);

  // Cron / Automation state
  const [cronLoading, setCronLoading] = useState<'reminder' | 'report' | null>(null);
  const [cronLog, setCronLog] = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);

  useEffect(() => {
    if (!user || user.roleType !== 'admin') return;
    setLoading(true);
    Promise.allSettled([
      usersApi.getAllUsers(),
      charityApi.getAll(),
      reportApi.getAll(),
    ]).then(([u, c, r]) => {
      if (u.status === 'fulfilled') setUsers(u.value.users || []);
      if (c.status === 'fulfilled') setCharities(c.value.charities || []);
      if (r.status === 'fulfilled') setReports(r.value.reports || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  // ─── Cron handlers ────────────────────────────────────────────────────────
  const runCron = async (type: 'reminder' | 'report') => {
    const endpoint = type === 'reminder' ? '/cron/donationReminder' : '/cron/adminReport';
    const label = type === 'reminder' ? 'تذكير التبرعات' : 'تقرير الأدمن';
    setCronLoading(type);
    try {
      await request(endpoint);
      setCronLog(prev => [{
        type: 'success',
        text: `✅ تم تشغيل "${label}" بنجاح`,
        time: new Date().toLocaleTimeString('ar-EG'),
      }, ...prev]);
    } catch (err: unknown) {
      setCronLog(prev => [{
        type: 'error',
        text: `❌ فشل تشغيل "${label}": ${err instanceof Error ? err.message : 'خطأ غير معروف'}`,
        time: new Date().toLocaleTimeString('ar-EG'),
      }, ...prev]);
    } finally {
      setCronLoading(null);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${name}"؟`)) return;
    setActionLoading('user-' + id);
    try {
      await usersApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      showMsg('success', 'تم حذف المستخدم بنجاح');
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteCharity = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف الجمعية "${name}"؟`)) return;
    setActionLoading('charity-' + id);
    try {
      await charityApi.delete(id);
      setCharities(prev => prev.filter(c => c._id !== id));
      showMsg('success', 'تم حذف الجمعية بنجاح');
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveCharity = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من الموافقة على جمعية "${name}"؟`)) return;
    setActionLoading('approve-' + id);
    try {
      await charityApi.approve(id);
      setCharities(prev => prev.map(c => c._id === id ? { ...c, status: 'approved' as const } : c));
      showMsg('success', `✅ تمت الموافقة على جمعية "${name}" بنجاح`);
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectCharity = async (id: string, name: string) => {
    const reason = prompt(`سبب رفض جمعية "${name}" (اختياري):`);
    if (reason === null) return;
    setActionLoading('reject-' + id);
    try {
      await charityApi.reject(id, reason);
      setCharities(prev => prev.map(c => c._id === id ? { ...c, status: 'rejected' as const, rejectionReason: reason } : c));
      showMsg('success', `تم رفض جمعية "${name}"`);
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  const validateCharityForm = () => {
    const errs: Record<string, string> = {};
    const nameErr = validateName(charityForm.charityName);
    if (nameErr) errs.charityName = nameErr;
    const emailErr = validateEmail(charityForm.email);
    if (emailErr) errs.email = emailErr;
    if (charityForm.phone) {
      const phoneErr = validatePhone(charityForm.phone);
      if (phoneErr) errs.phone = phoneErr;
    }
    const addrErr = validateAddress(charityForm.address);
    if (addrErr) errs.address = addrErr;
    if (!charityForm.description || charityForm.description.trim().length < 10) {
      errs.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
    }
    if (charityForm.licenseNumber) {
      const licErr = validateLicense(charityForm.licenseNumber);
      if (licErr) errs.licenseNumber = licErr;
    }
    setCharityErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ✅ FIX Bug #1: استبدل charityApi.create() (غير موجود) بـ authApi.register()
  const handleCreateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCharityForm()) return;
    setCharityLoading(true);
    try {
      await authApi.register({
        charityName:        charityForm.charityName,
        email:              charityForm.email,
        phone:              charityForm.phone,
        address:            charityForm.address,
        charityDescription: charityForm.description,
        licenseNumber:      charityForm.licenseNumber || undefined,
        roleType:           'charity',
        password:           'TempPass@1234',
        confirmPassword:    'TempPass@1234',
      });
      const data = await charityApi.getAll();
      setCharities(data.charities || []);
      setCharityForm({ charityName: '', email: '', phone: '', address: '', description: '', licenseNumber: '' });
      setCharityErrors({});
      setShowCreateCharity(false);
      showMsg('success', '✅ تم إنشاء الجمعية بنجاح — تحتاج تفعيل البريد الإلكتروني');
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setCharityLoading(false);
    }
  };

  const startEditCharity = (c: Charity) => {
    setEditingCharity(c);
    setEditForm({ charityName: c.charityName, address: c.address, description: c.description });
    setEditErrors({});
    setShowCreateCharity(false);
  };

  const validateEditForm = () => {
    const errs: Record<string, string> = {};
    const nameErr = validateName(editForm.charityName);
    if (nameErr) errs.charityName = nameErr;
    const addrErr = validateAddress(editForm.address);
    if (addrErr) errs.address = addrErr;
    if (!editForm.description || editForm.description.trim().length < 10) {
      errs.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
    }
    setEditErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharity || !validateEditForm()) return;
    setEditLoading(true);
    try {
      await charityApi.update(editingCharity._id, editForm);
      setCharities(prev => prev.map(c =>
        c._id === editingCharity._id ? { ...c, ...editForm } : c
      ));
      setEditingCharity(null);
      showMsg('success', 'تم تحديث الجمعية بنجاح');
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setEditLoading(false);
    }
  };

  if (isLoading) return (
    <div className="page-wrapper" style={{ paddingTop: 72 }}>
      <div className="spinner"><div className="spinner-ring" /></div>
    </div>
  );

  if (!user || user.roleType !== 'admin') return (
    <div className="page-wrapper" style={{ paddingTop: 72 }}>
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <p style={{ marginBottom: 20 }}>هذه الصفحة للمسؤولين فقط</p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-flex' }}>العودة للرئيسية</Link>
      </div>
    </div>
  );

  const setAdminField = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminForm(f => ({ ...f, [k]: e.target.value }));
    setAdminErrors(p => ({ ...p, [k]: '' }));
  };

  const validateAdminForm = () => {
    const errs: Record<string, string> = {};
    const nameErr = validateName(adminForm.userName);
    if (nameErr) errs.userName = nameErr;
    const emailErr = validateEmail(adminForm.email);
    if (emailErr) errs.email = emailErr;
    if (adminForm.phone) {
      const phoneErr = validatePhone(adminForm.phone);
      if (phoneErr) errs.phone = phoneErr;
    }
    const pwErr = validatePassword(adminForm.password);
    if (pwErr) errs.password = pwErr;
    if (!adminForm.confirmPassword) errs.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    else if (adminForm.password !== adminForm.confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
    const addrErr = validateAddress(adminForm.address);
    if (addrErr) errs.address = addrErr;
    const natErr = validateNationalId(adminForm.nationalId);
    if (natErr) errs.nationalId = natErr;
    setAdminErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ✅ FIX Bug #2: nationalID: adminForm.nationalId (مش nationalID)
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdminForm()) return;
    setAdminLoading(true);
    try {
      await authApi.register({
        userName:        adminForm.userName,
        email:           adminForm.email,
        phone:           adminForm.phone,
        password:        adminForm.password,
        confirmPassword: adminForm.confirmPassword,
        address:         adminForm.address,
        roleType:        'admin',
        nationalID:      adminForm.nationalId,   // ✅ الـ state اسمه nationalId (d صغيرة)
      });
      showMsg('success', `✅ تم إنشاء حساب الأدمن "${adminForm.userName}" بنجاح! يحتاج تفعيل البريد الإلكتروني.`);
      setAdminForm({ userName: '', email: '', phone: '', password: '', confirmPassword: '', address: '', nationalId: '' });
      setAdminErrors({});
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ أثناء إنشاء الأدمن');
    } finally {
      setAdminLoading(false);
    }
  };

  const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: 'users',       label: 'المستخدمون',      icon: '👥', count: users.length },
    { id: 'charities',   label: 'الجمعيات',         icon: '🏛️', count: charities.length },
    { id: 'reports',     label: 'التقارير',          icon: '🚨', count: reports.length },
    { id: 'createAdmin', label: 'إنشاء أدمن',       icon: '🛡️', count: 0 },
    { id: 'automation',  label: 'التشغيل التلقائي',  icon: '⚙️', count: 0 },
  ];

  const setCharityField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCharityForm(f => ({ ...f, [k]: e.target.value }));
    setCharityErrors(p => ({ ...p, [k]: '' }));
  };
  const setEditField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm(f => ({ ...f, [k]: e.target.value }));
    setEditErrors(p => ({ ...p, [k]: '' }));
  };

  return (
    <div className="dashboard-wrapper">
      {/* ─── Top Bar ─────────────────────────────────────────────── */}
      <div className="dash-topbar">
        <div className="dash-topbar-inner">
          <div className="dash-topbar-left">
            <div className="dash-topbar-icon">🛡️</div>
            <div>
              <h1>لوحة تحكم المسؤول</h1>
              <p>مرحبًا، {user.userName} — إدارة المنصة بالكامل</p>
            </div>
          </div>
          <div className="dash-topbar-date">
            {new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="dash-body">
        {/* ─── Stats ───────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'إجمالي المستخدمين', value: users.length,     icon: '👥', cls: 'stat-card stat-blue'  },
            { label: 'إجمالي الجمعيات',   value: charities.length,  icon: '🏛️', cls: 'stat-card stat-green' },
            { label: 'التقارير الواردة',  value: reports.length,    icon: '🚨', cls: 'stat-card stat-amber' },
          ].map(s => (
            <div key={s.label} className={s.cls} style={{ borderRadius: 12, padding: '20px 24px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px' }}>{s.value}</div>
              <div style={{ fontSize: 14, opacity: .7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ─── Charts ─────────────────────────────────────────────── */}
        {!loading && (users.length > 0 || charities.length > 0) && (() => {
          const tooltipStyle = {
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
            padding: '8px 14px', fontSize: 13, fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl' as const,
          };
          const barData = [
            { name: 'المستخدمون', value: users.length,    fill: '#3b82f6' },
            { name: 'الجمعيات',   value: charities.length, fill: '#10b981' },
            { name: 'التقارير',   value: reports.length,   fill: '#f59e0b' },
          ];
          const pending  = charities.filter(c => (c as any).status === 'pending').length;
          const approved = charities.filter(c => (c as any).status === 'approved').length;
          const rejected = charities.filter(c => (c as any).status === 'rejected').length;
          const pieData = [
            { name: 'معلقة',   value: pending,  color: '#f59e0b' },
            { name: 'مقبولة',  value: approved, color: '#10b981' },
            { name: 'مرفوضة', value: rejected,  color: '#ef4444' },
          ].filter(d => d.value > 0);
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 12, padding: '18px 20px' }}>
                <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#2d3748', marginBottom: 16 }}>📊 إحصائيات المنصة</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={barData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'عدد']} />
                    <Bar dataKey="value" name="العدد" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {pieData.length > 0 && (
                <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#2d3748', marginBottom: 16 }}>🏛️ حالة الجمعيات</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                        dataKey="value" nameKey="name" paddingAngle={3}>
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, 'جمعية']} />
                      <Legend iconType="circle" iconSize={10}
                        formatter={(v: string) => <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          );
        })()}

        {msg && (
          <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 8, background: msg.type === 'success' ? '#f0fff4' : '#fff5f5', color: msg.type === 'success' ? '#38a169' : '#e53e3e', border: `1px solid ${msg.type === 'success' ? '#c6f6d5' : '#fed7d7'}` }}>
            {msg.text}
          </div>
        )}

        {/* ─── Tabs ────────────────────────────────────────────────── */}
        <div className="dash-tabs">
          {tabs.map(t => (
            <button key={t.id} className={`dash-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
              {t.count > 0 && <span className="dash-tab-count">{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="spinner"><div className="spinner-ring" /></div>
        ) : (
          <>
            {/* ── USERS TAB ── */}
            {tab === 'users' && (
              <div className="dash-table-wrap">
                {users.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">👥</div><p>لا يوجد مستخدمون</p></div>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>الاسم</th>
                        <th>البريد الإلكتروني</th>
                        <th>الهاتف</th>
                        <th>الدور</th>
                        <th>موثّق</th>
                        <th>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id}>
                          <td><strong>{u.userName}</strong></td>
                          <td style={{ fontSize: 13 }}>{u.email}</td>
                          <td style={{ fontSize: 13 }}>{u.phone || '—'}</td>
                          <td>
                            <span className={`role-badge role-${u.roleType}`}>
                              {u.roleType === 'admin' ? '🛡️ أدمن' : u.roleType === 'charity' ? '🏛️ جمعية' : '👤 مستخدم'}
                            </span>
                          </td>
                          <td>
                            <span style={{ color: u.isVerified ? '#38a169' : '#e53e3e', fontSize: 13 }}>
                              {u.isVerified ? '✓ موثق' : '✗ غير موثق'}
                            </span>
                          </td>
                          <td>
                            {u.roleType !== 'admin' && (
                              <button
                                className="dash-btn-reject"
                                disabled={actionLoading === 'user-' + u._id}
                                onClick={() => handleDeleteUser(u._id, u.userName)}
                              >
                                {actionLoading === 'user-' + u._id ? '...' : 'حذف'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── CHARITIES TAB ── */}
            {tab === 'charities' && (
              <div className="dash-table-wrap">
                <div style={{ marginBottom: 16 }}>
                  <button className="btn-primary" onClick={() => { setShowCreateCharity(v => !v); setEditingCharity(null); }}>
                    {showCreateCharity ? '✕ إغلاق' : '+ إضافة جمعية جديدة'}
                  </button>
                </div>

                {showCreateCharity && (
                  <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                    <h3 style={{ marginBottom: 16, fontSize: 16 }}>إضافة جمعية جديدة</h3>
                    <form onSubmit={handleCreateCharity} noValidate>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">اسم الجمعية *</label>
                          <input className="form-input" type="text" required value={charityForm.charityName} onChange={setCharityField('charityName')}
                            style={{ borderColor: charityErrors.charityName ? '#e53e3e' : undefined }} />
                          <FieldError msg={charityErrors.charityName} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">البريد الإلكتروني *</label>
                          <input className="form-input" type="email" required value={charityForm.email} onChange={setCharityField('email')} dir="ltr"
                            style={{ borderColor: charityErrors.email ? '#e53e3e' : undefined }} />
                          <FieldError msg={charityErrors.email} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">رقم الهاتف</label>
                          <input className="form-input" type="text" value={charityForm.phone} onChange={setCharityField('phone')} dir="ltr"
                            style={{ borderColor: charityErrors.phone ? '#e53e3e' : undefined }} />
                          <FieldError msg={charityErrors.phone} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">العنوان *</label>
                          <input className="form-input" type="text" required value={charityForm.address} onChange={setCharityField('address')}
                            style={{ borderColor: charityErrors.address ? '#e53e3e' : undefined }} />
                          <FieldError msg={charityErrors.address} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">رقم الترخيص <span style={{ fontSize: 11, opacity: .6 }}>(اختياري)</span></label>
                          <input className="form-input" type="text" value={charityForm.licenseNumber} onChange={setCharityField('licenseNumber')} dir="ltr"
                            placeholder="مثال: AB-CDE12-2024"
                            style={{ borderColor: charityErrors.licenseNumber ? '#e53e3e' : undefined }} />
                          <FieldError msg={charityErrors.licenseNumber} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: 12 }}>
                        <label className="form-label">الوصف *</label>
                        <textarea className="form-input" rows={3} required value={charityForm.description} onChange={setCharityField('description')}
                          style={{ resize: 'vertical', borderColor: charityErrors.description ? '#e53e3e' : undefined }} />
                        <FieldError msg={charityErrors.description} />
                      </div>
                      <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={charityLoading}>
                        {charityLoading ? 'جاري الإنشاء...' : 'إنشاء الجمعية'}
                      </button>
                    </form>
                  </div>
                )}

                {editingCharity && (
                  <div style={{ background: '#f0fdfa', border: '2px solid #99f6e4', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, margin: 0 }}>✏️ تعديل: {editingCharity.charityName}</h3>
                      <button type="button" onClick={() => setEditingCharity(null)} style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>✕ إلغاء</button>
                    </div>
                    <form onSubmit={handleUpdateCharity} noValidate>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">اسم الجمعية *</label>
                          <input type="text" required className="form-input" value={editForm.charityName} onChange={setEditField('charityName')}
                            style={{ borderColor: editErrors.charityName ? '#e53e3e' : undefined }} />
                          <FieldError msg={editErrors.charityName} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">العنوان *</label>
                          <input type="text" required className="form-input" value={editForm.address} onChange={setEditField('address')}
                            style={{ borderColor: editErrors.address ? '#e53e3e' : undefined }} />
                          <FieldError msg={editErrors.address} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: 12 }}>
                        <label className="form-label">الوصف *</label>
                        <textarea rows={3} required className="form-input" value={editForm.description} onChange={setEditField('description')}
                          style={{ resize: 'vertical', borderColor: editErrors.description ? '#e53e3e' : undefined }} />
                        <FieldError msg={editErrors.description} />
                      </div>
                      <button type="submit" className="btn-primary" style={{ marginTop: 16 }} disabled={editLoading}>
                        {editLoading ? 'جاري الحفظ...' : '💾 حفظ التعديلات'}
                      </button>
                    </form>
                  </div>
                )}

                {charities.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">🏛️</div><p>لا توجد جمعيات</p></div>
                ) : (
                  <table className="dash-table">
                    <thead>
                      <tr>
                        <th>اسم الجمعية</th>
                        <th>البريد</th>
                        <th>الهاتف</th>
                        <th>العنوان</th>
                        <th>الحالة</th>
                        <th>تاريخ الإنشاء</th>
                        <th>إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...charities].sort((a, b) => {
                        const order = { pending: 0, approved: 1, rejected: 2 };
                        return (order[a.status] ?? 1) - (order[b.status] ?? 1);
                      }).map(c => (
                        <tr key={c._id} style={{ background: editingCharity?._id === c._id ? '#f0fdfa' : c.status === 'pending' ? '#fffbeb' : undefined }}>
                          <td>
                            <Link href={`/charities/${c._id}`} style={{ color: 'var(--teal-600)', fontWeight: 700, textDecoration: 'none' }}>
                              {c.charityName}
                            </Link>
                          </td>
                          <td style={{ fontSize: 13 }}>{c.email}</td>
                          <td style={{ fontSize: 13 }}>{c.phone || '—'}</td>
                          <td style={{ fontSize: 13 }}>{c.address}</td>
                          <td>
                            {c.status === 'pending'  && <span style={{ color: '#92400e', background: '#fef3c7', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>⏳ قيد المراجعة</span>}
                            {c.status === 'approved' && <span style={{ color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>✅ موافق عليه</span>}
                            {c.status === 'rejected' && <span style={{ color: '#991b1b', background: '#fee2e2', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>❌ مرفوض</span>}
                          </td>
                          <td style={{ fontSize: 13 }}>{formatDate(c.createdAt || '')}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              <Link href={`/charities/${c._id}`} className="btn-sm" style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}>
                                👁️ عرض
                              </Link>
                              <button className="btn-sm" style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => startEditCharity(c)}>
                                ✏️ تعديل
                              </button>
                              {c.status === 'pending' && (
                                <>
                                  <button
                                    className="dash-btn-approve"
                                    style={{ fontSize: 12, padding: '4px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
                                    disabled={!!actionLoading}
                                    onClick={() => handleApproveCharity(c._id, c.charityName)}
                                  >
                                    {actionLoading === 'approve-' + c._id ? '...' : '✓ موافقة'}
                                  </button>
                                  <button
                                    className="dash-btn-reject"
                                    disabled={!!actionLoading}
                                    onClick={() => handleRejectCharity(c._id, c.charityName)}
                                  >
                                    {actionLoading === 'reject-' + c._id ? '...' : '✕ رفض'}
                                  </button>
                                </>
                              )}
                              <button
                                className="dash-btn-reject"
                                disabled={!!actionLoading}
                                onClick={() => handleDeleteCharity(c._id, c.charityName)}
                              >
                                {actionLoading === 'charity-' + c._id ? '...' : 'حذف'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* ── REPORTS TAB ── */}
            {tab === 'reports' && (
              <div className="dash-table-wrap">
                {reports.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">🚨</div><p>لا توجد تقارير</p></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reports.map((r, i) => (
                      <div key={r._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--primary)' }}>تقرير #{i + 1}</span>
                          <span style={{ fontSize: 12, opacity: .6 }}>{formatDate(r.createdAt)}</span>
                        </div>
                        <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{r.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── CREATE ADMIN TAB ── */}
            {tab === 'createAdmin' && (
              <div className="dash-table-wrap">
                <div style={{ maxWidth: 560, margin: '0 auto' }}>
                  <div style={{ background: 'var(--card-bg)', border: '2px solid #99f6e4', borderRadius: 16, padding: 32 }}>
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 6 }}>🛡️ إنشاء حساب أدمن جديد</h3>
                      <p style={{ fontSize: 14, color: 'var(--neutral-500)', margin: 0 }}>
                        سيتم إرسال رمز تحقق على البريد الإلكتروني للأدمن الجديد لتفعيل الحساب
                      </p>
                    </div>
                    <form onSubmit={handleCreateAdmin} noValidate>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">الاسم بالكامل *</label>
                          <input className="form-input" type="text" placeholder="اسم الأدمن"
                            value={adminForm.userName} onChange={setAdminField('userName')}
                            style={{ borderColor: adminErrors.userName ? '#e53e3e' : undefined }} />
                          <FieldError msg={adminErrors.userName} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">البريد الإلكتروني *</label>
                          <input className="form-input" type="email" placeholder="admin@example.com" dir="ltr"
                            value={adminForm.email} onChange={setAdminField('email')}
                            style={{ borderColor: adminErrors.email ? '#e53e3e' : undefined }} />
                          <FieldError msg={adminErrors.email} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">رقم الهاتف <span style={{ fontSize: 11, opacity: .6 }}>(اختياري)</span></label>
                          <input className="form-input" type="tel" placeholder="01xxxxxxxxx" dir="ltr"
                            value={adminForm.phone} onChange={setAdminField('phone')}
                            style={{ borderColor: adminErrors.phone ? '#e53e3e' : undefined }} />
                          <FieldError msg={adminErrors.phone} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">العنوان *</label>
                          <input className="form-input" type="text" placeholder="المدينة / المنطقة"
                            value={adminForm.address} onChange={setAdminField('address')}
                            style={{ borderColor: adminErrors.address ? '#e53e3e' : undefined }} />
                          <FieldError msg={adminErrors.address} />
                        </div>
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                          <label className="form-label">الرقم القومي * <span style={{ fontSize: 11, opacity: .6, fontWeight: 400 }}>14 رقمًا</span></label>
                          <input className="form-input" type="text" placeholder="00000000000000" dir="ltr"
                            maxLength={14}
                            value={adminForm.nationalId}
                            onChange={e => { const v = e.target.value.replace(/\D/g, ''); setAdminForm(f => ({ ...f, nationalId: v })); setAdminErrors(p => ({ ...p, nationalId: '' })); }}
                            style={{ borderColor: adminErrors.nationalId ? '#e53e3e' : undefined, letterSpacing: 2 }} />
                          <FieldError msg={adminErrors.nationalId} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">كلمة المرور *</label>
                          <input className="form-input" type="password" placeholder="••••••••" dir="ltr"
                            value={adminForm.password} onChange={setAdminField('password')}
                            style={{ borderColor: adminErrors.password ? '#e53e3e' : undefined }} />
                          <FieldError msg={adminErrors.password} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">تأكيد كلمة المرور *</label>
                          <input className="form-input" type="password" placeholder="••••••••" dir="ltr"
                            value={adminForm.confirmPassword} onChange={setAdminField('confirmPassword')}
                            style={{ borderColor: adminErrors.confirmPassword ? '#e53e3e' : undefined }} />
                          <FieldError msg={adminErrors.confirmPassword} />
                        </div>
                      </div>
                      <div style={{ marginTop: 6, padding: '10px 14px', background: 'rgba(234,179,8,.08)', border: '1px solid rgba(234,179,8,.3)', borderRadius: 8, fontSize: 13 }}>
                        ⚠️ كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، وتشمل أرقامًا وأحرف كبيرة وصغيرة
                      </div>
                      <button type="submit" className="btn-primary" style={{ marginTop: 20, width: '100%' }} disabled={adminLoading}>
                        {adminLoading ? 'جاري الإنشاء...' : '🛡️ إنشاء حساب الأدمن'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* ── AUTOMATION / CRON TAB ── */}
            {tab === 'automation' && (
              <div className="dash-table-wrap">
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>⚙️ التشغيل التلقائي (Cron)</h3>
                    <p style={{ fontSize: 14, color: 'var(--neutral-500)', margin: 0 }}>
                      يمكنك تشغيل المهام التلقائية يدويًا من هنا. هذه المهام تعمل أيضًا تلقائيًا من الـ backend بجدول زمني محدد.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 14, padding: 24 }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📨</div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>تذكير التبرعات</h4>
                      <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '0 0 16px', lineHeight: 1.6 }}>
                        يرسل تذكيرات تلقائية للجمعيات بشأن التبرعات المعلقة منذ فترة طويلة.
                      </p>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534', marginBottom: 16 }}>
                        📡 Endpoint: <code style={{ fontFamily: 'monospace' }}>GET /cron/donationReminder</code>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ width: '100%' }}
                        disabled={cronLoading === 'reminder'}
                        onClick={() => runCron('reminder')}
                      >
                        {cronLoading === 'reminder'
                          ? <><i className="fas fa-spinner fa-spin" /> جاري التشغيل...</>
                          : '▶ تشغيل الآن'
                        }
                      </button>
                    </div>

                    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: 14, padding: 24 }}>
                      <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>تقرير الأدمن</h4>
                      <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '0 0 16px', lineHeight: 1.6 }}>
                        يولّد تقريرًا دوريًا شاملًا عن نشاط المنصة ويرسله للمسؤولين.
                      </p>
                      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1e40af', marginBottom: 16 }}>
                        📡 Endpoint: <code style={{ fontFamily: 'monospace' }}>GET /cron/adminReport</code>
                      </div>
                      <button
                        className="btn-primary"
                        style={{ width: '100%', background: '#1e40af' }}
                        disabled={cronLoading === 'report'}
                        onClick={() => runCron('report')}
                      >
                        {cronLoading === 'report'
                          ? <><i className="fas fa-spinner fa-spin" /> جاري التشغيل...</>
                          : '▶ تشغيل الآن'
                        }
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>📋 سجل التنفيذ</h4>
                      {cronLog.length > 0 && (
                        <button
                          onClick={() => setCronLog([])}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--neutral-500)' }}
                        >
                          مسح السجل
                        </button>
                      )}
                    </div>
                    {cronLog.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--neutral-400)', fontSize: 14 }}>
                        لا يوجد سجل تنفيذ بعد. قم بتشغيل إحدى المهام أعلاه.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {cronLog.map((log, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              padding: '10px 14px', borderRadius: 8, fontSize: 13,
                              background: log.type === 'success' ? '#f0fff4' : '#fff5f5',
                              border: `1px solid ${log.type === 'success' ? '#c6f6d5' : '#fed7d7'}`,
                              color: log.type === 'success' ? '#276749' : '#c53030',
                            }}
                          >
                            <span>{log.text}</span>
                            <span style={{ opacity: .6, fontSize: 12, flexShrink: 0, marginRight: 12 }}>{log.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}