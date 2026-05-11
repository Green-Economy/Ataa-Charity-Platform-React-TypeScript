
// import { useEffect, useState, useCallback } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { useLocation } from 'wouter';
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid,
// } from 'recharts';
// import PageLoader from '../components/ui/Pageloader';
// import '../styles/css/UserDashboard.css';

// /* ─────────────────────────────────────────
//    API CONFIG
// ───────────────────────────────────────── */
// const BASE_URL = 'https://ataa-charity-platform.vercel.app';

// // Helper: get token from wherever AuthContext stores it
// function getToken(): string {
//   // Try localStorage keys common in JWT setups
//   return (
//     localStorage.getItem('accessToken') ||
//     localStorage.getItem('token') ||
//     sessionStorage.getItem('accessToken') ||
//     sessionStorage.getItem('token') ||
//     ''
//   );
// }

// async function apiFetch(path: string, options: RequestInit = {}) {
//   const token = getToken();
//   const res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: token,
//       ...(options.headers || {}),
//     },
//   });
//   if (!res.ok) {
//     const err = await res.json().catch(() => ({}));
//     throw new Error(err.message || `HTTP ${res.status}`);
//   }
//   return res.json();
// }

// /* ─────────────────────────────────────────
//    TYPES
// ───────────────────────────────────────── */
// interface DashboardStats {
//   Total_Donations: number;
//   Pending_Donations: number;
//   Accepted_Donations: number;
//   Rejected_Donations: number;
// }

// interface Donation {
//   _id: string;
//   type: string;
//   size?: string;
//   quantity?: number;
//   description?: string;
//   condition?: string;
//   status: string;
//   createdAt: string;
//   images?: string[];
//   donorName?: string;
// }

// /* ─────────────────────────────────────────
//    STATUS CONFIG
// ───────────────────────────────────────── */
// const STATUS_CFG: Record<string, {
//   label: string; color: string; bg: string; border: string; dot: string;
// }> = {
//   pending:   { label: 'قيد المراجعة', color: '#92400e', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
//   accepted:  { label: 'مقبول',        color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981' },
//   delivered: { label: 'تم التسليم',   color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981' },
//   rejected:  { label: 'مرفوض',        color: '#991b1b', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
// };

// const CHART_COLORS = {
//   pending:  '#f59e0b',
//   accepted: '#10b981',
//   rejected: '#ef4444',
// };

// /* ─────────────────────────────────────────
//    CHART TOOLTIPS
// ───────────────────────────────────────── */
// const PieTooltip = ({ active, payload }: any) => {
//   if (!active || !payload?.length) return null;
//   const { name, value, color } = payload[0].payload;
//   return (
//     <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 10, padding: '7px 13px', fontFamily: 'Tajawal, sans-serif', fontSize: 12.5, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
//       <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, background: color, marginLeft: 5 }} />
//       <strong>{name}</strong>: {value} تبرع
//     </div>
//   );
// };

// const BarTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 10, padding: '7px 13px', fontFamily: 'Tajawal, sans-serif', fontSize: 12.5, boxShadow: '0 4px 16px rgba(0,0,0,.08)' }}>
//       <div style={{ fontWeight: 700, color: '#111', marginBottom: 2 }}>{label}</div>
//       <div style={{ color: '#10a37f' }}>{payload[0].value} تبرع</div>
//     </div>
//   );
// };

// const StackedTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: 10, padding: '10px 14px', fontFamily: 'Tajawal, sans-serif', fontSize: 13, direction: 'rtl', boxShadow: '0 4px 16px rgba(0,0,0,.09)' }}>
//       <div style={{ fontWeight: 800, color: '#111827', marginBottom: 6 }}>{label}</div>
//       {payload.map((p: any) => (
//         <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
//           <span style={{ width: 8, height: 8, borderRadius: 3, background: p.fill, flexShrink: 0 }} />
//           <span style={{ color: '#4b5563' }}>{p.name}:</span>
//           <strong>{p.value}</strong>
//         </div>
//       ))}
//     </div>
//   );
// };

// /* ─────────────────────────────────────────
//    CHART COMPONENTS
// ───────────────────────────────────────── */
// function StatusPieChart({ pending, accepted, rejected }: { pending: number; accepted: number; rejected: number }) {
//   const pieData = [
//     { name: 'قيد المراجعة', value: pending,  color: CHART_COLORS.pending  },
//     { name: 'مقبول',        value: accepted, color: CHART_COLORS.accepted },
//     { name: 'مرفوض',        value: rejected, color: CHART_COLORS.rejected },
//   ].filter(d => d.value > 0);

//   if (!pieData.length) return <div className="ud-chart-empty">لا توجد بيانات بعد</div>;

