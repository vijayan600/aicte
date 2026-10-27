import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApplicationStore } from '../../store/applicationStore';
import { ApprovalPipeline } from '../pipeline/ApprovalPipeline';
import { ProcessOverview } from '../panels/ProcessOverview';
import { LiveLogs } from '../panels/LiveLogs';
import { DocumentStatus } from '../panels/DocumentStatus';
import { EngineControls } from '../panels/EngineControls';

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const application = useApplicationStore(s => s.applications.find(a => a.id === id));

  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-sm" style={{ color: '#6B7686' }}>Application not found: {id}</p>
        <Link to="/institute/applications" className="text-sm" style={{ color: '#1EA7FF' }}>
          ← Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link to="/institute" className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
          style={{ color: '#6B7686' }}>
          <ArrowLeft size={12} />
          Dashboard
        </Link>
        <span style={{ color: '#4A5568' }}>/</span>
        <span className="text-xs mono" style={{ color: '#8B9CB8' }}>{application.id}</span>
      </div>

      <div className="glass-card p-3">
        <EngineControls />
      </div>

      <div className="glass-card p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-base font-bold" style={{ color: '#E8EDF5' }}>{application.category}</h1>
            <p className="text-xs mono mt-1" style={{ color: '#4A5568' }}>
              {application.id} · Submitted {application.submittedAt} · Deadline {application.deadline}
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              background: 'rgba(30,167,255,0.12)',
              color: '#1EA7FF',
              border: '1px solid rgba(30,167,255,0.3)',
            }}>
            Stage {application.stage} of 5
          </span>
        </div>
      </div>

      <ProcessOverview application={application} />

      <div className="glass-card p-4">
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#E8EDF5' }}>Approval Pipeline</h2>
        <ApprovalPipeline application={application} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LiveLogs applicationId={application.id} />
        <DocumentStatus application={application} />
      </div>
    </div>
  );
}
