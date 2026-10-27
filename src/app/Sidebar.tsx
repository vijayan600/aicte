import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Bell, Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, Users, Clipboard, Shield, GitBranch, FolderOpen,
  ClipboardCheck, TrendingUp, BookOpen, Calendar, Download
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useApplicationStore } from '../store/applicationStore';
import type { Role } from '../types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const INSTITUTE_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/institute', icon: LayoutDashboard },
  { label: 'My Applications', path: '/institute/applications', icon: FileText },
  { label: 'New Application', path: '/institute/new', icon: FolderOpen },
  { label: 'Documents', path: '/institute/documents', icon: Clipboard },
  { label: 'Compliance', path: '/institute/compliance', icon: Shield },
  { label: 'Notifications', path: '/institute/notifications', icon: Bell },
  { label: 'Downloads', path: '/institute/downloads', icon: Download },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Institutions', path: '/admin/institutions', icon: Building2 },
  { label: 'Applications', path: '/admin/applications', icon: FileText },
  { label: 'Scrutiny Queue', path: '/admin/scrutiny', icon: ClipboardCheck },
  { label: 'EVC Management', path: '/admin/evc', icon: Users },
  { label: 'Appeals', path: '/admin/appeals', icon: GitBranch },
  { label: 'Analytics', path: '/admin/analytics', icon: TrendingUp },
  { label: 'Notifications', path: '/admin/notifications', icon: Bell },
  { label: 'Audit Log', path: '/admin/audit', icon: BookOpen },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

const EVC_NAV: NavItem[] = [
  { label: 'Dashboard', path: '/evc', icon: LayoutDashboard },
  { label: 'My Cases', path: '/evc/cases', icon: FileText },
  { label: 'Schedule', path: '/evc/schedule', icon: Calendar },
  { label: 'Notifications', path: '/evc/notifications', icon: Bell },
];

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  institute: INSTITUTE_NAV,
  admin: ADMIN_NAV,
  evc: EVC_NAV,
};

const ROLE_LABEL: Record<Role, string> = {
  institute: 'Institute Portal',
  admin: 'AICTE Admin',
  evc: 'EVC Portal',
};

const ROLE_COLOR: Record<Role, string> = {
  institute: '#1EA7FF',
  admin: '#22E55A',
  evc: '#FFB020',
};

export const Sidebar = memo(function Sidebar() {
  const { role, sidebarOpen, setSidebarOpen, logout } = useUIStore();
  const notifications = useApplicationStore(s => s.notifications);
  const location = useLocation();

  if (!role) return null;

  const navItems = NAV_BY_ROLE[role];
  const unreadCount = notifications.filter(n => !n.read).length;
  const accentColor = ROLE_COLOR[role];

  return (
    <AnimatePresence mode="wait">
      <motion.aside
        key="sidebar"
        initial={{ width: sidebarOpen ? 260 : 72 }}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          flexShrink: 0,
          overflow: 'hidden',
          background: 'rgba(5,11,20,0.97)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Logo area */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          minHeight: 72,
        }}>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                background: `${accentColor}22`,
                border: `1px solid ${accentColor}44`,
                color: accentColor,
                flexShrink: 0,
              }}>
                A
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#E8EDF5', lineHeight: 1.2 }}>AICTE</div>
                <div style={{ fontSize: 12, color: accentColor, lineHeight: 1.2 }}>{ROLE_LABEL[role]}</div>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: 8,
              borderRadius: 10,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6B7686',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path ||
              (item.path !== '/institute' && item.path !== '/admin' && item.path !== '/evc' &&
               location.pathname.startsWith(item.path));
            const Icon = item.icon;
            const hasNotif = item.label === 'Notifications' && unreadCount > 0;

            return (
              <Link
                key={item.path + item.label}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '11px 12px',
                  borderRadius: 12,
                  textDecoration: 'none',
                  background: isActive ? `${accentColor}18` : 'transparent',
                  border: `1px solid ${isActive ? `${accentColor}33` : 'transparent'}`,
                  color: isActive ? accentColor : '#8B9CB8',
                  position: 'relative',
                  transition: 'all 0.15s',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Icon size={20} color={isActive ? accentColor : '#8B9CB8'} />
                  {hasNotif && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#FF4D4F',
                      color: 'white',
                      fontSize: 9,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ fontSize: 14, fontWeight: isActive ? 600 : 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {item.label}
                  </motion.span>
                )}
                {!sidebarOpen && (
                  <div style={{
                    position: 'absolute',
                    left: '100%',
                    marginLeft: 8,
                    padding: '6px 10px',
                    borderRadius: 8,
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    background: 'rgba(10,18,32,0.97)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: '#E8EDF5',
                    zIndex: 50,
                    pointerEvents: 'none',
                    transition: 'opacity 0.15s',
                  }}>
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 12px',
              borderRadius: 12,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#8B9CB8',
              width: '100%',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,77,79,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Log out"
          >
            <LogOut size={20} />
            {sidebarOpen && <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>Log out</span>}
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
});
