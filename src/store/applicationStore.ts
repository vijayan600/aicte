import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { Application, Institution, EventLog, Notification, CriterionStatus, EngineSpeed, EngineEvent } from '../types';
import { MOCK_APPLICATIONS, MOCK_INSTITUTIONS } from '../mock/institutions';

interface ApplicationStore {
  applications: Application[];
  institutions: Institution[];
  logs: EventLog[];
  notifications: Notification[];
  engineRunning: boolean;
  engineSpeed: EngineSpeed;
  selectedApplicationId: string | null;
  selectedInstitutionId: string | null;

  // Init
  initData: () => void;

  // Engine control
  setEngineRunning: (v: boolean) => void;
  setEngineSpeed: (s: EngineSpeed) => void;

  // Selection
  selectApplication: (id: string | null) => void;
  selectInstitution: (id: string | null) => void;

  // Event handler (called by eventBus listeners)
  applyEvent: (event: EngineEvent) => void;
}

export const useApplicationStore = create<ApplicationStore>()(
  immer((set) => ({
    applications: [],
    institutions: [],
    logs: [],
    notifications: [],
    engineRunning: true,
    engineSpeed: 1,
    selectedApplicationId: null,
    selectedInstitutionId: null,

    initData: () => set(state => {
      state.applications = JSON.parse(JSON.stringify(MOCK_APPLICATIONS));
      state.institutions = JSON.parse(JSON.stringify(MOCK_INSTITUTIONS));
    }),

    setEngineRunning: (v) => set(state => { state.engineRunning = v; }),
    setEngineSpeed: (s) => set(state => { state.engineSpeed = s; }),
    selectApplication: (id) => set(state => { state.selectedApplicationId = id; }),
    selectInstitution: (id) => set(state => { state.selectedInstitutionId = id; }),

    applyEvent: (event) => set(state => {
      switch (event.type) {
        case 'criterion.updated': {
          const app = state.applications.find(a => a.id === event.applicationId);
          if (!app) break;
          const stage = app.stages.find(s => s.id === event.stageId);
          if (!stage) break;
          const criterion = stage.criteria.find(c => c.id === event.criterionId);
          if (!criterion) break;
          criterion.status = event.status as CriterionStatus;
          criterion.progress = event.progress;
          if (event.score !== undefined) criterion.score = event.score;
          if (event.failReason !== undefined) criterion.failReason = event.failReason;
          break;
        }
        case 'stage.completed': {
          const app = state.applications.find(a => a.id === event.applicationId);
          if (!app) break;
          const stage = app.stages.find(s => s.id === event.stageId);
          if (stage) stage.status = 'COMPLETED';
          if (event.nextStageId) {
            const nextStage = app.stages.find(s => s.id === event.nextStageId);
            if (nextStage) {
              nextStage.status = 'IN_PROGRESS';
              app.stage = nextStage.number;
            }
          }
          break;
        }
        case 'log.created': {
          state.logs.unshift(event.log);
          if (state.logs.length > 500) state.logs.pop();
          break;
        }
        case 'notification.created': {
          state.notifications.unshift(event.notification);
          // Update institution submitted docs count
          const inst = state.institutions.find(i => i.id === event.notification.institutionId);
          if (inst && event.notification.type === 'completed') {
            inst.overallStatus = 'COMPLETED';
          }
          break;
        }
        case 'document.uploaded': {
          // Mark criterion as pending restart
          const app = state.applications.find(a => a.id === event.applicationId);
          if (!app) break;
          for (const stage of app.stages) {
            const crit = stage.criteria.find(c => c.id === event.criterionId);
            if (crit && crit.status === 'FAILED') {
              crit.status = 'PENDING';
              crit.progress = 0;
              crit.failReason = undefined;
            }
          }
          break;
        }
      }
    }),
  }))
);
