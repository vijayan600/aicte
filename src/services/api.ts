// API interface — swap mock implementation for real FastAPI + WebSocket later
import type { Application, Institution, EventLog, Notification } from '../types';

export interface API {
  getApplications(): Promise<Application[]>;
  getApplication(id: string): Promise<Application | undefined>;
  getInstitutions(): Promise<Institution[]>;
  getInstitution(id: string): Promise<Institution | undefined>;
  uploadDocument(applicationId: string, criterionId: string, file: File): Promise<void>;
  overrideCriterion(applicationId: string, stageId: string, criterionId: string, status: string, reason: string): Promise<void>;
  getLogs(applicationId?: string): Promise<EventLog[]>;
  getNotifications(institutionId?: string): Promise<Notification[]>;
  markNotificationRead(notificationId: string): Promise<void>;
  subscribe(callback: (event: import('../types').EngineEvent) => void): () => void;
}

// Mock implementation
import { MOCK_APPLICATIONS, MOCK_INSTITUTIONS } from '../mock/institutions';
import { eventBus } from './eventBus';
import type { EngineEvent } from '../types';

export const api: API = {
  async getApplications() { return MOCK_APPLICATIONS; },
  async getApplication(id) { return MOCK_APPLICATIONS.find(a => a.id === id); },
  async getInstitutions() { return MOCK_INSTITUTIONS; },
  async getInstitution(id) { return MOCK_INSTITUTIONS.find(i => i.id === id); },
  async uploadDocument(applicationId, criterionId, _file) {
    // Simulate upload then emit event
    setTimeout(() => {
      eventBus.emit({ type: 'document.uploaded', applicationId, criterionId, documentId: `doc-${Date.now()}` });
    }, 1000);
  },
  async overrideCriterion(_appId, _stageId, _criterionId, _status, _reason) {
    // Admin override - handled in store
  },
  async getLogs() { return []; },
  async getNotifications() { return []; },
  async markNotificationRead(_id) {},
  subscribe(callback: (event: EngineEvent) => void) {
    return eventBus.onAll(callback);
  },
};
