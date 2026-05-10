import { Link } from 'wouter';

export default function About() {
  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <div className="breadcrumb">
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>عن المنصة</span>
        </div>
        <h1>عن منصة <span style={{ color: 'var(--gold-400)' }}>عطاء</span></h1>
        <p>تعرف على قصتنا وأهدافنا وفريقنا الذي يعمل بشغف لجعل التبرع أسهل وأكثر أثراً</p>
      </div>

      {/* Goals */}
      <section className="goals-sec">
        <div className="container">
          <div className="goals-grid">
            <div className="goals-img">
              <img
                src="/images/hero-img-resala.jpg"
                alt="أهدافنا"
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800'; }}
              />
            </div>
            <div>
              <span className="sec-label">🎯 أهدافنا</span>
              <h2 className="sec-title">نسعى لعالم <span>أكثر تكافلًا</span></h2>
              <p className="sec-sub" style={{ marginBottom: 32 }}>
                منصة عطاء وُلدت من إيمان بأن كل قطعة ملابس غير مستخدمة يمكنها أن تصنع فرقًا في حياة إنسان يحتاجها.
              </p>
              <div className="goals-list">
                {[
                  { icon: '🔗', title: 'ربط المتبرعين بالجمعيات', desc: 'نوفر منصة سهلة تربط من يريد التبرع بالجمعيات الخيرية المعتمدة والموثوقة.' },
                  { icon: '🌟', title: 'الشفافية والمصداقية', desc: 'نضمن وصول تبرعاتك لمستحقيها مع تقارير متابعة تُظهر أثر تبرعك الحقيقي.' },
                  { icon: '♻️', title: 'الاقتصاد الدائري', desc: 'نشجع إعادة استخدام الملابس للحفاظ على البيئة وتقليل الهدر.' },
                  { icon: '📱', title: 'سهولة الوصول', desc: 'نجعل التبرع بسيطًا ومريحًا عبر منصة رقمية سهلة الاستخدام.' },
                ].map(g => (
                  <div key={g.title} className="goal-item">
                    <div className="goal-icon">{g.icon}</div>
                    <div>
                      <h4>{g.title}</h4>
                      <p>{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="values-sec">
        <div className="container">
          <div className="values-header">
            <span className="sec-label">💎 قيمنا</span>
            <h2 className="sec-title">القيم التي <span>تحركنا</span></h2>
            <p className="sec-sub">هذه القيم هي البوصلة التي تحدد كيف نعمل وكيف نتعامل مع مجتمعنا</p>
          </div>
          <div className="values-grid">
            {[
              { icon: '🤝', title: 'التكامل', desc: 'نؤمن بأن التكامل بين أفراد المجتمع يصنع مجتمعًا أقوى وأكثر إنسانية.' },
              { icon: '🔍', title: 'الشفافية', desc: 'نلتزم بالشفافية الكاملة في كل عملياتنا لبناء الثقة مع مجتمعنا.' },
              { icon: '🌱', title: 'الاستدامة', desc: 'نعمل نحو مستقبل أخضر مستدام يحافظ على مواردنا للأجيال القادمة.' },
              { icon: '❤️', title: 'التعاطف', desc: 'نضع إنسانية المستفيد في مقدمة كل قراراتنا وخدماتنا.' },
              { icon: '🚀', title: 'الابتكار', desc: 'نبحث دائمًا عن حلول مبتكرة تجعل تجربة التبرع أفضل وأكثر أثرًا.' },
              { icon: '🛡️', title: 'المصداقية', desc: 'نلتزم بأعلى معايير المصداقية والأمانة في تعاملنا مع الجميع.' },
              { icon: '🌟', title: 'الوصول', desc: 'نتمكن من الوصول لكافة المستفيدين بطريقة سهلة وسرية.' },
              { icon: '🌐', title: 'التواصل', desc: 'نتمكن من التواصل مع جميع المستفيدين بطريقة سهلة وسرية.' },
              { icon: '📱', title: 'الوصول', desc: 'نتمكن من الوصول لكافة المستفيدين بطريقة سهلة وسرية.' },
              { icon: '💡', title: 'الابتكار', desc: 'نبحث دائمًا عن حلول مبتكرة تجعل تجربة التبرع أفضل وأكثر أثرًا.' },
            { icon: '🌍', title: 'التأثير الاجتماعي', desc: 'نهدف إلى إحداث تأثير إيجابي ملموس في حياة المستفيدين ومجتمعاتهم.' },
            { icon: '🤗', title: 'الاحترام', desc: 'نحترم كرامة كل فرد ونسعى لتعزيزها من خلال خدماتنا.' },      
            ].map(v => (
              <div key={v.title} className="value-card">
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="cta-banner">
        <div className="cta-text">
          <h2>انضم إلى مجتمع عطاء</h2>
          <p>كن جزءًا من حركة التغيير الاجتماعي وساهم في بناء مجتمع أكثر تكافلًا وإنسانية.</p>
        </div>
        <div className="cta-btns">
          <Link href="/charities" className="btn-gold">تصفح الجمعيات</Link>
          <Link href="/contact" className="btn-outline">تواصل معنا</Link>
        </div>
      </div>
    </div>
  );
}
