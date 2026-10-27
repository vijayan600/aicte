import { useCallback, useRef, memo, useMemo } from 'react';
import ForceGraph2D, { type NodeObject, type LinkObject } from 'react-force-graph-2d';
import { useApplicationStore } from '../../store/applicationStore';

interface GraphNode extends NodeObject {
  id: string;
  nodeType: 'institution' | 'application' | 'stage' | 'criterion';
  label: string;
  status: string;
  progress?: number;
  deadline?: string;
  submittedDocs?: number;
  totalDocs?: number;
  overdue?: boolean;
  endingSoon?: boolean;
}

interface GraphLink extends LinkObject {
  label?: string;
  active?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#6B7686',
  IN_PROGRESS: '#1EA7FF',
  COMPLETED: '#22E55A',
  FAILED: '#FF4D4F',
  RETURNED: '#FFB020',
  NEEDS_CLARIFICATION: '#FFB020',
  SKIPPED: '#4A5568',
};

function daysUntil(deadline: string): number {
  const now = new Date();
  const d = new Date(deadline);
  return Math.round((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

interface InstitutionsGraphProps {
  selectedInstitutionId?: string | null;
  onSelectInstitution?: (id: string) => void;
}

export const InstitutionsGraph = memo(function InstitutionsGraph({
  selectedInstitutionId,
  onSelectInstitution,
}: InstitutionsGraphProps) {
  const institutions = useApplicationStore(s => s.institutions);
  const applications = useApplicationStore(s => s.applications);
  const graphRef = useRef<{ zoom: (n: number, ms?: number) => void; centerAt: (x: number, y: number, ms?: number) => void } | null>(null);

  // Build graph data
  const { nodes, links } = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Use first 15 institutions for performance in the graph
    const subset = institutions.slice(0, 15);

    subset.forEach(inst => {
      const app = applications.find(a => a.id === inst.applicationId);
      const daysLeft = inst.deadline ? daysUntil(inst.deadline) : 999;
      const overdue = daysLeft < 0;
      const endingSoon = daysLeft >= 0 && daysLeft <= 7;

      // Institution node
      nodes.push({
        id: inst.id,
        nodeType: 'institution',
        label: inst.name.split(' ').slice(0, 2).join(' '),
        status: inst.overallStatus,
        progress: inst.totalDocs > 0 ? (inst.submittedDocs / inst.totalDocs) * 100 : 0,
        deadline: inst.deadline,
        submittedDocs: inst.submittedDocs,
        totalDocs: inst.totalDocs,
        overdue,
        endingSoon,
      });

      if (!app) return;

      // Application node
      nodes.push({
        id: app.id,
        nodeType: 'application',
        label: app.categoryCode || app.category.split(' ')[0],
        status: app.status,
        progress: (app.stage / 5) * 100,
      });
      links.push({ source: inst.id, target: app.id, label: 'HAS_APPLICATION', active: app.status === 'IN_PROGRESS' });

      // Active stage node
      const activeStage = app.stages.find(s => s.status === 'IN_PROGRESS');
      if (activeStage) {
        const stageNodeId = `${app.id}-${activeStage.id}`;
        nodes.push({
          id: stageNodeId,
          nodeType: 'stage',
          label: `S${activeStage.number}`,
          status: activeStage.status,
          progress: activeStage.criteria.filter(c => c.status === 'COMPLETED').length / activeStage.criteria.length * 100,
        });
        links.push({ source: app.id, target: stageNodeId, label: 'AT_STAGE', active: true });

        // Criterion nodes
        activeStage.criteria.slice(0, 3).forEach(c => {
          const critNodeId = `${stageNodeId}-${c.id}`;
          nodes.push({
            id: critNodeId,
            nodeType: 'criterion',
            label: c.label.split(' ')[0],
            status: c.status,
            progress: c.progress,
          });
          links.push({ source: stageNodeId, target: critNodeId, label: 'REQUIRES_DOC', active: c.status === 'IN_PROGRESS' });
        });
      }
    });

    return { nodes, links };
  }, [institutions, applications]);

  const nodeSize = (node: GraphNode) => {
    switch (node.nodeType) {
      case 'institution': return 18;
      case 'application': return 12;
      case 'stage': return 9;
      case 'criterion': return 6;
      default: return 8;
    }
  };

  const drawNode = useCallback((node: GraphNode, ctx: CanvasRenderingContext2D) => {
    const x = node.x ?? 0;
    const y = node.y ?? 0;
    const r = nodeSize(node);
    const color = STATUS_COLORS[node.status] || '#6B7686';
    const isSelected = node.id === selectedInstitutionId;

    // Outer glow for selected
    if (isSelected) {
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Overdue / ending soon pulsing ring
    if (node.overdue || node.endingSoon) {
      const ringColor = node.overdue ? '#FF4D4F' : '#FFB020';
      ctx.beginPath();
      ctx.arc(x, y, r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = `${ringColor}80`;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Progress ring
    const pct = (node.progress ?? 0) / 100;
    ctx.beginPath();
    ctx.arc(x, y, r + 2, -Math.PI / 2, -Math.PI / 2 + pct * Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Background circle
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
    grad.addColorStop(0, `${color}44`);
    grad.addColorStop(1, `${color}18`);
    ctx.fillStyle = grad;
    ctx.fill();

    // Border
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    ctx.font = `bold ${r < 8 ? 6 : 7}px Inter, sans-serif`;
    ctx.fillStyle = '#E8EDF5';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const shortLabel = node.label.length > 8 ? node.label.slice(0, 7) + '…' : node.label;
    ctx.fillText(shortLabel, x, y);

    // Sub-label for institutions
    if (node.nodeType === 'institution' && node.deadline) {
      ctx.font = '5.5px Inter, sans-serif';
      ctx.fillStyle = '#6B7686';
      const daysLeft = daysUntil(node.deadline);
      const txt = daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `ends ${daysLeft}d`;
      ctx.fillText(txt, x, y + r + 8);
      if (node.submittedDocs !== undefined && node.totalDocs !== undefined) {
        ctx.fillText(`${node.submittedDocs}/${node.totalDocs} docs`, x, y + r + 14);
      }
    }
  }, [selectedInstitutionId]);

  const linkColor = useCallback((link: GraphLink) => {
    if (link.active) return '#1EA7FF';
    return 'rgba(255,255,255,0.08)';
  }, []);

  const linkWidth = useCallback((link: GraphLink) => {
    return link.active ? 1.5 : 0.5;
  }, []);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden"
      style={{ background: '#050B14', border: '1px solid rgba(255,255,255,0.06)' }}>
      <ForceGraph2D
        ref={graphRef as any}
        graphData={{ nodes: nodes as NodeObject[], links: links as LinkObject[] }}
        nodeCanvasObject={drawNode as any}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={linkColor as any}
        linkWidth={linkWidth as any}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={(link: LinkObject) => ((link as GraphLink).active ? 3 : 0)}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleColor={() => '#1EA7FF'}
        backgroundColor="#050B14"
        onNodeClick={(node) => {
          const n = node as GraphNode;
          if (n.nodeType === 'institution' && onSelectInstitution) {
            onSelectInstitution(n.id);
          }
        }}
        nodeRelSize={1}
        cooldownTicks={100}
        enableZoomInteraction
        enablePanInteraction
        d3AlphaDecay={0.03}
        d3VelocityDecay={0.4}
      />

      {/* Legend */}
      <div className="absolute top-3 left-3 rounded-lg p-2 text-xs space-y-1"
        style={{ background: 'rgba(5,11,20,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[
          { color: '#22E55A', label: 'Completed' },
          { color: '#1EA7FF', label: 'In Progress' },
          { color: '#FFB020', label: 'Clarification' },
          { color: '#FF4D4F', label: 'Failed/Overdue' },
          { color: '#6B7686', label: 'Pending' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span style={{ color: '#8B9CB8' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});
