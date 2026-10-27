import React, { useEffect, useRef, useCallback, memo } from 'react';
import type { Application } from '../../types';

interface ConnectorLayerProps {
  application: Application;
  containerRef: React.RefObject<HTMLDivElement | null>;
  boxRefs: React.MutableRefObject<Map<string, HTMLDivElement | null>>;
}

interface Point { x: number; y: number; }

function getBoxCenter(el: HTMLDivElement, container: HTMLDivElement): Point {
  const elRect = el.getBoundingClientRect();
  const contRect = container.getBoundingClientRect();
  return {
    x: elRect.left - contRect.left + elRect.width / 2,
    y: elRect.top - contRect.top + elRect.height / 2,
  };
}

const STATUS_STROKE: Record<string, string> = {
  PENDING: 'rgba(107,118,134,0.2)',
  IN_PROGRESS: '#1EA7FF',
  COMPLETED: '#22E55A',
  FAILED: '#FF4D4F',
  NEEDS_CLARIFICATION: '#FFB020',
  SKIPPED: 'rgba(107,118,134,0.1)',
};

export const ConnectorLayer = memo(function ConnectorLayer({ application, containerRef, boxRefs }: ConnectorLayerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animFrameRef = useRef<number>(0);

  const draw = useCallback(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const rect = container.getBoundingClientRect();
    svg.setAttribute('width', String(rect.width));
    svg.setAttribute('height', String(rect.height));

    // Clear
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Build ordered list of criteria across stages
    const allCriteria: Array<{ id: string; stageId: string; stageIdx: number; critIdx: number }> = [];
    application.stages.forEach((stage, si) => {
      if (stage.skipped) return;
      stage.criteria.forEach((c, ci) => {
        allCriteria.push({ id: c.id, stageId: stage.id, stageIdx: si, critIdx: ci });
      });
    });

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    svg.appendChild(defs);

    for (let i = 0; i < allCriteria.length - 1; i++) {
      const fromItem = allCriteria[i];
      const toItem = allCriteria[i + 1];
      const fromEl = boxRefs.current.get(fromItem.id);
      const toEl = boxRefs.current.get(toItem.id);
      if (!fromEl || !toEl) continue;

      const fromPt = getBoxCenter(fromEl, container);
      const toPt = getBoxCenter(toEl, container);

      const fromCrit = application.stages[fromItem.stageIdx]?.criteria[fromItem.critIdx];
      if (!fromCrit) continue;

      const stroke = STATUS_STROKE[fromCrit.status] || STATUS_STROKE.PENDING;
      const isActive = fromCrit.status === 'IN_PROGRESS';
      const isCompleted = fromCrit.status === 'COMPLETED';

      // Bezier path
      const dx = toPt.x - fromPt.x;
      const path = `M ${fromPt.x} ${fromPt.y} C ${fromPt.x + dx * 0.5} ${fromPt.y}, ${toPt.x - dx * 0.5} ${toPt.y}, ${toPt.x} ${toPt.y}`;

      if (isActive) {
        // Glowing animated path
        const gradId = `grad-${fromItem.id}`;
        const grad = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        grad.setAttribute('id', gradId);
        grad.setAttribute('x1', '0%');
        grad.setAttribute('y1', '0%');
        grad.setAttribute('x2', '100%');
        grad.setAttribute('y2', '0%');
        const s1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        s1.setAttribute('offset', '0%');
        s1.setAttribute('stop-color', 'rgba(30,167,255,0)');
        const s2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        s2.setAttribute('offset', '50%');
        s2.setAttribute('stop-color', '#1EA7FF');
        const s3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        s3.setAttribute('offset', '100%');
        s3.setAttribute('stop-color', 'rgba(30,167,255,0)');
        grad.appendChild(s1);
        grad.appendChild(s2);
        grad.appendChild(s3);
        defs.appendChild(grad);

        // Background glow line
        const bgLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bgLine.setAttribute('d', path);
        bgLine.setAttribute('fill', 'none');
        bgLine.setAttribute('stroke', 'rgba(30,167,255,0.15)');
        bgLine.setAttribute('stroke-width', '3');
        svg.appendChild(bgLine);

        // Animated particle
        const animLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        animLine.setAttribute('d', path);
        animLine.setAttribute('fill', 'none');
        animLine.setAttribute('stroke', `url(#${gradId})`);
        animLine.setAttribute('stroke-width', '2');
        animLine.setAttribute('stroke-dasharray', '30 70');
        animLine.setAttribute('stroke-dashoffset', '100');
        svg.appendChild(animLine);

        // Animate
        let offset = 100;
        const animate = () => {
          offset -= 1;
          if (offset < -100) offset = 100;
          animLine.setAttribute('stroke-dashoffset', String(offset));
          animFrameRef.current = requestAnimationFrame(animate);
        };
        animate();
      } else if (isCompleted) {
        // Solid glow
        const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        glowLine.setAttribute('d', path);
        glowLine.setAttribute('fill', 'none');
        glowLine.setAttribute('stroke', 'rgba(34,229,90,0.15)');
        glowLine.setAttribute('stroke-width', '4');
        svg.appendChild(glowLine);

        const solidLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        solidLine.setAttribute('d', path);
        solidLine.setAttribute('fill', 'none');
        solidLine.setAttribute('stroke', '#22E55A');
        solidLine.setAttribute('stroke-width', '1.5');
        svg.appendChild(solidLine);
      } else {
        // Faint pending
        const pendingLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pendingLine.setAttribute('d', path);
        pendingLine.setAttribute('fill', 'none');
        pendingLine.setAttribute('stroke', stroke);
        pendingLine.setAttribute('stroke-width', '1');
        pendingLine.setAttribute('stroke-dasharray', '4 4');
        svg.appendChild(pendingLine);
      }
    }
  }, [application, containerRef, boxRefs]);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(() => {
      cancelAnimationFrame(animFrameRef.current);
      draw();
    });
    obs.observe(containerRef.current);
    draw();
    return () => {
      obs.disconnect();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [draw]);

  // Redraw on application changes
  useEffect(() => {
    cancelAnimationFrame(animFrameRef.current);
    draw();
  }, [application, draw]);

  return (
    <svg
      ref={svgRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0, overflow: 'visible' }}
    />
  );
});
