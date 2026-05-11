import { useState } from 'react';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   TYPES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
interface DonorObj {
  _id: string;
  userName?: string;
  name?: string;        // بعض الـ APIs بترجع name مش userName
  phone?: string;
  address?: string;
  email?: string;
}

interface Donation {
  _id: string;
  type: string;
  size?: string;
  quantity?: number;
  description?: string;
  condition?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  imageUrl?: Array<{ secure_url: string }>;
  donorId?: DonorObj | string | null;
}

interface Props {
  donation: Donation;
  onBack: () => void;
  onAction: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
  actionLoading: string | null;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HELPERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const STATUS_CFG = {
  pending:  { label: 'قيد المراجعة', color: '#92400e', bg: '#fffbeb', dot: '#f59e0b', border: '#fde68a', icon: 'ti-clock' },
  accepted: { label: 'مقبول',        color: '#065f46', bg: '#ecfdf5', dot: '#10b981', border: '#6ee7b7', icon: 'ti-circle-check' },
  rejected: { label: 'مرفوض',        color: '#991b1b', bg: '#fef2f2', dot: '#ef4444', border: '#fca5a5', icon: 'ti-circle-x' },
} as const;

const CONDITION_LABELS: Record<string, string> = {
  new: 'جديدة ✨', good: 'جيدة 👍', excellent: 'ممتازة ⭐', acceptable: 'مقبولة',
};

/* ✅ FIX: استخراج بيانات المتبرع بشكل صحيح
   المشكلة كانت: getDonorData بترجع { userName, phone, address }
   بس في الـ JSX بنستخدم donor.name مش donor.userName
   الحل: نوحّد الـ output باستخدام حقل "name" دايماً */
function parseDonor(donorId: DonorObj | string | null | undefined) {
  if (!donorId) return { name: 'غير معروف', phone: 'غير متوفر', address: 'غير متوفر', initial: 'م' };
  
  if (typeof donorId === 'string') {
    // الـ ID بس موجود، مش populated
    return { name: `متبرع #${donorId.slice(-4)}`, phone: 'غير متوفر', address: 'غير متوفر', initial: 'م' };
  }
  
  // ✅ نجرب كل الحقول الممكنة للاسم
  const name = donorId.userName || donorId.name || 'غير معروف';
  const initial = name !== 'غير معروف' ? name.trim()[0]?.toUpperCase() || 'م' : 'م';
  
  return {
    name,
    phone:   donorId.phone   || 'غير متوفر',
    address: donorId.address || 'غير متوفر',
    email:   donorId.email,
    initial,
  };
}

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function DonationDetail({ donation, onBack, onAction, actionLoading }: Props) {
  const [activeImg,    setActiveImg]    = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const images  = donation.imageUrl || [];
  const hasImgs = images.length > 0;
  const current = images[activeImg]?.secure_url;
  const donor   = parseDonor(donation.donorId);
  const sc      = STATUS_CFG[donation.status] ?? STATUS_CFG.pending;
  const isPending = donation.status === 'pending';
  const isAccLoading = actionLoading === `${donation._id}-accepted`;
  const isRejLoading = actionLoading === `${donation._id}-rejected`;
  const isBusy       = isAccLoading || isRejLoading;

  return (
    <>
      {/* ── Lightbox ── */}
      {lightboxOpen && current && (
        <div
          onClick={() => setLightboxOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.92)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out', animation: 'cd-fadein .2s ease',
          }}
        >
          <img
            src={current}
            alt={donation.type}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 12 }}
          />
          <button
            onClick={() => setLightboxOpen(false)}
            style={{
              position: 'absolute', top: 20, right: 20, width: 44, height: 44,
              background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: '50%',
              color: 'white', fontSize: 22, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>
      )}

