import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, CheckCircle2, XCircle, AlertTriangle, Send, Clock } from 'lucide-react';
import { useApplicationStore } from '../../store/applicationStore';
import { EVC_MEMBERS } from '../../mock/institutions';
import { ApprovalPipeline } from '../pipeline/ApprovalPipeline';
import { LiveLogs } from '../panels/LiveLogs';

const MY_EVC_ID = 'EVC001';

const INSPECTION_ITEMS = [
  'Building infrastructure & safety compliance',
  'Laboratory equipment adequacy',
  'Library resources and digital access',
  'Faculty qualification records',
  'Student facilities (hostel, cafeteria)',
  'Administrative systems and records',
  'Fire safety and evacuation plan',
  'Accessibility for differently-abled persons',
];

type CheckStatus = 'compliant' | 'non_compliant' | 'needs_clarification' | null;

export default function EVCDashboard() {
  const applications = useApplicationStore(s => s.applications);
  const institutions = useApplicationStore(s => s.institutions);
  const evcMember = EVC_MEMBERS.find(m => m.id === MY_EVC_ID);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, CheckStatus>>({});
  const [observations, setObservations] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  const assignedApps = useMemo(() => {
    if (!evcMember) return [];
    return evcMember.assignedCases
      .map(appId => {
        const app = applications.find(a => a.id === appId);
        const inst = institutions.find(i => i.applicationId === appId);
        return app && inst ? { app, inst } : null;
      })
      .filter(Boolean) as Array<{ app: typeof applications[0]; inst: typeof institutions[0] }>;
  }, [evcMember, applications, institutions]);

  const selectedCase = assignedApps.find(c => c.app.id === selectedCaseId);
  const setCheck = (item: string, status: CheckStatus) => setChecks(prev => ({ ...prev, [item]: status }));
  const allChecked = INSPECTION_ITEMS.every(item => checks[item] !== null && checks[item] !== undefined);
  const compliantCount = Object.values(checks).filter(v => v === 'compliant').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* EVC Member header */}
      <div className="glass-card" style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{
          width: 60, height: 60, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800,
          background: 'rgba(255,176,32,0.15)',
          border: '2px solid rgba(255,176,32,0.45)',
          color: '#FFB020', flexShrink: 0,
        }}>
          {evcMember?.name.charAt(0) ?? 'E'}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#E8EDF5', marginBottom: 4 }}>
            {evcMember?.name ?? 'EVC Member'}
          </h1>
          <p style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#FFB020', marginBottom: 2 }}>{evcMember?.email}</p>
          <p style={{ fontSize: 13, color: '#8B9CB8' }}>{assignedApps.length} assigned cases</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            fontSize: 13, fontWeight: 700,
            padding: '8px 16px', borderRadius: 20,
            background: 'rgba(255,176,32,0.12)',
            color: '#FFB020',
            border: '1px solid rgba(255,176,32,0.35)',
          }}>
            EVC PORTAL
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Case list */}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E8EDF5' }}>Assigned Cases</h2>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: 560 }}>
            {assignedApps.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', fontSize: 14, color: '#4A5568' }}>
                No cases assigned
              </div>
            ) : (
              assignedApps.map(({ app, inst }) => {
                const isSelected = app.id === selectedCaseId;
                const evcStage = app.stages.find(s => s.number === 3);
                const visitScheduled = evcStage?.criteria[0]?.status === 'COMPLETED';

                return (
                  <motion.div
                    key={app.id}
                    onClick={() => setSelectedCaseId(app.id)}
                    whileHover={{ background: 'rgba(255,255,255,0.04)' }}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(255,176,32,0.09)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      borderLeft: `3px solid ${isSelected ? '#FFB020' : 'transparent'}`,
                      transition: 'background 0.15s',
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.name}</p>
                    <p style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#4A5568', marginBottom: 8 }}>{app.id}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      {visitScheduled ? <CheckCircle2 size={14} color="#22E55A" /> : <Clock size={14} color="#FFB020" />}
                      <span style={{ fontSize: 13, color: visitScheduled ? '#22E55A' : '#FFB020', fontWeight: 600 }}>
                        {visitScheduled ? 'Visit Scheduled' : 'Pending Schedule'}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: '#8B9CB8' }}>Deadline: {inst.deadline}</p>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* Inspection workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {!selectedCase ? (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
              <div style={{ textAlign: 'center' }}>
                <FileText size={40} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                <p style={{ fontSize: 15, color: '#4A5568' }}>Select a case to begin inspection</p>
              </div>
            </div>
          ) : (
            <>
              {/* Case info */}
              <div className="glass-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#E8EDF5', marginBottom: 6 }}>
                      {selectedCase.inst.name}
                    </h3>
                    <p style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#4A5568' }}>
                      {selectedCase.app.id} · {selectedCase.app.category}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#FFB020', fontSize: 14, fontWeight: 600 }}>
                    <Calendar size={16} />
                    Visit: {selectedCase.inst.deadline}
                  </div>
                </div>
              </div>

              {/* Pipeline */}
              <div className="glass-card" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B9CB8', marginBottom: 16 }}>
                  Stage 3 Status
                </h3>
                <ApprovalPipeline application={selectedCase.app} showConnectors={false} />
              </div>

              {/* Inspection Checklist */}
              <div className="glass-card" style={{ padding: '20px 24px' }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#E8EDF5', marginBottom: 20 }}>
                  Inspection Checklist
                </h3>

                {reportSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 0', gap: 12 }}
                  >
                    <div style={{
                      width: 64, height: 64, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'rgba(34,229,90,0.15)', border: '2px solid #22E55A',
                    }}>
                      <CheckCircle2 size={32} color="#22E55A" />
                    </div>
                    <p style={{ fontSize: 17, fontWeight: 700, color: '#22E55A' }}>Report Submitted</p>
                    <p style={{ fontSize: 14, color: '#8B9CB8' }}>{compliantCount}/{INSPECTION_ITEMS.length} items compliant</p>
                  </motion.div>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      {INSPECTION_ITEMS.map(item => {
                        const status = checks[item];
                        return (
                          <div key={item} style={{
                            padding: '14px 16px',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 16,
                            background: 'rgba(255,255,255,0.025)',
                            border: `1px solid ${
                              status === 'compliant' ? 'rgba(34,229,90,0.25)' :
                              status === 'non_compliant' ? 'rgba(255,77,79,0.25)' :
                              status === 'needs_clarification' ? 'rgba(255,176,32,0.25)' :
                              'rgba(255,255,255,0.07)'
                            }`,
                          }}>
                            <p style={{ flex: 1, fontSize: 14, color: '#E8EDF5' }}>{item}</p>
                            <div style={{ display: 'flex', gap: 8 }}>
                              {[
                                { val: 'compliant' as CheckStatus,            icon: CheckCircle2,   color: '#22E55A', title: 'Compliant' },
                                { val: 'needs_clarification' as CheckStatus,  icon: AlertTriangle,  color: '#FFB020', title: 'Needs Clarification' },
                                { val: 'non_compliant' as CheckStatus,        icon: XCircle,        color: '#FF4D4F', title: 'Non-Compliant' },
                              ].map(({ val, icon: Icon, color, title }) => (
                                <button
                                  key={val}
                                  onClick={() => setCheck(item, val)}
                                  title={title}
                                  aria-label={title}
                                  style={{
                                    padding: '8px 10px',
                                    borderRadius: 10,
                                    cursor: 'pointer',
                                    background: status === val ? `${color}18` : 'transparent',
                                    border: `1px solid ${status === val ? color : 'rgba(255,255,255,0.09)'}`,
                                    transition: 'all 0.15s',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  }}
                                >
                                  <Icon size={16} color={status === val ? color : '#4A5568'} />
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Observations */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={{ fontSize: 14, fontWeight: 600, color: '#8B9CB8', display: 'block', marginBottom: 8 }}>
                        Observations / Notes
                      </label>
                      <textarea
                        value={observations}
                        onChange={e => setObservations(e.target.value)}
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          fontSize: 14,
                          borderRadius: 12,
                          outline: 'none',
                          resize: 'none',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          color: '#E8EDF5',
                          lineHeight: 1.6,
                        }}
                        placeholder="Enter inspection observations…"
                        aria-label="Inspection observations"
                      />
                    </div>

                    {/* Submit button */}
                    <div>
                      <button
                        onClick={() => setReportSubmitted(true)}
                        disabled={!allChecked}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 10,
                          padding: '12px 24px', borderRadius: 12,
                          fontSize: 15, fontWeight: 700,
                          cursor: allChecked ? 'pointer' : 'not-allowed',
                          opacity: allChecked ? 1 : 0.4,
                          background: 'rgba(255,176,32,0.15)',
                          border: '1px solid rgba(255,176,32,0.45)',
                          color: '#FFB020',
                          transition: 'opacity 0.15s',
                        }}
                      >
                        <Send size={18} />
                        Submit Inspection Report
                      </button>
                      {!allChecked && (
                        <p style={{ marginTop: 10, fontSize: 13, color: '#4A5568' }}>
                          Please mark all checklist items before submitting
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <LiveLogs />
    </div>
  );
}
