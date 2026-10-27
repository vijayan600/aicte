import { useState, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useApplicationStore } from '../../store/applicationStore';
import type { Institution } from '../../types';

interface InstitutionListProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    '#6B7686',
  IN_PROGRESS:'#1EA7FF',
  COMPLETED:  '#22E55A',
  FAILED:     '#FF4D4F',
  RETURNED:   '#FFB020',
};

const selectStyle: React.CSSProperties = {
  flex: 1,
  fontSize: 14,
  padding: '10px 14px',
  borderRadius: 10,
  outline: 'none',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: '#E8EDF5',
  cursor: 'pointer',
};

function daysUntil(deadline: string): number {
  const now = new Date();
  const d = new Date(deadline);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const InstitutionList = memo(function InstitutionList({ selectedId, onSelect }: InstitutionListProps) {
  const institutions = useApplicationStore(s => s.institutions);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [sortKey, setSortKey] = useState<keyof Institution>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 10;

  const regions = useMemo(() => [...new Set(institutions.map(i => i.region))].sort(), [institutions]);
  const statuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'RETURNED'];

  const filtered = useMemo(() => {
    return institutions
      .filter(inst => {
        if (search && !inst.name.toLowerCase().includes(search.toLowerCase()) &&
          !inst.aicteId.toLowerCase().includes(search.toLowerCase())) return false;
        if (filterStatus && inst.overallStatus !== filterStatus) return false;
        if (filterRegion && inst.region !== filterRegion) return false;
        return true;
      })
      .sort((a, b) => {
        const av = String(a[sortKey] ?? '');
        const bv = String(b[sortKey] ?? '');
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      });
  }, [institutions, search, filterStatus, filterRegion, sortKey, sortDir]);

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const toggleSort = (key: keyof Institution) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Search & filters */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4A5568' }} />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            style={{
              width: '100%',
              paddingLeft: 40,
              paddingRight: 14,
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 14,
              borderRadius: 10,
              outline: 'none',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.09)',
              color: '#E8EDF5',
            }}
            placeholder="Search institution or AICTE ID…"
            aria-label="Search institutions"
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setPage(0); }}
            style={selectStyle}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
          <select
            value={filterRegion}
            onChange={e => { setFilterRegion(e.target.value); setPage(0); }}
            style={selectStyle}
            aria-label="Filter by region"
          >
            <option value="">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={{ fontSize: 13, color: '#6B7686' }}>
          {filtered.length} of {institutions.length} institutions
        </div>
      </div>

      {/* Table header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 90px 70px',
        padding: '10px 16px',
        fontSize: 12,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#4A5568',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {[
          { key: 'name',          label: 'Institution' },
          { key: 'region',        label: 'Region' },
          { key: 'overallStatus', label: 'Status' },
          { key: 'deadline',      label: 'Deadline' },
          { key: null,            label: 'Docs' },
        ].map(({ key, label }) => (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: key ? 'pointer' : 'default', userSelect: 'none' }}
            onClick={() => key && toggleSort(key as keyof Institution)}
          >
            {label}
            {key && sortKey === key && (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
          </div>
        ))}
      </div>

      {/* Rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {paged.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 14, color: '#4A5568' }}>
            No institutions match the filters
          </div>
        ) : (
          paged.map(inst => {
            const color = STATUS_COLORS[inst.overallStatus] || '#6B7686';
            const daysLeft = daysUntil(inst.deadline);
            const overdue = daysLeft < 0;
            const soon = daysLeft >= 0 && daysLeft <= 7;
            const isSelected = inst.id === selectedId;

            return (
              <motion.div
                key={inst.id}
                layout
                onClick={() => onSelect(inst.id)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 90px 70px',
                  padding: '13px 16px',
                  cursor: 'pointer',
                  background: isSelected ? 'rgba(30,167,255,0.09)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: isSelected ? '3px solid #1EA7FF' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {/* Name */}
                <div style={{ minWidth: 0, paddingRight: 12 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#E8EDF5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.name}</p>
                  <p style={{ fontSize: 12, color: '#4A5568', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inst.aicteId}</p>
                </div>

                {/* Region */}
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#8B9CB8' }}>
                  {inst.region}
                </div>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color }}>{inst.overallStatus.replace('_', ' ')}</span>
                </div>

                {/* Deadline */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace',
                    color: overdue ? '#FF4D4F' : soon ? '#FFB020' : '#8B9CB8',
                  }}>
                    {overdue ? `${Math.abs(daysLeft)}d late` : `${daysLeft}d`}
                  </span>
                </div>

                {/* Docs */}
                <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: '#8B9CB8', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                  {inst.submittedDocs}/{inst.totalDocs}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.07)',
          fontSize: 13, color: '#8B9CB8',
        }}>
          <span>Page {page + 1} of {totalPages}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#E8EDF5', cursor: page === 0 ? 'not-allowed' : 'pointer', opacity: page === 0 ? 0.35 : 1,
              }}
            >←</button>
            <button
              disabled={page === totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#E8EDF5', cursor: page === totalPages - 1 ? 'not-allowed' : 'pointer', opacity: page === totalPages - 1 ? 0.35 : 1,
              }}
            >→</button>
          </div>
        </div>
      )}
    </div>
  );
});
