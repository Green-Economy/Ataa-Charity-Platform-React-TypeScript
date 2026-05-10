import { useState } from 'react';
import { Link } from 'wouter';

interface FAQItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FAQItem[] = [
  // التبرع
  { category: 'التبرع', q: 'كيف أبدأ في التبرع بملابسي؟', a: 'سجّل حسابك على المنصة، ثم اذهب إلى صفحة الجمعيات واختر الجمعية التي تريد التبرع لها، ثم اضغط على "تبرع لهذه الجمعية" وأدخل تفاصيل الملابس. ستتواصل معك الجمعية خلال فترة قصيرة.' },
  { category: 'التبرع', q: 'ما أنواع الملابس التي يمكنني التبرع بها؟', a: 'يمكنك التبرع بجميع أنواع الملابس (قمصان، بناطيل، فساتين، معاطف، ملابس أطفال، أحذية، وغيرها) طالما كانت نظيفة وبحالة جيدة أو مقبولة. الملابس التالفة جدًا أو المتسخة لا تُقبل.' },
  { category: 'التبرع', q: 'كيف أعرف أن تبرعي وصل وتم قبوله؟', a: 'ستصلك إشعارات على المنصة عند كل تغيير في حالة تبرعك. يمكنك أيضًا متابعة حالة تبرعاتك من صفحة الإعدادات ضمن قسم "تبرعاتي". الحالات هي: قيد الانتظار، مقبول، مرفوض، أو تم التسليم.' },
  { category: 'التبرع', q: 'هل يمكنني التبرع لأكثر من جمعية في نفس الوقت؟', a: 'نعم، يمكنك تقديم تبرعات متعددة لجمعيات مختلفة في نفس الوقت. كل تبرع يُعامل بصورة مستقلة.' },
  { category: 'التبرع', q: 'هل يمكنني إلغاء تبرعي بعد تقديمه؟', a: 'يمكنك إلغاء التبرع طالما كانت حالته "قيد الانتظار". بمجرد قبوله من الجمعية، لا يمكن إلغاؤه. للإلغاء، تواصل مع الجمعية مباشرةً.' },

  // الحساب
  { category: 'الحساب', q: 'كيف أسجّل حسابًا على منصة عطاء؟', a: 'اضغط على "إنشاء حساب" في أعلى الصفحة، أدخل بياناتك (الاسم، البريد الإلكتروني، رقم الهاتف، العنوان، كلمة المرور)، ثم اختر نوع الحساب (مستخدم أو جمعية). ستصلك رسالة تحقق على بريدك الإلكتروني.' },
  { category: 'الحساب', q: 'نسيت كلمة المرور، كيف أستعيدها؟', a: 'اضغط على "نسيت كلمة المرور؟" في صفحة تسجيل الدخول، أدخل بريدك الإلكتروني، وستصلك رسالة بها رمز إعادة التعيين. أدخل الرمز وكلمة المرور الجديدة لإعادة الضبط.' },
  { category: 'الحساب', q: 'كيف أغيّر بياناتي الشخصية؟', a: 'اذهب إلى صفحة "الإعدادات" من القائمة العلوية بعد تسجيل الدخول. يمكنك تعديل الاسم ورقم الهاتف والعنوان. لتغيير كلمة المرور، استخدم قسم "تغيير كلمة المرور" في نفس الصفحة.' },
  { category: 'الحساب', q: 'كيف أحذف حسابي نهائيًا؟', a: 'من صفحة الإعدادات، انتقل إلى قسم "حذف الحساب" في أسفل الصفحة. سيُطلب منك تأكيد القرار. ملاحظة: حذف الحساب نهائي ولا يمكن التراجع عنه، وستُحذف جميع بياناتك.' },

  // الجمعيات
  { category: 'الجمعيات', q: 'كيف أختار الجمعية المناسبة لتبرعي؟', a: 'يمكنك تصفية الجمعيات حسب المنطقة الجغرافية أو البحث باسم الجمعية. اقرأ وصف كل جمعية لتعرف اهتماماتها وفئاتها المستهدفة، واختر الأقرب إليك لتسهيل التسليم.' },
  { category: 'الجمعيات', q: 'هل جميع الجمعيات على المنصة معتمدة ورسمية؟', a: 'نعم، كل الجمعيات المدرجة على منصة عطاء تمرّ بعملية تحقق وفحص من فريق الإدارة قبل اعتمادها. نحرص على أن تكون جمعيات مرخّصة وموثوقة.' },
  { category: 'الجمعيات', q: 'كيف يمكن لجمعيتي الانضمام إلى المنصة؟', a: 'سجّل حسابًا جديدًا واختر نوع الحساب "جمعية خيرية"، أدخل بيانات الجمعية الرسمية. سيراجع فريقنا الطلب خلال 3-5 أيام عمل ويتواصل معك لاستكمال عملية التحقق.' },

  // الذكاء الاصطناعي
  { category: 'الذكاء الاصطناعي', q: 'كيف يعمل تحليل الملابس بالذكاء الاصطناعي؟', a: 'ارفع صورة واضحة لقطعة الملابس، وسيحلل الذكاء الاصطناعي الصورة ويخبرك إذا كانت مناسبة للتبرع بناءً على حالتها الظاهرة. هذا التحليل استرشادي والقرار النهائي للجمعية.' },
  { category: 'الذكاء الاصطناعي', q: 'هل المساعد الذكي يحفظ محادثاتي؟', a: 'المحادثات مع المساعد الذكي تكون مؤقتة خلال الجلسة فقط ولا تُحفظ بعد إغلاق الصفحة حاليًا. ميزة حفظ سجل المحادثات ستُضاف في تحديثات قادمة.' },
  { category: 'الذكاء الاصطناعي', q: 'هل خدمة الذكاء الاصطناعي مجانية؟', a: 'نعم، خدمتا المساعد الذكي وتحليل الصور مجانيتان تمامًا لجميع المستخدمين المسجّلين على المنصة.' },

  // تقني
  { category: 'تقني', q: 'لماذا لا أستطيع تسجيل الدخول رغم أن البيانات صحيحة؟', a: 'تأكد من التحقق من بريدك الإلكتروني أولًا (رسالة التحقق). إذا لم تجد الرسالة، تحقق من مجلد Spam. إذا استمرت المشكلة، جرّب إعادة تعيين كلمة المرور أو تواصل معنا.' },
  { category: 'تقني', q: 'ما الصيغ المدعومة لرفع صور التبرعات والتحليل؟', a: 'ندعم صيغ JPG و PNG و WEBP بحد أقصى 5 ميجابايت للصورة الواحدة. يمكنك إرفاق عدة صور مع كل تبرع لإظهار الملابس من زوايا مختلفة.' },
  { category: 'تقني', q: 'هل المنصة تعمل على الهاتف المحمول؟', a: 'نعم، منصة عطاء متجاوبة تمامًا مع جميع الأجهزة (حاسوب، تابلت، هاتف محمول). يمكنك استخدامها عبر أي متصفح حديث.' },
];

