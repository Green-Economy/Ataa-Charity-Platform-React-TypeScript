import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { charityApi, Charity } from '../services';

const FALLBACK_IMAGES = [
  '/images/images11.jpg',
  '/images/hero-img-resala.jpg',
  '/images/hero-img-aleslah.png',
  '/images/card3.jpeg',
];

export default function Charities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('الكل');
  const [search, setSearch] = useState('');

  useEffect(() => {
    charityApi.getAll()
      .then(d => setCharities(d.charities || []))
      .catch(() => setCharities([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = charities.filter(c => {
    const matchesSearch = c.charityName.includes(search) || c.description.includes(search) || c.address.includes(search);
    const matchesFilter = filter === 'الكل' || c.address.includes(filter);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page-wrapper">
      <div className="page-hero" datatype='fade'>
        <div className="breadcrumb">
          <Link href="/">الرئيسية</Link>
          <span>›</span>
          <span>الجمعيات</span>
        </div>
        <h1>الجمعيات الخيرية <span style={{ color: 'var(--gold-400)' }}>المعتمدة</span></h1>
        <p>تصفح قائمة الجمعيات الخيرية الشريكة وتعرّف على أهدافها وخدماتها لتختار الأنسب لتبرعك</p>
      </div>

      {/* Search & Filter */}
      <div style={{ padding: '28px 5% 0' }} data-reveal="up">
        <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto' }}>
          <div className="form-group" style={{ maxWidth: 480, margin: '0 auto 20px' }}>
            <input
              type="text"
              placeholder="🔍 ابحث عن جمعية..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ borderRadius: 'var(--r-full)', textAlign: 'center' }}
            />
          </div>
        </div>
      </div>

      <div className="filter-bar">
      </div>

      <section className="charities-sec">
        {loading ? (
          <div className="spinner"><div className="spinner-ring" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>لا توجد جمعيات تطابق بحثك</p>
          </div>
        ) : (
          <div className="charities-grid" data-stagger>
            {filtered.map((c, i) => (
              <div key={c._id} className="charity-card">
                <div className="charity-card-img">
                  <img
                    src={c.logo || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                    alt={c.charityName}
                    onError={e => {
                      const img = e.target as HTMLImageElement;
                      const nextFallback = FALLBACK_IMAGES[(i + 1) % FALLBACK_IMAGES.length];
                      if (img.src !== nextFallback) img.src = nextFallback;
                    }}
                  />
                  <span className="charity-card-badge">{c.address}</span>
                </div>
                <div className="charity-card-body">
                  <div className="charity-card-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {c.logo ? (
                      <img
                        src={c.logo}
                        alt={`شعار ${c.charityName}`}
                        style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 8 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span style={{ fontSize: 24 }}>🏛️</span>
                    )}
                  </div>
                  <h3>{c.charityName}</h3>
                  <p>{c.description}</p>
                  {c.createdAt && (
                    <p style={{ fontSize: 12, color: 'var(--neutral-400)', marginTop: 4, marginBottom: 0 }}>
                      منذ {new Date(c.createdAt).getFullYear()}
                    </p>
                  )}
                  <div className="charity-card-footer">
                    <span className="charity-loc">
                      <i className="fas fa-location-dot" /> {c.address}
                    </span>
                    <Link href={`/charities/${c._id}`} className="btn-sm">عرض التفاصيل</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
