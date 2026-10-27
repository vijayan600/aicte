import { memo, useState } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useApplicationStore } from '../store/applicationStore';

interface TopBarProps {
  title?: string;
}

export const TopBar = memo(function TopBar({ title }: TopBarProps) {
  const { role, logout } = useUIStore();
  const notifications = useApplicationStore(s => s.notifications);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const unread = notifications.filter(n => !n.read);
  const applyEvent = useApplicationStore(s => s.applyEvent);

  const ROLE_NAMES: Record<string, string> = {
    institute: 'Institute User',
    admin: 'AICTE Administrator',
    evc: 'EVC Member',
  };

  const ROLE_COLORS: Record<string, string> = {
    institute: '#1EA7FF',
    admin: '#22E55A',
    evc: '#FFB020',
  };

  const accentColor = role ? ROLE_COLORS[role] : '#1EA7FF';
  const userName = role ? ROLE_NAMES[role] : 'User';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(5,11,20,0.93)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(20px)',
        minHeight: 68,
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div>
        {title && (
          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#E8EDF5', marginBottom: 2 }}>{title}</h1>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7686' }}>
          <span>AICTE Intelligent Document Processing System</span>
          <span>•</span>
          <span style={{ color: accentColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 12 }}>
            {role?.toUpperCase()} PORTAL
          </span>
        </div>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Search */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: 12, color: '#4A5568' }} />
          <input
            style={{
              paddingLeft: 36,
              paddingRight: 14,
              paddingTop: 9,
              paddingBottom: 9,
              fontSize: 14,
              borderRadius: 10,
              outline: 'none',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#E8EDF5',
              width: 200,
              transition: 'width 0.2s, border-color 0.2s',
            }}
            onFocus={e => { e.currentTarget.style.width = '260px'; e.currentTarget.style.borderColor = 'rgba(30,167,255,0.4)'; }}
            onBlur={e => { e.currentTarget.style.width = '200px'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
            placeholder="Search…"
            aria-label="Global search"
          />
        </div>

        {/* Notification bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(o => !o)}
            style={{
              position: 'relative',
              padding: 10,
              borderRadius: 10,
              border: 'none',
              background: 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              color: '#8B9CB8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            aria-label={`${unread.length} unread notifications`}
          >
            <Bell size={20} />
            {unread.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#FF4D4F',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unread.length > 9 ? '9+' : unread.length}
              </motion.span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 8,
                  width: 360,
                  borderRadius: 14,
                  overflow: 'hidden',
                  zIndex: 50,
                  background: 'rgba(10,18,32,0.99)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                }}
              >
                <div style={{
                  padding: '14px 18px',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#E8EDF5' }}>Notifications</span>
                  <span style={{
                    fontSize: 12,
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'rgba(255,77,79,0.15)',
                    color: '#FF4D4F',
                    fontWeight: 600,
                  }}>
                    {unread.length} unread
                  </span>
                </div>
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.slice(0, 10).map(n => (
                    <div
                      key={n.id}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        background: n.read ? 'transparent' : 'rgba(30,167,255,0.05)',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onClick={() => applyEvent({ type: 'notification.created', notification: { ...n, read: true } })}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          marginTop: 6,
                          flexShrink: 0,
                          background: n.type === 'failure' ? '#FF4D4F'
                            : n.type === 'completed' ? '#22E55A'
                            : n.type === 'clarification' ? '#FFB020'
                            : '#1EA7FF',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</p>
                          <p style={{ fontSize: 13, color: '#8B9CB8', lineHeight: 1.5, marginBottom: 4 }}>{n.message}</p>
                          <p style={{ fontSize: 12, color: '#4A5568', fontFamily: 'JetBrains Mono, monospace' }}>
                            {new Date(n.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div style={{ padding: '32px 18px', textAlign: 'center', fontSize: 14, color: '#4A5568' }}>
                      No notifications yet
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User chip */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setUserOpen(o => !o)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.09)',
              background: 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
            aria-haspopup="true"
            aria-expanded={userOpen}
          >
            <div style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              background: accentColor,
              color: '#050B14',
              flexShrink: 0,
            }}>
              {userName.charAt(0)}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5' }}>
              {userName.split(' ')[0]}
            </span>
            <ChevronDown size={14} style={{ color: '#6B7686' }} />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: 8,
                  width: 200,
                  borderRadius: 14,
                  overflow: 'hidden',
                  zIndex: 50,
                  background: 'rgba(10,18,32,0.99)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 16px 32px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#E8EDF5', marginBottom: 2 }}>{userName}</p>
                  <p style={{ fontSize: 12, color: accentColor, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{role?.toUpperCase()}</p>
                </div>
                <button
                  onClick={logout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 16px',
                    fontSize: 14,
                    color: '#FF4D4F',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,77,79,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
});