      <div className="cd-detail-root">
        {/* ═══════════ HEADER ═══════════ */}
        <header className="cd-detail-header">
          <button className="cd-back-btn" onClick={onBack}>
            <i className="ti ti-arrow-right" /> العودة للوحة
          </button>

          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--t1)' }}>
            تفاصيل التبرع — {donation.type}
          </span>

          <span
            className="cd-detail-status-pill"
            style={{ background: sc.bg, color: sc.color, border: `1.5px solid ${sc.border}` }}
          >
            <span className="cd-status-dot" style={{ background: sc.dot }} />
            <i className={`ti ${sc.icon}`} style={{ fontSize: 14 }} />
            {sc.label}
          </span>
        </header>

        {/* ═══════════ BODY ═══════════ */}
        <div className="cd-detail-body">

          {/* ── GALLERY ── */}
          <div className="cd-detail-gallery">
            {/* Main image */}
            <div
              className="cd-gallery-container"
              style={{ cursor: hasImgs ? 'zoom-in' : 'default' }}
              onClick={() => hasImgs && setLightboxOpen(true)}
            >
              {current ? (
                <>
                  <img
                    src={current}
                    alt={donation.type}
                    className="cd-gallery-main-img"
                    style={{ transition: 'opacity .2s' }}
                  />

                  {/* Nav arrows */}
                  {images.length > 1 && (
                    <>
                      <div
                        className="cd-gallery-nav cd-gallery-nav-prev"
                        onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + images.length) % images.length); }}
                      >
                        <i className="ti ti-chevron-right" />
                      </div>
                      <div
                        className="cd-gallery-nav cd-gallery-nav-next"
                        onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % images.length); }}
                      >
                        <i className="ti ti-chevron-left" />
                      </div>
                      <div className="cd-gallery-counter">{activeImg + 1} / {images.length}</div>
                    </>
                  )}

                  {/* Zoom hint */}
                  <div className="cd-gallery-zoom">
                    <button
                      className="cd-zoom-btn"
                      onClick={e => { e.stopPropagation(); setLightboxOpen(true); }}
                      title="عرض بالحجم الكامل"
                    >
                      <i className="ti ti-arrows-maximize" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="cd-gallery-ph-lg">
                  <i className="ti ti-photo" style={{ fontSize: 56, color: 'var(--t4)' }} />
                  <span style={{ color: 'var(--t4)', fontSize: 13 }}>لا توجد صور</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="cd-gallery-thumbs" style={{ marginTop: 10 }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    className={`cd-gallery-thumb ${activeImg === i ? 'active' : ''}`}
                    onClick={() => setActiveImg(i)}
                    style={{ opacity: activeImg === i ? 1 : 0.6 }}
                  >
                    <img src={img.secure_url} alt={`${donation.type} ${i + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── DONOR CARD ── */}
          <div className="cd-detail-donor-card">
            <div className="cd-info-card-label">
              <i className="ti ti-user-circle" /> بيانات المتبرع
            </div>

            <div className="cd-detail-donor">
              {/* Avatar */}
              <div
                className="cd-detail-donor-av"
                style={{
                  background: 'linear-gradient(135deg, var(--t1) 0%, #374151 100%)',
                  fontSize: 20,
                }}
              >
                {donor.initial}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="cd-detail-donor-name"
                  style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}
                >
                  {donor.name}
                </div>

                <div className="cd-detail-donor-meta">
                  <span>
                    <i className="ti ti-phone" />
                    <span style={{ direction: 'ltr', display: 'inline-block' }}>{donor.phone}</span>
                  </span>
                  <span>
                    <i className="ti ti-map-pin" />
                    {donor.address}
                  </span>
                  {donor.email && (
                    <span>
                      <i className="ti ti-mail" />
                      {donor.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ⚠️ Notice when donor data isn't populated */}
            {typeof donation.donorId === 'string' && (
              <div
                style={{
                  marginTop: 12, padding: '8px 12px',
                  background: '#fffbeb', border: '1px solid #fde68a',
                  borderRadius: 8, fontSize: 12, color: '#92400e',
                  display: 'flex', gap: 7, alignItems: 'center',
                }}
              >
                <i className="ti ti-info-circle" style={{ fontSize: 15 }} />
                بيانات المتبرع غير متاحة — يبدو أن الـ API لا يُرجع الـ donor كـ populated object.
                تأكد من استخدام <code style={{ background: '#fde68a', padding: '1px 5px', borderRadius: 4 }}>.populate('donorId')</code> في الـ backend.
              </div>
            )}
          </div>

          {/* ── ACTION CARD ── */}
          <div className="cd-detail-action-card">
            <div className="cd-info-card-label">
              <i className="ti ti-hand-click" /> الإجراء
            </div>

            {isPending ? (
              <div className="cd-action-row" style={{ gap: 12 }}>
                <button
                  className="cd-btn-accept-lg"
                  disabled={isBusy}
                  onClick={() => onAction(donation._id, 'accepted')}
                  style={{ borderRadius: 12, letterSpacing: 0.3 }}
                >
                  {isAccLoading
                    ? <><span className="cd-spinner" /> جاري القبول…</>
                    : <><i className="ti ti-circle-check" style={{ fontSize: 20 }} /> قبول التبرع</>
                  }
                </button>

                <button
                  className="cd-btn-reject-lg"
                  disabled={isBusy}
                  onClick={() => onAction(donation._id, 'rejected')}
                  style={{ borderRadius: 12, letterSpacing: 0.3 }}
                >
                  {isRejLoading
                    ? <><span className="cd-spinner" /> جاري الرفض…</>
                    : <><i className="ti ti-circle-x" style={{ fontSize: 20 }} /> رفض التبرع</>
                  }
                </button>
              </div>
            ) : (
              <div
                className={`cd-done-banner cd-done-banner--${donation.status}`}
                style={{ flexDirection: 'column', gap: 6, padding: 20 }}
              >
                <i
                  className={`ti ${donation.status === 'accepted' ? 'ti-circle-check' : 'ti-circle-x'}`}
                  style={{ fontSize: 32 }}
                />
                <span style={{ fontSize: 14 }}>
                  {donation.status === 'accepted' ? 'تم قبول هذا التبرع' : 'تم رفض هذا التبرع'}
                </span>
              </div>
            )}
          </div>

          {/* ── INFO CARD ── */}
          <div className="cd-detail-info-card">
            <div className="cd-info-card" style={{ borderRadius: 18 }}>
              <div className="cd-info-card-label">
                <i className="ti ti-package" /> تفاصيل التبرع
              </div>

              {[
                { key: 'نوع التبرع',  val: donation.type,                              icon: 'ti-shirt' },
                { key: 'الكمية',      val: donation.quantity ? `${donation.quantity} قطعة` : '—', icon: 'ti-stack-2' },
                { key: 'المقاس',      val: donation.size || '—',                       icon: 'ti-ruler-2' },
                { key: 'حالة القطعة', val: CONDITION_LABELS[donation.condition ?? ''] ?? donation.condition ?? '—', icon: 'ti-stars' },
                { key: 'تاريخ التبرع', val: donation.createdAt ? fmtDate(donation.createdAt) : '—', icon: 'ti-calendar' },
              ].map(row => (
                <div className="cd-info-row" key={row.key}>
                  <span className="cd-info-key" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className={`ti ${row.icon}`} style={{ fontSize: 14, color: 'var(--br)' }} />
                    {row.key}
                  </span>
                  <span className="cd-info-val">{row.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── DESCRIPTION ── */}
          {donation.description && (
            <div className="cd-detail-desc-card">
              <div className="cd-info-card-label">
                <i className="ti ti-notes" /> وصف التبرع
              </div>
              <div
                className="cd-detail-desc-text"
                style={{
                  background: 'var(--bg-sb)', borderRadius: 10,
                  padding: '14px 16px', marginTop: 4,
                  border: '1px solid var(--bd)', lineHeight: 1.9,
                }}
              >
                {donation.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}