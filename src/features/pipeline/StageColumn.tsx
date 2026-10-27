import { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Clock, XCircle, SkipForward } from 'lucide-react';
import type { Stage } from '../../types';
import { CriterionBox } from './CriterionBox';

interface StageColumnProps {
  stage: Stage;
  appId: string;
  stageNumber: number;
  boxRefs?: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
  onReupload?: (criterionId: string) => void;
}

const STATUS_CONFIG = {
  PENDING:              { color: '#6B7686', Icon: Clock,       label: 'PENDING',      glow: '' },
  IN_PROGRESS:          { color: '#1EA7FF', Icon: Loader2,     label: 'IN PROGRESS',  glow: '0 0 24px rgba(30,167,255,0.3)' },
  COMPLETED:            { color: '#22E55A', Icon: CheckCircle2,label: 'COMPLETED',    glow: '0 0 24px rgba(34,229,90,0.3)' },
  FAILED:               { color: '#FF4D4F', Icon: XCircle,     label: 'FAILED',       glow: '0 0 24px rgba(255,77,79,0.3)' },
  SKIPPED:              { color: '#4A5568', Icon: SkipForward, label: 'SKIPPED',      glow: '' },
};

const STAGE_ICONS = ['📋', '🔍', '🏛️', '⚖️', '✅'];

export const StageColumn = memo(function StageColumn({
  stage, stageNumber, boxRefs, onReupload
}: StageColumnProps) {
  const cfg = STATUS_CONFIG[stage.status] || STATUS_CONFIG.PENDING;
  const { Icon } = cfg;

  const completedCount = useMemo(
    () => stage.criteria.filter(c => c.status === 'COMPLETED').length,
    [stage.criteria]
  );
  const totalCount = stage.criteria.filter(c => c.status !== 'SKIPPED').length;
  const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const borderStyle = stage.status === 'SKIPPED'
    ? '1px dashed rgba(255,255,255,0.10)'
    : stage.status === 'IN_PROGRESS'
      ? `2px solid ${cfg.color}`
      : `1px solid rgba(255,255,255,0.10)`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: stage.status === 'SKIPPED' ? 0.5 : 1,
        y: 0,
      }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 16,
        overflow: 'hidden',
        minWidth: 220,
        flex: 1,
        background: 'rgba(255,255,255,0.025)',
        border: borderStyle,
        boxShadow: stage.status === 'COMPLETED'
          ? '0 0 24px rgba(34,229,90,0.15), inset 0 0 20px rgba(34,229,90,0.04)'
          : stage.status === 'IN_PROGRESS'
          ? '0 0 20px rgba(30,167,255,0.15)'
          : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 22 }}>{STAGE_ICONS[stageNumber - 1]}</span>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, opacity: 0.35, letterSpacing: '0.1em' }}>
              {String(stageNumber).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: cfg.color }}>
              {stage.name}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage.status}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 10px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 700,
              background: `${cfg.color}18`,
              border: `1px solid ${cfg.color}44`,
              color: cfg.color,
            }}
          >
            {stage.status === 'IN_PROGRESS' ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Icon size={12} />
              </motion.div>
            ) : (
              <Icon size={12} />
            )}
            <span>{cfg.label}</span>
          </motion.div>
        </AnimatePresence>

        {/* Doc ID */}
        {!stage.skipped && (
          <div style={{ marginTop: 8, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', opacity: 0.3 }}>
            AICTE-2026-00{stageNumber}
          </div>
        )}

        {/* Progress bar */}
        {!stage.skipped && (
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6B7686', marginBottom: 5 }}>
              <span>{completedCount}/{totalCount} criteria</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{Math.round(progressPct)}%</span>
            </div>
            <div style={{ height: 4, borderRadius: 4, overflow: 'hidden', background: 'rgba(255,255,255,0.07)' }}>
              <motion.div
                style={{ height: '100%', borderRadius: 4, background: cfg.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Criteria list */}
      <div style={{ flex: 1, padding: '10px 10px', overflowY: 'auto' }}>
        {stage.skipped ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', padding: '32px 0',
            textAlign: 'center', opacity: 0.4,
          }}>
            <SkipForward size={28} style={{ marginBottom: 8 }} />
            <p style={{ fontSize: 14, fontWeight: 600 }}>Stage Skipped</p>
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Not required for this category</p>
          </div>
        ) : (
          stage.criteria.map(criterion => (
            <div
              key={criterion.id}
              ref={(el) => { boxRefs?.current.set(criterion.id, el); }}
            >
              <CriterionBox
                criterion={criterion}
                onReupload={criterion.status === 'FAILED' ? () => onReupload?.(criterion.id) : undefined}
              />
            </div>
          ))
        )}
      </div>

      {/* Completed shimmer */}
      {stage.status === 'COMPLETED' && (
        <motion.div
          style={{
            position: 'absolute', inset: 0, borderRadius: 16, pointerEvents: 'none',
            background: 'linear-gradient(135deg, rgba(34,229,90,0.15), transparent)',
          }}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />
      )}
    </motion.div>
  );
});
