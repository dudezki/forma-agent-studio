import { useSyncExternalStore } from 'react';
export type AgentState = 'idle' | 'thinking' | 'executing' | 'success' | 'blocked';
export type AgentEvent = { state: AgentState; detail?: string; command?: string; recoveryLabel?: string };
export type AgentContext = { mode: string; reference?: File };
export interface AgentTransport { submit(prompt: string, emit: (event: AgentEvent) => void, signal: AbortSignal, context?: AgentContext): void | Promise<void>; recover?(): void; }
let snapshot: AgentEvent = { state: 'idle' };
let transport: AgentTransport | undefined;
let controller: AbortController | undefined;
const listeners = new Set<() => void>();
export const agent = {
  connect(adapter: AgentTransport) { transport = adapter; return () => { if (transport === adapter) transport = undefined; }; },
  emit(event: AgentEvent) { snapshot = event; listeners.forEach(fn => fn()); },
  submit(prompt: string, context?: AgentContext) {
    controller?.abort(); controller = new AbortController();
    if (!transport) { this.emit({ state: 'blocked', detail: 'Connect an agent to bring this idea to life.', recoveryLabel: 'View connection guide' }); return; }
    const signal = controller.signal;
    try { Promise.resolve(transport.submit(prompt, event => { if (!signal.aborted) this.emit(event); }, signal, context)).catch(error => { if (!signal.aborted) this.emit({ state: 'blocked', detail: error instanceof Error ? error.message : 'The agent connection was interrupted.', recoveryLabel: 'Try again' }); }); }
    catch (error) { this.emit({ state: 'blocked', detail: error instanceof Error ? error.message : 'Could not reach the agent.' }); }
  },
  reset() { controller?.abort(); this.emit({ state: 'idle' }); },
  recover() { if (!transport?.recover) return false; transport.recover(); return true; },
};
export function useAgent() { return useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => snapshot); }
