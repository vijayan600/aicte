import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Clock, AlertTriangle, SkipForward } from 'lucide-react';
import type { Criterion } from '../../types';

interface CriterionBoxProps {
  criterion: Criterion;
  boxRef?: React.RefObject<HTMLDivElement | null>;
  onReupload?: () => void;
}

const STATUS_CONFIG = {
  PENDING:              { color: '#6B7686', glow: 'none',                         icon: Clock,          label: 'Pending' },
  IN_PROGRESS:          { color: '#1EA7FF', glow: '0 0 14px rgba(30,167,255,0.4)',icon: Clock,          label: 'Processing' },
  COMPLETED:            { color: '#22E55A', glow: '0 0 14px rgba(34,229,90,0.4)', icon: Check,          label: 'Completed' },
  FAILED:               { color: '#FF4D4F', glow: '0 0 14px rgba(255,77,79,0.4)', icon: AlertCircle,    label: 'Failed' },
  NEEDS_CLARIFICATION:  { color: '#FFB020', glow: '0 0 14px rgba(255,176,32,0.4)',icon: AlertTriangle,  label: 'Clarification' },
  SKIPPED:              { color: '#4A5568', glow: 'none',                         icon: SkipForward,    label: 'Skipped' },
};

export const CriterionBox = memo(function CriterionBox({ criterion, boxRef, onReupload }: CriterionBoxProps) {
  const cfg = STATUS_CONFIG[criterion.status] || STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;

  const borderColor = (criterion.status === 'PENDING' || criterion.status === 'SKIPPED')
    ? 'rgba(255,255,255,0.09)'
    : cfg.color;

  return (
    <motion.div
      ref={boxRef as React.RefObject<HTMLDivElement>}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: criterion.status === 'SKIPPED' ? 0.4 : 1,
        scale: 1,
        boxShadow: cfg.glow,
      }}
      transition={{ duration: 0.3 }}
      className="group"
      style={{
        position: 'relative',
        borderRadius: 12,
        padding: '12px 14px',
        marginBottom: 8,
        cursor: 'default',
        userSelect: 'none',
        background: 'rgba(255,255,255,0.035)',
        border: `1px solid ${borderColor}`,
        boxShadow: cfg.glow !== 'none' ? cfg.glow : undefined,
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: criterion.status === 'IN_PROGRESS' || criterion.status === 'COMPLETED' ? 8 : 0 }}>
        {/* Status ring / icon */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {criterion.status === 'IN_PROGRESS' ? (
            <svg width="26" height="26" viewBox="0 0 26 26">
              <circle cx="13" cy="13" r="10" fill="none" stroke="rgba(30,167,255,0.2)" strokeWidth="2.5" />
              <motion.circle
                cx="13" cy="13" r="10"
                fill="none"
                stroke="#1EA7FF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="62"
                strokeDashoffset="47"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ transformOrigin: '13px 13px' }}
              />
            </svg>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={criterion.status}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.25, type: 'spring', stiffness: 300 }}
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: (criterion.status === 'PENDING' || criterion.status === 'SKIPPED')
                    ? 'transparent'
                    : `${cfg.color}22`,
                  border: `2px solid ${cfg.color}`,
                }}
              >
                <Icon size={13} color={cfg.color} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Label */}
        <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3, flex: 1, color: cfg.color }}>
          {criterion.label}
        </span>

        {/* Score badge */}
        {criterion.score !== undefined && criterion.status === 'COMPLETED' && (
          <span style={{
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 700,
            padding: '2px 7px',
            borderRadius: 6,
            background: 'rgba(34,229,90,0.12)',
            color: '#22E55A',
            border: '1px solid rgba(34,229,90,0.25)',
          }}>
            {(criterion.score * 100).toFixed(0)}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {(criterion.status === 'IN_PROGRESS' || criterion.status === 'COMPLETED') && (
        <div style={{ height: 3, borderRadius: 3, overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
          <motion.div
            style={{ height: '100%', borderRadius: 3, background: cfg.color }}
            initial={{ width: 0 }}
            animate={{ width: `${criterion.progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Fail reason */}
      {criterion.status === 'FAILED' && criterion.failReason && (
        <div style={{ marginTop: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#FF4D4F', marginBottom: 3 }}>⚠ {criterion.failReason}</p>
          {criterion.evidence && <p style={{ fontSize: 12, color: '#FF4D4F', opacity: 0.7 }}>{criterion.evidence}</p>}
          {onReupload && (
            <button
              onClick={onReupload}
              style={{
                marginTop: 8,
                padding: '7px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: 'rgba(255,77,79,0.15)',
                border: '1px solid rgba(255,77,79,0.45)',
                color: '#FF4D4F',
              }}
            >
              Re-upload Document
            </button>
          )}
        </div>
      )}

      {/* Clarification note */}
      {criterion.status === 'NEEDS_CLARIFICATION' && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#FFB020', fontWeight: 600 }}>
          ⚠ Clarification required
        </div>
      )}
    </motion.div>
  );
});
