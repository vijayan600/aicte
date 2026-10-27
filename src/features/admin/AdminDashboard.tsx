import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, TrendingDown, Clock, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApplicationStore } from '../../store/applicationStore';
import { InstitutionList } from './InstitutionList';
import { InstitutionsGraph } from './InstitutionsGraph';
import { ApprovalPipeline } from '../pipeline/ApprovalPipeline';
import { EngineControls } from '../panels/EngineControls';
import { LiveLogs } from '../panels/LiveLogs';

const KPI = ({ label, value, icon: Icon, color }: {
  label: string; value: number | string;
  icon: React.ComponentType<{ size?: number; color?: string }>; color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card"
    style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16 }}
  >
    <div style={{
      width: 52, height: 52, borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: `${color}18`, border: `1px solid ${color}33`,
    }}>
      <Icon size={24} color={color} />
    </div>
    <div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: '#8B9CB8', marginTop: 4 }}>{label}</div>
    </div>
  </motion.div>
);

const STAGE_LABELS = ['Submission', 'Scrutiny', 'EVC Visit', 'SAC/SHC', 'Final'];
const STAGE_COLORS = ['#1EA7FF', '#22E55A', '#FFB020', '#A78BFA', '#F472B6'];

export default function AdminDashboard() {
  const institutions = useApplicationStore(s => s.institutions);
  const applications = useApplicationStore(s => s.applications);
  const [selectedInstId, setSelectedInstId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'graph'>('list');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedInst = institutions.find(i => i.id === selectedInstId);
  const selectedApp = selectedInst
    ? applications.find(a => a.id === selectedInst.applicationId)
    : null;

  const kpis = useMemo(() => ({
    total: institutions.length,
    pending: institutions.filter(i => i.overallStatus === 'PENDING').length,
    inProgress: institutions.filter(i => i.overallStatus === 'IN_PROGRESS').length,
    approved: institutions.filter(i => i.overallStatus === 'COMPLETED').length,
    failed: institutions.filter(i => i.overallStatus === 'FAILED').length,
  }), [institutions]);

  const pendencyData = useMemo(() => {
    return STAGE_LABELS.map((label, i) => {
      const count = applications.filter(a => a.stage === i + 1).length;
      return { label, count };
    });
  }, [applications]);

  const stuckApplications = useMemo(() => {
    return applications
      .filter(a => a.status === 'IN_PROGRESS')
      .map(a => {
        const stage = a.stages.find(s => s.status === 'IN_PROGRESS');
        const stuckCrit = stage?.criteria.find(c => c.status === 'FAILED' || c.status === 'NEEDS_CLARIFICATION');
        return { app: a, stage, stuckCrit };
      })
      .filter(x => x.stuckCrit)
      .slice(0, 5);
  }, [applications]);

  const handleSelectInstitution = (id: string) => {
    setSelectedInstId(id);
    setDrawerOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: '100%' }}>
      {/* Engine Controls */}
      <div className="glass-card" style={{ padding: '16px 20px' }}>
        <EngineControls />
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        <KPI label="Total Institutions" value={kpis.total} icon={Building2} color="#1EA7FF" />
        <KPI label="Pending Review" value={kpis.pending} icon={Clock} color="#6B7686" />
        <KPI label="In Progress" value={kpis.inProgress} icon={TrendingDown} color="#FFB020" />
        <KPI label="Approved" value={kpis.approved} icon={CheckCircle2} color="#22E55A" />
        <KPI label="Failed / Flagged" value={kpis.failed} icon={AlertCircle} color="#FF4D4F" />
      </div>

      {/* Pendency bar chart + Stuck list */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8B9CB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            Pendency by Stage
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pendencyData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#8B9CB8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#8B9CB8', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: 'rgba(10,18,32,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, fontSize: 13 }}
                labelStyle={{ color: '#E8EDF5' }}
                itemStyle={{ color: '#1EA7FF' }}
              />
              <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                {pendencyData.map((_, i) => (
                  <Cell key={i} fill={STAGE_COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#8B9CB8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>
            🚧 Stuck Applications
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {stuckApplications.length === 0 ? (
              <p style={{ fontSize: 14, color: '#4A5568' }}>No stuck applications</p>
            ) : stuckApplications.map(({ app, stage, stuckCrit }) => (
              <div key={app.id} style={{
                padding: '12px 14px',
                borderRadius: 10,
                background: 'rgba(255,77,79,0.07)',
                border: '1px solid rgba(255,77,79,0.18)',
              }}>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: '#FF4D4F', marginBottom: 4 }}>{app.id}</p>
                <p style={{ fontSize: 13, color: '#8B9CB8' }}>Stage {stage?.number}: {stuckCrit?.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Institutions section */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: '#E8EDF5' }}>Institutions</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['list', 'graph'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: activeTab === tab ? 'rgba(30,167,255,0.15)' : 'rgba(255,255,255,0.05)',
                  color: activeTab === tab ? '#1EA7FF' : '#8B9CB8',
                  border: `1px solid ${activeTab === tab ? 'rgba(30,167,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.15s',
                }}
                aria-pressed={activeTab === tab}
              >
                {tab === 'list' ? '☰ List' : '🌐 Graph'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ height: 520 }}>
          {activeTab === 'list' ? (
            <InstitutionList selectedId={selectedInstId} onSelect={handleSelectInstitution} />
          ) : (
            <InstitutionsGraph
              selectedInstitutionId={selectedInstId}
              onSelectInstitution={handleSelectInstitution}
            />
          )}
        </div>
      </div>

      {/* Logs */}
      <LiveLogs />

      {/* Institution Detail Drawer */}
      <AnimatePresence>
        {drawerOpen && selectedInst && selectedApp && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              height: '100%',
              zIndex: 50,
              overflowY: 'auto',
              width: 'min(90vw, 900px)',
              background: 'rgba(5,11,20,0.99)',
              borderLeft: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#E8EDF5' }}>{selectedInst.name}</h2>
                <p style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#4A5568', marginTop: 4 }}>{selectedInst.aicteId}</p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                style={{
                  padding: 10, borderRadius: 10, border: 'none',
                  background: 'rgba(255,255,255,0.06)', cursor: 'pointer', color: '#8B9CB8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'State', value: selectedInst.state },
                  { label: 'Region', value: selectedInst.region },
                  { label: 'Type', value: selectedInst.type },
                  { label: 'Programmes', value: selectedInst.programmes.join(', ') },
                  { label: 'Docs Submitted', value: `${selectedInst.submittedDocs}/${selectedInst.totalDocs}` },
                  { label: 'Deadline', value: selectedInst.deadline },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p style={{ fontSize: 12, color: '#4A5568', marginBottom: 6 }}>{label}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5' }}>{value}</p>
                  </div>
                ))}
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B9CB8', marginBottom: 14 }}>
                  Application Pipeline
                </h3>
                <ApprovalPipeline application={selectedApp} showConnectors={false} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {drawerOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.45)' }} onClick={() => setDrawerOpen(false)} />}
    </div>
  );
}
