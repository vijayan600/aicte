import { memo, useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { Role } from '../types';

interface AppLayoutProps {
  requiredRole?: Role;
}

export const AppLayout = memo(function AppLayout({ requiredRole }: AppLayoutProps) {
  const { role } = useUIStore();
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // Scroll main container to top whenever route changes
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  if (!role) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    const defaultRoutes: Record<Role, string> = {
      institute: '/institute',
      admin: '/admin',
      evc: '/evc',
    };
    return <Navigate to={defaultRoutes[role]} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050B14' }}>
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar />
        <main ref={mainRef} className="flex-1 overflow-auto p-4 md:p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
});

