import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { donorApi, reportApi, Donation } from '../services';
import { formatDate } from '../lib/utils';
import { Link, useLocation } from 'wouter';
import RatingModal from '../features/rating/RatingModal';
import '../styles/css/UserDashboard.css';
import PageLoader from '../components/ui/Pageloader';


/* Status/config helpers (kept as your design tokens) */
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  pending:   { label: 'قيد المراجعة', color: '#92400e', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  accepted:  { label: 'مقبول',        color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981' },
  delivered: { label: 'تم التسليم',   color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981' },
  rejected:  { label: 'مرفوض',        color: '#991b1b', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'جديدة', good: 'جيدة', excellent: 'ممتازة', acceptable: 'مقبولة',
};

export default function UserDashboard(): JSX.Element | null {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [ratingDonation, setRatingDonation] = useState<Donation | null>(null);
  const [ratedIds, setRatedIds] = useState<Set<string>>(new Set());
  const [showReport, setShowReport] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQ, setSearchQ] = useState('');

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await donorApi.getMyDonations();
      const list = res.donations || [];
      setDonations(Array.isArray(list) ? list : []);
      setFetchError(null);
    } catch {
      setFetchError('فشل تحميل التبرعات، تحقق من اتصالك بالإنترنت');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (!authLoading && user) fetchDonations(); }, [user, authLoading]);

  const handleRatingSuccess = (id: string) => {
    setRatedIds(p => new Set([...p, id]));
    setRatingDonation(null);
    fetchDonations();
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportText.trim().length < 10) {
      setReportMsg({ type: 'error', text: 'يجب كتابة 10 أحرف على الأقل' });
      return;
    }
    setReportLoading(true); setReportMsg(null);
    try {
      await reportApi.create({ description: reportText.trim() });
      setReportMsg({ type: 'success', text: 'تم إرسال البلاغ بنجاح، سيتم مراجعته قريباً' });
      setReportText('');
      setTimeout(() => { setShowReport(false); setReportMsg(null); }, 2400);
    } catch (err: unknown) {
      setReportMsg({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى' });
    } finally { setReportLoading(false); }
  };

  const getCharityName = (d: Donation) => {
    if (!d.charityId) return 'غير محدد';
    if (typeof d.charityId === 'object' && 'charityName' in d.charityId)
      return (d.charityId as { charityName: string }).charityName;
    return 'غير محدد';
  };

  const stats = {
    total: donations.length,
    pending: donations.filter(d => d.status === 'pending').length,
    accepted: donations.filter(d => d.status === 'accepted').length,
    rejected: donations.filter(d => d.status === 'rejected').length,
  };

  const filtered = donations.filter(d => {
    const matchTab = activeTab === 'all' || d.status === activeTab;
    const q = searchQ.trim();
    const matchSearch = !q || (d.type && d.type.includes(q)) || getCharityName(d).includes(q);
    return matchTab && matchSearch;
  });

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const userInitial = user?.userName?.[0]?.toUpperCase() ?? 'م';
  const userName = user?.userName || user?.name || 'المستخدم';
     if (authLoading || loading) {
       return <PageLoader text="جاري تحميل بياناتك…" />;
     }


  if (!user) return null;

  return (
    <>
      <div className="ud-root">
        <div className="ud-page">

          <header className="ud-topbar">
            <div className="ud-topbar-left">
              <div className="ud-brand">
                <div className="ud-brand-ico"><i className="ti ti-layout-grid" /></div>
                <span className="ud-brand-name">لوحة التحكم</span>
              </div>

              <div
                className="ud-page-badge"
                aria-label="مساعد عطاء"
                onClick={() => setLocation('/ai-chat')}
                style={{ cursor: 'pointer' }}
              >
                <span className="ud-badge-dot" /> مساعد عطاء
              </div>
            </div>

            <div className="ud-topbar-right">
              {/* <div className="ud-topbar-av" title={userName} aria-label={`المستخدم ${userName}`}>
                {userInitial}
              </div> */}
              <div
  className="ud-topbar-av"
  title={userName}
  aria-label={`المستخدم ${userName}`}
  onClick={() => setLocation('/settings')}
  style={{ cursor: 'pointer' }}
>
  {userInitial}
</div>
            </div>
          </header>

          <div className="ud-hero">
            <div className="ud-hero-inner">
              <div className="ud-hero-left">
                <div className="ud-hero-av" aria-hidden="true">{userInitial}</div>
                <div>
                  <div className="ud-hero-name">أهلاً بك، {userName} 👋</div>
                  <div className="ud-hero-sub">لوحة تتبع تبرعاتك الشخصية</div>
                </div>
              </div>

              <div className="ud-hero-right">
                <div className="ud-date-pill"><i className="ti ti-calendar" /> {today}</div>
                <button className="ud-hero-btn" onClick={() => setLocation('/donate')}>
                  <i className="ti ti-plus" /> تبرع الآن
                </button>
              </div>
            </div>
          </div>

          <div className="ud-content">
            <div className="ud-stats" role="region" aria-label="إحصائيات التبرعات">
              {([
                { label: 'إجمالي التبرعات', val: stats.total, icon: 'ti-packages', color: 'var(--br)' },
                { label: 'قيد المراجعة', val: stats.pending, icon: 'ti-clock', color: '#f59e0b' },
                { label: 'مقبولة', val: stats.accepted, icon: 'ti-circle-check', color: '#10b981' },
                { label: 'مرفوضة', val: stats.rejected, icon: 'ti-circle-x', color: '#ef4444' },
              ]).map(s => (
                <div key={s.label} className="ud-stat" style={{ ['--ud-stat-color' as any]: s.color }}>
                  <div className="ud-stat-top"><div className="ud-stat-ico" style={{ color: s.color }}>{/* icon */}<i className={`ti ${s.icon}`} /></div></div>
                  <div className="ud-stat-num" style={{ color: s.color }}>{s.val}</div>
                  <div className="ud-stat-label">{s.label}</div>
                </div>
              ))}
            </div>

            <nav className="ud-quick" aria-label="الإجراءات السريعة">
              <button className="ud-quick-btn primary" onClick={() => setLocation('/donate')}>
                <i className="ti ti-heart-handshake" /> تبرع الآن
              </button>
              <Link href="/charities" className="ud-quick-btn">
                <i className="ti ti-building-community" /> الجمعيات
              </Link>
              <Link href="/ai-chat" className="ud-quick-btn">
                <i className="ti ti-robot" /> المساعد الذكي
              </Link>
              <button className="ud-quick-btn danger" onClick={() => { setShowReport(true); setReportMsg(null); setReportText(''); }}>
                <i className="ti ti-alert-triangle" /> إبلاغ
              </button>
            </nav>

            <div className="ud-greet" role="note">
              <div className="ud-greet-bell" aria-hidden="true">🔔<div className="ud-greet-notif">1</div></div>
              <div>
                <div className="ud-greet-lbl">رسالة من أحد المستفيدين</div>
                <div className="ud-greet-msg">يمكن إحنا منعرفش بعض… <span>بس تبرعك وصل لحد محتاج بجد، شكراً.</span></div>
              </div>
            </div>

            <div className="ud-card" role="region" aria-label="سجل التبرعات">
              <div className="ud-card-header">
                <div>
                  <span className="ud-card-title"><i className="ti ti-clipboard-list" /> سجل التبرعات</span>
                  <span className="ud-card-count">({filtered.length} نتيجة)</span>
                </div>
                <div className="ud-search" role="search">
                  <i className="ti ti-search ud-search-ico" />
                  <input placeholder="ابحث بالنوع أو الجمعية…" value={searchQ} onChange={e => setSearchQ(e.target.value)} aria-label="بحث في التبرعات" />
                </div>
              </div>

              <div className="ud-tabs" role="tablist" aria-label="تصفية التبرعات">
                {([
                  ['all', 'الكل', stats.total],
                  ['pending', 'قيد المراجعة', stats.pending],
                  ['accepted', 'مقبول', stats.accepted],
                  ['rejected', 'مرفوض', stats.rejected],
                ] as const).map(([key, label, count]) => (
                  <button key={key} className={`ud-tab${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key)} role="tab" aria-selected={activeTab === key}>
                    {label}{count > 0 && <span style={{ marginRight: 4, opacity: .65, fontSize: 12 }}>({count})</span>}
                  </button>
                ))}
              </div>

              {fetchError ? (
                <div className="ud-empty">
                  <div className="ud-empty-ico"><i className="ti ti-alert-circle" /></div>
                  <p className="ud-empty-title">{fetchError}</p>
                  <button className="ud-empty-btn" onClick={fetchDonations}><i className="ti ti-refresh" /> إعادة المحاولة</button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="ud-empty">
                  <div className="ud-empty-ico"><i className="ti ti-inbox" /></div>
                  <p className="ud-empty-title">لا توجد تبرعات {activeTab !== 'all' ? 'في هذه الحالة' : 'بعد'}</p>
                  <p className="ud-empty-sub">ابدأ رحلتك في العطاء وساعد من يحتاج</p>
                  <button className="ud-empty-btn" onClick={() => setLocation('/donate')}><i className="ti ti-plus" /> أضف تبرعًا جديدًا</button>
                </div>
              ) : (
                <>
                  <div className="ud-tbl-wrap">
                    <table className="ud-tbl" aria-label="قائمة التبرعات">
                      <thead>
                        <tr>
                          <th scope="col">نوع التبرع</th>
                          <th scope="col">الكمية</th>
                          <th scope="col">الجمعية</th>
                          <th scope="col">حالة القطعة</th>
                          <th scope="col">التاريخ</th>
                          <th scope="col">الحالة</th>
                          <th scope="col"><span className="sr-only">إجراء</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map(d => {
                          const sc = STATUS_CFG[d.status] ?? { label: d.status, color: '#6b7280', bg: '#f3f4f6', border: '#e5e7eb', dot: '#9ca3af' };
                          const alreadyRated = ratedIds.has(d._id);
                          const canRate = d.status === 'delivered' || d.status === 'completed';
                          const condLabel = CONDITION_LABELS[d.condition ?? ''] ?? d.condition ?? '—';

                          return (
                            <tr key={d._id}>
                              <td>
                                <div className="ud-type-cell">
                                  <div className="ud-type-ico"><i className="ti ti-shirt" /></div>
                                  <div>
                                    <div className="ud-type-name">{d.type}</div>
                                    {d.size && <div className="ud-type-size">مقاس: {d.size}</div>}
                                  </div>
                                </div>
                              </td>
                              <td><span className="ud-qty">{d.quantity ?? '—'} قطعة</span></td>
                              <td><span className="ud-charity-tag"><i className="ti ti-building-community" />{getCharityName(d)}</span></td>
                              <td style={{ color: 'var(--t2)', fontSize: 13, fontWeight: 600 }}>{condLabel}</td>
                              <td style={{ color: 'var(--t3)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{formatDate(d.createdAt)}</td>
                              <td><span className="ud-status" style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}><span className="ud-status-dot" style={{ background: sc.dot }} />{sc.label}</span></td>
                              <td>
                                {canRate && (alreadyRated ? <span className="ud-rated"><i className="ti ti-check" /> مُقيّم</span> : <button className="ud-rate-btn" onClick={() => setRatingDonation(d)}><i className="ti ti-star" /> قيّم</button>)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="ud-card-footer">
                    <span className="ud-result-count">{filtered.length} تبرع</span>
                    <button className="ud-add-btn" onClick={() => setLocation('/donate')}><i className="ti ti-plus" /> أضف تبرعًا جديدًا</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {ratingDonation && (
        <RatingModal
          donationId={ratingDonation._id}
          donationType={ratingDonation.type}
          charityName={getCharityName(ratingDonation)}
          onClose={() => setRatingDonation(null)}
          onSuccess={() => handleRatingSuccess(ratingDonation._id)}
        />
      )}

      {showReport && (
        <div className="ud-root ud-modal-overlay" role="dialog" aria-modal="true" aria-label="الإبلاغ عن مشكلة" onClick={e => { if (e.target === e.currentTarget) setShowReport(false); }}>
          <div className="ud-modal">
            <div className="ud-modal-hd">
              <span className="ud-modal-title"><i className="ti ti-alert-triangle" /> الإبلاغ عن مشكلة</span>
              <button className="ud-modal-cls" onClick={() => setShowReport(false)} aria-label="إغلاق"><i className="ti ti-x" /></button>
            </div>
            <div className="ud-modal-body">
              <div className="ud-modal-icon"><i className="ti ti-alert-triangle" /></div>
              <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--t3)', marginBottom: 18, lineHeight: 1.6 }}>سيتم مراجعة بلاغك من قِبل فريق الإدارة في أقرب وقت</p>

              {reportMsg && <div className={`ud-alert ${reportMsg.type === 'success' ? 'ud-alert-ok' : 'ud-alert-err'}`} role="alert"><i className={`ti ${reportMsg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />{reportMsg.text}</div>}

              <form onSubmit={handleReport} noValidate>
                <label className="ud-modal-lbl" htmlFor="report-ta">وصف المشكلة <span style={{ color: '#dc2626' }}>*</span></label>
                <textarea id="report-ta" className="ud-modal-ta" value={reportText} onChange={e => setReportText(e.target.value)} rows={4} minLength={10} maxLength={500} placeholder="اشرح المشكلة بالتفصيل…" required />
                <div className="ud-modal-char">{reportText.length} / 500</div>
                <button type="submit" className="ud-modal-submit" disabled={reportLoading || reportText.trim().length < 10}>
                  {reportLoading ? <><i className="ti ti-loader" /> جاري الإرسال…</> : <><i className="ti ti-send-2" /> إرسال البلاغ</>}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}