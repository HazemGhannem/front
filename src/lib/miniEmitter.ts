/**
 * A minimal typed pub-sub, used the same way in the agent and mobile app
 * (see agent/src/signaling/signalingClient.ts and mobile-app/src/lib/
 * miniEmitter.ts) for consistency across all four codebases in this
 * project. The browser has no built-in EventEmitter either.
 */
export class MiniEmitter<Events extends { [K in keyof Events]: unknown[] }> {
  private listeners: { [K in keyof Events]?: Array<(...args: Events[K]) => void> } = {};

  on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): void {
    (this.listeners[event] ??= []).push(listener);
  }

  off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => void): void {
    const list = this.listeners[event];
    if (!list) return;
    const index = list.indexOf(listener);
    if (index !== -1) list.splice(index, 1);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    for (const listener of this.listeners[event] ?? []) listener(...args);
  }
}
