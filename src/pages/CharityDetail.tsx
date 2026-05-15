// import { useEffect, useState } from 'react';
// import { Link, useParams } from 'wouter';
// import { charityApi, Charity } from '../services';
// import { useAuth } from '../contexts/AuthContext';
// import DonationModal from '../components/shared/DonationModal';

// export default function CharityDetail() {
//   const { id } = useParams<{ id: string }>();
//   const [charity, setCharity]     = useState<Charity | null>(null);
//   const [loading, setLoading]     = useState(true);
//   const [showDonate, setShowDonate] = useState(false);
//   const [donated, setDonated]     = useState(false);
//   const { isLoggedIn, user } = useAuth();

//   useEffect(() => {
//     if (!id) return;
//     charityApi.getById(id)
//       .then(d => setCharity(d.charity))
//       .catch(() => setCharity(null))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <div className="page-wrapper"><div className="spinner"><div className="spinner-ring" /></div></div>;
//   if (!charity) return (
//     <div className="page-wrapper">
//       <div className="empty-state">
//         <div className="empty-icon">❌</div>
//         <p>لم يتم العثور على الجمعية</p>
//         <Link href="/charities" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>العودة للجمعيات</Link>
//       </div>
//     </div>
//   );

//   // لو المستخدم جمعية أو أدمن، متبينلوش زرار التبرع
//   const canDonate = isLoggedIn && user?.roleType === 'user';

//   return (
//     <div className="page-wrapper">
//       <div className="page-hero" style={{ textAlign: 'right', padding: '48px 5%' }} data-reveal="fade">
//         <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
//           <div className="breadcrumb" style={{ justifyContent: 'flex-start' }}>
//             <Link href="/">الرئيسية</Link>
//             <span>›</span>
//             <Link href="/charities">الجمعيات</Link>
//             <span>›</span>
//             <span>{charity.charityName}</span>
//           </div>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
//             <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,.12)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
//               🏛️
//             </div>
//             <div>
//               <h1 style={{ marginBottom: 6 }}>{charity.charityName}</h1>
//               <p style={{ margin: 0 }}>
//                 <i className="fas fa-location-dot" /> {charity.address} &nbsp;|&nbsp;
//                 <i className="fas fa-envelope" /> {charity.email}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '40px auto 80px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }} data-stagger>
//         <div>
//           <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--r-lg)', padding: 28, marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
//             <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--neutral-100)', display: 'flex', alignItems: 'center', gap: 8 }}>
//               📖 عن الجمعية
//             </h2>
//             <p style={{ fontSize: 15, color: 'var(--neutral-700)', lineHeight: 1.9 }}>{charity.description}</p>
//           </div>

//           <div style={{ background: 'var(--teal-700)', border: '1px solid var(--teal-700)', borderRadius: 'var(--r-lg)', padding: 28 }}>
//             <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--white)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
//               🌟 رسالتنا
//             </h2>
//             <p style={{ color: 'rgba(255,255,255,.85)', fontSize: 15, lineHeight: 1.9 }}>
//               نسعى جاهدين لتحقيق أهدافنا الإنسانية من خلال العمل الجماعي والتعاون مع المجتمع المحيط بنا،
//               لضمان وصول المساعدة لكل محتاج بطريقة كريمة ومنظمة.
//             </p>
//           </div>
//         </div>

//         <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
//           {/* معلومات التواصل */}
//           <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
//             <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--neutral-100)' }}>
//               معلومات التواصل
//             </h3>
//             <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--neutral-100)' }}>
//               <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-600)', flexShrink: 0 }}>
//                 <i className="fas fa-envelope" />
//               </div>
//               <div>
//                 <strong style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 2 }}>البريد الإلكتروني</strong>
//                 <p style={{ fontSize: 13, color: 'var(--neutral-700)' }}>{charity.email}</p>
//               </div>
//             </div>
//             {charity.phone && (
//               <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--neutral-100)' }}>
//                 <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-600)', flexShrink: 0 }}>
//                   <i className="fas fa-phone" />
//                 </div>
//                 <div>
//                   <strong style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 2 }}>الهاتف</strong>
//                   <p style={{ fontSize: 13, color: 'var(--neutral-700)' }}>{charity.phone}</p>
//                 </div>
//               </div>
//             )}
//             <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0' }}>
//               <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--teal-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-600)', flexShrink: 0 }}>
//                 <i className="fas fa-location-dot" />
//               </div>
//               <div>
//                 <strong style={{ fontSize: 12, color: 'var(--neutral-400)', display: 'block', marginBottom: 2 }}>العنوان</strong>
//                 <p style={{ fontSize: 13, color: 'var(--neutral-700)' }}>{charity.address}</p>
//               </div>
//             </div>
//           </div>

