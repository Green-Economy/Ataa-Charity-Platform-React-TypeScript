import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { charityApi, Charity } from '../services';
import { useAuth } from '../contexts/AuthContext';
import DonationModal from '../components/shared/DonationModal';

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const [charity, setCharity]     = useState<Charity | null>(null);
  const [loading, setLoading]     = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [donated, setDonated]     = useState(false);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (!id) return;
    charityApi.getById(id)
      .then(d => setCharity(d.charity))
      .catch(() => setCharity(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-wrapper"><div className="spinner"><div className="spinner-ring" /></div></div>;
  if (!charity) return (
    <div className="page-wrapper">
      <div className="empty-state">
        <div className="empty-icon">❌</div>
        <p>لم يتم العثور على الجمعية</p>
        <Link href="/charities" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>العودة للجمعيات</Link>
      </div>
    </div>
  );

  // لو المستخدم جمعية أو أدمن، متبينلوش زرار التبرع
  const canDonate = isLoggedIn && user?.roleType === 'user';

  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ textAlign: 'right', padding: '48px 5%' }} data-reveal="fade">
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="breadcrumb" style={{ justifyContent: 'flex-start' }}>
            <Link href="/">الرئيسية</Link>
            <span>›</span>
            <Link href="/charities">الجمعيات</Link>
            <span>›</span>
            <span>{charity.charityName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
              🏛️
            </div>
            <div>
              <h1 style={{ marginBottom: 6 }}>{charity.charityName}</h1>
              <p style={{ margin: 0 }}>
                <i className="fas fa-location-dot" /> {charity.address} &nbsp;|&nbsp;
                <i className="fas fa-envelope" /> {charity.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '40px auto 80px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }} data-stagger>
        <div>
          <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--r-lg)', padding: 28, marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
              📖 عن الجمعية
            </h2>
            <p style={{ fontSize: 15, color: 'var(--neutral-700)', lineHeight: 1.9 }}>{charity.description}</p>
          </div>

          <div style={{ background: 'var(--teal-700)', border: '1px solid var(--teal-700)', borderRadius: 'var(--r-lg)', padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
              🌟 رسالتنا
            </h2>
            <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 15, lineHeight: 1.9 }}>
              نسعى جاهدين لتحقيق أهدافنا الإنسانية من خلال العمل الجماعي والتعاون مع المجتمع المحيط بنا،
              لضمان وصول المساعدة لكل محتاج بطريقة كريمة ومنظمة.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* معلومات التواصل */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--neutral-100)' }}>
              معلومات التواصل
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--neutral-100)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-600)', flexShrink: 0 }}>
                <i className="fas fa-envelope" />
              </div>
              <div>
                <strong style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 2 }}>البريد الإلكتروني</strong>
                <p style={{ fontSize: 13, color: 'var(--neutral-700)' }}>{charity.email}</p>
              </div>
            </div>
            {charity.phone && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--neutral-100)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-600)', flexShrink: 0 }}>
                  <i className="fas fa-phone" />
                </div>
                <div>
                  <strong style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 2 }}>الهاتف</strong>
                  <p style={{ fontSize: 13, color: 'var(--neutral-700)' }}>{charity.phone}</p>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-600)', flexShrink: 0 }}>
                <i className="fas fa-location-dot" />
              </div>
              <div>
                <strong style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 2 }}>العنوان</strong>
                <p style={{ fontSize: 13, color: 'var(--neutral-700)' }}>{charity.address}</p>
              </div>
            </div>
          </div>

          {/* زرار التبرع */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
            {donated ? (
              <div style={{ padding: '12px 0', color: 'var(--teal-700)', fontWeight: 700, fontSize: 15 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                تم إرسال تبرعك بنجاح!
              </div>
            ) : canDonate ? (
              <button
                className="btn-donate"
                style={{ width: '100%', padding: 14, background: 'var(--teal-600)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-full)', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 0, transition: 'all .25s', fontFamily: 'var(--font)' }}
                onClick={() => setShowDonate(true)}
              >
                <i className="fas fa-heart" /> تبرع لهذه الجمعية
              </button>
            ) : !isLoggedIn ? (
              <>
                <button
                  className="btn-donate"
                  style={{ width: '100%', padding: 14, background: 'var(--teal-600)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-full)', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 8, fontFamily: 'var(--font)' }}
                  onClick={() => alert('يرجى تسجيل الدخول أولًا للتبرع')}
                >
                  <i className="fas fa-heart" /> تبرع لهذه الجمعية
                </button>
                <p style={{ fontSize: 12, color: 'var(--neutral-500)' }}>يجب تسجيل الدخول للتبرع</p>
              </>
            ) : null}
          </div>
        </div>
      </div>

{showDonate && (
  <DonationModal
    isOpen={showDonate}
    onClose={() => setShowDonate(false)}
    onSuccess={() => setDonated(true)}
  />
)}
    </div>
  );
}