//   return (
//     <>
//       <ResponsiveContainer width="100%" height={155}>
//         <PieChart>
//           <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={700}>
//             {pieData.map((entry, i) => <Cell key={i} fill={entry.color} strokeWidth={0} />)}
//           </Pie>
//           <Tooltip content={<PieTooltip />} />
//         </PieChart>
//       </ResponsiveContainer>
//       <div className="ud-chart-legend">
//         {pieData.map((d, i) => (
//           <span key={i} className="ud-legend-item">
//             <span className="ud-legend-dot" style={{ background: d.color }} />
//             {d.name}
//           </span>
//         ))}
//       </div>
//     </>
//   );
// }

// function StackedTypeChart({ donations }: { donations: Donation[] }) {
//   if (!donations.length) return <div className="ud-chart-empty">لا توجد بيانات كافية</div>;

//   const map: Record<string, { pending: number; accepted: number; rejected: number }> = {};
//   donations.forEach(d => {
//     const key = d.type?.trim() || 'غير محدد';
//     if (!map[key]) map[key] = { pending: 0, accepted: 0, rejected: 0 };
//     const s = d.status as 'pending' | 'accepted' | 'rejected';
//     if (s in map[key]) map[key][s]++;
//   });

//   const data = Object.entries(map)
//     .map(([name, c]) => ({ name, ...c, total: c.pending + c.accepted + c.rejected }))
//     .sort((a, b) => b.total - a.total)
//     .slice(0, 8)
//     .map(({ total: _t, ...rest }) => rest);

//   return (
//     <>
//       <ResponsiveContainer width="100%" height={190}>
//         <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//           <XAxis dataKey="name" tick={{ fontFamily: 'Tajawal', fontSize: 11, fill: '#b0b0c0' }} axisLine={false} tickLine={false} />
//           <YAxis allowDecimals={false} tick={{ fontFamily: 'Tajawal', fontSize: 11, fill: '#b0b0c0' }} axisLine={false} tickLine={false} />
//           <Tooltip content={<StackedTooltip />} cursor={{ fill: 'rgba(16,163,127,.06)' }} />
//           <Bar dataKey="pending"  name="قيد المراجعة" stackId="s" fill={CHART_COLORS.pending}  maxBarSize={40} />
//           <Bar dataKey="accepted" name="مقبول"         stackId="s" fill={CHART_COLORS.accepted} maxBarSize={40} />
//           <Bar dataKey="rejected" name="مرفوض"         stackId="s" fill={CHART_COLORS.rejected} radius={[6,6,0,0]} maxBarSize={40} />
//         </BarChart>
//       </ResponsiveContainer>
//       <div className="ud-chart-legend" style={{ marginTop: 8 }}>
//         {[
//           { label: 'قيد المراجعة', color: CHART_COLORS.pending  },
//           { label: 'مقبول',        color: CHART_COLORS.accepted },
//           { label: 'مرفوض',        color: CHART_COLORS.rejected },
//         ].map(l => (
//           <span key={l.label} className="ud-legend-item">
//             <span className="ud-legend-dot" style={{ background: l.color }} />
//             {l.label}
//           </span>
//         ))}
//       </div>
//     </>
//   );
// }

// function TimelineChart({ donations }: { donations: Donation[] }) {
//   if (!donations.length) return <div className="ud-chart-empty">لا توجد بيانات كافية</div>;

//   const byMonth: Record<string, number> = {};
//   [...donations]
//     .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
//     .forEach(d => {
//       if (!d.createdAt) return;
//       const key = new Date(d.createdAt).toLocaleDateString('ar-EG', { month: 'short', year: '2-digit' });
//       byMonth[key] = (byMonth[key] || 0) + 1;
//     });

//   const data = Object.entries(byMonth).map(([month, count]) => ({ month, count }));
//   if (data.length < 2) return <div className="ud-chart-empty">بيانات غير كافية للرسم البياني</div>;

//   return (
//     <ResponsiveContainer width="100%" height={190}>
//       <BarChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
//         <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
//         <XAxis dataKey="month" tick={{ fontFamily: 'Tajawal', fontSize: 11, fill: '#b0b0c0' }} axisLine={false} tickLine={false} />
//         <YAxis allowDecimals={false} tick={{ fontFamily: 'Tajawal', fontSize: 11, fill: '#b0b0c0' }} axisLine={false} tickLine={false} />
//         <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(16,163,127,.06)' }} />
//         <Bar dataKey="count" fill="#10a37f" radius={[6,6,0,0]} maxBarSize={40} animationDuration={700} />
//       </BarChart>
//     </ResponsiveContainer>
//   );
// }

// /* ─────────────────────────────────────────
//    MAIN COMPONENT
// ───────────────────────────────────────── */
// type CharityTab = 'stats' | 'donations' | 'requests';

// export default function CharityDashboard() {
//   const { user, isLoading: authLoading } = useAuth();
//   const [, setLocation] = useLocation();

