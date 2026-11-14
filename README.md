# Forma

A responsive React + TypeScript agent workspace with a Three.js / React Three Fiber particle orb.

## Run

```sh
npm install
npm run dev
```

`npm run build` typechecks and produces the production bundle.

## Real agent integration

Import `agent` from `src/agent.ts` and call `agent.connect(transport)`. A transport receives the prompt, an event emitter, and an AbortSignal. Emit actual lifecycle events from your service:

```ts
agent.connect({
  async submit(prompt, emit, signal) {
    // Forward to your backend and map its streamed events:
    // emit({ state: 'thinking', detail: 'Your actual status' });
    // emit({ state: 'executing', command: 'Your actual command' });
    // emit({ state: 'success', detail: 'Your actual result' });
    // emit({ state: 'blocked', detail: 'Specific blocker', recoveryLabel: 'Retry' });
  },
  recover() {
    // Implement service-specific recovery.
  },
});
```

The default interface does not call an AI service or simulate work. Submitting without a connected transport shows a connection blocker. The five state controls are explicitly labeled visualization previews. New task cancels the active request; late events from cancelled requests are ignored. History is session-only. Reference files remain local; they are not uploaded. The selected mode and local reference File are passed to the transport as a fourth context argument. Your transport controls how they are used.

## Orb

`<Orb state="thinking" />` accepts idle, thinking, executing, success, and blocked. A single GPU draw call renders 3,500 shader-based dots. Fibonacci sphere coordinates retain particle identity; damped state weights blend waves, moving bands, and compact cube deformation. Pixel ratio is capped at 2, delta is clamped, and reduced-motion preferences disable ongoing rotation and turbulence. Status and recovery actions remain available independently of WebGL.
