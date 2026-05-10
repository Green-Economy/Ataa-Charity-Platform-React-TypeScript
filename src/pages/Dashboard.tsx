import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardApi, donorApi, DashboardStats, Donation } from '../services';
import { statusLabel } from '../lib/utils';
import { Link } from 'wouter';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

/* ─────────────────────────────────────────
   SHARED CSS
───────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');

.db-root {
  font-family: 'Tajawal', sans-serif;
  direction: rtl;
  min-height: 100vh;
  background: #f7f8fa;
  color: #1a202c;
}

.db-topbar {
  background: linear-gradient(135deg, #0f6b52 0%, #0a4d3b 55%, #063629 100%);
  padding: 0 24px;
  position: sticky; top: 0; z-index: 100;
  box-shadow: 0 2px 12px rgba(0,0,0,.15);
}
.db-topbar-inner {
  max-width: 1100px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 0; gap: 12px;
}
.db-topbar-left { display: flex; align-items: center; gap: 14px; }
.db-topbar-icon {
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.35rem; flex-shrink: 0;
}
.db-topbar-left h1 { color: #fff; font-size: 1.1rem; font-weight: 800; margin: 0 0 2px; line-height: 1.2; }
.db-topbar-left p  { color: rgba(255,255,255,.55); font-size: .8rem; margin: 0; }
.db-topbar-date    { color: rgba(255,255,255,.4); font-size: .78rem; font-weight: 500; white-space: nowrap; flex-shrink: 0; }

.db-body { max-width: 1100px; margin: 0 auto; padding: 24px 20px 48px; }

.db-tabs {
  display: flex; gap: 4px;
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 5px;
  margin-bottom: 22px;
  overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.db-tabs::-webkit-scrollbar { display: none; }
.db-tab {
  flex: 1; min-width: max-content;
  display: flex; align-items: center; justify-content: center; gap: 7px;
  padding: 9px 18px; border-radius: 8px; border: none;
  font-family: 'Tajawal', sans-serif; font-size: .88rem; font-weight: 700;
  color: #718096; background: transparent; cursor: pointer;
  transition: background .18s, color .18s; white-space: nowrap;
}
.db-tab:hover:not(.active) { background: #f7f8fa; color: #2d3748; }
.db-tab.active { background: #e8f5f0; color: #0a4d3b; }
.db-tab-badge {
  background: #0f6b52; color: #fff;
  font-size: .68rem; font-weight: 800;
  padding: 1px 7px; border-radius: 20px; min-width: 20px; text-align: center;
}

.db-stats {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
  gap: 14px; margin-bottom: 24px;
}
.db-stat-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
  padding: 18px 16px; position: relative; overflow: hidden;
  transition: transform .18s, box-shadow .18s;
}
.db-stat-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,.07); }
.db-stat-card::before {
  content: ''; position: absolute; top: 0; right: 0; left: 0; height: 3px;
  background: var(--accent); border-radius: 12px 12px 0 0;
}
.db-stat-ico { font-size: 1.4rem; margin-bottom: 10px; display: block; }
.db-stat-val { font-size: 1.8rem; font-weight: 900; color: #1a202c; line-height: 1; margin-bottom: 5px; }
.db-stat-lbl { font-size: .78rem; font-weight: 600; color: #718096; }

.db-table-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
.db-table-head {
  padding: 14px 20px; border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; justify-content: space-between;
}
.db-table-title { font-size: .9rem; font-weight: 800; color: #2d3748; }
.db-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.db-table-scroll::-webkit-scrollbar { height: 3px; }
.db-table-scroll::-webkit-scrollbar-thumb { background: #c8e6dc; border-radius: 3px; }

table { width: 100%; border-collapse: collapse; font-size: .84rem; }
thead th {
  padding: 11px 16px; text-align: right;
  font-weight: 700; font-size: .78rem; letter-spacing: .04em;
  color: #718096; background: #f8fafc;
  border-bottom: 1px solid #e2e8f0; white-space: nowrap;
}
tbody td { padding: 12px 16px; border-bottom: 1px solid #f0f4f8; color: #2d3748; vertical-align: middle; }
tbody tr:last-child td { border-bottom: none; }
tbody tr:hover td { background: #f8fafc; }

.sb { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: .75rem; font-weight: 700; white-space: nowrap; }
.sb-pending   { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
.sb-accepted  { background: #f0fff8; color: #1a6645; border: 1px solid #9ae6c0; }
.sb-rejected  { background: #fff5f5; color: #c53030; border: 1px solid #fed7d7; }
.sb-delivered { background: #ebf8ff; color: #1a5276; border: 1px solid #bee3f8; }
.sb-default   { background: #f7f8fa; color: #718096; border: 1px solid #e2e8f0; }

.db-act { display: flex; gap: 6px; }
.db-btn-accept, .db-btn-reject {
  padding: 5px 13px; border-radius: 6px; border: none;
  font-family: 'Tajawal', sans-serif; font-size: .8rem; font-weight: 700;
  cursor: pointer; transition: background .15s; white-space: nowrap;
}
.db-btn-accept:disabled, .db-btn-reject:disabled { opacity: .5; cursor: not-allowed; }
.db-btn-accept { background: #e8f5f0; color: #0a4d3b; }
.db-btn-accept:hover:not(:disabled) { background: #c8e6dc; }
.db-btn-reject { background: #fff5f5; color: #c53030; }
.db-btn-reject:hover:not(:disabled) { background: #fed7d7; }

.db-cta {
  display: inline-flex; align-items: center; gap: 8px;
  background: linear-gradient(135deg, #0f6b52, #0a4d3b);
  color: #fff; border: none; border-radius: 10px;
  font-family: 'Tajawal', sans-serif; font-size: .88rem; font-weight: 800;
  padding: 10px 20px; cursor: pointer;
  box-shadow: 0 3px 12px rgba(15,107,82,.28);
  transition: transform .18s, box-shadow .18s; text-decoration: none;
}
.db-cta:hover { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(15,107,82,.38); }
.db-cta-sm { padding: 7px 14px; font-size: .82rem; }

.db-empty { text-align: center; padding: 52px 20px; color: #a0aec0; font-size: .9rem; font-weight: 600; }
.db-empty-ico { font-size: 2.5rem; margin-bottom: 10px; }

.db-spinner { display: flex; align-items: center; justify-content: center; padding: 60px; }
.db-spinner-ring {
  width: 36px; height: 36px;
  border: 3px solid #c8e6dc; border-top-color: #0f6b52;
  border-radius: 50%; animation: db-spin .7s linear infinite;
}
@keyframes db-spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .db-topbar { padding: 0 14px; }
  .db-topbar-date { display: none; }
  .db-body { padding: 16px 12px 40px; }
  .db-stats { grid-template-columns: repeat(2, 1fr); }
  .db-tab { padding: 8px 12px; font-size: .82rem; }
  thead th, tbody td { padding: 10px 12px; }
}
@media (max-width: 400px) {
  .db-stat-val { font-size: 1.5rem; }
}
`;

/* ─────────────────────────────────────────
   CHART HELPERS
───────────────────────────────────────── */
const CHART_COLORS = {
  pending:  '#f59e0b',
  accepted: '#10b981',
  rejected: '#ef4444',
  total:    '#0f6b52',
};