//   const [tab, setTab]                     = useState<CharityTab>('stats');
//   const [stats, setStats]                 = useState<DashboardStats | null>(null);
//   const [donations, setDonations]         = useState<Donation[]>([]);
//   const [requests, setRequests]           = useState<Donation[]>([]);
//   const [loading, setLoading]             = useState(true);
//   const [fetchError, setFetchError]       = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [searchQ, setSearchQ]             = useState('');
//   const [activeStatusFilter, setActiveStatusFilter] = useState<'all'|'pending'|'accepted'|'rejected'>('all');

//   // Automation state
//   const [cronLoading, setCronLoading]     = useState(false);
//   const [cronResult, setCronResult]       = useState<{ success: boolean; message: string } | null>(null);

//   /* ── Fetch All Dashboard Data ── */
//   const fetchAll = useCallback(async () => {
//     setLoading(true);
//     setFetchError(null);
//     try {
//       // الـ API بيستخدم JWT Token مباشرة — مش licenseNumber في الـ URL
//       const [statsRes, donationsRes, requestsRes] = await Promise.allSettled([
//         apiFetch('/dashboard/stats'),
//         apiFetch('/dashboard/donations'),
//         apiFetch('/dashboard/requests'),
//       ]);

//       if (statsRes.status === 'fulfilled') {
//         // Response: { success, stats: { Total_Donations, Pending_Donations, Accepted_Donations, Rejected_Donations } }
//         setStats(statsRes.value.stats ?? null);
//       }
//       if (donationsRes.status === 'fulfilled') {
//         // Response: { success, donations: [...] }
//         const d = donationsRes.value;
//         setDonations(d.donations ?? d.data ?? []);
//       }
//       if (requestsRes.status === 'fulfilled') {
//         // Response: { success, donations: [...] } — same shape, filtered to pending
//         const r = requestsRes.value;
//         // setRequests(r.donations ?? r.data ?? []);
//         setRequests(Array.isArray(r.donations) ? r.donations : Array.isArray(r.data) ? r.data : []);
//       }

//       // إذا كل الـ requests فشلوا
//       const allFailed = [statsRes, donationsRes, requestsRes].every(r => r.status === 'rejected');
//       if (allFailed) {
//         setFetchError('فشل تحميل البيانات. تأكد من تسجيل الدخول.');
//       }
//     } catch (err: any) {
//       setFetchError(err.message || 'فشل تحميل البيانات');
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     if (!authLoading && user) fetchAll();
//   }, [user, authLoading, fetchAll]);

//   /* ── Accept / Reject Action ── */
//   const handleAction = async (donationId: string, status: 'accepted' | 'rejected') => {
//     setActionLoading(donationId + status);
//     try {
//       // PATCH /dashboard/request/:id  —  body: { status }
//       await apiFetch(`/dashboard/request/${donationId}`, {
//         method: 'PATCH',
//         body: JSON.stringify({ status }),
//       });

//       // تحديث الـ state محلياً بدون re-fetch
//       setRequests(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
//       setDonations(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
//       setStats(prev => {
//         if (!prev) return prev;
//         return {
//           ...prev,
//           Pending_Donations:  Math.max(0, prev.Pending_Donations - 1),
//           Accepted_Donations: status === 'accepted' ? prev.Accepted_Donations + 1 : prev.Accepted_Donations,
//           Rejected_Donations: status === 'rejected' ? prev.Rejected_Donations + 1 : prev.Rejected_Donations,
//         };
//       });
//     } catch (err: any) {
//      setFetchError('حدث خطأ أثناء تحديث الحالة: ' + (err.message || ''));
// setTimeout(() => setFetchError(null), 4000);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   /* ── Automation: Donation Reminder ── */
//   const handleDonationReminder = async () => {
//     setCronLoading(true);
//     setCronResult(null);
//     try {
//       // GET /cron/donationReminder — يرسل تذكير للجمعيات بالتبرعات المعلقة
//       const res = await apiFetch('/cron/donationReminder');
//       setCronResult({
//         success: true,
//         message: res.message || 'تم إرسال التذكير بنجاح ✅',
//       });
//     } catch (err: any) {
//       setCronResult({
//         success: false,
//         message: err.message || 'فشل إرسال التذكير',
//       });
//     } finally {
//       setCronLoading(false);
//       // مسح الرسالة بعد 5 ثواني
//       setTimeout(() => setCronResult(null), 5000);
//     }
//   };

//   /* ── Helpers ── */
//   const today = new Date().toLocaleDateString('ar-EG', {
//     weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
//   });

//   const charityInitial = user?.userName?.[0]?.toUpperCase() ?? 'ج';
//   const charityName    = user?.userName || 'الجمعية';
//   const pendingCount   = requests.filter(r => r.status === 'pending').length;