const CATEGORIES = ['الكل', ...Array.from(new Set(FAQS.map(f => f.category)))];

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = FAQS.filter(f => {
    const matchesCategory = activeCategory === 'الكل' || f.category === activeCategory;
    const matchesSearch = !search || f.q.includes(search) || f.a.includes(search);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <div className="breadcrumb">
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>الأسئلة الشائعة</span>
        </div>
        <h1>الأسئلة <span style={{ color: 'var(--gold-400)' }}>الشائعة</span></h1>
        <p>إجابات لأكثر الأسئلة شيوعًا عن منصة عطاء والتبرع بالملابس</p>
      </div>

      <section style={{ maxWidth: 860, width: '90%', margin: '48px auto 80px' }}>

        {/* Search */}
        <div className="form-group" style={{ maxWidth: 480, margin: '0 auto 28px' }}>
          <input
            type="text"
            placeholder="🔍 ابحث في الأسئلة..."
            value={search}
            onChange={e => { setSearch(e.target.value); setOpenIndex(null); }}
            style={{ borderRadius: 'var(--r-full)', textAlign: 'center' }}
          />
        </div>

        {/* Category filter */}
        <div className="filter-bar" style={{ marginBottom: 32 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>لا توجد نتائج تطابق بحثك</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div
                  key={i}
                  style={{
                    background: 'var(--white)',
                    border: `1px solid ${isOpen ? 'var(--teal-300)' : 'var(--neutral-200)'}`,
                    borderRadius: 'var(--r-lg)',
                    overflow: 'hidden',
                    boxShadow: isOpen ? '0 4px 20px rgba(0,128,128,.08)' : 'var(--shadow-sm)',
                    transition: 'all .2s',
                  }}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '18px 22px',
                      background: isOpen ? 'var(--teal-50)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'right',
                      gap: 12,
                      transition: 'background .2s',
                      fontFamily: 'var(--font)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: isOpen ? 'var(--teal-600)' : 'var(--neutral-100)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: isOpen ? 'white' : 'var(--teal-600)',
                        fontSize: 14, fontWeight: 800, flexShrink: 0,
                        transition: 'all .2s',
                      }}>❓</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--neutral-900)', lineHeight: 1.5 }}>
                        {faq.q}
                      </span>
                    </div>
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: isOpen ? 'var(--teal-600)' : 'var(--neutral-100)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isOpen ? 'white' : 'var(--neutral-500)',
                      fontSize: 18, flexShrink: 0,
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'all .25s',
                    }}>
                      ‹
                    </span>
                  </button>

                  {isOpen && (
                    <div style={{ padding: '4px 22px 20px 22px', borderTop: '1px solid var(--teal-100)' }}>
                      <p style={{ margin: 0, fontSize: 14.5, color: 'var(--neutral-700)', lineHeight: 1.9, paddingTop: 14 }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Still have questions? */}
        <div style={{
          marginTop: 48, padding: '32px 36px',
          background: 'linear-gradient(135deg, var(--teal-700) 0%, var(--teal-600) 100%)',
          borderRadius: 'var(--r-lg)', textAlign: 'center', color: 'white',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>💬</div>
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8, color: 'white' }}>لم تجد إجابتك؟</h3>
          <p style={{ opacity: .85, marginBottom: 20, fontSize: 14 }}>فريقنا جاهز للإجابة على جميع استفساراتك</p>
          <Link
            href="/contact"
            className="btn-primary"
            style={{ display: 'inline-flex', background: 'white', color: 'var(--teal-700)', fontWeight: 800 }}
          >
            📩 تواصل معنا
          </Link>
        </div>
      </section>
    </div>
  );
}
