import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersApi, charityApi, reportApi, request } from '../../services';
import type { User, Charity, Report } from '../../services';
import { formatDate } from '../../lib/utils';
import { Link } from 'wouter';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

type Tab = 'users' | 'charities' | 'reports' | 'automation';

// ✅ BUG #7 FIX: مدة الـ cooldown بين كل تشغيل وتاني (30 ثانية)
const CRON_COOLDOWN_MS = 30_000;

export default function AdminPanel() {
  const { user, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('users');

  const [users, setUsers]         = useState<User[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [reports, setReports]     = useState<Report[]>([]);
  const [loading, setLoading]     = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Edit charity
  const [editingCharity, setEditingCharity] = useState<Charity | null>(null);
  const [editForm, setEditForm] = useState({ charityName: '', address: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Automation
  const [cronLoading, setCronLoading] = useState<'reminder' | 'report' | null>(null);
  const [cronLog, setCronLog] = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
  // ✅ BUG #7 FIX: نتتبع آخر وقت تشغيل لكل task
  const [lastRun, setLastRun] = useState<Record<string, number>>({});

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

  // DELETE /users/:userId
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

  // DELETE /charity/:charityId
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

  // PATCH /charity/:id/approve
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

  // PATCH /charity/:id/reject  { reason }
  const handleRejectCharity = async (id: string, name: string) => {
    const reason = prompt(`سبب رفض جمعية "${name}" (اختياري):`);
    if (reason === null) return;
    setActionLoading('reject-' + id);
    try {
      await charityApi.reject(id, reason);
      setCharities(prev => prev.map(c =>
        c._id === id ? { ...c, status: 'rejected' as const, rejectionReason: reason } : c
      ));
      showMsg('success', `تم رفض جمعية "${name}"`);
    } catch (e) {
      showMsg('error', e instanceof Error ? e.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  // PATCH /charity/:charityId  { charityName, address, description }
  const startEditCharity = (c: Charity) => {
    setEditingCharity(c);
    setEditForm({ charityName: c.charityName, address: c.address, description: c.description });
  };

  const handleUpdateCharity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharity) return;
    if (!editForm.charityName.trim() || !editForm.address.trim() || !editForm.description.trim()) {
      showMsg('error', 'جميع الحقول مطلوبة');
      return;
    }
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

  // GET /cron/donationReminder  |  GET /cron/adminReport
  const runCron = async (type: 'reminder' | 'report') => {
    const endpoint = type === 'reminder' ? '/cron/donationReminder' : '/cron/adminReport';
    const label    = type === 'reminder' ? 'تذكير التبرعات' : 'تقرير الأدمن';

    // ✅ BUG #7 FIX: تحقق من الـ cooldown قبل التشغيل
    const timeSinceLast = Date.now() - (lastRun[type] || 0);
    if (timeSinceLast < CRON_COOLDOWN_MS) {
      const remaining = Math.ceil((CRON_COOLDOWN_MS - timeSinceLast) / 1000);
      showMsg('error', `الرجاء الانتظار ${remaining} ثانية قبل إعادة تشغيل "${label}"`);
      return;
    }

    setCronLoading(type);
    try {
      // ✅ BUG #4 FIX: requiresAuth = true لضمان إرسال Authorization header
      // وللـ redirect التلقائي عند انتهاء الجلسة بدل "خطأ غير معروف"
      await request(endpoint, {}, false, true);

      // ✅ BUG #7 FIX: نسجّل وقت آخر تشغيل ناجح
      setLastRun(prev => ({ ...prev, [type]: Date.now() }));

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

  // ✅ BUG #7 FIX: حساب الثواني المتبقية لكل زرار
  const getCooldownRemaining = (type: 'reminder' | 'report') => {
    const elapsed = Date.now() - (lastRun[type] || 0);
    if (elapsed >= CRON_COOLDOWN_MS) return 0;
    return Math.ceil((CRON_COOLDOWN_MS - elapsed) / 1000);
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

  const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: 'users',      label: 'المستخدمون',      icon: '👥', count: users.length },
    { id: 'charities',  label: 'الجمعيات',         icon: '🏛️', count: charities.length },
    { id: 'reports',    label: 'التقارير',          icon: '🚨', count: reports.length },
    { id: 'automation', label: 'التشغيل التلقائي',  icon: '⚙️', count: 0 },
  ];

  const setEditField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm(f => ({ ...f, [k]: e.target.value }));

  const tooltipStyle = {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
    padding: '8px 14px', fontSize: 13, fontFamily: 'Tajawal, sans-serif',
    direction: 'rtl' as const,
  };
  const barData = [
    { name: 'المستخدمون', value: users.length,     fill: '#3b82f6' },
    { name: 'الجمعيات',   value: charities.length,  fill: '#10b981' },
    { name: 'التقارير',   value: reports.length,    fill: '#f59e0b' },
  ];
  const pieData = [
    { name: 'معلقة',   value: charities.filter(c => (c as any).status === 'pending').length,  color: '#f59e0b' },
    { name: 'مقبولة',  value: charities.filter(c => (c as any).status === 'approved').length, color: '#10b981' },
    { name: 'مرفوضة', value: charities.filter(c => (c as any).status === 'rejected').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="dashboard-wrapper">
      {/* Top Bar */}
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
            {new Date().toLocaleDateString('ar-EG', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </div>
        </div>
      </div>

      <div className="dash-body">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'إجمالي المستخدمين', value: users.length,     icon: '👥', cls: 'stat-card stat-blue'  },
            { label: 'إجمالي الجمعيات',   value: charities.length,  icon: '🏛️', cls: 'stat-card stat-green' },
            { label: 'التقارير الواردة',  value: reports.length,    icon: '🚨', cls: 'stat-card stat-amber' },
          ].map(s => (
            <div key={s.label} className={s.cls}
              style={{ borderRadius: 12, padding: '20px 24px', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px' }}>{s.value}</div>
              <div style={{ fontSize: 14, opacity: .7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {!loading && (users.length > 0 || charities.length > 0) && (
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
        )}

        {/* Message */}
        {msg && (
          <div style={{
            marginBottom: 16, padding: '12px 16px', borderRadius: 8,
            background: msg.type === 'success' ? '#f0fff4' : '#fff5f5',
            color:      msg.type === 'success' ? '#38a169'  : '#e53e3e',
            border: `1px solid ${msg.type === 'success' ? '#c6f6d5' : '#fed7d7'}`,
          }}>
            {msg.text}
          </div>
        )}

        {/* Tabs */}
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
            {/* ══ USERS ══ */}
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
                              {u.roleType === 'admin'   ? '🛡️ أدمن'
                               : u.roleType === 'charity' ? '🏛️ جمعية'
                               : '👤 مستخدم'}
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

            {/* ══ CHARITIES ══ */}
            {tab === 'charities' && (
              <div className="dash-table-wrap">
                {editingCharity && (
                  <div style={{ background: '#f0fdfa', border: '2px solid #99f6e4', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: 16, margin: 0 }}>✏️ تعديل: {editingCharity.charityName}</h3>
                      <button type="button" onClick={() => setEditingCharity(null)}
                        style={{ background: 'transparent', border: '1px solid #ccc', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 13 }}>
                        ✕ إلغاء
                      </button>
                    </div>
                    <form onSubmit={handleUpdateCharity} noValidate>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div className="form-group">
                          <label className="form-label">اسم الجمعية *</label>
                          <input type="text" required className="form-input"
                            value={editForm.charityName} onChange={setEditField('charityName')} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">العنوان *</label>
                          <input type="text" required className="form-input"
                            value={editForm.address} onChange={setEditField('address')} />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginTop: 12 }}>
                        <label className="form-label">الوصف *</label>
                        <textarea rows={3} required className="form-input"
                          value={editForm.description} onChange={setEditField('description')}
                          style={{ resize: 'vertical' }} />
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
                        const o: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
                        return (o[a.status] ?? 1) - (o[b.status] ?? 1);
                      }).map(c => (
                        <tr key={c._id} style={{
                          background: editingCharity?._id === c._id
                            ? '#f0fdfa'
                            : c.status === 'pending' ? '#fffbeb' : undefined,
                        }}>
                          <td>
                            <Link href={`/charities/${c._id}`}
                              style={{ color: 'var(--teal-600)', fontWeight: 700, textDecoration: 'none' }}>
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
                              <Link href={`/charities/${c._id}`} className="btn-sm"
                                style={{ fontSize: 12, padding: '4px 10px', textDecoration: 'none' }}>
                                👁️ عرض
                              </Link>
                              <button className="btn-sm"
                                style={{ fontSize: 12, padding: '4px 10px' }}
                                onClick={() => startEditCharity(c)}>
                                ✏️ تعديل
                              </button>
                              {c.status === 'pending' && (
                                <>
                                  <button
                                    disabled={!!actionLoading}
                                    onClick={() => handleApproveCharity(c._id, c.charityName)}
                                    style={{ fontSize: 12, padding: '4px 10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
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

            {/* ══ REPORTS ══ */}
            {tab === 'reports' && (
              <div className="dash-table-wrap">
                {reports.length === 0 ? (
                  <div className="empty-state"><div className="empty-icon">🚨</div><p>لا توجد تقارير</p></div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {reports.map((r, i) => (
                      <div key={r._id}
                        style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
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

            {/* ══ AUTOMATION ══ */}
            {tab === 'automation' && (
              <div className="dash-table-wrap">
                <div style={{ maxWidth: 640, margin: '0 auto' }}>
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px' }}>⚙️ التشغيل التلقائي (Cron)</h3>
                    <p style={{ fontSize: 14, color: 'var(--neutral-500)', margin: 0 }}>
                      يمكنك تشغيل المهام التلقائية يدويًا من هنا. تعمل أيضًا تلقائيًا من الـ backend بجدول زمني محدد.
                    </p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                    {/* Donation Reminder */}
                    {(() => {
                      const cooldown = getCooldownRemaining('reminder');
                      const isOnCooldown = cooldown > 0;
                      return (
                        <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 14, padding: 24 }}>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>📨</div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>تذكير التبرعات</h4>
                          <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '0 0 16px', lineHeight: 1.6 }}>
                            يرسل تذكيرات للجمعيات بشأن التبرعات المعلقة منذ فترة طويلة.
                          </p>
                          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#166534', marginBottom: 16 }}>
                            📡 <code style={{ fontFamily: 'monospace' }}>GET /cron/donationReminder</code>
                          </div>
                          {/* ✅ BUG #7 FIX: إظهار الـ cooldown في الزرار */}
                          <button className="btn-primary" style={{ width: '100%' }}
                            disabled={cronLoading === 'reminder' || isOnCooldown}
                            onClick={() => runCron('reminder')}>
                            {cronLoading === 'reminder'
                              ? 'جاري التشغيل...'
                              : isOnCooldown
                              ? `⏳ انتظر ${cooldown}ث`
                              : '▶ تشغيل الآن'}
                          </button>
                        </div>
                      );
                    })()}

                    {/* Admin Report */}
                    {(() => {
                      const cooldown = getCooldownRemaining('report');
                      const isOnCooldown = cooldown > 0;
                      return (
                        <div style={{ background: 'var(--card-bg,#fff)', border: '1px solid var(--border,#e2e8f0)', borderRadius: 14, padding: 24 }}>
                          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                          <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 8px' }}>تقرير الأدمن</h4>
                          <p style={{ fontSize: 13, color: 'var(--neutral-500)', margin: '0 0 16px', lineHeight: 1.6 }}>
                            يولّد تقريرًا دوريًا شاملًا عن نشاط المنصة ويرسله للمسؤولين.
                          </p>
                          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#1e40af', marginBottom: 16 }}>
                            📡 <code style={{ fontFamily: 'monospace' }}>GET /cron/adminReport</code>
                          </div>
                          {/* ✅ BUG #7 FIX: إظهار الـ cooldown في الزرار */}
                          <button className="btn-primary" style={{ width: '100%', background: '#1e40af' }}
                            disabled={cronLoading === 'report' || isOnCooldown}
                            onClick={() => runCron('report')}>
                            {cronLoading === 'report'
                              ? 'جاري التشغيل...'
                              : isOnCooldown
                              ? `⏳ انتظر ${cooldown}ث`
                              : '▶ تشغيل الآن'}
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Cron Log */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>📋 سجل التنفيذ</h4>
                      {cronLog.length > 0 && (
                        <button onClick={() => setCronLog([])}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--neutral-500)' }}>
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
                          <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 14px', borderRadius: 8, fontSize: 13,
                            background: log.type === 'success' ? '#f0fff4' : '#fff5f5',
                            border: `1px solid ${log.type === 'success' ? '#c6f6d5' : '#fed7d7'}`,
                            color:  log.type === 'success' ? '#276749' : '#c53030',
                          }}>
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