//   /* ── Filtered Donations ── */
//   const filteredDonations = donations.filter(d => {
//     const matchStatus = activeStatusFilter === 'all' || d.status === activeStatusFilter;
//     const q           = searchQ.trim();
//     const matchSearch = !q || (d.type && d.type.includes(q));
//     return matchStatus && matchSearch;
//   });

//   /* ── Tab Definitions ── */
//   const tabDefs: { id: CharityTab; label: string; count?: number }[] = [
//     { id: 'stats',     label: 'الإحصائيات'                          },
//     { id: 'donations', label: 'التبرعات',        count: donations.length },
//     { id: 'requests',  label: 'الطلبات المعلقة', count: pendingCount     },
//   ];

//   if (authLoading || loading) return <PageLoader text="جاري تحميل بيانات الجمعية…" />;
//   if (!user) return null;

//   /* ─────────────────────────────────────────
//      RENDER
//   ───────────────────────────────────────── */
//   return (
//     <div className="ud-root">
//       <div className="ud-page">

//         {/* ━━━━ Topbar ━━━━ */}
//         <header className="ud-topbar">
//           <div className="ud-topbar-left">
//             <div className="ud-brand">
//               <div className="ud-brand-ico"><i className="ti ti-building-community" /></div>
//               <span className="ud-brand-name">لوحة تحكم الجمعية</span>
//             </div>
//             <button
//               className="ud-page-badge"
//               onClick={() => setLocation('/ai-chat')}
//               style={{ cursor: 'pointer', border: 'none', background: 'var(--br-pale)' }}
//               type="button"
//             >
//               <span className="ud-badge-dot" /> مساعد عطاء
//             </button>
//           </div>
//           <div className="ud-topbar-right">
//             <button
//               className="ud-topbar-av"
//               title={`${charityName} — الإعدادات`}
//               onClick={() => setLocation('/settings')}
//               type="button"
//               style={{ border: '2px solid var(--bd2)', background: 'var(--t1)' }}
//             >
//               {charityInitial}
//             </button>
//           </div>
//         </header>

//         {/* ━━━━ Hero ━━━━ */}
//         <div className="ud-hero">
//           <div className="ud-hero-inner">
//             <div className="ud-hero-left">
//               <div className="ud-hero-av">{charityInitial}</div>
//               <div>
//                 <div className="ud-hero-name">أهلاً، {charityName} 🏛️</div>
//                 <div className="ud-hero-sub">إدارة التبرعات والطلبات الواردة</div>
//               </div>
//             </div>
//             <div className="ud-hero-right">
//               <div className="ud-date-pill"><i className="ti ti-calendar" /> {today}</div>
//             </div>
//           </div>
//         </div>

//         {/* ━━━━ Main Content ━━━━ */}
//         <div className="ud-content">

//           {/* ── Main Tabs ── */}
//           <div className="ud-card" style={{ marginBottom: 14, overflow: 'hidden' }}>
//             <div className="ud-tabs" role="tablist">
//               {tabDefs.map(t => (
//                 <button
//                   key={t.id}
//                   className={`ud-tab${tab === t.id ? ' active' : ''}`}
//                   onClick={() => setTab(t.id)}
//                   role="tab"
//                   aria-selected={tab === t.id}
//                   type="button"
//                 >
//                   {t.label}
//                   {t.count !== undefined && t.count > 0 && (
//                     <span style={{ marginRight: 4, opacity: .6, fontSize: 11.5 }}>({t.count})</span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {fetchError ? (
//             <div className="ud-card">
//               <div className="ud-empty">
//                 <div className="ud-empty-ico"><i className="ti ti-alert-circle" /></div>
//                 <p className="ud-empty-title">{fetchError}</p>
//                 <button className="ud-empty-btn" onClick={fetchAll} type="button">
//                   <i className="ti ti-refresh" /> إعادة المحاولة
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <>
//               {/* ══════════ STATS TAB ══════════ */}
//               {tab === 'stats' && (
//                 <>
//                   {/* Row 1: Stats + Pie */}
//                   <div className="ud-top-row" role="region" aria-label="إحصائيات التبرعات">
//                     <div className="ud-stats">
//                       {([
//                         { label: 'إجمالي التبرعات', val: stats?.Total_Donations    ?? 0, icon: 'ti-packages',     color: 'var(--br)'  },
//                         { label: 'قيد المراجعة',    val: stats?.Pending_Donations   ?? 0, icon: 'ti-clock',        color: '#f59e0b'    },
//                         { label: 'مقبولة',           val: stats?.Accepted_Donations  ?? 0, icon: 'ti-circle-check', color: '#10b981'    },
//                         { label: 'مرفوضة',           val: stats?.Rejected_Donations  ?? 0, icon: 'ti-circle-x',    color: '#ef4444'    },
//                       ]).map(s => (
//                         <div key={s.label} className="ud-stat" style={{ ['--ud-stat-color' as any]: s.color }}>
//                           <div className="ud-stat-top">
//                             <div className="ud-stat-ico" style={{ color: s.color }}>
//                               <i className={`ti ${s.icon}`} />
//                             </div>
//                           </div>
//                           <div className="ud-stat-num" style={{ color: s.color }}>{s.val}</div>
//                           <div className="ud-stat-label">{s.label}</div>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="ud-pie-card">
//                       <div className="ud-card-header">
//                         <span className="ud-card-title">
//                           <i className="ti ti-chart-pie" style={{ color: 'var(--br)' }} /> توزيع الحالات
//                         </span>
//                       </div>
//                       <div className="ud-pie-body">
//                         <StatusPieChart
//                           pending={stats?.Pending_Donations  ?? 0}
//                           accepted={stats?.Accepted_Donations ?? 0}
//                           rejected={stats?.Rejected_Donations ?? 0}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Row 2: Stacked Bar + Quick Actions */}
//                   <div className="ud-mid-row">
//                     <div className="ud-bar-card">
//                       <div className="ud-card-header">
//                         <span className="ud-card-title">
//                           <i className="ti ti-chart-bar" style={{ color: 'var(--br)' }} /> أنواع التبرعات حسب الحالة
//                         </span>
//                       </div>
//                       <div className="ud-chart-body">
//                         <StackedTypeChart donations={donations} />
//                       </div>
//                     </div>

