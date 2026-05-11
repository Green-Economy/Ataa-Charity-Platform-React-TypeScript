import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { notificationApi, Notification } from '../../services';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  // ✅ BUG #5 FIX: إضافة error state بدل silent catch
  const [fetchError, setFetchError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const unread = notifications.filter(n => n.status === 'unread').length;

  const fetchNotifications = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await notificationApi.getAll();
      setNotifications(data.notifications || []);
    } catch (err: unknown) {
      // ✅ BUG #5 FIX: نحفظ الخطأ ونعرضه في الـ dropdown
      setFetchError(err instanceof Error ? err.message : 'فشل تحميل الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
    } catch { /* silent — عملية ثانوية */ }
  };

  const handleViewAll = () => {
    setOpen(false);
    setLocation('/notifications');
  };

  return (
    <div className="notif-bell-wrap" ref={dropRef}>
      <button
        className="notif-bell-btn"
        onClick={() => setOpen(o => !o)}
        title="الإشعارات"
      >
        <i className="fas fa-bell" />
        {unread > 0 && (
          <span className="notif-bell-badge">{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-drop-header">
            <span className="notif-drop-title">الإشعارات</span>
            {unread > 0 && <span className="notif-drop-count">{unread} جديد</span>}
          </div>

          <div className="notif-drop-list">
            {loading ? (
              <div className="notif-drop-empty">
                <div className="spinner" style={{ padding: 20 }}><div className="spinner-ring" /></div>
              </div>
            ) : fetchError ? (
              // ✅ BUG #5 FIX: عرض رسالة خطأ في الـ dropdown مع زرار إعادة المحاولة
              <div className="notif-drop-empty" style={{ padding: '16px 12px', gap: 8 }}>
                <i className="fas fa-exclamation-circle" style={{ fontSize: 24, color: 'var(--danger, #ef4444)' }} />
                <p style={{ fontSize: 13, margin: 0 }}>{fetchError}</p>
                <button
                  onClick={fetchNotifications}
                  style={{ fontSize: 12, marginTop: 4, background: 'none', border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: 'inherit' }}
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notif-drop-empty">
                <i className="fas fa-bell-slash" style={{ fontSize: 28, color: 'var(--neutral-300)', marginBottom: 8 }} />
                <p>لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div
                  key={n._id}
                  className={`notif-drop-item${n.status === 'unread' ? ' unread' : ''}`}
                  onClick={() => n.status === 'unread' && markRead(n._id)}
                >
                  <div className={`notif-dot${n.status === 'read' ? ' read' : ''}`} />
                  <div className="notif-drop-text">
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <button className="notif-drop-footer" onClick={handleViewAll}>
              عرض كل الإشعارات ({notifications.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
}