import { useRef, useMemo, memo } from 'react';
import type { Application } from '../../types';
import { StageColumn } from './StageColumn';
import { ConnectorLayer } from './ConnectorLayer';

interface ApprovalPipelineProps {
  application: Application;
  showConnectors?: boolean;
  onReupload?: (criterionId: string) => void;
}

export const ApprovalPipeline = memo(function ApprovalPipeline({
  application,
  showConnectors = true,
  onReupload,
}: ApprovalPipelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const stages = useMemo(() => application.stages, [application.stages]);

  return (
    <div
      ref={containerRef}
      className="relative flex gap-3 overflow-x-auto pb-2"
      style={{ minHeight: 420 }}
    >
      {showConnectors && (
        <ConnectorLayer
          application={application}
          containerRef={containerRef}
          boxRefs={boxRefs}
        />
      )}
      {stages.map((stage) => (
        <div key={stage.id} className="relative z-10 flex-1 min-w-[190px] max-w-[240px]">
          <StageColumn
            stage={stage}
            appId={application.id}
            stageNumber={stage.number}
            boxRefs={boxRefs}
            onReupload={onReupload}
          />
        </div>
      ))}
    </div>
  );
});