//                     <div className="ud-right-panel">
//                       {/* Notification badge */}
//                       <div className="ud-greet" role="note">
//                         <div className="ud-greet-bell" aria-hidden="true">
//                           🔔
//                           <div className="ud-greet-notif">{pendingCount > 9 ? '9+' : pendingCount || 0}</div>
//                         </div>
//                         <div>
//                           <div className="ud-greet-lbl">طلبات تنتظر مراجعتك</div>
//                           <div className="ud-greet-msg">
//                             لديك <span>{pendingCount} طلب</span> تبرع جديد في انتظار القبول أو الرفض.
//                           </div>
//                         </div>
//                       </div>

//                       {/* Quick actions — جميعها أزرار تعمل */}
//                       <nav className="ud-quick" aria-label="الإجراءات السريعة">
//                         <button
//                           className="ud-quick-btn primary"
//                           type="button"
//                           onClick={() => setLocation('/ai-chat')}
//                         >
//                           <i className="ti ti-robot" /> مساعد عطاء
//                         </button>
//                         <button
//                           className="ud-quick-btn"
//                           type="button"
//                           onClick={() => setTab('requests')}
//                         >
//                           <i className="ti ti-clock-exclamation" /> الطلبات المعلقة
//                           {pendingCount > 0 && (
//                             <span style={{ marginRight: 4, opacity: .7, fontSize: 11 }}>({pendingCount})</span>
//                           )}
//                         </button>
//                         <button
//                           className="ud-quick-btn"
//                           type="button"
//                           onClick={() => setTab('donations')}
//                         >
//                           <i className="ti ti-packages" /> كل التبرعات
//                         </button>
//                         <button
//                           className="ud-quick-btn"
//                           type="button"
//                           onClick={fetchAll}
//                         >
//                           <i className="ti ti-refresh" /> تحديث البيانات
//                         </button>
//                         <button
//                           className="ud-quick-btn"
//                           type="button"
//                           onClick={() => setLocation('/settings')}
//                         >
//                           <i className="ti ti-settings" /> الإعدادات
//                         </button>
//                       </nav>
//                     </div>
//                   </div>

//                   {/* Row 3: Timeline */}
//                   {donations.length >= 2 && (
//                     <div className="ud-bar-card" style={{ marginBottom: 14 }}>
//                       <div className="ud-card-header">
//                         <span className="ud-card-title">
//                           <i className="ti ti-chart-area" style={{ color: 'var(--br)' }} /> التبرعات عبر الزمن
//                         </span>
//                       </div>
//                       <div className="ud-chart-body">
//                         <TimelineChart donations={donations} />
//                       </div>
//                     </div>
//                   )}

//                   {/* Row 4: Automation — فعّال بالكامل */}
//                   <div className="ud-card">
//                     <div className="ud-card-header">
//                       <span className="ud-card-title">
//                         <i className="ti ti-settings-automation" style={{ color: 'var(--br)' }} /> مركز الأتمتة
//                       </span>
//                       <span className="ud-card-count">جدولة المهام التلقائية</span>
//                     </div>
//                     <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>

