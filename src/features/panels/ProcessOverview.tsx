import { memo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, Clock, XCircle } from 'lucide-react';
import type { Application } from '../../types';

interface ProcessOverviewProps {
  application: Application;
}

const STAGE_NAMES = [
  { short: 'Submission',  full: 'Application Submission' },
  { short: 'Scrutiny',   full: 'Document Scrutiny' },
  { short: 'EVC Visit',  full: 'EVC Inspection Visit' },
  { short: 'SAC/SHC',    full: 'SAC/SHC Committee' },
  { short: 'Final',      full: 'Final Approval' },
];

export const ProcessOverview = memo(function ProcessOverview({ application }: ProcessOverviewProps) {
  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B9CB8', marginBottom: 24 }}>
        Process Overview
      </h3>
      <div style={{ position: 'relative' }}>
        {/* Connector track */}
        <div style={{ position: 'absolute', top: 28, left: '10%', right: '10%', height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
          <motion.div
            style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(to right, #22E55A, #1EA7FF)' }}
            animate={{ width: `${Math.max(0, ((application.stage - 1) / 4) * 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Stage nodes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
          {application.stages.map((stage, idx) => {
            const pct = stage.status === 'COMPLETED' ? 100
              : stage.status === 'IN_PROGRESS'
                ? Math.round(stage.criteria.filter(c => c.status === 'COMPLETED').length / Math.max(1, stage.criteria.length) * 100)
                : 0;

            const color = stage.status === 'COMPLETED' ? '#22E55A'
              : stage.status === 'IN_PROGRESS' ? '#1EA7FF'
              : stage.status === 'SKIPPED' ? '#4A5568'
              : '#6B7686';

            const Icon = stage.status === 'COMPLETED' ? CheckCircle2
              : stage.status === 'IN_PROGRESS' ? Loader2
              : stage.status === 'FAILED' ? XCircle
              : Clock;

            return (
              <div key={stage.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '20%' }}>
                {/* Node circle */}
                <motion.div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    background: `${color}18`,
                    border: `2.5px solid ${color}`,
                    boxShadow: stage.status !== 'PENDING' ? `0 0 16px ${color}44` : 'none',
                  }}
                  animate={{ scale: stage.status === 'IN_PROGRESS' ? [1, 1.09, 1] : 1 }}
                  transition={{ duration: 2, repeat: stage.status === 'IN_PROGRESS' ? Infinity : 0 }}
                >
                  {stage.status === 'IN_PROGRESS' ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Icon size={22} color={color} />
                    </motion.div>
                  ) : (
                    <Icon size={22} color={color} />
                  )}
                </motion.div>

                {/* Stage label */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color, marginBottom: 2 }}>
                    {STAGE_NAMES[idx].short}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>
                    {pct}%
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
