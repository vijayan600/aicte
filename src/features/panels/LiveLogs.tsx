import { useRef, useEffect, memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Pause, Play } from 'lucide-react';
import type { EventLog } from '../../types';
import { useApplicationStore } from '../../store/applicationStore';

interface LiveLogsProps {
  applicationId?: string;
  maxLines?: number;
}

const LOG_COLORS: Record<EventLog['type'], string> = {
  success: '#22E55A',
  processing: '#1EA7FF',
  next: '#FFB020',
  error: '#FF4D4F',
  info: '#8B9CB8',
  warning: '#FFB020',
};

const LOG_PREFIXES: Record<EventLog['type'], string> = {
  success: '✓',
  processing: '⟳',
  next: '→',
  error: '✗',
  info: 'ℹ',
  warning: '⚠',
};

export const LiveLogs = memo(function LiveLogs({ applicationId, maxLines = 60 }: LiveLogsProps) {
  const logs = useApplicationStore(s => s.logs);
  const containerRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);

  const filteredLogs = applicationId
    ? logs.filter(l => l.applicationId === applicationId)
    : logs;

  const displayedLogs = filteredLogs.slice(0, maxLines);

  // Auto-scroll ONLY inside the logs container, NEVER scroll the dashboard page
  useEffect(() => {
    if (!paused && shouldScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLogs.length, paused, shouldScroll]);

  return (
    <div className="glass-card flex flex-col" style={{ height: 260 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <Terminal size={14} style={{ color: '#1EA7FF' }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#8B9CB8' }}>
            Live Logs
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded mono" style={{ background: 'rgba(30,167,255,0.15)', color: '#1EA7FF' }}>
            {displayedLogs.length}
          </span>
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors"
          style={{
            background: paused ? 'rgba(255,176,32,0.1)' : 'rgba(255,255,255,0.05)',
            color: paused ? '#FFB020' : '#6B7686',
            border: `1px solid ${paused ? 'rgba(255,176,32,0.3)' : 'rgba(255,255,255,0.08)'}`,
          }}
          aria-label={paused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
        >
          {paused ? <Play size={11} /> : <Pause size={11} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      {/* Log list */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto p-3 font-mono text-xs space-y-0.5"
        style={{ background: 'rgba(0,0,0,0.2)' }}
        onMouseEnter={() => setShouldScroll(false)}
        onMouseLeave={() => setShouldScroll(true)}
      >
        <AnimatePresence initial={false}>
          {displayedLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full" style={{ color: '#4A5568' }}>
              <p>Waiting for events…</p>
            </div>
          ) : (
            displayedLogs.slice().reverse().map(log => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex gap-2 leading-5"
              >
                <span className="opacity-30 text-xs flex-shrink-0" style={{ color: '#6B7686', minWidth: 70 }}>
                  {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                </span>
                <span className="flex-shrink-0" style={{ color: LOG_COLORS[log.type] }}>
                  {LOG_PREFIXES[log.type]}
                </span>
                <span style={{ color: LOG_COLORS[log.type], opacity: log.type === 'info' ? 0.7 : 1 }}>
                  {log.message}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