//           {/* زرار التبرع */}
//           <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--r-lg)', padding: 24, boxShadow: 'var(--shadow-sm)', textAlign: 'center' }}>
//             {donated ? (
//               <div style={{ padding: '12px 0', color: 'var(--teal-700)', fontWeight: 700, fontSize: 15 }}>
//                 <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
//                 تم إرسال تبرعك بنجاح!
//               </div>
//             ) : canDonate ? (
//               <button
//                 className="btn-donate"
//                 style={{ width: '100%', padding: 14, background: 'var(--teal-600)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-full)', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 0, transition: 'all .25s', fontFamily: 'var(--font)' }}
//                 onClick={() => setShowDonate(true)}
//               >
//                 <i className="fas fa-heart" /> تبرع لهذه الجمعية
//               </button>
//             ) : !isLoggedIn ? (
//               <>
//                 <button
//                   className="btn-donate"
//                   style={{ width: '100%', padding: 14, background: 'var(--teal-600)', color: 'var(--white)', border: 'none', borderRadius: 'var(--r-full)', fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 8, fontFamily: 'var(--font)' }}
//                   onClick={() => alert('يرجى تسجيل الدخول أولًا للتبرع')}
//                 >
//                   <i className="fas fa-heart" /> تبرع لهذه الجمعية
//                 </button>
//                 <p style={{ fontSize: 12, color: 'var(--neutral-500)' }}>يجب تسجيل الدخول للتبرع</p>
//               </>
//             ) : null}
//           </div>
//         </div>
//       </div>

// {showDonate && (
//   <DonationModal
//     isOpen={showDonate}
//     onClose={() => setShowDonate(false)}
//     onSuccess={() => setDonated(true)}
//   />
// )}
//     </div>
//   );
// }

