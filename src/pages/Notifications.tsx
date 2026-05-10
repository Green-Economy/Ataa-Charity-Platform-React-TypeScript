import { useEffect, useState } from 'react';
import { notificationApi, Notification } from '../services';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    notificationApi.getAll()
      .then(d => setNotifications(d.notifications || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      // FIX: use status field, not isRead
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    // FIX: use status field, not isRead
    const unread = notifications.filter(n => n.status === 'unread');
    await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
  };

  const deleteNotif = async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { /* silent */ }
  };

  const filtered = notifications.filter(n => {
    // FIX: use status field, not isRead
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'read')   return n.status === 'read';
    return true;
  });

  // FIX: use status field, not isRead
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="page-wrapper" style={{ paddingTop: 72 }}>
      <div className="page-hero">
        <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '0 auto', padding: '48px 0' }}>
          <h1 style={{ marginBottom: 6 }}>الإشعارات</h1>
          <p style={{ margin: 0, opacity: .75 }}>تابع آخر تحديثات تبرعاتك</p>
        </div>
      </div>

      <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '32px auto 80px' }}>

        {/* Toolbar */}
        <div className="notif-page-toolbar">
          <div className="notif-filter-tabs">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button
                key={f}
                className={`notif-filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? `الكل (${notifications.length})` : f === 'unread' ? `غير مقروء (${unreadCount})` : `مقروء`}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button className="btn-sm" onClick={markAllRead}>
              <i className="fas fa-check-double" /> تحديد الكل كمقروء
            </button>
          )}
        </div>

        {/* List */}
        {loading ? (
          <div className="spinner"><div className="spinner-ring" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <p>{filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}</p>
          </div>
        ) : (
          <div className="notif-page-list">
            {filtered.map(n => (
              <div
                key={n._id}
                // FIX: use status field, not isRead
                className={`notif-page-item${n.status === 'unread' ? ' unread' : ''}`}
                onClick={() => n.status === 'unread' && markRead(n._id)}
              >
                <div className={`notif-dot${n.status === 'read' ? ' read' : ''}`} style={{ marginTop: 6, flexShrink: 0 }} />
                <div className="notif-page-content">
                  <p className="notif-page-msg">{n.message}</p>
                  <span className="notif-time">
                    {new Date(n.createdAt).toLocaleString('ar-EG', {
                      weekday: 'short', year: 'numeric', month: 'short',
                      day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="notif-page-actions">
                  {n.status === 'unread' && (
                    <button
                      className="notif-action-btn"
                      title="تحديد كمقروء"
                      onClick={e => { e.stopPropagation(); markRead(n._id); }}
                    >
                      <i className="fas fa-check" />
                    </button>
                  )}
                  <button
                    className="notif-action-btn danger"
                    title="حذف"
                    onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                  >
                    <i className="fas fa-trash-alt" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
