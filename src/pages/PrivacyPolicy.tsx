import { Link } from 'wouter';

export default function PrivacyPolicy() {
  return (
    <div className="page-wrapper">
      <div className="page-hero">
        <div className="breadcrumb">
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>سياسة الخصوصية</span>
        </div>
        <h1>سياسة <span style={{ color: 'var(--gold-400)' }}>الخصوصية</span></h1>
        <p>نلتزم بحماية بياناتك الشخصية وضمان خصوصيتك على منصة عطاء</p>
      </div>

      <section style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '48px auto 80px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--neutral-200)', borderRadius: 'var(--r-lg)', padding: '40px 44px', boxShadow: 'var(--shadow-sm)', lineHeight: 2, color: 'var(--neutral-700)', fontSize: 15 }}>

          <p style={{ color: 'var(--neutral-500)', fontSize: 13, marginBottom: 36, paddingBottom: 20, borderBottom: '1px solid var(--neutral-100)' }}>
            آخر تحديث: يناير 2026
          </p>

          <Section icon="🔐" title="مقدمة">
            تُعدّ منصة <strong>عطاء</strong> ملتزمةً بحماية خصوصية مستخدميها. توضح هذه السياسة كيفية جمع معلوماتك الشخصية واستخدامها والحفاظ عليها وحمايتها عند استخدامك للمنصة. باستخدامك لمنصة عطاء، فإنك توافق على ممارسات الخصوصية المبيّنة في هذه السياسة.
          </Section>

          <Section icon="📋" title="المعلومات التي نجمعها">
            <p>نجمع المعلومات التالية عند تسجيلك واستخدامك للمنصة:</p>
            <InfoList items={[
              'الاسم الكامل وعنوان البريد الإلكتروني ورقم الهاتف',
              'العنوان الجغرافي لتسهيل التواصل مع الجمعيات القريبة',
              'معلومات التبرعات التي تقدمها (نوع الملابس، الكمية، الحالة)',
              'صور الملابس التي ترفعها لأغراض التبرع',
              'سجل المحادثات مع المساعد الذكي (إن كنت مسجلًا)',
              'بيانات الاستخدام مثل صفحات الزيارة والتوقيت',
            ]} />
          </Section>

          <Section icon="🎯" title="كيف نستخدم معلوماتك">
            <p>نستخدم المعلومات المجمّعة للأغراض التالية:</p>
            <InfoList items={[
              'إنشاء حسابك وإدارته على المنصة',
              'تسهيل عمليات التبرع وربطك بالجمعيات الخيرية المناسبة',
              'إرسال إشعارات تتعلق بحالة تبرعاتك',
              'تحليل صور الملابس بالذكاء الاصطناعي لتقييم صلاحيتها للتبرع',
              'تحسين تجربة الاستخدام وتطوير خدماتنا',
              'التواصل معك بشأن التحديثات والإعلانات الهامة',
            ]} />
          </Section>

          <Section icon="🔒" title="حماية بياناتك">
            نتخذ تدابير أمنية صارمة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو الإفصاح أو التعديل أو الحذف. تشمل هذه التدابير:
            <InfoList items={[
              'تشفير البيانات المنقولة باستخدام بروتوكول HTTPS',
              'تخزين كلمات المرور بصورة مشفّرة ومؤمّنة',
              'استخدام رموز JWT للمصادقة مع آلية تجديد تلقائي',
              'قصر الوصول إلى البيانات الحساسة على الموظفين المخوّلين فقط',
              'إجراء مراجعات أمنية دورية للمنصة',
            ]} />
          </Section>

          <Section icon="🤝" title="مشاركة المعلومات">
            <p>لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. نشارك بياناتك فقط في الحالات التالية:</p>
            <InfoList items={[
              'مع الجمعيات الخيرية المعتمدة لإتمام عملية التبرع',
              'عند الضرورة القانونية أو بأمر قضائي',
              'مع مزودي الخدمات التقنية الذين يساعدوننا في تشغيل المنصة (بموجب اتفاقيات سرية)',
            ]} />
          </Section>

          <Section icon="🍪" title="ملفات تعريف الارتباط (Cookies)">
            نستخدم التخزين المحلي للمتصفح (localStorage) لحفظ رموز المصادقة وتفضيلاتك. يمكنك مسح هذه البيانات في أي وقت من إعدادات متصفحك، مع العلم بأن ذلك سيؤدي إلى تسجيل خروجك من المنصة.
          </Section>

          <Section icon="⚖️" title="حقوقك">
            <p>يحق لك في أي وقت:</p>
            <InfoList items={[
              'الاطلاع على بياناتك الشخصية المخزّنة لدينا',
              'تصحيح أي معلومات غير دقيقة عبر صفحة الإعدادات',
              'طلب حذف حسابك وجميع بياناتك من المنصة',
              'الاعتراض على معالجة بياناتك لأغراض التسويق',
              'تقديم شكوى لجهات حماية البيانات المختصة',
            ]} />
          </Section>

          <Section icon="👶" title="الخصوصية وحماية الأطفال">
            منصة عطاء مخصصة للمستخدمين الذين تجاوزوا سن الثامنة عشرة. لا نتعمّد جمع بيانات شخصية من الأطفال دون سن الثامنة عشرة. إذا اكتشفنا جمع مثل هذه البيانات، سنحذفها فورًا.
          </Section>

          <Section icon="📝" title="تعديلات السياسة">
            نحتفظ بحق تعديل هذه السياسة في أي وقت. سنخطرك بأي تغييرات جوهرية عبر البريد الإلكتروني المسجّل أو بإشعار بارز على المنصة. استمرارك في استخدام المنصة بعد نشر التعديلات يُعدّ موافقةً منك عليها.
          </Section>

          <div style={{ background: 'var(--teal-50)', border: '1px solid var(--teal-100)', borderRadius: 'var(--r-md)', padding: '20px 24px', marginTop: 36 }}>
            <h4 style={{ fontWeight: 800, color: 'var(--teal-800)', marginBottom: 8 }}>📬 التواصل بشأن الخصوصية</h4>
            <p style={{ margin: 0, fontSize: 14 }}>
              لأي استفسارات تتعلق بسياسة الخصوصية أو بياناتك الشخصية، تواصل معنا عبر:{' '}
              <a href="mailto:privacy@ataa.com" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>privacy@ataa.com</a>
              {' '}أو من خلال <Link href="/contact" style={{ color: 'var(--teal-600)', fontWeight: 600 }}>صفحة التواصل</Link>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--neutral-900)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 10, borderBottom: '2px solid var(--teal-100)' }}>
        <span style={{ fontSize: 22 }}>{icon}</span> {title}
      </h2>
      <div style={{ paddingRight: 8 }}>{children}</div>
    </div>
  );
}

function InfoList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingRight: 20, margin: '10px 0 0', lineHeight: 2.2 }}>
      {items.map((item, i) => (
        <li key={i} style={{ paddingRight: 4 }}>{item}</li>
      ))}
    </ul>
  );
}
