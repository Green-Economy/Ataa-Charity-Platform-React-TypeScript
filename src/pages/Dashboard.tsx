import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import PageLoader from '../components/ui/Pageloader';
import DonationDetail from './DonationDetail';
import '../styles/css/CharityDashboard.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONFIG
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const BASE_URL = 'https://ataa-charity-platform.vercel.app';

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token') || '';
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: token, ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface DashboardStats {
  Total_Donations: number;
  Pending_Donations: number;
  Accepted_Donations: number;
  Rejected_Donations: number;
}
interface DonorObj { _id: string; userName?: string; name?: string; phone?: string; address?: string; }
interface Donation {
  _id: string; type: string; size?: string; quantity?: number;
  description?: string; condition?: string; status: 'pending' | 'accepted' | 'rejected';
  createdAt: string; imageUrl?: Array<{ secure_url: string }>; donorId?: DonorObj | string | null;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const STATUS_CFG = {
  pending:  { label: 'قيد المراجعة', color: '#92400e', bg: '#fffbeb', dot: '#f59e0b', border: '#fde68a' },
  accepted: { label: 'مقبول',        color: '#065f46', bg: '#ecfdf5', dot: '#10b981', border: '#6ee7b7' },
  rejected: { label: 'مرفوض',        color: '#991b1b', bg: '#fef2f2', dot: '#ef4444', border: '#fca5a5' },
} as const;

const CHART_COLORS = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444' };
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

/* ✅ FIX: دالة استخراج بيانات المتبرع الصحيحة */
function parseDonor(donorId: DonorObj | string | null | undefined) {
  if (!donorId) return { name: '—', phone: '—', address: '—', initial: 'م' };
  if (typeof donorId === 'string') return { name: `#${donorId.slice(-4)}`, phone: '—', address: '—', initial: 'م' };
  const name = donorId.userName || donorId.name || '—';
  return {
    name,
    phone:   donorId.phone   || '—',
    address: donorId.address || '—',
    initial: name !== '—' ? name.trim()[0]?.toUpperCase() || 'م' : 'م',
  };
}

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CHAT PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ChatPanel() {
  const [msgs, setMsgs] = useState([
    { role: 'ai', text: 'أهلاً! أنا مساعد عطاء الذكي 🤖\nيمكنني مساعدتك في إدارة التبرعات، الإحصائيات، والإجابة على أي استفسار.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text }]);
    setLoading(true);
    try {
      // استبدل هذا بـ API الخاص بيك
      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setMsgs(prev => [...prev, { role: 'ai', text: res.reply || res.message || 'حدث خطأ في الرد' }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: '⚠️ تعذّر الاتصال بالمساعد، حاول مرة أخرى.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 480 }}>
      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {msgs.map((m, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-start' : 'flex-end',
            }}
          >
            {m.role === 'ai' && (
              <div style={{
                width: 32, height: 32, borderRadius: '50%', background: 'var(--t1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: 10, flexShrink: 0,
              }}>
                <i className="ti ti-robot" style={{ color: 'var(--br)', fontSize: 16 }} />
              </div>
            )}
            <div style={{
              maxWidth: '72%',
              padding: '10px 14px',
              borderRadius: m.role === 'user'
                ? '18px 4px 18px 18px'
                : '4px 18px 18px 18px',
              background: m.role === 'user' ? 'var(--t1)' : 'var(--bg-sb)',
              color: m.role === 'user' ? 'white' : 'var(--t1)',
              border: m.role === 'ai' ? '1.5px solid var(--bd)' : 'none',
              fontSize: 13.5, lineHeight: 1.7,
              whiteSpace: 'pre-line',
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 8 }}>
            <div style={{
              padding: '10px 16px', background: 'var(--bg-sb)',
              border: '1.5px solid var(--bd)', borderRadius: '4px 18px 18px 18px',
            }}>
              <span className="cd-spinner" style={{ borderColor: 'var(--t3)', borderTopColor: 'var(--br)' }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{ padding: '8px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['كم عدد التبرعات المعلقة؟', 'أرسل تذكيراً للمتبرعين', 'ما أكثر أنواع التبرعات؟'].map(s => (
          <button
            key={s}
            onClick={() => { setInput(s); }}
            style={{
              padding: '5px 12px', borderRadius: 20, border: '1.5px solid var(--bd)',
              background: 'var(--bg-pu)', color: 'var(--t3)', fontSize: 12,
              fontFamily: 'Tajawal, sans-serif', cursor: 'pointer', transition: 'all .15s',
              fontWeight: 600,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--br)'; e.currentTarget.style.color = 'var(--br)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--bd)'; e.currentTarget.style.color = 'var(--t3)'; }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 20px', borderTop: '1.5px solid var(--bd)',
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="اكتب سؤالك هنا…"
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 12,
            border: '1.5px solid var(--bd)', background: 'var(--bg-sb)',
            fontFamily: 'Tajawal, sans-serif', fontSize: 13.5, color: 'var(--t1)',
            outline: 'none', direction: 'rtl',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--br)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--bd)'; }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: 42, height: 42, borderRadius: 12, border: 'none',
            background: input.trim() && !loading ? 'var(--br)' : 'var(--bd2)',
            color: 'white', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all .2s', flexShrink: 0,
          }}
        >
          <i className="ti ti-send" style={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REPORT MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface ReportModalProps {
  onClose: () => void;
  charityToken: string;
}

function ReportModal({ onClose, charityToken }: ReportModalProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async () => {
    if (text.trim().length < 10) {
      setMsg({ ok: false, text: 'يجب كتابة 10 أحرف على الأقل' });
      return;
    }
    setLoading(true); setMsg(null);
    try {
      await apiFetch('/report', { method: 'POST', body: JSON.stringify({ description: text.trim() }) });
      setMsg({ ok: true, text: 'تم إرسال البلاغ بنجاح، سيتم مراجعته قريباً' });
      setText('');
      setTimeout(() => { onClose(); }, 2200);
    } catch (err: any) {
      setMsg({ ok: false, text: err.message || 'حدث خطأ، حاول مرة أخرى' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
        backdropFilter: 'blur(6px)', zIndex: 500,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'cd-fadein .2s ease',
      }}
    >
      <div style={{
        background: 'var(--bg-pu)', borderRadius: 20, border: '1.5px solid var(--bd)',
        maxWidth: 460, width: '100%', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,.2)',
        animation: 'cd-modal-up .3s cubic-bezier(.34,1.56,.64,1) both',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1.5px solid var(--bd)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--bg-sb)',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="ti ti-alert-triangle" style={{ color: '#ef4444', fontSize: 18 }} />
            الإبلاغ عن مشكلة
          </span>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8, border: '1.5px solid var(--bd)',
              background: 'var(--bg-pu)', cursor: 'pointer', color: 'var(--t3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
              transition: 'all .15s',
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 22px 24px' }}>
          {/* Icon */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: '#fef2f2', border: '1.5px solid #fca5a5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px', fontSize: 22, color: '#ef4444',
          }}>
            <i className="ti ti-alert-octagon" />
          </div>

          <p style={{ textAlign: 'center', color: 'var(--t3)', fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
            سيتم مراجعة بلاغك من قِبل فريق الإدارة في أقرب وقت ممكن
          </p>

          {msg && (
            <div style={{
              padding: '9px 14px', borderRadius: 10, marginBottom: 14, fontSize: 13,
              background: msg.ok ? 'var(--green-pale)' : 'var(--red-pale)',
              border: `1.5px solid ${msg.ok ? 'var(--green-bd)' : 'var(--red-bd)'}`,
              color: msg.ok ? 'var(--green-t)' : 'var(--red-dark)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <i className={`ti ${msg.ok ? 'ti-circle-check' : 'ti-alert-circle'}`} style={{ fontSize: 16 }} />
              {msg.text}
            </div>
          )}

          <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', display: 'block', marginBottom: 8 }}>
            وصف المشكلة <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="اشرح المشكلة بالتفصيل…"
            style={{
              width: '100%', padding: '10px 14px',
              border: '1.5px solid var(--bd)', borderRadius: 12,
              fontFamily: 'Tajawal, sans-serif', fontSize: 13.5, color: 'var(--t1)',
              background: 'var(--bg-sb)', resize: 'vertical', outline: 'none',
              direction: 'rtl', transition: 'border-color .18s', lineHeight: 1.7,
            }}
            onFocus={e => { e.target.style.borderColor = '#ef4444'; e.target.style.boxShadow = '0 0 0 3px rgba(239,68,68,.1)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--bd)'; e.target.style.boxShadow = 'none'; }}
          />
          <div style={{ fontSize: 11, color: 'var(--t4)', textAlign: 'left', marginTop: 4 }}>
            {text.length} / 500
          </div>

          <button
            onClick={send}
            disabled={loading || text.trim().length < 10}
            style={{
              width: '100%', marginTop: 14, padding: '13px',
              background: loading || text.trim().length < 10 ? 'var(--bd2)' : '#ef4444',
              color: 'white', border: 'none', borderRadius: 12,
              fontFamily: 'Tajawal, sans-serif', fontSize: 14, fontWeight: 700,
              cursor: loading || text.trim().length < 10 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all .2s',
            }}
          >
            {loading
              ? <><span className="cd-spinner" /> جاري الإرسال…</>
              : <><i className="ti ti-send-2" /> إرسال البلاغ</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DONATION CARD (shared UI)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DonationCard({ d, onClick, actions }: {
  d: Donation;
  onClick?: () => void;
  actions?: React.ReactNode;
}) {
  const sc    = STATUS_CFG[d.status];
  const donor = parseDonor(d.donorId);
  const img   = d.imageUrl?.[0]?.secure_url;

  return (
    <div
      className="cd-donation-card"
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="cd-card-img-wrap">
        {img
          ? <img src={img} className="cd-card-img" alt={d.type} />
          : (
            <div className="cd-card-img-placeholder">
              <i className="ti ti-photo" />
              <span>لا توجد صورة</span>
            </div>
          )
        }
        {d.imageUrl && d.imageUrl.length > 1 && (
          <div className="cd-img-count">
            <i className="ti ti-photo" /> {d.imageUrl.length}
          </div>
        )}
      </div>

      <div className="cd-card-body">
        <div className="cd-card-top">
          <div>
            <div className="cd-card-type">{d.type}</div>
            {d.condition && <div className="cd-card-condition">{d.condition}</div>}
          </div>
          <span className="cd-status" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
            <span className="cd-status-dot" style={{ background: sc.dot }} />
            {sc.label}
          </span>
        </div>

        <div className="cd-card-meta">
          <span className="cd-meta-item">
            <i className="ti ti-package" />
            <strong>{d.quantity || '—'}</strong> قطعة
          </span>
          {d.size && (
            <span className="cd-meta-item">
              <i className="ti ti-ruler-2" /> {d.size}
            </span>
          )}
        </div>

        <div className="cd-card-donor">
          <div className="cd-card-donor-av">{donor.initial}</div>
          <div>
            <div className="cd-card-donor-name">{donor.name}</div>
            {donor.address !== '—' && (
              <div className="cd-card-donor-addr">
                <i className="ti ti-map-pin" /> {donor.address}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="cd-card-footer">
        {actions ?? (
          <>
            <span className="cd-card-date">
              <i className="ti ti-calendar" /> {fmtDate(d.createdAt)}
            </span>
            <span className="cd-card-cta">
              <i className="ti ti-eye" /> تفاصيل
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function CharityDashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  /* ── State ── */
  const [tab, setTab]                 = useState<'stats' | 'donations' | 'requests' | 'chat'>('stats');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [stats, setStats]             = useState<DashboardStats | null>(null);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [pendingReqs, setPendingReqs] = useState<Donation[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQ, setSearchQ]         = useState('');
  const [showReport, setShowReport]   = useState(false);

  /* ── Fetch ── */
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [statsRes, donationsRes, requestsRes] = await Promise.allSettled([
        apiFetch('/dashboard/stats'),
        apiFetch('/dashboard/donations?page=1&limit=100'),
        apiFetch('/dashboard/requests?page=1&limit=100'),
      ]);
      if (statsRes.status === 'fulfilled' && statsRes.value.success)
        setStats(statsRes.value.stats);
      if (donationsRes.status === 'fulfilled' && donationsRes.value.success)
        setAllDonations(donationsRes.value.donations || []);
      if (requestsRes.status === 'fulfilled' && requestsRes.value.success)
        setPendingReqs((requestsRes.value.requests || []).filter((d: Donation) => d.status === 'pending'));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!authLoading && user) fetchAll(); }, [user, authLoading, fetchAll]);

  /* ── Action ── */
  const handleAction = async (donationId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(`${donationId}-${status}`);
    try {
      await apiFetch(`/dashboard/request/${donationId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setAllDonations(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
      setPendingReqs(prev => prev.filter(d => d._id !== donationId));
      if (selectedDonation?._id === donationId)
        setSelectedDonation(prev => prev ? { ...prev, status } : prev);
      setStats(prev => prev ? {
        ...prev,
        Pending_Donations:  Math.max(0, prev.Pending_Donations - 1),
        Accepted_Donations: status === 'accepted' ? prev.Accepted_Donations + 1 : prev.Accepted_Donations,
        Rejected_Donations: status === 'rejected' ? prev.Rejected_Donations + 1 : prev.Rejected_Donations,
      } : prev);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReminder = async () => {
    setCronLoading(true); setCronMessage(null);
    try {
      const res = await apiFetch('/cron/donationReminder');
      setCronMessage(res.message || '✅ تم إرسال التذكير بنجاح');
    } catch {
      setCronMessage('❌ فشل إرسال التذكير');
    } finally {
      setCronLoading(false);
      setTimeout(() => setCronMessage(null), 4000);
    }
  };

  /* ── Derived ── */
  const rejectedCount = stats ? Math.max(0, stats.Total_Donations - stats.Pending_Donations - stats.Accepted_Donations) : 0;

  const pieData = [
    { name: 'قيد المراجعة', value: stats?.Pending_Donations || 0, color: CHART_COLORS.pending },
    { name: 'مقبول',        value: stats?.Accepted_Donations || 0, color: CHART_COLORS.accepted },
    { name: 'مرفوض',        value: rejectedCount,                  color: CHART_COLORS.rejected },
  ].filter(d => d.value > 0);

  const stackedData = (() => {
    const map: Record<string, any> = {};
    allDonations.forEach(d => {
      const k = d.type || 'غير محدد';
      if (!map[k]) map[k] = { name: k, pending: 0, accepted: 0, rejected: 0 };
      map[k][d.status]++;
    });
    return Object.values(map).slice(0, 6);
  })();

  const timelineData = (() => {
    const m: Record<number, number> = {};
    for (let i = 0; i < 12; i++) m[i] = 0;
    allDonations.forEach(d => { if (d.createdAt) m[new Date(d.createdAt).getMonth()]++; });
    return MONTHS_AR.map((month, i) => ({ month: month.slice(0, 3), count: m[i] }));
  })();

  const filteredDonations = allDonations.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    const q = searchQ.trim(); if (!q) return true;
    return d.type.includes(q) || parseDonor(d.donorId).name.includes(q);
  });

  /* ━━━━━━━━━━━━━━━━━━━━ RENDER ━━━━━━━━━━━━━━━━━━━━ */
  if (authLoading || loading) return <PageLoader text="جاري تحميل البيانات…" />;
  if (selectedDonation) return (
    <DonationDetail
      donation={selectedDonation}
      onBack={() => setSelectedDonation(null)}
      onAction={handleAction}
      actionLoading={actionLoading}
    />
  );

  const charityName    = user?.userName || 'الجمعية';
  const charityInitial = charityName[0]?.toUpperCase() || 'ج';
  const today          = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      {showReport && (
        <ReportModal onClose={() => setShowReport(false)} charityToken={user?.token || ''} />
      )}

      <div className="cd-root">
        {/* ════════ HEADER ════════ */}
        <header className="cd-header">
          <div className="cd-header-left">
            <div className="cd-brand-ico">
              <i className="ti ti-building-community" />
            </div>
            <span className="cd-brand-name">لوحة تحكم الجمعية</span>
            <button className="cd-ai-badge" onClick={() => setTab('chat')}>
              <span className="cd-ai-dot" /> مساعد عطاء
            </button>
          </div>
          <div className="cd-header-right">
            {/* زر الإبلاغ */}
            <button
              className="cd-icon-btn"
              onClick={() => setShowReport(true)}
              title="إبلاغ عن مشكلة"
              style={{ borderColor: 'var(--red-bd)', color: 'var(--red)' }}
            >
              <i className="ti ti-alert-triangle" style={{ color: '#ef4444' }} />
            </button>
            <button className="cd-icon-btn" onClick={fetchAll} title="تحديث">
              <i className="ti ti-refresh" />
            </button>
            <button className="cd-avatar-btn" onClick={() => setLocation('/settings')}>
              {charityInitial}
            </button>
          </div>
        </header>

        {/* ════════ HERO ════════ */}
        <div className="cd-hero">
          <div className="cd-hero-inner">
            <div className="cd-hero-left">
              <div className="cd-hero-av">{charityInitial}</div>
              <div>
                <div className="cd-hero-name">أهلاً، {charityName} 🏛️</div>
                <div className="cd-hero-sub">{today}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div className="cd-date-pill">
                <i className="ti ti-calendar" /> {today}
              </div>
              {pendingReqs.length > 0 && (
                <div className="cd-pending-badge" style={{ cursor: 'pointer' }} onClick={() => setTab('requests')}>
                  <i className="ti ti-clock" /> {pendingReqs.length} طلب معلق
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ════════ TABS ════════ */}
        <div className="cd-tabs-bar">
          {([
            { key: 'stats',     label: 'الإحصائيات',       icon: 'ti-chart-pie'          },
            { key: 'donations', label: 'كل التبرعات',      icon: 'ti-packages'            },
            { key: 'requests',  label: 'الطلبات المعلقة',  icon: 'ti-clock-exclamation'   },
            { key: 'chat',      label: 'مساعد عطاء',       icon: 'ti-robot'               },
          ] as const).map(t => (
            <button
              key={t.key}
              className={`cd-tab${tab === t.key ? ' active' : ''}${t.key === 'chat' ? ' cd-tab--chat' : ''}`}
              onClick={() => setTab(t.key)}
              style={tab === t.key && t.key === 'chat' ? { background: 'var(--br)' } : {}}
            >
              <i className={`ti ${t.icon}`} />
              {t.label}
              {t.key === 'requests' && pendingReqs.length > 0 && (
                <span className="cd-tab-badge">{pendingReqs.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════ CONTENT ════════ */}
        <div className="cd-content">
          {error && (
            <div className="cd-alert cd-alert--error">
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          {/* ══ STATS TAB ══ */}
          {tab === 'stats' && (
            <>
              <div className="cd-stats-grid">
                {[
                  { label: 'إجمالي التبرعات', val: stats?.Total_Donations    || 0, icon: 'ti-packages',     color: '#10b981', bg: '#ecfdf5' },
                  { label: 'قيد المراجعة',    val: stats?.Pending_Donations  || 0, icon: 'ti-clock',        color: '#f59e0b', bg: '#fffbeb' },
                  { label: 'مقبولة',           val: stats?.Accepted_Donations || 0, icon: 'ti-circle-check', color: '#10b981', bg: '#ecfdf5' },
                  { label: 'مرفوضة',           val: rejectedCount,                  icon: 'ti-circle-x',    color: '#ef4444', bg: '#fef2f2' },
                ].map(s => (
                  <div key={s.label} className="cd-stat-card">
                    <div className="cd-stat-ico-wrap" style={{ background: s.bg }}>
                      <i className={`ti ${s.icon}`} style={{ color: s.color }} />
                    </div>
                    <div className="cd-stat-num" style={{ color: s.color }}>{s.val}</div>
                    <div className="cd-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="cd-charts-row">
                <div className="cd-card">
                  <div className="cd-card-title"><i className="ti ti-chart-pie" /> توزيع الحالات</div>
                  {pieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                            {pieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="cd-legend">
                        {pieData.map(d => (
                          <div key={d.name} className="cd-legend-item">
                            <span className="cd-legend-dot" style={{ background: d.color }} />{d.name}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : <div className="cd-chart-empty">لا توجد بيانات</div>}
                </div>

                <div className="cd-card">
                  <div className="cd-card-title"><i className="ti ti-chart-bar" /> أنواع التبرعات</div>
                  {stackedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={stackedData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={60} tick={{ fontFamily: 'Tajawal', fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="pending"  fill="#f59e0b" radius={[0,4,4,0]} />
                        <Bar dataKey="accepted" fill="#10b981" radius={[0,4,4,0]} />
                        <Bar dataKey="rejected" fill="#ef4444" radius={[0,4,4,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <div className="cd-chart-empty">لا توجد بيانات</div>}
                </div>
              </div>

              <div className="cd-timeline-row">
                <div className="cd-card">
                  <div className="cd-card-title"><i className="ti ti-chart-line" /> التبرعات عبر الزمن</div>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontFamily: 'Tajawal', fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="cd-card">
                  <div className="cd-card-title"><i className="ti ti-settings-automation" /> مركز الأتمتة</div>
                  <div className="cd-auto-title">تذكير التبرعات التلقائي</div>
                  <div className="cd-auto-desc">يرسل تذكيراً للجمعيات بالتبرعات المعلقة</div>
                  {cronMessage && (
                    <div className={`cd-alert ${cronMessage.includes('✅') ? 'cd-alert--success' : 'cd-alert--error'}`} style={{ marginTop: 10 }}>
                      {cronMessage}
                    </div>
                  )}
                  <button
                    className={`cd-cron-btn ${cronLoading ? 'cd-cron-btn--off' : 'cd-cron-btn--on'}`}
                    onClick={handleReminder}
                    disabled={cronLoading}
                  >
                    {cronLoading
                      ? <><span className="cd-spinner" /> جاري…</>
                      : <><i className="ti ti-send" /> تشغيل التذكير</>
                    }
                  </button>
                </div>
              </div>

              {allDonations.length > 0 && (
                <div className="cd-card">
                  <div className="cd-section-header">
                    <div className="cd-section-title">
                      <i className="ti ti-clock-record" /> آخر التبرعات
                    </div>
                    <button className="cd-view-btn" onClick={() => setTab('donations')}>
                      <i className="ti ti-eye" /> عرض الكل
                    </button>
                  </div>
                  <div className="cd-cards-grid">
                    {allDonations.slice(0, 4).map(d => (
                      <DonationCard key={d._id} d={d} onClick={() => setSelectedDonation(d)} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ══ DONATIONS TAB ══ */}
          {tab === 'donations' && (
            <div className="cd-card">
              <div className="cd-section-header">
                <div className="cd-section-title">
                  <i className="ti ti-clipboard-list" /> كل التبرعات
                  <span className="cd-section-meta">({filteredDonations.length})</span>
                </div>
                <div className="cd-filter-bar">
                  <div className="cd-search">
                    <i className="ti ti-search" />
                    <input
                      placeholder="بحث بالاسم أو النوع…"
                      value={searchQ}
                      onChange={e => setSearchQ(e.target.value)}
                    />
                  </div>
                  <div className="cd-filter-tabs">
                    {(['all', 'pending', 'accepted', 'rejected'] as const).map(s => (
                      <button
                        key={s}
                        className={`cd-filter-tab${statusFilter === s ? ' active' : ''}`}
                        onClick={() => setStatusFilter(s)}
                      >
                        {s === 'all' ? 'الكل' : STATUS_CFG[s].label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="cd-cards-grid">
                {filteredDonations.map(d => (
                  <DonationCard key={d._id} d={d} onClick={() => setSelectedDonation(d)} />
                ))}
              </div>

              {filteredDonations.length === 0 && (
                <div className="cd-empty">
                  <i className="ti ti-inbox" />
                  <p>لا توجد تبرعات مطابقة</p>
                </div>
              )}
            </div>
          )}

          {/* ══ REQUESTS TAB ══ */}
          {tab === 'requests' && (
            <div className="cd-card">
              <div className="cd-section-header">
                <div className="cd-section-title">
                  <i className="ti ti-clock-exclamation" /> الطلبات المعلقة
                  <span className="cd-section-meta">({pendingReqs.length})</span>
                </div>
                <button className="cd-view-btn" onClick={fetchAll}>
                  <i className="ti ti-refresh" /> تحديث
                </button>
              </div>

              {pendingReqs.length === 0 ? (
                <div className="cd-empty">
                  <i className="ti ti-inbox" />
                  <p>لا توجد طلبات معلقة 🎉</p>
                </div>
              ) : (
                <div className="cd-cards-grid">
                  {pendingReqs.map(d => {
                    const isAcc = actionLoading === `${d._id}-accepted`;
                    const isRej = actionLoading === `${d._id}-rejected`;
                    const busy  = isAcc || isRej;

                    return (
                      <DonationCard
                        key={d._id}
                        d={d}
                        actions={
                          <div style={{ display: 'flex', gap: 8, width: '100%', padding: '4px 0' }}>
                            <button
                              className="cd-btn-accept"
                              disabled={busy}
                              onClick={e => { e.stopPropagation(); handleAction(d._id, 'accepted'); }}
                              style={{ flex: 1 }}
                            >
                              {isAcc ? <><span className="cd-spinner" /> جاري</> : <><i className="ti ti-check" /> قبول</>}
                            </button>
                            <button
                              className="cd-btn-reject"
                              disabled={busy}
                              onClick={e => { e.stopPropagation(); handleAction(d._id, 'rejected'); }}
                              style={{ flex: 1 }}
                            >
                              {isRej ? <><span className="cd-spinner" /> جاري</> : <><i className="ti ti-x" /> رفض</>}
                            </button>
                            <button
                              className="cd-view-btn"
                              onClick={() => setSelectedDonation(d)}
                            >
                              <i className="ti ti-eye" />
                            </button>
                          </div>
                        }
                      />
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══ CHAT TAB ══ */}
          {tab === 'chat' && (
            <div className="cd-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="cd-section-header" style={{ padding: '14px 18px', borderBottom: '1.5px solid var(--bd)' }}>
                <div className="cd-section-title">
                  <i className="ti ti-robot" style={{ color: 'var(--br)' }} />
                  مساعد عطاء الذكي
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--t3)' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--br)', display: 'inline-block', animation: 'cd-blink 2.5s ease-in-out infinite' }} />
                  متصل
                </div>
              </div>
              <ChatPanel />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