import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { charityApi, Charity } from '../services';
import { useAuth } from '../contexts/AuthContext';
import DonationModal from '../components/shared/DonationModal';

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const [charity, setCharity]       = useState<Charity | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [donated, setDonated]       = useState(false);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (!id) return;
    charityApi.getById(id)
      .then(d => setCharity(d.charity))
      .catch(() => setCharity(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="page-wrapper">
      <div className="spinner"><div className="spinner-ring" /></div>
    </div>
  );

  if (!charity) return (
    <div className="page-wrapper">
      <div className="empty-state">
        <div className="empty-icon">🏛️</div>
        <p>لم يتم العثور على الجمعية</p>
        <Link href="/charities" className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }}>
          العودة للجمعيات
        </Link>
      </div>
    </div>
  );

  const canDonate = isLoggedIn && user?.roleType === 'user';
  const initials  = charity.charityName?.slice(0, 2).toUpperCase() || 'JX';
  const status    = (charity as any).approvalStatus;

  return (
    <div className="page-wrapper" style={{ background: '#f9fafb', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0F6E56 0%, #1D9E75 100%)', padding: '52px 5%' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'rgba(255,255,255,.6)', marginBottom: 24 }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>الرئيسية</Link>
            <i className="ti ti-chevron-left" style={{ fontSize: 11 }} />
            <Link href="/charities" style={{ color: 'inherit', textDecoration: 'none' }}>الجمعيات</Link>
            <i className="ti ti-chevron-left" style={{ fontSize: 11 }} />
            <span style={{ color: '#fff' }}>{charity.charityName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800, marginBottom: 7 }}>{charity.charityName}</h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: 'rgba(255,255,255,.72)' }}>
                {charity.address && <span><i className="ti ti-map-pin" style={{ marginLeft: 4 }} />{charity.address}</span>}
                <span><i className="ti ti-mail" style={{ marginLeft: 4 }} />{charity.email}</span>
                {charity.phone && <span><i className="ti ti-phone" style={{ marginLeft: 4 }} />{charity.phone}</span>}
              </div>
            </div>
            {status && (
              <span style={{ padding: '4px 13px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: status === 'approved' ? 'rgba(16,185,129,.18)' : 'rgba(245,158,11,.18)', color: status === 'approved' ? '#a7f3d0' : '#fde68a', border: `1px solid ${status === 'approved' ? 'rgba(16,185,129,.3)' : 'rgba(245,158,11,.3)'}` }}>
                {status === 'approved' ? '✓ معتمدة' : 'قيد المراجعة'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '28px auto 80px', display: 'grid', gridTemplateColumns: '1fr 290px', gap: 22 }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 22, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-book-2" style={{ color: '#1D9E75' }} />عن الجمعية
            </h2>
            <p style={{ fontSize: 14, color: '#374151', lineHeight: 2, margin: 0 }}>
              {charity.description || 'لا يوجد وصف متاح لهذه الجمعية.'}
            </p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #0F6E56, #1D9E75)', borderRadius: 14, padding: 22 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-star" />رسالتنا
            </h2>
            <p style={{ color: 'rgba(255,255,255,.82)', fontSize: 14, lineHeight: 2, margin: 0 }}>
              نسعى جاهدين لتحقيق أهدافنا الإنسانية من خلال العمل الجماعي والتعاون مع المجتمع المحيط، لضمان وصول المساعدة لكل محتاج بطريقة كريمة ومنظمة.
            </p>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Contact */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 7 }}>
              <i className="ti ti-address-book" style={{ color: '#1D9E75' }} />معلومات التواصل
            </h3>
            {[
              { icon: 'ti-mail',    label: 'البريد الإلكتروني', val: charity.email,   ltr: false },
              charity.phone ? { icon: 'ti-phone', label: 'رقم الهاتف', val: charity.phone, ltr: true } : null,
              { icon: 'ti-map-pin', label: 'العنوان',           val: charity.address, ltr: false },
            ].filter(Boolean).map((row: any, i, arr) => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1D9E75', flexShrink: 0, fontSize: 13 }}>
                  <i className={`ti ${row.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: 500, direction: row.ltr ? 'ltr' : 'rtl', textAlign: 'right' }}>{row.val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Donate */}
          <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 14, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,.05)', textAlign: 'center' }}>
            {donated ? (
              <div style={{ padding: '12px 0' }}>
                <div style={{ fontSize: 38, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#0F6E56' }}>تم إرسال تبرعك!</div>
                <p style={{ fontSize: 13, color: '#6b7280', marginTop: 5 }}>شكراً لمساهمتك</p>
              </div>
            ) : canDonate ? (
              <>
                <div style={{ fontSize: 34, marginBottom: 8 }}>🎁</div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 5 }}>تبرع لهذه الجمعية</h4>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 14, lineHeight: 1.7 }}>ملابسك المستعملة قد تغير حياة شخص محتاج</p>
                <button
                  onClick={() => setShowDonate(true)}
                  style={{ width: '100%', padding: '11px 0', background: 'linear-gradient(135deg, #0F6E56, #1D9E75)', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <i className="ti ti-heart" />تبرع الآن
                </button>
              </>
            ) : !isLoggedIn ? (
              <>
                <div style={{ fontSize: 34, marginBottom: 8 }}>🔒</div>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>يجب تسجيل الدخول للتبرع</p>
                <Link href="/auth" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#1D9E75', color: '#fff', borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                  <i className="ti ti-login" />تسجيل الدخول
                </Link>
              </>
            ) : null}
          </div>

          <Link href="/charities" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#6b7280', textDecoration: 'none', background: '#fff' }}>
            <i className="ti ti-arrow-right" />العودة للجمعيات
          </Link>
        </div>
      </div>

      {showDonate && (
        <DonationModal isOpen={showDonate} onClose={() => setShowDonate(false)} onSuccess={() => { setDonated(true); setShowDonate(false); }} />
      )}
    </div>
  );
}