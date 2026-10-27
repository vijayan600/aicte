import type { EngineEvent } from '../types';

type Listener = (event: EngineEvent) => void;

class EventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  on(eventType: string, listener: Listener) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(listener);
    return () => this.off(eventType, listener);
  }

  off(eventType: string, listener: Listener) {
    this.listeners.get(eventType)?.delete(listener);
  }

  emit(event: EngineEvent) {
    // Notify specific type listeners
    this.listeners.get(event.type)?.forEach(l => l(event));
    // Notify wildcard listeners
    this.listeners.get('*')?.forEach(l => l(event));
  }

  onAll(listener: Listener) {
    return this.on('*', listener);
  }
}

export const eventBus = new EventBus();