//                       {/* Donation Reminder — زر يعمل */}
//                       <div style={{
//                         display: 'flex', alignItems: 'center', gap: 14,
//                         padding: '14px 16px', borderRadius: 12,
//                         border: '1px solid var(--bd)', background: 'var(--bg-sb)',
//                       }}>
//                         <div style={{
//                           width: 44, height: 44, borderRadius: 11,
//                           background: 'var(--br-pale)', border: '1px solid var(--br-lt)',
//                           display: 'flex', alignItems: 'center', justifyContent: 'center',
//                           flexShrink: 0,
//                         }}>
//                           <i className="ti ti-bell-ringing" style={{ fontSize: 20, color: 'var(--br)' }} />
//                         </div>
//                         <div style={{ flex: 1 }}>
//                           <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 3 }}>
//                             تذكير التبرعات التلقائي
//                           </div>
//                           <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.5 }}>
//                             يرسل تذكيراً للجمعيات بالتبرعات المعلقة — يعمل عبر{' '}
//                             <code style={{ background: 'var(--bg-user)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>
//                               GET /cron/donationReminder
//                             </code>
//                           </div>
//                           {cronResult && (
//                             <div className={`ud-alert ${cronResult.success ? 'ud-alert-ok' : 'ud-alert-err'}`} style={{ marginTop: 8, marginBottom: 0 }}>
//                               <i className={`ti ${cronResult.success ? 'ti-circle-check' : 'ti-alert-circle'}`} />
//                               {cronResult.message}
//                             </div>
//                           )}
//                         </div>
//                         <button
//                           type="button"
//                           disabled={cronLoading}
//                           onClick={handleDonationReminder}
//                           style={{
//                             display: 'inline-flex', alignItems: 'center', gap: 6,
//                             padding: '8px 16px', borderRadius: 999,
//                             background: cronLoading ? 'var(--br-pale)' : 'var(--br)',
//                             border: '1px solid var(--br-lt)',
//                             fontSize: 12.5, fontWeight: 700,
//                             color: cronLoading ? 'var(--br)' : 'white',
//                             cursor: cronLoading ? 'not-allowed' : 'pointer',
//                             fontFamily: 'Tajawal, sans-serif',
//                             transition: 'all .18s',
//                             whiteSpace: 'nowrap',
//                           }}
//                         >
//                           {cronLoading ? (
//                             <>
//                               <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--br)', borderTopColor: 'transparent', animation: 'ud-spin .7s linear infinite', display: 'inline-block' }} />
//                               جارٍ الإرسال…
//                             </>
//                           ) : (
//                             <>
//                               <i className="ti ti-send" />
//                               تشغيل
//                             </>
//                           )}
//                         </button>
//                       </div>

//                       {/* تذكير: الـ schedule التلقائي */}
//                       <div style={{
//                         padding: '10px 14px', borderRadius: 10,
//                         background: '#fffbeb', border: '1px solid #fde68a',
//                         fontSize: 12.5, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8,
//                       }}>
//                         <i className="ti ti-info-circle" style={{ fontSize: 15, flexShrink: 0 }} />
//                         هذا الـ endpoint يُشغَّل تلقائياً يومياً الساعة 11:00 ص عبر Vercel Cron. يمكنك تشغيله يدوياً من هنا عند الحاجة.
//                       </div>
//                     </div>
//                   </div>

//                   {/* Row 5: Recent donations */}
//                   {donations.length > 0 && (
//                     <div className="ud-card">
//                       <div className="ud-card-header">
//                         <span className="ud-card-title">
//                           <i className="ti ti-clock-record" style={{ color: 'var(--br)' }} /> آخر التبرعات
//                         </span>
//                         <button
//                           className="ud-empty-btn"
//                           style={{ padding: '6px 14px', fontSize: 12.5 }}
//                           onClick={() => setTab('donations')}
//                           type="button"
//                         >
//                           <i className="ti ti-eye" /> عرض الكل
//                         </button>
//                       </div>
//                       <div className="ud-tbl-wrap">
//                         <table className="ud-tbl">
//                           <thead>
//                             <tr>
//                         <th>نوع التبرع</th>
//                         <th>الكمية</th>
//                         <th>المقاس</th>
//                         <th>الحالة</th>
//                         <th>إجراء</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {donations.slice(0, 5).map(d => {
//                               const sc = STATUS_CFG[d.status] ?? STATUS_CFG['pending'];
//                               return (
//                                 <tr key={d._id}>
//                                   <td>
//                                     <div className="ud-type-cell">
//                                       <div className="ud-type-ico"><i className="ti ti-shirt" /></div>
//                                       <div>
//                                         <div className="ud-type-name">{d.type}</div>
//                                         {d.size && <div className="ud-type-size">مقاس: {d.size}</div>}
//                                       </div>
//                                     </div>
//                                   </td>
//                                   <td><span className="ud-qty">{d.quantity ?? '—'} قطعة</span></td>
//                                   <td>
//                                     <span className="ud-status" style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
//                                       <span className="ud-status-dot" style={{ background: sc.dot }} />
//                                       {sc.label}
//                                     </span>
//                                   </td>
//                                   <td style={{ color: 'var(--t3)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
//                                     {d.createdAt ? new Date(d.createdAt).toLocaleDateString('ar-EG') : '—'}
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}

