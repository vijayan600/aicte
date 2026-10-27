import React, { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApplicationStore } from './store/applicationStore';
import { useUIStore } from './store/uiStore';
import { eventBus } from './services/eventBus';
import { mockEngine } from './services/mockEngine';
import { AppLayout } from './app/AppLayout';
import type { EngineEvent } from './types';

// Lazy load pages
const LoginPage = React.lazy(() => import('./features/auth/LoginPage'));
const InstituteDashboard = React.lazy(() => import('./features/institute/InstituteDashboard'));
const ApplicationDetailPage = React.lazy(() => import('./features/institute/ApplicationDetailPage'));
const AdminDashboard = React.lazy(() => import('./features/admin/AdminDashboard'));
const EVCDashboard = React.lazy(() => import('./features/evc/EVCDashboard'));

// Simple placeholder for secondary pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="glass-card p-8 flex flex-col items-center justify-center gap-3 min-h-64">
    <div className="text-2xl opacity-20">🚧</div>
    <h2 className="text-base font-semibold" style={{ color: '#E8EDF5' }}>{title}</h2>
    <p className="text-xs text-center" style={{ color: '#4A5568', maxWidth: 300 }}>
      This page is part of the full system. Navigate to the dashboard to see the live pipeline.
    </p>
  </div>
);

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#050B14' }}>
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full animate-ping" style={{ background: '#1EA7FF', animationDuration: '1s' }} />
        <span className="text-sm" style={{ color: '#8B9CB8' }}>Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  const { initData, applyEvent, applications } = useApplicationStore();
  const role = useUIStore(s => s.role);

  // Initialize data and engine
  useEffect(() => {
    initData();
  }, [initData]);

  // Subscribe event bus to store
  useEffect(() => {
    const unsub = eventBus.onAll((event: EngineEvent) => {
      applyEvent(event);
    });
    return unsub;
  }, [applyEvent]);

  // Start engine after data is loaded
  useEffect(() => {
    if (applications.length === 0) return;
    mockEngine.start(applications);
    return () => {
      mockEngine.pause();
    };
  }, [applications.length > 0]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={role ? <Navigate to={`/${role}`} replace /> : <LoginPage />} />

        {/* Institute routes */}
        <Route element={<AppLayout requiredRole="institute" />}>
          <Route path="/institute" element={<InstituteDashboard />} />
          <Route path="/institute/applications" element={<InstituteDashboard />} />
          <Route path="/institute/applications/:id" element={<ApplicationDetailPage />} />
          <Route path="/institute/new" element={<Placeholder title="New Application Wizard" />} />
          <Route path="/institute/documents" element={<Placeholder title="Document Management" />} />
          <Route path="/institute/compliance" element={<Placeholder title="Compliance Tracker" />} />
          <Route path="/institute/notifications" element={<Placeholder title="Notifications" />} />
          <Route path="/institute/downloads" element={<Placeholder title="Downloads" />} />
        </Route>

        {/* Admin routes */}
        <Route element={<AppLayout requiredRole="admin" />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/institutions" element={<AdminDashboard />} />
          <Route path="/admin/applications" element={<Placeholder title="All Applications" />} />
          <Route path="/admin/scrutiny" element={<Placeholder title="Scrutiny Queue" />} />
          <Route path="/admin/evc" element={<Placeholder title="EVC Management" />} />
          <Route path="/admin/appeals" element={<Placeholder title="Appeals (SAC/SHC)" />} />
          <Route path="/admin/analytics" element={<Placeholder title="Analytics" />} />
          <Route path="/admin/notifications" element={<Placeholder title="Notifications" />} />
          <Route path="/admin/audit" element={<Placeholder title="Audit Log" />} />
          <Route path="/admin/settings" element={<Placeholder title="Rules & Settings" />} />
        </Route>

        {/* EVC routes */}
        <Route element={<AppLayout requiredRole="evc" />}>
          <Route path="/evc" element={<EVCDashboard />} />
          <Route path="/evc/cases" element={<EVCDashboard />} />
          <Route path="/evc/schedule" element={<Placeholder title="Inspection Schedule" />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
