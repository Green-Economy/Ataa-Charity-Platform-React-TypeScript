import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation } from 'wouter';
import '../../styles/css/AdminPanel.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import AIChatEmbed from '../../components/shared/AIChatEmbed';
import {
  apiFetch, fetchPage,
  User, Charity, Report, Tab, ApprovalStatus,
  APPROVAL_CFG, ROLE_CFG,
  TEAL, TEAL2, AMBER, GREEN, RED, BORDER,
  fmt,
} from './adminTypes';

// ─── Nav items — chat tab removed from dashboard nav ──────────────────────────
const NAV_ITEMS: { id: Tab; label: string; icon: string }[] = [
  { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
  { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
  { id: 'charities',  label: 'الجمعيات',         icon: 'ti-building-community'  },
  { id: 'reports',    label: 'التقارير',         icon: 'ti-alert-circle'        },
  { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
];

// ─── Admin Topbar ─────────────────────────────────────────────────────────────
function AdminTopbar({ activeTab, onTabChange, userName, onLogout, pendingCount }: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  userName: string;
  onLogout: () => void;
  pendingCount: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [, navigate] = useLocation();

  // close menu on tab change
  const handleTabChange = (tab: Tab) => {
    onTabChange(tab);
    setMenuOpen(false);
  };

  return (
    <>
      <header className="ap-topbar">
        {/* Brand */}
        <div className="ap-topbar-brand">
          <div className="ap-topbar-brand-ico">
            <i className="ti ti-shield-check" />
          </div>
          <span className="ap-topbar-brand-title">لوحة التحكم</span>
        </div>

        {/* Desktop nav */}
        <nav className="ap-topbar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`ap-topbar-link${activeTab === item.id ? ' active' : ''}`}
              onClick={() => handleTabChange(item.id)}
            >
              <i className={`ti ${item.icon}`} />
              <span>{item.label}</span>
              {item.id === 'charities' && pendingCount > 0 && (
                <span className="ap-topbar-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ap-topbar-right">
          <div className="ap-topbar-user" title={userName}>
            {userName?.slice(0, 1).toUpperCase()}
          </div>
          <button
            className="ap-topbar-logout"
            onClick={() => navigate('/settings')}
            title="الإعدادات"
          >
            <i className="ti ti-settings" />
          </button>
          <button
            className="ap-topbar-logout"
            onClick={onLogout}
            title="تسجيل الخروج"
          >
            <i className="ti ti-logout" />
          </button>

          {/* Hamburger — mobile only */}
          <button
            className="ap-hamburger"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="القائمة"
          >
            <i className={`ti ${menuOpen ? 'ti-x' : 'ti-menu-2'}`} />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className="ap-mobile-overlay" onClick={() => setMenuOpen(false)} />
          <div className="ap-mobile-menu">
            <div className="ap-mobile-menu-header">
              <div className="ap-topbar-brand-ico" style={{ width: 32, height: 32 }}>
                <i className="ti ti-shield-check" style={{ fontSize: 16 }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-1)' }}>
                لوحة التحكم
              </span>
              <button
                className="ap-mobile-close"
                onClick={() => setMenuOpen(false)}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            <div className="ap-mobile-menu-user">
              <div className="ap-mobile-user-avatar">
                {userName?.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="ap-mobile-user-name">{userName}</div>
                <div className="ap-mobile-user-role">مسؤول النظام</div>
              </div>
            </div>

            <nav className="ap-mobile-nav">
              {NAV_ITEMS.map(item => (
                <button
                  key={item.id}
                  className={`ap-mobile-link${activeTab === item.id ? ' active' : ''}`}
                  onClick={() => handleTabChange(item.id)}
                >
                  <i className={`ti ${item.icon}`} />
                  <span>{item.label}</span>
                  {item.id === 'charities' && pendingCount > 0 && (
                    <span className="ap-topbar-badge">{pendingCount}</span>
                  )}
                  {activeTab === item.id && <i className="ti ti-chevron-left ap-mobile-active-arrow" />}
                </button>
              ))}
            </nav>

            <div className="ap-mobile-menu-footer">
              <button
                className="ap-mobile-settings-btn"
                onClick={() => { navigate('/settings'); setMenuOpen(false); }}
              >
                <i className="ti ti-settings" /> الإعدادات
              </button>
              <button className="ap-mobile-logout-btn" onClick={onLogout}>
                <i className="ti ti-logout" /> تسجيل الخروج
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// ─── Badges ───────────────────────────────────────────────────────────────────

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
  const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? {
    label: role, bg: '#f3f4f6', color: '#374151', icon: '',
  };
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

// ─── Confirm Modal ────────────────────────────────────────────────────────────

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
            <i
              className={`ti ${opts.icon ?? (isDanger ? 'ti-trash' : 'ti-check')}`}
              style={{ color: confirmBg }}
            />
          </div>
          <h3 className="ap-modal-title">{opts.title}</h3>
          <p className="ap-modal-msg">{opts.message}</p>
          <div className="ap-modal-actions">
            <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
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
            <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>
              إلغاء
            </button>
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
    form.address !== (target.address ?? '') ||
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
          address: form.address.trim(),
          description: form.description.trim(),
        }),
      });
      onSaved(target._id, form);
      showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
      onClose();
    } catch (err: unknown) {
      showMsg('error', (err instanceof Error ? err.message : null) || 'فشل التحديث');
    } finally { setLoading(null); }
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
            <div className="ap-form-group">
              <label className="ap-form-label">
                اسم الجمعية <span style={{ color: RED }}>*</span>
              </label>
              <input
                className={`ap-form-input${errors.charityName ? ' error' : ''}`}
                value={form.charityName}
                onChange={e => {
                  setForm(f => ({ ...f, charityName: e.target.value }));
                  setErrors(er => ({ ...er, charityName: '' }));
                }}
                placeholder="اسم الجمعية"
              />
              {errors.charityName && (
                <div className="ap-form-err">
                  <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />
                  {errors.charityName}
                </div>
              )}
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label">
                العنوان <span style={{ color: RED }}>*</span>
              </label>
              <input
                className={`ap-form-input${errors.address ? ' error' : ''}`}
                value={form.address}
                onChange={e => {
                  setForm(f => ({ ...f, address: e.target.value }));
                  setErrors(er => ({ ...er, address: '' }));
                }}
                placeholder="عنوان الجمعية"
              />
              {errors.address && (
                <div className="ap-form-err">
                  <i className="ti ti-alert-circle" style={{ fontSize: 13 }} />
                  {errors.address}
                </div>
              )}
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label">
                الوصف{' '}
                <span style={{ fontSize: 11, color: 'var(--text-4)', fontWeight: 400 }}>
                  (اختياري)
                </span>
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
            <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>
              إلغاء
            </button>
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

// ─── Skeleton components ──────────────────────────────────────────────────────

function ModalSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="ap-skel-avatar-row">
        <div className="ap-skel" style={{ width: 54, height: 54, borderRadius: 16, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="ap-skel" style={{ height: 15, width: 150 }} />
          <div className="ap-skel" style={{ height: 12, width: 200 }} />
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            <div className="ap-skel" style={{ height: 22, width: 64, borderRadius: 20 }} />
          </div>
        </div>
      </div>
      <div className="ap-detail-section">
        <div className="ap-skel" style={{ height: 32, width: '100%', borderRadius: 0 }} />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="ap-detail-row">
            <div className="ap-skel" style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0 }} />
            <div className="ap-skel" style={{ height: 12, width: 80 }} />
            <div className="ap-skel" style={{ height: 13, width: 140, marginRight: 'auto' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="ap-stats-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="ap-stat-card" style={{ gap: 10 }}>
            <div className="ap-skel" style={{ width: 40, height: 40, borderRadius: 12 }} />
            <div className="ap-skel" style={{ height: 28, width: 60 }} />
            <div className="ap-skel" style={{ height: 12, width: 100 }} />
          </div>
        ))}
      </div>
      <div className="ap-charts-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="ap-chart-card">
            <div className="ap-skel" style={{ height: 14, width: 120, marginBottom: 16 }} />
            <div className="ap-skel" style={{ height: 180, width: '100%', borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TableSkeleton({ cols = 5, rows = 5 }: { cols?: number; rows?: number }) {
  return (
    <div className="ap-table-wrap">
      <div className="ap-table-inner">
        <table className="ap-table">
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}><div className="ap-skel" style={{ height: 12, width: '70%' }} /></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((__, c) => (
                  <td key={c}>
                    <div className="ap-skel" style={{ height: 14, width: c === 0 ? 120 : 80 }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="ap-card-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="user-card" style={{ pointerEvents: 'none' }}>
          <div className="user-card-header">
            <div className="ap-skel" style={{ width: 44, height: 44, borderRadius: 14, flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="ap-skel" style={{ height: 14, width: '60%' }} />
              <div className="ap-skel" style={{ height: 11, width: '80%' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="ap-skel" style={{ height: 22, width: 60, borderRadius: 20 }} />
            <div className="ap-skel" style={{ height: 22, width: 70, borderRadius: 20 }} />
          </div>
          <div className="ap-skel" style={{ height: 11, width: '50%' }} />
        </div>
      ))}
    </div>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({ icon, label, value, mono, danger }: {
  icon: string; label: string; value: string; mono?: boolean; danger?: boolean;
}) {
  return (
    <div className="ap-detail-row">
      <div className="ap-detail-row-icon"><i className={`ti ${icon}`} /></div>
      <span className="ap-detail-row-label">{label}</span>
      <span className={`ap-detail-row-val${mono ? ' mono' : ''}${danger ? ' danger' : ''}`}>
        {value}
      </span>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
  return (
    <div className="ap-empty-state">
      <div className="ap-empty-icon"><i className={`ti ${icon}`} /></div>
      <div className="ap-empty-title">{title}</div>
      {desc && <div className="ap-empty-desc">{desc}</div>}
    </div>
  );
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="ap-error-banner">
      <div className="ap-error-banner-inner">
        <div className="ap-error-icon"><i className="ti ti-alert-triangle" /></div>
        <div style={{ flex: 1 }}>
          <div className="ap-error-title">حدث خطأ</div>
          <div className="ap-error-msg">{msg}</div>
        </div>
        <button className="retry-btn" onClick={onRetry}>
          <i className="ti ti-refresh" /> إعادة المحاولة
        </button>
      </div>
    </div>
  );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────

function ReportModal({ report, onClose }: {
  report: Report | null;
  onClose: () => void;
}) {
  if (!report) return null;
  const isCharity  = report.senderType === 'charity';
  const senderName = report.userName || report.charityName || '—';
  const iconColor  = isCharity ? TEAL2 : '#3b82f6';
  const iconBg     = isCharity ? '#ecfdf5' : '#eff6ff';
  const icon       = isCharity ? 'ti-building-community' : 'ti-user';
  const typeLabel  = isCharity ? 'جمعية خيرية' : 'مستخدم';

  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal ap-modal-wide">
        <div className="ap-detail-modal-head">
          <div className="ap-detail-modal-head-icon" style={{ background: '#FAEEDA' }}>
            <i className="ti ti-alert-triangle" style={{ color: '#f59e0b', fontSize: 18 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="ap-detail-modal-head-title">تفاصيل البلاغ</div>
            <div className="ap-detail-modal-head-sub">{fmt(report.createdAt)}</div>
          </div>
          <button className="ap-detail-modal-close" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="ap-detail-modal-body">
          <div className="ap-detail-sender-card" style={{ background: iconBg, borderColor: iconColor + '22' }}>
            <div className="ap-detail-sender-icon" style={{ color: iconColor }}>
              <i className={`ti ${icon}`} />
            </div>
            <div>
              <div className="ap-detail-sender-name">{senderName}</div>
              <div className="ap-detail-sender-type" style={{ color: iconColor }}>{typeLabel}</div>
            </div>
          </div>

          <div className="ap-detail-section">
            <div className="ap-detail-section-label">بيانات البلاغ</div>
            <DetailRow icon="ti-fingerprint" label="معرّف البلاغ" value={report._id} mono />
            <DetailRow icon="ti-user-circle" label="نوع المُبلِّغ" value={typeLabel} />
            <DetailRow icon="ti-calendar"    label="تاريخ الإرسال" value={fmt(report.createdAt)} />
          </div>

          <div className="ap-detail-section">
            <div className="ap-detail-section-label">نص البلاغ</div>
            <div className="ap-report-body">{report.description}</div>
          </div>
        </div>

        <div className="ap-detail-modal-foot">
          <button className="ap-detail-foot-btn" onClick={onClose}>
            <i className="ti ti-x" /> إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── User Modal ───────────────────────────────────────────────────────────────

function UserModal({ userId, onClose, onDelete }: {
  userId: string | null;
  onClose: () => void;
  onDelete: (id: string, name: string) => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!userId) { setUser(null); setError(false); return; }
    setBusy(true); setError(false);
    apiFetch(`/users/${userId}`)
      .then(res => setUser(res.user ?? res.data ?? res))
      .catch(() => setError(true))
      .finally(() => setBusy(false));
  }, [userId]);

  if (!userId) return null;
  const cfg      = user ? (ROLE_CFG[user.roleType] ?? ROLE_CFG.user) : null;
  const initials = user?.userName?.slice(0, 2).toUpperCase() ?? '..';
  const verified = user?.isVerified || user?.verify;

  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal ap-modal-wide">
        <div className="ap-detail-modal-head">
          <div className="ap-detail-modal-head-icon" style={{ background: '#EEF2FF' }}>
            <i className="ti ti-user" style={{ color: '#3730a3', fontSize: 18 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="ap-detail-modal-head-title">تفاصيل المستخدم</div>
            <div className="ap-detail-modal-head-sub">بيانات الحساب والمعلومات الشخصية</div>
          </div>
          <button className="ap-detail-modal-close" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="ap-detail-modal-body">
          {busy ? (
            <ModalSkeleton />
          ) : error ? (
            <EmptyState icon="ti-user-off" title="تعذّر تحميل بيانات المستخدم" desc="تحقق من اتصالك وحاول مجدداً" />
          ) : user ? (
            <>
              <div
                className="ap-detail-hero"
                style={{ background: cfg?.bg ?? '#f3f4f6', borderColor: (cfg?.color ?? '#374151') + '22' }}
              >
                <div
                  className="ap-detail-hero-avatar"
                  style={{ color: cfg?.color ?? '#374151' }}
                >
                  {initials}
                </div>
                <div className="ap-detail-hero-info">
                  <div className="ap-detail-hero-name">{user.userName}</div>
                  <div className="ap-detail-hero-email">{user.email}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    <RoleBadge role={user.roleType} />
                    <span
                      className="badge"
                      style={{
                        background: verified ? '#EAF3DE' : '#FCEBEB',
                        color: verified ? '#27500A' : '#791F1F',
                      }}
                    >
                      <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
                      {verified ? 'موثق' : 'غير موثق'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ap-detail-section">
                <div className="ap-detail-section-label">بيانات الحساب</div>
                <DetailRow icon="ti-fingerprint" label="المعرّف"     value={user._id}               mono />
                <DetailRow icon="ti-mail"        label="البريد"      value={user.email}                    />
                {user.phone   && <DetailRow icon="ti-phone"     label="الهاتف"    value={user.phone}       />}
                {user.address && <DetailRow icon="ti-map-pin"   label="العنوان"   value={user.address}     />}
                <DetailRow icon="ti-calendar"    label="تاريخ الإنشاء" value={fmt(user.createdAt)}         />
                {user.updatedAt && (
                  <DetailRow icon="ti-refresh" label="آخر تحديث" value={fmt(user.updatedAt)} />
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="ap-detail-modal-foot">
          <button className="ap-detail-foot-btn" onClick={onClose}>
            <i className="ti ti-x" /> إغلاق
          </button>
          {user && user.roleType !== 'admin' && (
            <button
              className="ap-detail-foot-btn ap-detail-foot-danger"
              onClick={() => { onClose(); onDelete(user._id, user.userName); }}
            >
              <i className="ti ti-trash" /> حذف المستخدم
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Charity Modal ────────────────────────────────────────────────────────────

function CharityModal({ charityId, onClose, onEdit, onDelete, onApprove, onReject, actionLoading }: {
  charityId: string | null;
  onClose: () => void;
  onEdit: (c: Charity) => void;
  onDelete: (id: string, name: string) => void;
  onApprove: (id: string, name: string) => void;
  onReject: (target: { id: string; name: string }) => void;
  actionLoading: string | null;
}) {
  const [charity, setCharity] = useState<Charity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!charityId) { setCharity(null); setError(false); return; }
    setBusy(true); setError(false);
    apiFetch(`/charity/${charityId}`)
      .then(res => setCharity(res.charity ?? res.data ?? res))
      .catch(() => setError(true))
      .finally(() => setBusy(false));
  }, [charityId]);

  if (!charityId) return null;
  const statusCfg = charity ? (APPROVAL_CFG[charity.approvalStatus] ?? APPROVAL_CFG.pending) : null;
  const initials  = charity?.charityName?.slice(0, 2).toUpperCase() ?? 'ج';

  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal ap-modal-wide">
        <div className="ap-detail-modal-head">
          <div className="ap-detail-modal-head-icon" style={{ background: '#ecfdf5' }}>
            <i className="ti ti-building-community" style={{ color: TEAL, fontSize: 18 }} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="ap-detail-modal-head-title">تفاصيل الجمعية</div>
            <div className="ap-detail-modal-head-sub">بيانات التسجيل والحالة</div>
          </div>
          <button className="ap-detail-modal-close" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        <div className="ap-detail-modal-body">
          {busy ? (
            <ModalSkeleton />
          ) : error ? (
            <EmptyState icon="ti-building-off" title="تعذّر تحميل بيانات الجمعية" desc="تحقق من اتصالك وحاول مجدداً" />
          ) : charity ? (
            <>
              <div
                className="ap-detail-hero"
                style={{
                  background: statusCfg?.bg ?? '#ecfdf5',
                  borderColor: (statusCfg?.dot ?? TEAL) + '22',
                }}
              >
                <div
                  className="ap-detail-hero-avatar"
                  style={{ color: statusCfg?.color ?? TEAL }}
                >
                  {initials}
                </div>
                <div className="ap-detail-hero-info">
                  <div className="ap-detail-hero-name">{charity.charityName}</div>
                  <div className="ap-detail-hero-email">{charity.email}</div>
                  <div style={{ marginTop: 4 }}>
                    <StatusBadge status={charity.approvalStatus} />
                  </div>
                </div>
              </div>

              <div className="ap-detail-section">
                <div className="ap-detail-section-label">بيانات الجمعية</div>
                <div className="ap-detail-grid-2">
                  {[
                    { icon: 'ti-map-pin',    label: 'العنوان',         value: charity.address        },
                    { icon: 'ti-calendar',   label: 'تاريخ الإنشاء',  value: fmt(charity.createdAt)  },
                    ...(charity.phone         ? [{ icon: 'ti-phone',       label: 'الهاتف',       value: charity.phone         }] : []),
                    ...(charity.licenseNumber ? [{ icon: 'ti-certificate', label: 'رقم الترخيص', value: charity.licenseNumber }] : []),
                  ].map(item => (
                    <div key={item.label} className="ap-detail-mini-card">
                      <div className="ap-detail-mini-label">
                        <i className={`ti ${item.icon}`} />
                        {item.label}
                      </div>
                      <div className="ap-detail-mini-value">{item.value || '—'}</div>
                    </div>
                  ))}
                </div>

                <div className="ap-detail-mini-card" style={{ gridColumn: '1/-1' }}>
                  <div className="ap-detail-mini-label">
                    <i className="ti ti-fingerprint" /> المعرّف
                  </div>
                  <div className="ap-detail-mini-value mono" style={{ fontSize: 12, direction: 'ltr' }}>
                    {charity._id}
                  </div>
                </div>

                {charity.description && (
                  <div className="ap-detail-description-card">
                    <div className="ap-detail-mini-label">
                      <i className="ti ti-info-circle" /> الوصف
                    </div>
                    <div className="ap-detail-mini-value">{charity.description}</div>
                  </div>
                )}

                {charity.rejectionReason && (
                  <div className="ap-detail-rejection-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: RED, fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                      <i className="ti ti-alert-circle" /> سبب الرفض
                    </div>
                    <div style={{ fontSize: 13.5, color: '#991b1b', lineHeight: 1.7 }}>
                      {charity.rejectionReason}
                    </div>
                  </div>
                )}
              </div>

              {charity.approvalStatus === 'pending' && (
                <div className="ap-detail-pending-actions">
                  <button
                    className="action-btn approve"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={!!actionLoading}
                    onClick={() => { onClose(); onApprove(charity._id, charity.charityName); }}
                  >
                    <i className="ti ti-check" />
                    {actionLoading === 'approve-' + charity._id ? 'جاري...' : 'موافقة'}
                  </button>
                  <button
                    className="action-btn reject"
                    style={{ flex: 1, justifyContent: 'center' }}
                    disabled={!!actionLoading}
                    onClick={() => { onClose(); onReject({ id: charity._id, name: charity.charityName }); }}
                  >
                    <i className="ti ti-x" /> رفض
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>

        {charity && (
          <div className="ap-detail-modal-foot">
            <button className="ap-detail-foot-btn" onClick={onClose}>
              <i className="ti ti-x" /> إغلاق
            </button>
            <button
              className="ap-detail-foot-btn"
              style={{ borderColor: TEAL2, color: TEAL2 }}
              onClick={() => { onClose(); onEdit(charity); }}
            >
              <i className="ti ti-edit" /> تعديل
            </button>
            <button
              className="ap-detail-foot-btn ap-detail-foot-danger"
              disabled={!!actionLoading}
              onClick={() => { onClose(); onDelete(charity._id, charity.charityName); }}
            >
              <i className="ti ti-trash" /> حذف
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({ icon, color, title, badge }: {
  icon: string; color: string; title: string; badge?: number;
}) {
  return (
    <div className="ap-section-title">
      <i className={`ti ${icon}`} style={{ color, fontSize: 16 }} />
      {title}
      {badge != null && badge > 0 && (
        <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
      )}
    </div>
  );
}

const tooltipStyle = {
  background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 9,
  padding: '8px 14px', fontSize: 13, fontFamily: 'Tajawal, sans-serif',
  direction: 'rtl' as const,
};

// ─── CronCard ─────────────────────────────────────────────────────────────────

function CronCard({ icon, iconBg, iconColor, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: {
  icon: string; iconBg: string; iconColor: string;
  title: string; desc: string; code: string;
  codeBg: string; codeBorder: string; codeColor: string;
  loading: boolean; btnColor: string; onRun: () => void;
}) {
  return (
    <div className="cron-card">
      <div className="cron-icon-wrap" style={{ background: iconBg }}>
        <i className={`ti ${icon}`} style={{ color: iconColor, fontSize: 22 }} />
      </div>
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

// ─── Search Box ───────────────────────────────────────────────────────────────

function SearchBox({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="ap-tab-search-box">
      <i className="ti ti-search" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button className="ap-tab-search-clear" onClick={() => onChange('')}>
          <i className="ti ti-x" style={{ fontSize: 12 }} />
        </button>
      )}
    </div>
  );
}

// ─── View Toggle ──────────────────────────────────────────────────────────────

function ViewToggle({ view, onChange }: {
  view: 'table' | 'cards';
  onChange: (v: 'table' | 'cards') => void;
}) {
  return (
    <div className="view-toggle">
      <button
        className={`view-toggle-btn${view === 'table' ? ' active' : ''}`}
        onClick={() => onChange('table')}
      >
        <i className="ti ti-layout-rows" /><span>جدول</span>
      </button>
      <button
        className={`view-toggle-btn${view === 'cards' ? ' active' : ''}`}
        onClick={() => onChange('cards')}
      >
        <i className="ti ti-layout-grid" /><span>بطاقات</span>
      </button>
    </div>
  );
}

// ─── Load More Button ─────────────────────────────────────────────────────────

function LoadMoreBtn({ loading, remaining, onClick }: {
  loading: boolean; remaining: number; onClick: () => void;
}) {
  return (
    <div className="load-more-wrap">
      <button className="load-more-btn" disabled={loading} onClick={onClick}>
        {loading
          ? <><i className="ti ti-loader-2 ti-spin" />جاري التحميل...</>
          : <><i className="ti ti-chevron-down" />تحميل المزيد{remaining > 0 ? ` (${remaining} متبقي)` : ''}</>
        }
      </button>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { user, isLoading, logout } = useAuth() as any;
  const [location] = useLocation();

  const initialTab = (new URLSearchParams(location.split('?')[1] || '').get('tab') as Tab) || 'overview';
  const [tab, setTab] = useState<Tab>(initialTab);

  // ── Search states ──────────────────────────────────────────────────────────
  const [usersSearch,     setUsersSearch]     = useState('');
  const [charitiesSearch, setCharitiesSearch] = useState('');
  const [reportsSearch,   setReportsSearch]   = useState('');
  const [usersQ,          setUsersQ]          = useState('');
  const [charitiesQ,      setCharitiesQ]      = useState('');
  const [reportsQ,        setReportsQ]        = useState('');

  const usersDebRef     = useRef<ReturnType<typeof setTimeout>>();
  const charitiesDebRef = useRef<ReturnType<typeof setTimeout>>();
  const reportsDebRef   = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(usersDebRef.current);
    usersDebRef.current = setTimeout(() => setUsersQ(usersSearch.trim().toLowerCase()), 300);
  }, [usersSearch]);

  useEffect(() => {
    clearTimeout(charitiesDebRef.current);
    charitiesDebRef.current = setTimeout(() => setCharitiesQ(charitiesSearch.trim().toLowerCase()), 300);
  }, [charitiesSearch]);

  useEffect(() => {
    clearTimeout(reportsDebRef.current);
    reportsDebRef.current = setTimeout(() => setReportsQ(reportsSearch.trim().toLowerCase()), 300);
  }, [reportsSearch]);

  // ── UI states ──────────────────────────────────────────────────────────────
  const [charityFilter, setCharityFilter] = useState<'all' | ApprovalStatus>('all');
  const [userView,      setUserView]      = useState<'table' | 'cards'>('cards');
  const [charityView,   setCharityView]   = useState<'table' | 'cards'>('cards');

  // ── Data ───────────────────────────────────────────────────────────────────
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

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [msg,           setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
  const [confirmBusy,   setConfirmBusy]   = useState(false);
  const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
  const [editTarget,    setEditTarget]    = useState<Charity | null>(null);
  const [userModalId,   setUserModalId]   = useState<string | null>(null);
  const [charModalId,   setCharModalId]   = useState<string | null>(null);
  const [reportModal,   setReportModal]   = useState<Report | null>(null);

  const [cronLoading, setCronLoading] = useState(false);
  const [cronLog,     setCronLog]     = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
  const [lastRun,     setLastRun]     = useState(0);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3200);
  };

  const confirm = (opts: ConfirmState) => setConfirmOpts(opts);

  // ── Load data ──────────────────────────────────────────────────────────────
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
        fetchPage<Report>('/report/allReports', 1, 10),
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
    } catch (err: unknown) {
      const m = (err instanceof Error ? err.message : null) || 'فشل تحميل البيانات';
      setPageError(m);
      if ((err as { status?: number })?.status === 401) setTimeout(() => logout?.(), 2000);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (user?.roleType === 'admin') loadData();
  }, [user, loadData]);

  // ── Load more ──────────────────────────────────────────────────────────────
  const loadMoreUsers = async () => {
    const next = usersPage + 1;
    setLoadingMore('users');
    try {
      const res = await fetchPage<User>('/users', next, 10);
      if (!res.data.length) { setHasMoreUsers(false); return; }
      setUsers(prev => {
        const ids = new Set(prev.map(u => u._id));
        return [...prev, ...res.data.filter(u => !ids.has(u._id))];
      });
      setUsersPage(next);
      setHasMoreUsers(res.hasMore);
    } finally { setLoadingMore(null); }
  };

  const loadMoreCharities = async () => {
    const next = charitiesPage + 1;
    setLoadingMore('charities');
    try {
      const res = await fetchPage<Charity>('/charity/charities', next, 10);
      if (!res.data.length) { setHasMoreCharities(false); return; }
      setCharities(prev => {
        const ids = new Set(prev.map(c => c._id));
        return [...prev, ...res.data.filter(c => !ids.has(c._id))];
      });
      setCharitiesPage(next);
      setHasMoreCharities(res.hasMore);
    } finally { setLoadingMore(null); }
  };

  const loadMoreReports = async () => {
    const next = reportsPage + 1;
    setLoadingMore('reports');
    try {
      const res = await fetchPage<Report>('/report/allReports', next, 10);
      if (!res.data.length) { setHasMoreReports(false); return; }
      setReports(prev => {
        const ids = new Set(prev.map(r => r._id));
        return [...prev, ...res.data.filter(r => !ids.has(r._id))];
      });
      setReportsPage(next);
      setHasMoreReports(res.hasMore);
    } finally { setLoadingMore(null); }
  };

  // ── User actions ───────────────────────────────────────────────────────────
  const handleDeleteUser = (id: string, name: string) => {
    confirm({
      title: `حذف المستخدم "${name}"`,
      message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيًا.',
      confirmLabel: 'حذف', variant: 'danger', icon: 'ti-trash',
      onConfirm: async () => {
        setConfirmBusy(true);
        try {
          await apiFetch(`/users/${id}`, { method: 'DELETE' });
          await loadData();
          showMsg('success', `تم حذف "${name}"`);
          setConfirmOpts(null);
        } catch (e: unknown) {
          showMsg('error', (e instanceof Error ? e.message : null) || 'حدث خطأ');
        } finally { setConfirmBusy(false); }
      },
    });
  };

  // ── Charity actions ────────────────────────────────────────────────────────
  const handleApprove = async (id: string, name: string) => {
    setActionLoading('approve-' + id);
    try {
      await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
      await loadData();
      showMsg('success', `تمت الموافقة على "${name}"`);
    } catch (e: unknown) {
      showMsg('error', (e instanceof Error ? e.message : null) || 'حدث خطأ');
    } finally { setActionLoading(null); }
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
      await loadData();
      showMsg('success', `تم رفض "${name}"`);
    } catch (e: unknown) {
      showMsg('error', (e instanceof Error ? e.message : null) || 'حدث خطأ');
    } finally { setActionLoading(null); setRejectTarget(null); }
  };

  const handleEditSaved = async () => { await loadData(); };

  const handleDeleteCharity = (id: string, name: string) => {
    confirm({
      title: `حذف جمعية "${name}"`,
      message: 'هذا الإجراء لا يمكن التراجع عنه.',
      confirmLabel: 'حذف', variant: 'danger', icon: 'ti-trash',
      onConfirm: async () => {
        setConfirmBusy(true);
        try {
          await apiFetch(`/charity/${id}`, { method: 'DELETE' });
          await loadData();
          showMsg('success', `تم حذف "${name}"`);
          setConfirmOpts(null);
        } catch (e: unknown) {
          showMsg('error', (e instanceof Error ? e.message : null) || 'حدث خطأ');
        } finally { setConfirmBusy(false); }
      },
    });
  };

  // ── Cron ──────────────────────────────────────────────────────────────────
  const runAdminReport = async () => {
    if (Date.now() - lastRun < 30_000) {
      showMsg('error', 'انتظر 30 ثانية قبل إعادة التشغيل');
      return;
    }
    setCronLoading(true);
    try {
      await apiFetch('/cron/adminReport');
      setLastRun(Date.now());
      setCronLog(prev => [{
        type: 'success', text: 'تم تشغيل تقرير الأدمن بنجاح',
        time: new Date().toLocaleTimeString('ar-EG'),
      }, ...prev]);
    } catch (err: unknown) {
      setCronLog(prev => [{
        type: 'error',
        text: (err instanceof Error ? err.message : null) || 'فشل التشغيل',
        time: new Date().toLocaleTimeString('ar-EG'),
      }, ...prev]);
    } finally { setCronLoading(false); }
  };

  const runDonationReminder = async () => {
    setCronLoading(true);
    try {
      await apiFetch('/cron/donationReminder');
      setCronLog(prev => [{
        type: 'success', text: 'تم إرسال تذكيرات التبرعات',
        time: new Date().toLocaleTimeString('ar-EG'),
      }, ...prev]);
    } catch (err: unknown) {
      setCronLog(prev => [{
        type: 'error',
        text: (err instanceof Error ? err.message : null) || 'فشل التشغيل',
        time: new Date().toLocaleTimeString('ar-EG'),
      }, ...prev]);
    } finally { setCronLoading(false); }
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const filteredUsers = users.filter(u => {
    if (!usersQ) return true;
    return (
      u._id?.toLowerCase().includes(usersQ) ||
      u.userName?.toLowerCase().includes(usersQ) ||
      u.email?.toLowerCase().includes(usersQ) ||
      u.roleType?.includes(usersQ)
    );
  });

  const filteredCharities = charities.filter(c => {
    if (charityFilter !== 'all' && c.approvalStatus !== charityFilter) return false;
    if (!charitiesQ) return true;
    return (
      c._id?.toLowerCase().includes(charitiesQ) ||
      c.charityName?.toLowerCase().includes(charitiesQ) ||
      c.email?.toLowerCase().includes(charitiesQ)
    );
  });

  const filteredReports = reports.filter(r => {
    if (!reportsQ) return true;
    return (
      r._id?.toLowerCase().includes(reportsQ) ||
      r.description?.toLowerCase().includes(reportsQ) ||
      r.userName?.toLowerCase().includes(reportsQ) ||
      r.charityName?.toLowerCase().includes(reportsQ) ||
      r.senderType?.toLowerCase().includes(reportsQ)
    );
  });

  const pendingCharities = charities.filter(c => c.approvalStatus === 'pending');

  const sortedCharities = [...filteredCharities].sort((a, b) => {
    const o: Record<string, number> = { pending: 0, approved: 1, rejected: 2 };
    return (o[a.approvalStatus] ?? 1) - (o[b.approvalStatus] ?? 1);
  });

  const overviewBarData = [
    { name: 'المستخدمون', value: usersTotal     || users.length,     fill: '#3b82f6' },
    { name: 'الجمعيات',   value: charitiesTotal || charities.length, fill: TEAL2    },
    { name: 'التقارير',   value: reportsTotal   || reports.length,   fill: AMBER    },
  ];

  const charityPieData = [
    { name: 'معلقة',   value: charities.filter(c => c.approvalStatus === 'pending').length,  color: AMBER },
    { name: 'مقبولة',  value: charities.filter(c => c.approvalStatus === 'approved').length, color: GREEN },
    { name: 'مرفوضة', value: charities.filter(c => c.approvalStatus === 'rejected').length,  color: RED   },
  ].filter(d => d.value > 0);

  const rolePieData = [
    { name: 'متبرعون', value: users.filter(u => u.roleType === 'user').length,    color: '#3b82f6' },
    { name: 'جمعيات',  value: users.filter(u => u.roleType === 'charity').length, color: TEAL2    },
    { name: 'أدمن',    value: users.filter(u => u.roleType === 'admin').length,   color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const usersRemaining     = Math.max(0, usersTotal - users.length);
  const charitiesRemaining = Math.max(0, charitiesTotal - charities.length);

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="ap-loading-center">
      <div className="ap-spinner">
        <div className="ap-spinner-dot" />
        <div className="ap-spinner-dot" />
        <div className="ap-spinner-dot" />
      </div>
      <span>جاري التحقق من الصلاحيات...</span>
    </div>
  );

  if (!user || user.roleType !== 'admin') return (
    <div className="ap-unauthorized">
      <i className="ti ti-lock" />
      <h2>غير مصرح بالوصول</h2>
      <p>هذه الصفحة للمسؤولين فقط</p>
      <Link href="/" className="btn-primary">العودة للرئيسية</Link>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="admin-panel-layout">
      <Toast msg={msg} />

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
      <UserModal
        userId={userModalId}
        onClose={() => setUserModalId(null)}
        onDelete={handleDeleteUser}
      />
      <CharityModal
        charityId={charModalId}
        onClose={() => setCharModalId(null)}
        onEdit={c => setEditTarget(c)}
        onDelete={handleDeleteCharity}
        onApprove={handleApprove}
        onReject={t => setRejectTarget(t)}
        actionLoading={actionLoading}
      />
      <ReportModal report={reportModal} onClose={() => setReportModal(null)} />

      <AdminTopbar
        activeTab={tab}
        onTabChange={setTab}
        userName={user.userName}
        onLogout={logout}
        pendingCount={pendingCharities.length}
      />

      <main className="admin-panel-main">
        {pageError && <ErrorBanner msg={pageError} onRetry={loadData} />}

        {loading ? <PageSkeleton /> : (
          <>
            {/* ══ OVERVIEW ══ */}
            {tab === 'overview' && (
              <div className="ap-tab-content">
                {/* Stats */}
                <div className="ap-stats-grid">
                  {[
                    { label: 'إجمالي المستخدمين', value: usersTotal     || users.length,     icon: 'ti-users',              color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'إجمالي الجمعيات',   value: charitiesTotal || charities.length, icon: 'ti-building-community', color: TEAL2,     bg: '#ecfdf5' },
                    { label: 'إجمالي التقارير',   value: reportsTotal   || reports.length,   icon: 'ti-alert-circle',       color: AMBER,     bg: '#fffbeb' },
                    { label: 'بانتظار الموافقة',  value: pendingCharities.length,            icon: 'ti-clock-exclamation',  color: RED,       bg: '#fef2f2' },
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
                          <Legend iconType="circle" iconSize={9} formatter={(v: string) => (
                            <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>
                          )} />
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
                          <Legend iconType="circle" iconSize={9} formatter={(v: string) => (
                            <span style={{ fontSize: 12, fontFamily: 'Tajawal, sans-serif' }}>{v}</span>
                          )} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Pending charities table */}
                {pendingCharities.length > 0 && (
                  <div className="ap-chart-card">
                    <div className="ap-section-header">
                      <SectionTitle icon="ti-clock-exclamation" color={AMBER} title="بانتظار الموافقة" badge={pendingCharities.length} />
                      <button
                        className="ap-view-all-btn"
                        onClick={() => setTab('charities')}
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
                              <tr key={c._id} className="ap-table-row-pending">
                                <td><strong style={{ color: TEAL }}>{c.charityName}</strong></td>
                                <td className="ap-td-muted">{c.email}</td>
                                <td className="ap-td-muted">{fmt(c.createdAt)}</td>
                                <td>
                                  <div className="ap-table-actions">
                                    <button
                                      className="action-btn approve"
                                      disabled={!!actionLoading}
                                      onClick={() => handleApprove(c._id, c.charityName)}
                                    >
                                      <i className="ti ti-check" />
                                      {actionLoading === 'approve-' + c._id ? '...' : 'موافقة'}
                                    </button>
                                    <button
                                      className="action-btn reject"
                                      disabled={!!actionLoading}
                                      onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}
                                    >
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

            {/* ══ USERS ══ */}
            {tab === 'users' && (
              <div className="ap-tab-content">
                <div className="ap-section-header">
                  <div className="ap-section-title">
                    <i className="ti ti-users" style={{ color: '#3b82f6' }} />
                    المستخدمون
                    <span className="ap-count-badge" style={{ background: '#3b82f6' }}>
                      {usersTotal || users.length}
                    </span>
                    {users.length < usersTotal && (
                      <span className="ap-showing-hint">(يعرض {users.length})</span>
                    )}
                  </div>
                  <div className="ap-section-controls">
                    <SearchBox
                      value={usersSearch}
                      onChange={setUsersSearch}
                      placeholder="بحث بالاسم أو البريد..."
                    />
                    <ViewToggle view={userView} onChange={setUserView} />
                  </div>
                </div>

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
                            <tr key={u._id} onClick={() => setUserModalId(u._id)} style={{ cursor: 'pointer' }}>
                              <td><strong>{u.userName}</strong></td>
                              <td className="ap-td-muted">{u.email}</td>
                              <td className="ap-td-muted">{u.phone || '—'}</td>
                              <td><RoleBadge role={u.roleType} /></td>
                              <td>
                                <span
                                  className="ap-verified-badge"
                                  style={{ color: (u.isVerified || u.verify) ? GREEN : RED }}
                                >
                                  <i className={`ti ${(u.isVerified || u.verify) ? 'ti-circle-check' : 'ti-circle-x'}`} />
                                  {(u.isVerified || u.verify) ? 'موثق' : 'غير موثق'}
                                </span>
                              </td>
                              <td className="ap-td-dim">{fmt(u.createdAt)}</td>
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

                {userView === 'cards' && (
                  filteredUsers.length === 0 ? (
                    <EmptyState icon="ti-users-minus" title="لا توجد نتائج" desc="جرب تغيير كلمة البحث" />
                  ) : (
                    <div className="ap-card-grid">
                      {filteredUsers.map(u => {
                        const cfg = ROLE_CFG[u.roleType] ?? ROLE_CFG.user;
                        const verified = u.isVerified || u.verify;
                        return (
                          <div key={u._id} className="user-card" onClick={() => setUserModalId(u._id)}>
                            <div className="user-card-header">
                              <div className="user-avatar" style={{ background: cfg.color }}>
                                {u.userName?.slice(0, 2).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div className="user-card-name">{u.userName}</div>
                                <div className="user-card-email">{u.email}</div>
                              </div>
                            </div>
                            <div className="user-card-badges">
                              <RoleBadge role={u.roleType} />
                              <span
                                className="badge"
                                style={{
                                  background: verified ? '#EAF3DE' : '#FCEBEB',
                                  color: verified ? '#27500A' : '#791F1F',
                                }}
                              >
                                <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
                                {verified ? 'موثق' : 'غير موثق'}
                              </span>
                            </div>
                            {u.phone && (
                              <div className="user-card-meta">
                                <i className="ti ti-phone" />{u.phone}
                              </div>
                            )}
                            <div className="user-card-meta">
                              <i className="ti ti-calendar" />{fmt(u.createdAt)}
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

                {hasMoreUsers && (
                  <LoadMoreBtn
                    loading={loadingMore === 'users'}
                    remaining={usersRemaining}
                    onClick={loadMoreUsers}
                  />
                )}
              </div>
            )}

            {/* ══ CHARITIES ══ */}
            {tab === 'charities' && (
              <div className="ap-tab-content">
                {/* Summary filter cards */}
                <div className="charity-summary-grid">
                  {[
                    { id: 'all',      label: 'الكل',    value: charitiesTotal || charities.length,                            color: TEAL2, bg: '#ecfdf5' },
                    { id: 'pending',  label: 'معلقة',   value: charities.filter(c => c.approvalStatus === 'pending').length,  color: AMBER, bg: '#fffbeb' },
                    { id: 'approved', label: 'مقبولة',  value: charities.filter(c => c.approvalStatus === 'approved').length, color: GREEN, bg: '#f0fdf4' },
                    { id: 'rejected', label: 'مرفوضة', value: charities.filter(c => c.approvalStatus === 'rejected').length,  color: RED,   bg: '#fef2f2' },
                  ].map(s => (
                    <div
                      key={s.id}
                      className={`charity-summary-card${charityFilter === s.id ? ' active' : ''}`}
                      style={{ background: s.bg, color: s.color }}
                      onClick={() => setCharityFilter(s.id as 'all' | ApprovalStatus)}
                    >
                      <div className="charity-summary-value">{s.value}</div>
                      <div className="charity-summary-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="ap-section-header">
                  <div className="ap-section-title">
                    <i className="ti ti-building-community" style={{ color: TEAL2 }} />
                    الجمعيات
                    <span className="ap-count-badge" style={{ background: TEAL2 }}>
                      {charitiesTotal || charities.length}
                    </span>
                    {charities.length < charitiesTotal && (
                      <span className="ap-showing-hint">(يعرض {charities.length})</span>
                    )}
                  </div>
                  <div className="ap-section-controls">
                    <SearchBox
                      value={charitiesSearch}
                      onChange={setCharitiesSearch}
                      placeholder="بحث بالاسم أو البريد..."
                    />
                    <ViewToggle view={charityView} onChange={setCharityView} />
                  </div>
                </div>

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
                              className={c.approvalStatus === 'pending' ? 'ap-table-row-pending' : ''}
                              style={{ cursor: 'pointer' }}
                              onClick={() => setCharModalId(c._id)}
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
                              <td className="ap-td-muted">{c.email}</td>
                              <td className="ap-td-muted">{c.phone || '—'}</td>
                              <td className="ap-td-truncate" title={c.address}>{c.address || '—'}</td>
                              <td><StatusBadge status={c.approvalStatus} /></td>
                              <td className="ap-td-dim">{fmt(c.createdAt)}</td>
                              <td onClick={e => e.stopPropagation()}>
                                <div className="ap-table-actions">
                                  <button
                                    className="action-btn edit"
                                    disabled={!!actionLoading}
                                    onClick={() => setEditTarget(c)}
                                  >
                                    <i className="ti ti-edit" />تعديل
                                  </button>
                                  {c.approvalStatus === 'pending' && (
                                    <>
                                      <button
                                        className="action-btn approve"
                                        disabled={!!actionLoading}
                                        onClick={() => handleApprove(c._id, c.charityName)}
                                      >
                                        <i className="ti ti-check" />
                                        {actionLoading === 'approve-' + c._id ? '...' : 'موافقة'}
                                      </button>
                                      <button
                                        className="action-btn reject"
                                        disabled={!!actionLoading}
                                        onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}
                                      >
                                        <i className="ti ti-x" />رفض
                                      </button>
                                    </>
                                  )}
                                  <button
                                    className="action-btn delete"
                                    disabled={!!actionLoading}
                                    onClick={() => handleDeleteCharity(c._id, c.charityName)}
                                  >
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

                {charityView === 'cards' && (
                  sortedCharities.length === 0 ? (
                    <EmptyState icon="ti-building-off" title="لا توجد جمعيات" desc="جرب تغيير الفلتر أو كلمة البحث" />
                  ) : (
                    <div className="ap-card-grid charity">
                      {sortedCharities.map(c => {
                        const sCfg = APPROVAL_CFG[c.approvalStatus] ?? APPROVAL_CFG.pending;
                        return (
                          <div key={c._id} className="charity-card" onClick={() => setCharModalId(c._id)}>
                            <div className="status-stripe" style={{ background: sCfg.dot }} />
                            <div className="charity-card-header">
                              <div style={{ flex: 1, overflow: 'hidden' }}>
                                <Link
                                  href={`/charities/${c._id}`}
                                  className="charity-card-name"
                                  onClick={e => e.stopPropagation()}
                                >
                                  {c.charityName}
                                </Link>
                                <div className="charity-card-email">{c.email}</div>
                              </div>
                              <StatusBadge status={c.approvalStatus} />
                            </div>
                            <div className="charity-card-info">
                              {c.phone && <div className="charity-info-row"><i className="ti ti-phone" />{c.phone}</div>}
                              <div className="charity-info-row"><i className="ti ti-map-pin" />{c.address || '—'}</div>
                              {c.licenseNumber && <div className="charity-info-row"><i className="ti ti-certificate" />{c.licenseNumber}</div>}
                              <div className="charity-info-row"><i className="ti ti-calendar" />{fmt(c.createdAt)}</div>
                            </div>
                            {c.description && <p className="charity-card-desc">{c.description}</p>}
                            {c.rejectionReason && (
                              <div className="charity-rejection-reason">
                                <strong>سبب الرفض:</strong> {c.rejectionReason}
                              </div>
                            )}
                            <div className="charity-card-actions" onClick={e => e.stopPropagation()}>
                              <button
                                className="action-btn edit"
                                disabled={!!actionLoading}
                                onClick={() => setEditTarget(c)}
                              >
                                <i className="ti ti-edit" />تعديل
                              </button>
                              {c.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    className="action-btn approve"
                                    disabled={!!actionLoading}
                                    onClick={() => handleApprove(c._id, c.charityName)}
                                  >
                                    <i className="ti ti-check" />موافقة
                                  </button>
                                  <button
                                    className="action-btn reject"
                                    disabled={!!actionLoading}
                                    onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}
                                  >
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

                {hasMoreCharities && (
                  <LoadMoreBtn
                    loading={loadingMore === 'charities'}
                    remaining={charitiesRemaining}
                    onClick={loadMoreCharities}
                  />
                )}
              </div>
            )}

            {/* ══ REPORTS ══ */}
            {tab === 'reports' && (
              <div className="ap-tab-content">
                <div className="ap-section-header">
                  <div className="ap-section-title">
                    <i className="ti ti-alert-circle" style={{ color: AMBER }} />
                    التقارير
                    <span className="ap-count-badge" style={{ background: AMBER }}>
                      {reportsTotal || reports.length}
                    </span>
                  </div>
                  <SearchBox
                    value={reportsSearch}
                    onChange={setReportsSearch}
                    placeholder="بحث في التقارير..."
                  />
                </div>

                {filteredReports.length === 0 ? (
                  <EmptyState icon="ti-mood-happy" title="لا توجد تقارير حتى الآن" desc="كل شيء يسير على ما يرام!" />
                ) : (
                  <div className="ap-card-grid reports">
                    {filteredReports.map((r, i) => {
                      const isCharity  = r.senderType === 'charity';
                      const senderLabel = isCharity ? 'جمعية' : r.senderType === 'user' ? 'مستخدم' : r.senderType;
                      const senderName  = r.userName || r.charityName || '—';
                      return (
                        <div key={r._id} className="report-card" onClick={() => setReportModal(r)}>
                          <div className="report-card-header">
                            <span className="report-card-num">
                              <i className="ti ti-alert-triangle" />تقرير #{i + 1}
                            </span>
                            <span className="report-card-date">
                              <i className="ti ti-calendar" />{fmt(r.createdAt)}
                            </span>
                          </div>

                          <div className="report-card-sender">
                            <div
                              className="report-sender-icon"
                              style={{
                                background: isCharity ? '#ecfdf5' : '#eff6ff',
                                color: isCharity ? TEAL2 : '#3b82f6',
                              }}
                            >
                              <i className={`ti ${isCharity ? 'ti-building' : 'ti-user'}`} />
                            </div>
                            <div>
                              <div className="report-sender-name">{senderName}</div>
                              {senderLabel && <div className="report-sender-type">{senderLabel}</div>}
                            </div>
                          </div>

                          <p className="report-card-body">{r.description}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {hasMoreReports && (
                  <LoadMoreBtn
                    loading={loadingMore === 'reports'}
                    remaining={0}
                    onClick={loadMoreReports}
                  />
                )}
              </div>
            )}

            {/* ══ AUTOMATION ══ */}
            {tab === 'automation' && (
              <div className="ap-tab-content ap-automation-wrap">
                <div className="ap-automation-banner">
                  <div className="ap-automation-banner-icon">
                    <i className="ti ti-settings-automation" />
                  </div>
                  <div>
                    <div className="ap-automation-banner-title">التشغيل التلقائي (Cron Jobs)</div>
                    <div className="ap-automation-banner-sub">
                      يمكنك تشغيل المهام التلقائية يدويًا من هنا. يتم تشغيل هذه المهام تلقائيًا في
                      الخلفية وفقًا لجدول زمني محدد.
                    </div>
                  </div>
                </div>

                <div className="cron-grid">
                  <CronCard
                    icon="ti-bell-ringing" iconBg="#ecfdf5" iconColor={TEAL2}
                    title="تذكير التبرعات"
                    desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة التي لم يتم تأكيدها."
                    code="GET /cron/donationReminder"
                    codeBg="#f0fdf4" codeBorder="#bbf7d0" codeColor="#166534"
                    loading={cronLoading} btnColor={TEAL2} onRun={runDonationReminder}
                  />
                  <CronCard
                    icon="ti-report-analytics" iconBg="#eff6ff" iconColor="#1e40af"
                    title="تقرير الأدمن"
                    desc="يولّد تقريرًا شاملاً عن نشاط المنصة ويرسله لجميع المسؤولين عبر البريد الإلكتروني."
                    code="GET /cron/adminReport"
                    codeBg="#eff6ff" codeBorder="#bfdbfe" codeColor="#1e40af"
                    loading={cronLoading} btnColor="#1e40af" onRun={runAdminReport}
                  />
                </div>

                <div className="ap-automation-stats">
                  <div className="ap-automation-stat">
                    <i className="ti ti-history" style={{ fontSize: 20, color: TEAL2 }} />
                    <div>
                      <div className="ap-automation-stat-val">{cronLog.length}</div>
                      <div className="ap-automation-stat-lbl">عدد مرات التشغيل</div>
                    </div>
                  </div>
                  <div className="ap-automation-stat">
                    <i className="ti ti-clock" style={{ fontSize: 20, color: AMBER }} />
                    <div>
                      <div className="ap-automation-stat-val">
                        {lastRun ? new Date(lastRun).toLocaleTimeString('ar-EG') : '—'}
                      </div>
                      <div className="ap-automation-stat-lbl">آخر تشغيل</div>
                    </div>
                  </div>
                  <div className="ap-automation-stat">
                    <i className="ti ti-calendar-event" style={{ fontSize: 20, color: '#3b82f6' }} />
                    <div>
                      <div className="ap-automation-stat-val">تلقائي</div>
                      <div className="ap-automation-stat-lbl">جدول زمني</div>
                    </div>
                  </div>
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
                          <span>{log.type === 'success' ? '✓' : '✗'} {log.text}</span>
                          <span className="cron-log-time">{log.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}