//               {/* ══════════ DONATIONS TAB ══════════ */}
//               {tab === 'donations' && (
//                 <div className="ud-card" role="region" aria-label="سجل التبرعات">
//                   <div className="ud-card-header">
//                     <div>
//                       <span className="ud-card-title">
//                         <i className="ti ti-clipboard-list" style={{ color: 'var(--br)' }} /> كل التبرعات
//                       </span>
//                       <span className="ud-card-count"> ({filteredDonations.length} نتيجة)</span>
//                     </div>
//                     <div className="ud-search" role="search">
//                       <i className="ti ti-search ud-search-ico" />
//                       <input
//                         placeholder="ابحث بنوع التبرع…"
//                         value={searchQ}
//                         onChange={e => setSearchQ(e.target.value)}
//                         aria-label="بحث في التبرعات"
//                       />
//                     </div>
//                   </div>

//                   {/* Status filter tabs */}
//                   <div className="ud-tabs" role="tablist">
//                     {([
//                       ['all',      'الكل',         donations.length],
//                       ['pending',  'قيد المراجعة', donations.filter(d => d.status === 'pending').length],
//                       ['accepted', 'مقبول',        donations.filter(d => d.status === 'accepted').length],
//                       ['rejected', 'مرفوض',        donations.filter(d => d.status === 'rejected').length],
//                     ] as const).map(([key, label, count]) => (
//                       <button
//                         key={key}
//                         className={`ud-tab${activeStatusFilter === key ? ' active' : ''}`}
//                         onClick={() => setActiveStatusFilter(key)}
//                         role="tab"
//                         aria-selected={activeStatusFilter === key}
//                         type="button"
//                       >
//                         {label}
//                         {(count as number) > 0 && (
//                           <span style={{ marginRight: 4, opacity: .6, fontSize: 11 }}>({count})</span>
//                         )}
//                       </button>
//                     ))}
//                   </div>

//                   {filteredDonations.length === 0 ? (
//                     <div className="ud-empty">
//                       <div className="ud-empty-ico"><i className="ti ti-inbox" /></div>
//                       <p className="ud-empty-title">لا توجد تبرعات في هذه الحالة</p>
//                     </div>
//                   ) : (
//                     <>
//                       <div className="ud-tbl-wrap">
//                         <table className="ud-tbl">
//                           <thead>
//                             <tr>
                              
//                               <th>نوع التبرع</th>
//                               <th>الكمية</th>
//                               <th>المقاس</th>
//                               <th>الحالة</th>
//                               <th>الوصف</th>
//                               <th>التاريخ</th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {filteredDonations.map(d => {
//                               const sc = STATUS_CFG[d.status] ?? STATUS_CFG['pending'];
//                               return (
//                                 <tr key={d._id}>
//                                   <td>
//                                     <div className="ud-type-cell">
//                                       <div className="ud-type-ico"><i className="ti ti-shirt" /></div>
//                                       <div className="ud-type-name">{d.type}</div>
//                                     </div>
//                                   </td>
//                                   <td><span className="ud-qty">{d.quantity ?? '—'} قطعة</span></td>
//                                   <td style={{ color: 'var(--t2)', fontSize: 13, fontWeight: 600 }}>{d.size || '—'}</td>
//                                   <td>
//                                     <span className="ud-status" style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
//                                       <span className="ud-status-dot" style={{ background: sc.dot }} />
//                                       {sc.label}
//                                     </span>
//                                   </td>
//                                   <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--t3)', fontSize: 12 }}>
//                                     {d.description || '—'}
//                                   </td>
//                                   <td style={{ color: 'var(--t3)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
//                                     {d.createdAt ? new Date(d.createdAt).toLocaleDateString('ar-EG') : '—'}
//                                   </td>
//                                 </tr>
//                               );
//                             })}
//                           </tbody>
//                         </table>
//                       </div>
//                       <div className="ud-card-footer">
//                         <span className="ud-result-count">{filteredDonations.length} تبرع</span>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               )}

//               {/* ══════════ REQUESTS TAB ══════════ */}
//               {tab === 'requests' && (
//                 <div className="ud-card" role="region" aria-label="الطلبات الواردة">
//                   <div className="ud-card-header">
//                     <span className="ud-card-title">
//                       <i className="ti ti-clock-exclamation" style={{ color: 'var(--br)' }} /> الطلبات الواردة
//                     </span>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                       <span className="ud-card-count">{requests.length} طلب — {pendingCount} معلق</span>
//                       <button className="ud-empty-btn" style={{ padding: '5px 12px', fontSize: 12 }} onClick={fetchAll} type="button">
//                         <i className="ti ti-refresh" /> تحديث
//                       </button>
//                     </div>
//                   </div>

