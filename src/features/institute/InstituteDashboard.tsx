import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, AlertCircle, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import { useApplicationStore } from '../../store/applicationStore';
import { ApprovalPipeline } from '../pipeline/ApprovalPipeline';
import { ProcessOverview } from '../panels/ProcessOverview';
import { ProcessMetrics } from '../panels/ProcessMetrics';
import { LiveLogs } from '../panels/LiveLogs';
import { DocumentStatus } from '../panels/DocumentStatus';
import { EngineControls } from '../panels/EngineControls';

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#6B7686',
  IN_PROGRESS: '#1EA7FF',
  COMPLETED: '#22E55A',
  FAILED: '#FF4D4F',
  RETURNED: '#FFB020',
};

const KPI = ({ label, value, icon: Icon, color }: {
  label: string; value: number;
  icon: React.ComponentType<{ size?: number; color?: string }>; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card"
    style={{ padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 18 }}
  >
    <div style={{
      width: 56, height: 56, borderRadius: 16, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `${color}18`, border: `1px solid ${color}33`,
    }}>
      <Icon size={26} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 30, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 14, color: '#8B9CB8', marginTop: 5 }}>{label}</div>
    </div>
  </motion.div>
);

export default function InstituteDashboard() {
  const applications = useApplicationStore(s => s.applications);
  const institutions = useApplicationStore(s => s.institutions);

  const myInstitution = institutions[0];
  const myApps = useMemo(() =>
    applications.filter(a => a.institutionId === myInstitution?.id),
    [applications, myInstitution]
  );

  const primaryApp = myApps[0] || applications[0];

  const kpis = useMemo(() => ({
    total: myApps.length || applications.length,
    inProgress: applications.filter(a => a.status === 'IN_PROGRESS').length,
    returned: applications.filter(a => a.status === 'RETURNED' || a.status === 'FAILED').length,
    approved: applications.filter(a => a.status === 'COMPLETED').length,
  }), [applications, myApps]);

  if (!primaryApp) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 16, color: '#6B7686' }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '100%' }}>

      {/* Engine Controls */}
      <div className="glass-card" style={{ padding: '18px 24px' }}>
        <EngineControls />
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPI label="Total Applications" value={kpis.total}     icon={FileText}     color="#1EA7FF" />
        <KPI label="In Progress"        value={kpis.inProgress} icon={Clock}        color="#FFB020" />
        <KPI label="Returned / Failed"  value={kpis.returned}  icon={AlertCircle}  color="#FF4D4F" />
        <KPI label="Approved"           value={kpis.approved}  icon={CheckCircle2} color="#22E55A" />
      </div>

      {/* Process Overview */}
      <ProcessOverview application={primaryApp} />

      {/* Pipeline */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8EDF5', marginBottom: 4 }}>
              Approval Pipeline
            </h2>
            <p style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#4A5568' }}>
              {primaryApp.id} · {primaryApp.category}
            </p>
          </div>
          <span style={{
            fontSize: 13, fontWeight: 700,
            padding: '6px 14px', borderRadius: 20,
            background: `${STATUS_COLORS[primaryApp.status]}18`,
            color: STATUS_COLORS[primaryApp.status],
            border: `1px solid ${STATUS_COLORS[primaryApp.status]}35`,
          }}>
            {primaryApp.status}
          </span>
        </div>
        <ApprovalPipeline application={primaryApp} />
      </div>

      {/* Metrics + Document Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <ProcessMetrics application={primaryApp} />
        <DocumentStatus application={primaryApp} />
      </div>

      {/* Live Logs */}
      <LiveLogs applicationId={primaryApp.id} />

      {/* My Applications table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E8EDF5' }}>My Applications</h3>
          <Link
            to="/institute/new"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700,
              textDecoration: 'none',
              background: 'rgba(30,167,255,0.15)',
              color: '#1EA7FF',
              border: '1px solid rgba(30,167,255,0.38)',
            }}
          >
            <Plus size={16} />
            New Application
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Application ID', 'Category', 'Stage', 'Status', 'Deadline', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '10px 16px',
                    fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.07em', color: '#4A5568',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.slice(0, 8).map(app => (
                <tr key={app.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#8B9CB8' }}>{app.id}</td>
                  <td style={{ padding: '14px 16px', fontSize: 14, color: '#E8EDF5' }}>{app.category}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 13, fontWeight: 600,
                      background: 'rgba(30,167,255,0.12)', color: '#1EA7FF',
                    }}>
                      Stage {app.stage}/5
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                      background: `${STATUS_COLORS[app.status]}15`,
                      color: STATUS_COLORS[app.status],
                    }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#8B9CB8' }}>
                    {app.deadline}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <Link
                      to={`/institute/applications/${app.id}`}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1EA7FF', textDecoration: 'none' }}
                    >
                      View <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
