// Core Type Definitions

export type Role = 'institute' | 'admin' | 'evc';

export type CriterionStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'NEEDS_CLARIFICATION'
  | 'SKIPPED';

export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
export type ApplicationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'RETURNED';

export interface Criterion {
  id: string;
  label: string;
  status: CriterionStatus;
  progress: number; // 0-100
  score?: number;
  failReason?: string;
  evidence?: string;
  logLines?: string[];
  documentRequired?: string;
}

export interface Stage {
  id: string;
  number: number;
  name: string;
  status: StageStatus;
  criteria: Criterion[];
  skipped?: boolean;
}

export interface Application {
  id: string;
  institutionId: string;
  category: string;
  categoryCode: string;
  stage: number; // 1-5 current active stage
  status: ApplicationStatus;
  stages: Stage[];
  submittedAt: string;
  deadline: string;
  lastUpdated: string;
}

export interface Institution {
  id: string;
  name: string;
  aicteId: string;
  state: string;
  region: string;
  type: 'University' | 'Deemed' | 'Autonomous' | 'Affiliated' | 'Private' | 'Government';
  programmes: string[];
  applicationId: string;
  overallStatus: ApplicationStatus;
  totalDocs: number;
  submittedDocs: number;
  deadline: string;
  daysOverdue?: number;
  evcMemberId?: string;
}

export interface EventLog {
  id: string;
  timestamp: string;
  applicationId: string;
  institutionId: string;
  type: 'success' | 'processing' | 'next' | 'error' | 'info' | 'warning';
  message: string;
  criterionId?: string;
  stageId?: string;
}

export interface Notification {
  id: string;
  institutionId: string;
  applicationId: string;
  type: 'failure' | 'clarification' | 'completed' | 'info' | 'deadline';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  criterionId?: string;
}

export interface Document {
  id: string;
  name: string;
  criterionId: string;
  status: CriterionStatus;
  uploadedAt?: string;
  size?: number;
  pages?: number;
}

export interface EVCMember {
  id: string;
  name: string;
  email: string;
  assignedCases: string[];
}

export type EngineSpeed = 1 | 2 | 5;

export interface EngineState {
  running: boolean;
  speed: EngineSpeed;
  forceNextFail: boolean;
}

// Event Bus event types
export type EngineEvent =
  | { type: 'criterion.updated'; applicationId: string; stageId: string; criterionId: string; status: CriterionStatus; progress: number; score?: number; failReason?: string }
  | { type: 'stage.completed'; applicationId: string; stageId: string; nextStageId?: string }
  | { type: 'log.created'; log: EventLog }
  | { type: 'notification.created'; notification: Notification }
  | { type: 'document.uploaded'; applicationId: string; criterionId: string; documentId: string };