const PIE_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899'];

const CustomTooltipStyle = {
  background: '#fff',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '8px 14px',
  fontSize: 13,
  fontFamily: 'Tajawal, sans-serif',
  direction: 'rtl' as const,
  boxShadow: '0 4px 12px rgba(0,0,0,.08)',
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: '18px 20px', overflow: 'hidden',
    }}>
      <div style={{ fontSize: '.88rem', fontWeight: 800, color: '#2d3748', marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function StatusDonutChart({ pending, accepted, rejected }: { pending: number; accepted: number; rejected: number }) {
  const total = pending + accepted + rejected;
  if (total === 0) return null;
  const data = [
    { name: 'قيد الانتظار', value: pending,  color: CHART_COLORS.pending },
    { name: 'مقبولة',       value: accepted, color: CHART_COLORS.accepted },
    { name: 'مرفوضة',       value: rejected, color: CHART_COLORS.rejected },
  ].filter(d => d.value > 0);
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
          dataKey="value" nameKey="name" paddingAngle={3}>
          {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
        </Pie>
        <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [v, 'عدد']} />
        <Legend iconType="circle" iconSize={10}
          formatter={(v: string) => <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function TypeBarChart({ donations }: { donations: Donation[] }) {
  if (!donations.length) return null;
  const byType: Record<string, number> = {};
  donations.forEach(d => {
    const key = d.type || 'غير محدد';
    byType[key] = (byType[key] || 0) + 1;
  });
  const data = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([type, count]) => ({ type, count }));
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
        <XAxis dataKey="type" tick={{ fontSize: 11, fontFamily: 'Tajawal, sans-serif' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [v, 'عدد']} />
        <Bar dataKey="count" name="العدد" radius={[6, 6, 0, 0]}>
          {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function TimelineBarChart({ donations }: { donations: Donation[] }) {
  if (!donations.length) return null;
  const byMonth: Record<string, number> = {};
  [...donations]
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .forEach(d => {
      if (!d.createdAt) return;
      const key = new Date(d.createdAt).toLocaleDateString('ar-EG', { month: 'short', year: '2-digit' });
      byMonth[key] = (byMonth[key] || 0) + 1;
    });
  const data = Object.entries(byMonth).map(([month, count]) => ({ month, count }));
  if (data.length < 2) return null;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f4f8" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: 'Tajawal, sans-serif' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
        <Tooltip contentStyle={CustomTooltipStyle} formatter={(v: number) => [v, 'تبرع']} />
        <Bar dataKey="count" name="التبرعات" fill={CHART_COLORS.total} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ─────────────────────────────────────────
   DONOR DASHBOARD
───────────────────────────────────────── */
type DonorTab = 'overview' | 'donations';

function DonorDashboard({ user }: { user: any }) {
  const [tab, setTab]             = useState<DonorTab>('overview');
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    donorApi.getMyDonations()
      .then(d => setDonations(d.donations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const counts = {
    total:     donations.length,
    pending:   donations.filter(d => d.status === 'pending').length,
    accepted:  donations.filter(d => d.status === 'accepted').length,
    // delivered: donations.filter(d => d.status === 'delivered').length,
  };

  const statCards = [
    { label: 'إجمالي تبرعاتي', val: counts.total,     icon: '📦', accent: '#0f6b52' },
    { label: 'قيد المراجعة',   val: counts.pending,   icon: '⏳', accent: '#c9a84c' },
    { label: 'مقبولة',         val: counts.accepted,  icon: '✅', accent: '#38a169' },
  ];

  const tabDefs: { id: DonorTab; label: string; icon: string; count?: number }[] = [
    { id: 'overview',  label: 'نظرة عامة', icon: '📊' },
    { id: 'donations', label: 'تبرعاتي',   icon: '📦', count: counts.total },
  ];

  const DonationTable = ({ rows }: { rows: Donation[] }) => (
    <div className="db-table-scroll">
      <table>
        <thead>
          <tr>
            <th>الجمعية</th><th>النوع</th><th>المقاس</th>
            <th>الكمية</th><th>الحالة</th><th>التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(d => {
            const { label, cls } = statusLabel(d.status);
            return (
              <tr key={d._id}>
                <td style={{ fontWeight: 700 }}>{(d as any).charityName || '—'}</td>
                <td>{d.type}</td>
                <td>{d.size}</td>
                <td>{d.quantity}</td>
                <td><span className={`sb sb-${cls}`}>{label}</span></td>
                <td style={{ color: '#718096' }}>
                  {d.createdAt ? new Date(d.createdAt).toLocaleDateString('ar-EG') : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="db-root">
      <div className="db-topbar">
        <div className="db-topbar-inner">
          <div className="db-topbar-left">
            <div className="db-topbar-icon">🤝</div>
            <div>
              <h1>حساب المتبرع</h1>
              <p>أهلاً، {user.userName} — شكراً لتبرعاتك ❤️</p>
            </div>
          </div>
          <div className="db-topbar-date">{today}</div>
        </div>
      </div>

      <div className="db-body">
        <div className="db-tabs">
          {tabDefs.map(t => (
            <button key={t.id} className={`db-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
              {t.count !== undefined && t.count > 0 && <span className="db-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="db-spinner"><div className="db-spinner-ring" /></div>
        ) : (
          <>
            {tab === 'overview' && (
              <>
                <div className="db-stats">
                  {statCards.map(s => (
                    <div key={s.label} className="db-stat-card" style={{ '--accent': s.accent } as React.CSSProperties}>
                      <span className="db-stat-ico">{s.icon}</span>
                      <div className="db-stat-val">{s.val}</div>
                      <div className="db-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                {donations.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                    <ChartCard title="📊 توزيع التبرعات حسب الحالة">
                      <StatusDonutChart
                        pending={counts.pending}
                        accepted={counts.accepted}
                        rejected={donations.filter(d => d.status === 'rejected').length}
                      />
                    </ChartCard>
                    <ChartCard title="📦 التبرعات حسب النوع">
                      <TypeBarChart donations={donations} />
                    </ChartCard>
                    {donations.length >= 2 && (
                      <ChartCard title="📅 التبرعات عبر الزمن">
                        <TimelineBarChart donations={donations} />
                      </ChartCard>
                    )}
                  </div>
                )}

                {donations.length === 0 ? (
                  <div className="db-table-card">
                    <div className="db-empty">
                      <div className="db-empty-ico">🎁</div>
                      <p style={{ marginBottom: 16 }}>لم تقم بأي تبرع حتى الآن</p>
                      <Link href="/charities" className="db-cta"> تبرع الآن</Link>
                    </div>
                  </div>
                ) : (
                  <div className="db-table-card">
                    <div className="db-table-head">
                      <span className="db-table-title">آخر تبرعاتي</span>
                      <Link href="/charities" className="db-cta db-cta-sm">+ تبرع جديد</Link>
                    </div>
                    <DonationTable rows={donations.slice(0, 5)} />
                  </div>
                )}
              </>
            )}

            {tab === 'donations' && (
              donations.length === 0 ? (
                <div className="db-table-card">
                  <div className="db-empty">
                    <div className="db-empty-ico">📦</div>
                    <p style={{ marginBottom: 16 }}>لا توجد تبرعات بعد</p>
                    <Link href="/charities" className="db-cta"> تبرع الآن</Link>
                  </div>
                </div>
              ) : (
                <div className="db-table-card">
                  <div className="db-table-head">
                    <span className="db-table-title">كل تبرعاتي</span>
                    <span style={{ fontSize: '.8rem', color: '#718096', fontWeight: 600 }}>{donations.length} تبرع</span>
                  </div>
                  <DonationTable rows={donations} />
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CHARITY DASHBOARD
───────────────────────────────────────── */
type CharityTab = 'stats' | 'donations' | 'requests';

function CharityDashboard({ user }: { user: any }) {
  const [tab, setTab]                     = useState<CharityTab>('stats');
  const [stats, setStats]                 = useState<DashboardStats | null>(null);
  const [donations, setDonations]         = useState<Donation[]>([]);
  const [requests, setRequests]           = useState<Donation[]>([]);
  const [loading, setLoading]             = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const license = user?.licenseNumber;
    if (!license) {
      setLoading(false);
      return;
    }
    Promise.allSettled([
      dashboardApi.getStats(license),
      dashboardApi.getDonations(license),
      dashboardApi.getRequests(license),
    ]).then(([s, d, r]) => {
      if (s.status === 'fulfilled') setStats(s.value.stats);
      if (d.status === 'fulfilled') setDonations(d.value.donations || []);
      if (r.status === 'fulfilled') setRequests(r.value.donations || []);
    }).finally(() => setLoading(false));
  }, [user?.licenseNumber]);

  const handleAction = async (donationId: string, status: 'accepted' | 'rejected') => {
    const license = user?.licenseNumber;
    if (!license) return;
    setActionLoading(donationId + status);
    try {
      // FIX: pass license as required by endpoint PATCH /dashboard/request/:donationId/:license
      await dashboardApi.changeRequest(donationId, status, license);
      setRequests(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
    } catch {
      alert('حدث خطأ أثناء تحديث الحالة');
    } finally {
      setActionLoading(null);
    }
  };

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const tabDefs: { id: CharityTab; label: string; icon: string; count?: number }[] = [
    { id: 'stats',     label: 'الإحصائيات',     icon: '📊' },
    { id: 'donations', label: 'التبرعات',        icon: '📦', count: donations.length },
    { id: 'requests',  label: 'الطلبات المعلقة', icon: '⏳', count: pendingCount },
  ];

  const statCards = [
    { label: 'إجمالي التبرعات', val: stats?.Total_Donations    ?? '—', icon: '📦', accent: '#0f6b52' },
    { label: 'قيد الانتظار',   val: stats?.Pending_Donations   ?? '—', icon: '⏳', accent: '#c9a84c' },
    { label: 'مقبولة',         val: stats?.Accepted_Donations  ?? '—', icon: '✅', accent: '#38a169' },
    { label: 'مرفوضة',         val: stats?.Rejected_Donations  ?? '—', icon: '❌', accent: '#e53e3e' },
  ];

  return (
    <div className="db-root">
      <div className="db-topbar">
        <div className="db-topbar-inner">
          <div className="db-topbar-left">
            <div className="db-topbar-icon">🏛️</div>
            <div>
              <h1>لوحة تحكم الجمعية</h1>
              <p>مرحبًا، {user.userName} — إدارة التبرعات والطلبات</p>
            </div>
          </div>
          <div className="db-topbar-date">{today}</div>
        </div>
      </div>

      <div className="db-body">
        <div className="db-tabs">
          {tabDefs.map(t => (
            <button key={t.id} className={`db-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
              {t.count !== undefined && t.count > 0 && <span className="db-tab-badge">{t.count}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="db-spinner"><div className="db-spinner-ring" /></div>
        ) : (
          <>
            {tab === 'stats' && (
              <>
                <div className="db-stats">
                  {statCards.map(s => (
                    <div key={s.label} className="db-stat-card" style={{ '--accent': s.accent } as React.CSSProperties}>
                      <span className="db-stat-ico">{s.icon}</span>
                      <div className="db-stat-val">{s.val}</div>
                      <div className="db-stat-lbl">{s.label}</div>
                    </div>
                  ))}
                </div>
                {stats && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                    <ChartCard title="📊 توزيع التبرعات حسب الحالة">
                      <StatusDonutChart
                        pending={stats.Pending_Donations}
                        accepted={stats.Accepted_Donations}
                        rejected={stats.Rejected_Donations}
                      />
                    </ChartCard>
                    {donations.length > 0 && (
                      <ChartCard title="📦 التبرعات حسب النوع">
                        <TypeBarChart donations={donations} />
                      </ChartCard>
                    )}
                    {donations.length >= 2 && (
                      <ChartCard title="📅 التبرعات عبر الزمن">
                        <TimelineBarChart donations={donations} />
                      </ChartCard>
                    )}
                  </div>
                )}

                {donations.length > 0 && (
                  <div className="db-table-card">
                    <div className="db-table-head"><span className="db-table-title">آخر التبرعات</span></div>
                    <div className="db-table-scroll">
                      <table>
                        <thead><tr><th>النوع</th><th>المقاس</th><th>الكمية</th><th>الحالة</th><th>التاريخ</th></tr></thead>
                        <tbody>
                          {donations.slice(0, 5).map(d => {
                            const { label, cls } = statusLabel(d.status);
                            return (
                              <tr key={d._id}>
                                <td>{d.type}</td><td>{d.size}</td><td>{d.quantity}</td>
                                <td><span className={`sb sb-${cls}`}>{label}</span></td>
                                <td style={{ color: '#718096' }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('ar-EG') : '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            {tab === 'donations' && (
              donations.length === 0 ? (
                <div className="db-table-card"><div className="db-empty"><div className="db-empty-ico">📦</div>لا توجد تبرعات بعد</div></div>
              ) : (
                <div className="db-table-card">
                  <div className="db-table-head">
                    <span className="db-table-title">كل التبرعات</span>
                    <span style={{ fontSize: '.8rem', color: '#718096', fontWeight: 600 }}>{donations.length} تبرع</span>
                  </div>
                  <div className="db-table-scroll">
                    <table>
                      <thead><tr><th>النوع</th><th>المقاس</th><th>الكمية</th><th>الحالة</th><th>الوصف</th><th>التاريخ</th></tr></thead>
                      <tbody>
                        {donations.map(d => {
                          const { label, cls } = statusLabel(d.status);
                          return (
                            <tr key={d._id}>
                              <td>{d.type}</td><td>{d.size}</td><td>{d.quantity}</td>
                              <td><span className={`sb sb-${cls}`}>{label}</span></td>
                              <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#718096' }}>{d.description || '—'}</td>
                              <td style={{ color: '#718096' }}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString('ar-EG') : '—'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {tab === 'requests' && (
              requests.length === 0 ? (
                <div className="db-table-card"><div className="db-empty"><div className="db-empty-ico">⏳</div>لا توجد طلبات معلقة</div></div>
              ) : (
                <div className="db-table-card">
                  <div className="db-table-head">
                    <span className="db-table-title">الطلبات</span>
                    <span style={{ fontSize: '.8rem', color: '#718096', fontWeight: 600 }}>{requests.length} طلب</span>
                  </div>
                  <div className="db-table-scroll">
                    <table>
                      <thead><tr><th>النوع</th><th>المقاس</th><th>الكمية</th><th>الحالة</th><th>إجراء</th></tr></thead>
                      <tbody>
                        {requests.map(d => {
                          const { label, cls } = statusLabel(d.status);
                          const isPending = d.status === 'pending';
                          return (
                            <tr key={d._id}>
                              <td>{d.type}</td><td>{d.size}</td><td>{d.quantity}</td>
                              <td><span className={`sb sb-${cls}`}>{label}</span></td>
                              <td>
                                {isPending ? (
                                  <div className="db-act">
                                    <button className="db-btn-accept" disabled={!!actionLoading}
                                      onClick={() => handleAction(d._id, 'accepted')}>
                                      {actionLoading === d._id + 'accepted' ? '...' : '✓ قبول'}
                                    </button>
                                    <button className="db-btn-reject" disabled={!!actionLoading}
                                      onClick={() => handleAction(d._id, 'rejected')}>
                                      {actionLoading === d._id + 'rejected' ? '...' : '✕ رفض'}
                                    </button>
                                  </div>
                                ) : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────── */
export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <style>{`@keyframes db-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #c8e6dc', borderTopColor: '#0f6b52', borderRadius: '50%', animation: 'db-spin .7s linear infinite' }} />
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
          <p style={{ marginBottom: 20, color: '#4a5568' }}>يجب تسجيل الدخول أولاً</p>
          <Link href="/" style={{ background: '#0f6b52', color: '#fff', padding: '10px 22px', borderRadius: 8, fontFamily: 'Tajawal, sans-serif', fontWeight: 700, textDecoration: 'none' }}>
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{CSS}</style>
      {user.roleType === 'user'     && <DonorDashboard   user={user} />}
      {user.roleType === 'charity' && <CharityDashboard user={user} />}
      {user.roleType === 'admin'   && (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Tajawal, sans-serif', direction: 'rtl' }}>
          <p>استخدم <Link href="/admin" style={{ color: '#0f6b52' }}>لوحة الإدارة</Link></p>
        </div>
      )}
    </>
  );
}