//                   {requests.length === 0 ? (
//                     <div className="ud-empty">
//                       <div className="ud-empty-ico"><i className="ti ti-inbox" /></div>
//                       <p className="ud-empty-title">لا توجد طلبات بعد</p>
//                     </div>
//                   ) : (
//                     <div className="ud-tbl-wrap">
//                       <table className="ud-tbl">
//                         <thead>
//                           <tr>
//                             <th>نوع التبرع</th>
//                             <th>الكمية</th>
//                             <th>المقاس</th>
//                             <th>الحالة</th>
//                             <th>إجراء</th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {requests.map(d => {
//                             const sc        = STATUS_CFG[d.status] ?? STATUS_CFG['pending'];
//                             const isPending = d.status === 'pending';
//                             const isAccLoading = actionLoading === d._id + 'accepted';
//                             const isRejLoading = actionLoading === d._id + 'rejected';
//                             const anyLoading   = !!actionLoading;

//                             return (
//                               <tr key={d._id}>
//                                 <td>
//                                   <div className="ud-type-cell">
//                                     <div className="ud-type-ico"><i className="ti ti-shirt" /></div>
//                                     <div>
//                                       <div className="ud-type-name">{d.type}</div>
//                                       {d.size && <div className="ud-type-size">مقاس: {d.size}</div>}
//                                     </div>
//                                   </div>
//                                 </td>
//                                 <td><span className="ud-qty">{d.quantity ?? '—'} قطعة</span></td>
//                                 <td style={{ color: 'var(--t2)', fontSize: 13 }}>{d.size || '—'}</td>
//                                 <td>
//                                   <span className="ud-status" style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
//                                     <span className="ud-status-dot" style={{ background: sc.dot }} />
//                                     {sc.label}
//                                   </span>
//                                 </td>
//                                 <td>
//                                   {isPending ? (
//                                     <div style={{ display: 'flex', gap: 6 }}>
//                                       {/* Accept */}
//                                       <button
//                                         type="button"
//                                         disabled={anyLoading}
//                                         onClick={() => handleAction(d._id, 'accepted')}
//                                         style={{
//                                           display: 'flex', alignItems: 'center', gap: 4,
//                                           padding: '5px 12px', borderRadius: 7,
//                                           background: '#ecfdf5', color: '#065f46',
//                                           border: '1px solid #a7f3d0',
//                                           fontFamily: 'Tajawal, sans-serif', fontSize: 12, fontWeight: 700,
//                                           cursor: anyLoading ? 'not-allowed' : 'pointer',
//                                           opacity: anyLoading ? .45 : 1,
//                                           transition: 'all .15s', whiteSpace: 'nowrap',
//                                         }}
//                                       >
//                                         {isAccLoading
//                                           ? <><span style={{ width: 10, height: 10, border: '2px solid #065f46', borderTopColor: 'transparent', borderRadius: '50%', animation: 'ud-spin .7s linear infinite', display: 'inline-block' }} /> جاري…</>
//                                           : <><i className="ti ti-check" style={{ fontSize: 13 }} /> قبول</>
//                                         }
//                                       </button>

//                                       {/* Reject */}
//                                       <button
//                                         type="button"
//                                         disabled={anyLoading}
//                                         onClick={() => handleAction(d._id, 'rejected')}
//                                         style={{
//                                           display: 'flex', alignItems: 'center', gap: 4,
//                                           padding: '5px 12px', borderRadius: 7,
//                                           background: '#fef2f2', color: '#991b1b',
//                                           border: '1px solid #fca5a5',
//                                           fontFamily: 'Tajawal, sans-serif', fontSize: 12, fontWeight: 700,
//                                           cursor: anyLoading ? 'not-allowed' : 'pointer',
//                                           opacity: anyLoading ? .45 : 1,
//                                           transition: 'all .15s', whiteSpace: 'nowrap',
//                                         }}
//                                       >
//                                         {isRejLoading
//                                           ? <><span style={{ width: 10, height: 10, border: '2px solid #991b1b', borderTopColor: 'transparent', borderRadius: '50%', animation: 'ud-spin .7s linear infinite', display: 'inline-block' }} /> جاري…</>
//                                           : <><i className="ti ti-x" style={{ fontSize: 13 }} /> رفض</>
//                                         }
//                                       </button>
//                                     </div>
//                                   ) : (
//                                     <span style={{ color: 'var(--t3)', fontSize: 12 }}>—</span>
//                                   )}
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </>
//           )}

//         </div>{/* end ud-content */}
//       </div>{/* end ud-page */}
//     </div>
//   );
// }







