import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, donorApi, notificationApi, charityApi, Charity, Donation, Notification } from '../services';
import { statusLabel, formatDate } from '../lib/utils';
import RatingModal from '../features/rating/RatingModal';

type Tab = 'profile' | 'password' | 'donations' | 'notifications' | 'danger';

export default function Settings() {
  const { user, logout, refreshUser, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
  const [charityProfile, setCharityProfile] = useState<Charity | null>(null);
  const [charityForm, setCharityForm] = useState({ charityName: '', address: '', description: '' });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [ratingDonation, setRatingDonation] = useState<Donation | null>(null);

  useEffect(() => {
    if (user) {
      setProfileForm({ userName: user.userName || '', phone: user.phone || '', address: user.address || '' });
      if (user.roleType === 'charity') {
        charityApi.getAll().then(d => {
          const mine = d.charities?.find(c => c.email === user.email);
          if (mine) {
            setCharityProfile(mine);
            setCharityForm({ charityName: mine.charityName || '', address: mine.address || '', description: mine.description || '' });
          }
        }).catch(() => {});
      }
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'donations') {
      setLoadingData(true);
      donorApi.getMyDonations().then(d => setDonations(d.donations || [])).catch(() => {}).finally(() => setLoadingData(false));
    }
    if (tab === 'notifications') {
      setLoadingData(true);
      notificationApi.getAll().then(d => setNotifications(d.notifications || [])).catch(() => {}).finally(() => setLoadingData(false));
    }
  }, [tab]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await usersApi.updateProfile(profileForm);
      await refreshUser();
      showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const saveCharityProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charityProfile) return;
    setSaving(true);
    try {
      // Save charity-specific fields
      await charityApi.update(charityProfile._id, charityForm);
      // FIX: also save phone via user profile endpoint since phone belongs to the user record
      if (profileForm.phone !== (user?.phone || '')) {
        await usersApi.updateProfile({ phone: profileForm.phone });
        await refreshUser();
      }
      showMsg('success', 'تم تحديث بيانات الجمعية بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      showMsg('error', 'كلمتا المرور غير متطابقتين');
      return;
    }
    setSaving(true);
    try {
      await usersApi.changePassword(passForm);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showMsg('success', 'تم تغيير كلمة المرور بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const markNotifRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      // FIX: use status field, not isRead
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
    } catch {}
  };

  const deleteAccount = async () => {
    if (!confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    try {
      await usersApi.deleteAccount();
      logout();
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ أثناء الحذف');
    }
  };

  if (isLoading) return <div className="settings-wrapper"><div className="spinner"><div className="spinner-ring" /></div></div>;

  if (!user) {
    return (
      <div className="settings-wrapper">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="empty-icon">🔒</div>
          <p style={{ marginBottom: 20 }}>يجب تسجيل الدخول للوصول للإعدادات</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-flex' }}>العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; icon: string; label: string; danger?: boolean }[] = [
    { id: 'profile', icon: user.roleType === 'charity' ? '🏛️' : '👤', label: user.roleType === 'charity' ? 'بيانات الجمعية' : 'الملف الشخصي' },
    { id: 'password', icon: '🔑', label: 'كلمة المرور' },
    ...(user.roleType === 'user' ? [{ id: 'donations' as Tab, icon: '📦', label: 'تبرعاتي' }] : []),
    { id: 'notifications', icon: '🔔', label: 'الإشعارات' },
    { id: 'danger', icon: '⚠️', label: 'منطقة الخطر', danger: true },
  ];

  const roleLabel = user.roleType === 'charity' ? 'جمعية خيرية' : user.roleType === 'admin' ? 'مدير' : 'متبرع';

  return (
    <div className="settings-wrapper">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-icon">⚙️</div>
          <div>
            <h1>إعدادات الحساب</h1>
            <p>إدارة معلوماتك الشخصية وإعدادات حسابك</p>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '16px auto 0' }}>
          <div className={msg.type === 'success' ? 'modal-success' : 'modal-error'}>{msg.text}</div>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-nav">
          <div className="settings-nav-card">
            <div className="settings-nav-user">
              <div className="settings-nav-avatar">{user.userName?.[0]?.toUpperCase() || '👤'}</div>
              <h3>{user.userName}</h3>
              <p>{user.email}</p>
              <span className="settings-nav-role">{roleLabel}</span>
            </div>
            <div className="settings-nav-links">
              {navItems.map(n => (
                <button
                  key={n.id}
                  className={`nav-link-item${tab === n.id ? ' active' : ''}${n.danger ? ' danger' : ''}`}
                  onClick={() => setTab(n.id)}
                >
                  <span className="n-icon">{n.icon}</span>
                  {n.label}
                </button>
              ))}
              <button className="nav-link-item danger" onClick={logout}>
                <span className="n-icon">🚪</span>
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        <div className="settings-content">
          {/* Profile */}
          <div className={`settings-section${tab === 'profile' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">
                  {user.roleType === 'charity' ? '🏛️ بيانات الجمعية' : '👤 الملف الشخصي'}
                </span>
              </div>
              {user.roleType === 'charity' ? (
                <form onSubmit={saveCharityProfile}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>اسم الجمعية</label>
                      <input value={charityForm.charityName} onChange={e => setCharityForm(f => ({ ...f, charityName: e.target.value }))} placeholder="اسم الجمعية" />
                    </div>
                    <div className="form-group">
                      <label>البريد الإلكتروني</label>
                      <input value={user.email} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>رقم الهاتف</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" />
                    </div>
                    <div className="form-group">
                      <label>نوع الحساب</label>
                      <input value="جمعية خيرية" disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group form-full">
                      <label>العنوان</label>
                      <input value={charityForm.address} onChange={e => setCharityForm(f => ({ ...f, address: e.target.value }))} placeholder="مدينتك أو منطقتك" />
                    </div>
                    <div className="form-group form-full">
                      <label>وصف الجمعية</label>
                      <textarea
                        value={charityForm.description}
                        onChange={e => setCharityForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="أدخل وصفاً موجزاً عن الجمعية وأهدافها"
                        rows={4}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--neutral-200)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button type="submit" className="btn-save" disabled={saving}>
                      {saving ? '⏳ جاري الحفظ...' : '💾 حفظ بيانات الجمعية'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={saveProfile}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>الاسم</label>
                      <input value={profileForm.userName} onChange={e => setProfileForm(f => ({ ...f, userName: e.target.value }))} placeholder="اسمك الكامل" />
                    </div>
                    <div className="form-group">
                      <label>البريد الإلكتروني</label>
                      <input value={user.email} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>رقم الهاتف</label>
                      <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} placeholder="01xxxxxxxxx" />
                    </div>
                    <div className="form-group">
                      <label>نوع الحساب</label>
                      <input value={roleLabel} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group form-full">
                      <label>العنوان</label>
                      <input value={profileForm.address} onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))} placeholder="مدينتك أو منطقتك" />
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button type="submit" className="btn-save" disabled={saving}>
                      {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Password */}
          <div className={`settings-section${tab === 'password' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">🔑 تغيير كلمة المرور</span>
              </div>
              <form onSubmit={savePassword}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>كلمة المرور الحالية</label>
                    <input type="password" value={passForm.oldPassword} onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))} placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>كلمة المرور الجديدة</label>
                    <input type="password" value={passForm.newPassword} onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>تأكيد كلمة المرور الجديدة</label>
                    <input type="password" value={passForm.confirmPassword} onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="••••••••" required />
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? '⏳ جاري الحفظ...' : '🔑 تغيير كلمة المرور'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Donations */}
          <div className={`settings-section${tab === 'donations' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">📦 تبرعاتي</span>
              </div>
              {loadingData ? (
                <div className="spinner"><div className="spinner-ring" /></div>
              ) : donations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>لا توجد تبرعات بعد</p>
                </div>
              ) : (
                <div className="donations-list">
                  {donations.map(d => {
                    const { label, cls } = statusLabel(d.status);
                    return (
                      <div key={d._id} className="donation-item">
                        <div className="donation-icon">👕</div>
                        <div className="donation-info">
                          <h4>{d.type} — {d.size}</h4>
                          <p>{d.quantity} قطعة | {d.condition} | {formatDate(d.createdAt)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`donation-status status-badge ${cls}`}>{label}</span>
                          {d.status === 'delivered' && (
                            <button
                              className="btn-sm"
                              style={{ fontSize: 12, padding: '5px 12px' }}
                              onClick={() => setRatingDonation(d)}
                              title="قيّم التبرع"
                            >
                              ⭐ تقييم
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className={`settings-section${tab === 'notifications' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">🔔 الإشعارات</span>
                {/* FIX: use status field, not isRead */}
                <span style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{notifications.filter(n => n.status === 'unread').length} غير مقروء</span>
              </div>
              {loadingData ? (
                <div className="spinner"><div className="spinner-ring" /></div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔔</div>
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      // FIX: use status field, not isRead
                      className={`notif-item${n.status === 'unread' ? ' unread' : ''}`}
                      onClick={() => n.status === 'unread' && markNotifRead(n._id)}
                    >
                      <div className={`notif-dot${n.status === 'read' ? ' read' : ''}`} />
                      <div className="notif-text">
                        <h4>{n.message}</h4>
                        <span className="notif-time">{new Date(n.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className={`settings-section${tab === 'danger' ? ' active' : ''}`}>
            <div className="danger-card">
              <h3>⚠️ حذف الحساب</h3>
              <p>هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك وتبرعاتك بشكل نهائي.</p>
              <button className="btn-danger" onClick={deleteAccount}>
                🗑️ حذف حسابي نهائيًا
              </button>
            </div>
          </div>
        </div>
      </div>

      {ratingDonation && (
        <RatingModal
          donationId={ratingDonation._id}
          donationType={ratingDonation.type}
          charityName={
            typeof ratingDonation.charityId === 'object'
              ? ratingDonation.charityId.charityName
              : undefined
          }
          onClose={() => setRatingDonation(null)}
          onSuccess={() => {
            setRatingDonation(null);
            showMsg('success', 'شكرًا! تم إرسال تقييمك بنجاح ✨');
          }}
        />
      )}
    </div>
  );
}
