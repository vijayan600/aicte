import { memo } from 'react';
import { Play, Pause, AlertOctagon, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useApplicationStore } from '../../store/applicationStore';
import { mockEngine } from '../../services/mockEngine';

export const EngineControls = memo(function EngineControls() {
  const engineRunning = useApplicationStore(s => s.engineRunning);
  const engineSpeed = useApplicationStore(s => s.engineSpeed);
  const setEngineRunning = useApplicationStore(s => s.setEngineRunning);
  const setEngineSpeed = useApplicationStore(s => s.setEngineSpeed);
  const applications = useApplicationStore(s => s.applications);
  const initData = useApplicationStore(s => s.initData);

  const handlePlayPause = () => {
    if (engineRunning) {
      mockEngine.pause();
      setEngineRunning(false);
    } else {
      mockEngine.resume();
      setEngineRunning(true);
    }
  };

  const handleSpeed = (speed: 1 | 2 | 5) => {
    mockEngine.setSpeed(speed);
    setEngineSpeed(speed);
  };

  const handleForceFail = () => mockEngine.forceFailNext();

  const handleReset = () => {
    initData();
    mockEngine.reset(applications);
    setTimeout(() => { mockEngine.resume(); setEngineRunning(true); }, 100);
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 18px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid transparent',
    transition: 'opacity 0.15s, transform 0.1s',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      {/* Label */}
      <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A5568', marginRight: 4 }}>
        Engine
      </span>

      {/* Play / Pause */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handlePlayPause}
        style={{
          ...btnBase,
          background: engineRunning ? 'rgba(30,167,255,0.15)' : 'rgba(34,229,90,0.15)',
          borderColor: engineRunning ? 'rgba(30,167,255,0.45)' : 'rgba(34,229,90,0.45)',
          color: engineRunning ? '#1EA7FF' : '#22E55A',
        }}
        aria-label={engineRunning ? 'Pause engine' : 'Start engine'}
      >
        {engineRunning ? <Pause size={16} /> : <Play size={16} />}
        {engineRunning ? 'Pause' : 'Play'}
      </motion.button>

      {/* Speed buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 12, color: '#4A5568', marginRight: 4 }}>Speed:</span>
        {([1, 2, 5] as const).map(s => (
          <motion.button
            key={s}
            whileTap={{ scale: 0.93 }}
            onClick={() => handleSpeed(s)}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              cursor: 'pointer',
              background: engineSpeed === s ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${engineSpeed === s ? 'rgba(167,139,250,0.55)' : 'rgba(255,255,255,0.09)'}`,
              color: engineSpeed === s ? '#A78BFA' : '#8B9CB8',
              transition: 'all 0.15s',
            }}
            aria-label={`Set speed ${s}x`}
            aria-pressed={engineSpeed === s}
          >
            {s}x
          </motion.button>
        ))}
      </div>

      {/* Force Fail */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleForceFail}
        style={{
          ...btnBase,
          background: 'rgba(255,77,79,0.12)',
          borderColor: 'rgba(255,77,79,0.4)',
          color: '#FF4D4F',
        }}
        aria-label="Force next check to fail"
      >
        <AlertOctagon size={16} />
        Force Fail
      </motion.button>

      {/* Reset */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleReset}
        style={{
          ...btnBase,
          background: 'rgba(255,255,255,0.06)',
          borderColor: 'rgba(255,255,255,0.14)',
          color: '#8B9CB8',
        }}
        aria-label="Reset demo"
      >
        <RefreshCw size={16} />
        Reset Demo
      </motion.button>

      {/* LIVE indicator */}
      {engineRunning && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 4 }}
        >
          <span style={{ position: 'relative', display: 'inline-flex', width: 10, height: 10 }}>
            <span style={{
              position: 'absolute', inset: 0,
              borderRadius: '50%', background: '#22E55A', opacity: 0.7,
              animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
            }} />
            <span style={{ position: 'relative', width: 10, height: 10, borderRadius: '50%', background: '#22E55A', display: 'inline-flex' }} />
          </span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#22E55A', letterSpacing: '0.05em' }}>LIVE</span>
        </motion.div>
      )}
    </div>
  );
});
