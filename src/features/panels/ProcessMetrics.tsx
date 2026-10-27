import { memo, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { Application } from '../../types';

interface ProcessMetricsProps {
  application: Application;
}

const STAGE_COLORS = ['#22E55A', '#1EA7FF', '#FFB020', '#A78BFA', '#F472B6'];
const STAGE_LABELS = ['Submission', 'Scrutiny', 'EVC Visit', 'SAC/SHC', 'Final'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{color: string; name: string; value: number}>; label?: string }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg p-3 text-xs" style={{
      background: 'rgba(10,18,32,0.95)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(8px)',
    }}>
      <p className="font-semibold mb-2" style={{ color: '#8B9CB8' }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: '#E8EDF5' }}>{p.name}:</span>
          <span className="font-bold mono" style={{ color: p.color }}>{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

export const ProcessMetrics = memo(function ProcessMetrics({ application }: ProcessMetricsProps) {
  const data = useMemo(() => {
    // Generate time-series data points for each stage
    const points = Array.from({ length: 8 }, (_, i) => {
      const entry: Record<string, number | string> = { time: `T-${7 - i}d` };
      application.stages.forEach((stage, si) => {
        const completed = stage.criteria.filter(c => c.status === 'COMPLETED').length;
        const total = stage.criteria.length;
        const basePct = (completed / total) * 100;
        // Simulate historical progression
        const factor = Math.min(1, (i / 7) * (1 + 0.2 * si));
        entry[STAGE_LABELS[si]] = Math.round(Math.min(basePct, basePct * factor + Math.random() * 5));
      });
      return entry;
    });
    return points;
  }, [application]);

  return (
    <div className="glass-card p-4">
      <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider" style={{ color: '#8B9CB8' }}>
        Process Metrics
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="time"
            tick={{ fill: '#6B7686', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6B7686', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => <span style={{ color: '#8B9CB8' }}>{value}</span>}
          />
          {STAGE_LABELS.map((label, i) => (
            <Line
              key={label}
              type="monotone"
              dataKey={label}
              stroke={STAGE_COLORS[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
