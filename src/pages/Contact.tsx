import { Link } from 'wouter';

export default function Contact() {
  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <div className="breadcrumb">
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>تواصل معنا</span>
        </div>
        <h1>تواصل <span style={{ color: 'var(--gold-400)' }}>معنا</span></h1>
        <p>نحن هنا للإجابة على أسئلتك ومساعدتك في أي استفسار يخص منصة عطاء</p>
      </div>

      <section style={{ padding: '60px 5% 80px' }}>
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}>
            {[
              { icon: '📍', title: 'العنوان', text: 'القاهرة، مصر — شارع التحرير', link: null },
              { icon: '📞', title: 'الهاتف', text: '+20 100 000 0000', link: 'tel:+201000000000' },
              { icon: '📧', title: 'البريد الإلكتروني', text: 'support@ataa.com', link: 'mailto:support@ataa.com' },
              { icon: '🕒', title: 'أوقات العمل', text: 'الأحد – الخميس: 9 ص – 5 م', link: null },
            ].map(item => (
              <div key={item.title} style={{
                background: 'var(--white)',
                border: '1px solid var(--neutral-200)',
                borderRadius: 16,
                padding: '28px 24px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: 'var(--teal-50)', border: '1px solid var(--teal-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: 'var(--neutral-400)', marginBottom: 6 }}>{item.title}</h4>
                  {item.link ? (
                    <a href={item.link} style={{ fontSize: 16, color: 'var(--teal-700)', fontWeight: 600, textDecoration: 'none' }}>{item.text}</a>
                  ) : (
                    <p style={{ fontSize: 16, color: 'var(--neutral-800)', fontWeight: 600, margin: 0 }}>{item.text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', paddingTop: 32, borderTop: '1px solid var(--neutral-100)' }}>
            <p style={{ fontSize: 15, color: 'var(--neutral-500)', marginBottom: 20 }}>تابعنا على وسائل التواصل الاجتماعي</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[
                { icon: 'fab fa-facebook-f', label: 'فيسبوك', color: '#1877F2' },
                { icon: 'fab fa-instagram', label: 'إنستغرام', color: '#E4405F' },
                { icon: 'fab fa-twitter', label: 'تويتر', color: '#1DA1F2' },
                { icon: 'fab fa-whatsapp', label: 'واتساب', color: '#25D366' },
              ].map(s => (
                <a key={s.label} href="#" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 20px', borderRadius: 'var(--r-full)',
                  border: '1px solid var(--neutral-200)',
                  background: 'var(--white)',
                  color: 'var(--neutral-700)',
                  fontWeight: 600, fontSize: 14,
                  textDecoration: 'none',
                }}>
                  <i className={s.icon} style={{ color: s.color }} />
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
