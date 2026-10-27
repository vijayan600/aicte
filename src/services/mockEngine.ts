import type { Application, Criterion, CriterionStatus, EngineSpeed, EventLog, Notification } from '../types';
import { eventBus } from './eventBus';

const OCR_LOG_SEQUENCE = [
  (doc: string) => `OCR started: reading ${doc}…`,
  () => `Text extracted (page 1/3)`,
  () => `Text extracted (page 2/3)`,
  () => `Text extracted (page 3/3)`,
  () => `AI Analysis running…`,
  () => `60% completed…`,
  () => `80% completed…`,
  () => `Cross-referencing regulatory database…`,
];

class MockEngine {
  private running = false;
  private speed: EngineSpeed = 1;
  private forceNextFail = false;
  private applications: Application[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  private processingQueue: Array<{ appId: string; stageId: string; criterionId: string }> = [];
  private logId = 0;
  private notifId = 0;

  private delay(ms: number) {
    return ms / this.speed;
  }

  init(apps: Application[]) {
    this.applications = apps.map(a => ({
      ...a,
      stages: a.stages.map(s => ({
        ...s,
        criteria: s.criteria.map(c => ({ ...c }))
      }))
    }));
    this.buildQueue();
  }

  private buildQueue() {
    this.processingQueue = [];
    for (const app of this.applications) {
      for (const stage of app.stages) {
        if (stage.skipped) continue;
        if (stage.status !== 'IN_PROGRESS') continue;
        for (const criterion of stage.criteria) {
          if (criterion.status === 'IN_PROGRESS' || criterion.status === 'PENDING') {
            this.processingQueue.push({ appId: app.id, stageId: stage.id, criterionId: criterion.id });
          }
        }
      }
    }
  }

  start(apps: Application[]) {
    this.init(apps);
    this.running = true;
    this.tick();
  }

  pause() { this.running = false; }
  resume() { this.running = true; this.tick(); }
  setSpeed(s: EngineSpeed) { this.speed = s; }
  forceFailNext() { this.forceNextFail = true; }

  reset(apps: Application[]) {
    this.timers.forEach(t => clearTimeout(t));
    this.timers = [];
    this.processingQueue = [];
    this.init(apps);
  }

  getState() {
    return { running: this.running, speed: this.speed, forceNextFail: this.forceNextFail };
  }

  private tick() {
    if (!this.running || this.processingQueue.length === 0) return;

    // Process up to 2 criteria concurrently
    const batch = this.processingQueue.splice(0, 2);
    batch.forEach(item => this.processCriterion(item.appId, item.stageId, item.criterionId));

    // Schedule next tick
    const t = setTimeout(() => {
      if (this.running) {
        if (this.processingQueue.length === 0) this.buildQueue();
        this.tick();
      }
    }, this.delay(8000));
    this.timers.push(t);
  }

  private getApp(appId: string) {
    return this.applications.find(a => a.id === appId);
  }


  private emitCriterionUpdate(appId: string, stageId: string, c: Criterion) {
    eventBus.emit({
      type: 'criterion.updated',
      applicationId: appId,
      stageId,
      criterionId: c.id,
      status: c.status,
      progress: c.progress,
      score: c.score,
      failReason: c.failReason,
    });
  }

  private emitLog(appId: string, institutionId: string, type: EventLog['type'], message: string, criterionId?: string, stageId?: string) {
    const log: EventLog = {
      id: `log-${++this.logId}`,
      timestamp: new Date().toISOString(),
      applicationId: appId,
      institutionId,
      type,
      message,
      criterionId,
      stageId,
    };
    eventBus.emit({ type: 'log.created', log });
  }

  private emitNotification(appId: string, institutionId: string, notifType: Notification['type'], title: string, message: string, criterionId?: string) {
    const notif: Notification = {
      id: `notif-${++this.notifId}`,
      institutionId,
      applicationId: appId,
      type: notifType,
      title,
      message,
      read: false,
      timestamp: new Date().toISOString(),
      criterionId,
    };
    eventBus.emit({ type: 'notification.created', notification: notif });
  }

  private async processCriterion(appId: string, stageId: string, criterionId: string) {
    const app = this.getApp(appId);
    if (!app) return;
    const stage = app.stages.find(s => s.id === stageId);
    if (!stage || stage.skipped) return;
    const criterion = stage.criteria.find(c => c.id === criterionId);
    if (!criterion || criterion.status === 'COMPLETED') return;

    const sleep = (ms: number) => new Promise<void>(resolve => {
      if (!this.running) { resolve(); return; }
      const t = setTimeout(resolve, this.delay(ms));
      this.timers.push(t);
    });

    // Step 1: Set IN_PROGRESS
    criterion.status = 'IN_PROGRESS';
    criterion.progress = 0;
    this.emitCriterionUpdate(appId, stageId, criterion);
    this.emitLog(appId, app.institutionId, 'processing', `Starting verification: ${criterion.label}`, criterionId, stageId);

    // Step 2: Stream OCR logs
    for (let i = 0; i < OCR_LOG_SEQUENCE.length; i++) {
      await sleep(600 + Math.random() * 400);
      if (!this.running) return;
      const msg = OCR_LOG_SEQUENCE[i](criterion.documentRequired || criterion.label);
      this.emitLog(appId, app.institutionId, 'processing', msg, criterionId, stageId);

      // Animate progress
      criterion.progress = Math.min(100, Math.round((i / OCR_LOG_SEQUENCE.length) * 90));
      this.emitCriterionUpdate(appId, stageId, criterion);
    }

    await sleep(800);
    if (!this.running) return;

    // Step 3: Decision
    const score = this.forceNextFail ? 0.3 : (0.5 + Math.random() * 0.5);
    this.forceNextFail = false;
    criterion.score = score;
    criterion.progress = 100;

    let newStatus: CriterionStatus;
    if (score >= 0.85) {
      newStatus = 'COMPLETED';
    } else if (score >= 0.6) {
      newStatus = 'NEEDS_CLARIFICATION';
    } else {
      newStatus = 'FAILED';
    }

    criterion.status = newStatus;
    this.emitCriterionUpdate(appId, stageId, criterion);

    if (newStatus === 'COMPLETED') {
      this.emitLog(appId, app.institutionId, 'success', `✓ ${criterion.label} — Score: ${(score * 100).toFixed(0)}%`, criterionId, stageId);

      // Check if stage complete
      const allDone = stage.criteria.every(c => c.status === 'COMPLETED' || c.status === 'SKIPPED' || c.id === criterionId);
      if (allDone) {
        stage.status = 'COMPLETED';
        // Find next stage
        const stageIdx = app.stages.findIndex(s => s.id === stageId);
        let nextStage = app.stages[stageIdx + 1];
        while (nextStage?.skipped) {
          nextStage.status = 'SKIPPED';
          nextStage = app.stages[app.stages.findIndex(s => s.id === nextStage!.id) + 1];
        }
        if (nextStage) {
          nextStage.status = 'IN_PROGRESS';
          app.stage = nextStage.number;
          this.emitLog(appId, app.institutionId, 'next', `➜ Stage ${nextStage.number}: ${nextStage.name} now IN PROGRESS`, undefined, nextStage.id);
          // Queue next stage criteria
          nextStage.criteria.forEach(c => {
            if (c.status === 'PENDING') {
              this.processingQueue.push({ appId, stageId: nextStage!.id, criterionId: c.id });
            }
          });
        } else {
          app.status = 'COMPLETED';
          this.emitLog(appId, app.institutionId, 'success', `🎉 Application ${appId} — FULLY APPROVED!`);
          this.emitNotification(appId, app.institutionId, 'completed', 'Application Approved!', 'Congratulations! Your application has been fully approved by AICTE.');
        }
        eventBus.emit({ type: 'stage.completed', applicationId: appId, stageId, nextStageId: nextStage?.id });
      }
    } else if (newStatus === 'NEEDS_CLARIFICATION') {
      criterion.failReason = 'Submitted document requires additional supporting evidence.';
      this.emitLog(appId, app.institutionId, 'warning', `⚠ ${criterion.label} — Clarification needed (Score: ${(score * 100).toFixed(0)}%)`, criterionId, stageId);
      this.emitNotification(appId, app.institutionId, 'clarification', 'Clarification Required', `${criterion.label}: Additional documentation required. Please respond within 7 days.`, criterionId);
    } else {
      const reasons = [
        'Missing required signature on document',
        'Unreadable scan quality — resolution below 150 DPI',
        'Document validity expired — renewal required',
        'Incorrect Annexure number attached',
        'Affiliation certificate mismatch with AICTE records',
        'Land documents not notarised',
        'Trust resolution missing members\' signatures',
      ];
      criterion.failReason = reasons[Math.floor(Math.random() * reasons.length)];
      criterion.evidence = `Extracted text confidence: ${(score * 100).toFixed(0)}%. Anomaly detected at page ${Math.ceil(Math.random() * 3)}.`;
      this.emitLog(appId, app.institutionId, 'error', `✗ FAILED: ${criterion.label} — ${criterion.failReason}`, criterionId, stageId);
      this.emitNotification(appId, app.institutionId, 'failure', 'Document Verification Failed', `${criterion.label}: ${criterion.failReason}. Please re-upload the corrected document.`, criterionId);
    }
  }
}

export const mockEngine = new MockEngine();
