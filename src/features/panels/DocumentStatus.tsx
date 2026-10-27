import { memo } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, FileX, FileClock } from 'lucide-react';
import type { Application } from '../../types';

interface DocumentStatusProps {
  application: Application;
}

export const DocumentStatus = memo(function DocumentStatus({ application }: DocumentStatusProps) {
  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-3 uppercase tracking-wider" style={{ color: '#8B9CB8' }}>
        Document Status
      </h3>
      <div className="space-y-3">
        {application.stages.map((stage) => {
          const completed = stage.criteria.filter(c => c.status === 'COMPLETED').length;
          const total = stage.criteria.length;
          const pct = total > 0 ? (completed / total) * 100 : 0;
          const color = stage.status === 'COMPLETED' ? '#22E55A'
            : stage.status === 'IN_PROGRESS' ? '#1EA7FF'
            : stage.status === 'FAILED' ? '#FF4D4F'
            : stage.status === 'SKIPPED' ? '#4A5568'
            : '#6B7686';

          const StatusIcon = stage.status === 'COMPLETED' ? FileCheck
            : stage.status === 'FAILED' ? FileX
            : FileClock;

          return (
            <div key={stage.id} className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18`, border: `1px solid ${color}33` }}>
                <StatusIcon size={13} color={color} />
              </div>

              {/* Label + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs truncate" style={{ color: '#E8EDF5' }}>
                    Stage {stage.number}: {stage.name}
                  </span>
                  <span className="text-xs mono ml-2 flex-shrink-0" style={{ color }}>
                    {stage.skipped ? 'N/A' : `${completed}/${total}`}
                  </span>
                </div>
                {!stage.skipped && (
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
