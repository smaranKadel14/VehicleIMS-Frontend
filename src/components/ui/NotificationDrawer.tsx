import { type FC, useEffect } from 'react';
import { X, CheckCircle, BellOff } from 'lucide-react';

export interface NotificationItem {
  id: number;
  message: string;
  isRead: boolean;
  date: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead?: (id: number) => void;
  onMarkAllAsRead?: () => void;
}

export const NotificationDrawer: FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(26, 26, 26, 0.3)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Sliding Panel */}
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: '#FFFFFF',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          animation: 'drawerSlideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid rgba(26, 26, 26, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111', margin: 0, letterSpacing: '-0.3px' }}>Notifications</h3>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0 0', fontWeight: 500 }}>
              {notifications.filter(n => !n.isRead).length} unread alerts
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F5F5F3', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#8c8c8c' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }} className="custom-scrollbar">
          {notifications.length === 0 ? (
            <div style={{ height: '80%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', gap: 12 }}>
              <BellOff className="w-8 h-8 opacity-60" />
              <p style={{ fontSize: '13px', fontWeight: 500, margin: 0 }}>No notifications found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {notifications.map((notif) => (
                <div 
                  key={notif.id}
                  onClick={() => !notif.isRead && onMarkAsRead && onMarkAsRead(notif.id)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 16,
                    background: notif.isRead ? '#F9FAFB' : 'rgba(26, 26, 26, 0.02)',
                    border: notif.isRead ? '1px solid #F3F4F6' : '1px solid rgba(26, 26, 26, 0.06)',
                    cursor: !notif.isRead && onMarkAsRead ? 'pointer' : 'default',
                    position: 'relative',
                    transition: 'all 0.2s',
                  }}
                  className="hover:scale-[1.01]"
                >
                  {!notif.isRead && (
                    <span style={{ position: 'absolute', top: 16, left: 10, width: 6, height: 6, borderRadius: '50%', background: '#111111' }} />
                  )}
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: notif.isRead ? 500 : 700, color: '#111827', lineHeight: 1.5, paddingLeft: !notif.isRead ? 8 : 0 }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingLeft: !notif.isRead ? 8 : 0 }}>
                    <span style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 600 }}>
                      {new Date(notif.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!notif.isRead && onMarkAsRead && (
                      <span style={{ fontSize: '10px', color: '#111111', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle className="w-3.5 h-3.5" /> Mark read
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {notifications.filter(n => !n.isRead).length > 0 && onMarkAllAsRead && (
          <div style={{ padding: '20px 32px', borderTop: '1px solid rgba(26, 26, 26, 0.06)', flexShrink: 0 }}>
            <button
              onClick={onMarkAllAsRead}
              style={{
                width: '100%',
                background: '#111827',
                color: '#FFFFFF',
                padding: '14px 0',
                borderRadius: 14,
                fontWeight: 800,
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              className="hover:bg-primary/95 active:scale-[0.98]"
            >
              Mark all as read
            </button>
          </div>
        )}

      </div>

      {/* Sliding Keyframes CSS */}
      <style>{`
        @keyframes drawerSlideLeft {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>

    </div>
  );
};
