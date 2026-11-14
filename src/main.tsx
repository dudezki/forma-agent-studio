import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowUp, ArrowUpRight, Plus, Paperclip, ChevronDown, Check, X, Command, ArrowLeft, BookOpen, SlidersHorizontal, CircleHelp, RotateCcw, PanelLeft, Clock3, CheckCheck, CirclePause, AudioLines, ScanLine } from 'lucide-react';
import { Orb } from './Orb';
import { agent, useAgent, type AgentState } from './agent';
import './styles.css';
const stateInfo: Record<AgentState, { title: string; text: string }> = {
  idle: { title: 'Ready when you are', text: 'A little direction. A world of possibilities.' },
  thinking: { title: 'Finding the right direction', text: 'Exploring possibilities and connecting the dots.' },
  executing: { title: 'Bringing the idea together', text: 'Focused on the details. Moving your work forward.' },
  success: { title: 'Everything, in its place', text: 'The task is complete and ready for your review.' },
  blocked: { title: 'A little help to move forward', text: 'Connect an agent to bring this idea to life.' },
};
const previews: { state: AgentState; label: string; icon: typeof Clock3 }[] = [
  { state: 'idle', label: 'Resting', icon: ScanLine }, { state: 'thinking', label: 'Thinking', icon: AudioLines }, { state: 'executing', label: 'Working', icon: Command }, { state: 'success', label: 'Complete', icon: CheckCheck }, { state: 'blocked', label: 'Blocked', icon: CirclePause },
];
function App() {
  const live = useAgent();
  const [preview, setPreview] = useState<AgentState | null>(null);
  const [prompt, setPrompt] = useState('');
  const [task, setTask] = useState('');
  const [modal, setModal] = useState<'guide' | 'history' | 'settings' | null>(null);
  const [model, setModel] = useState('Auto');
  const [modelOpen, setModelOpen] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement;
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    const selectors = 'button, a[href], input, textarea, [tabindex="0"]';
    dialog?.querySelector<HTMLElement>(selectors)?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setModal(null);
      if (event.key !== 'Tab' || !dialog) return;
      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(selectors));
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [modal]);
  const state = preview ?? live.state;
  const isWelcome = !task && preview === null && state === 'idle';
  function reset() { agent.reset(); setTask(''); setPrompt(''); setPreview(null); setAttachment(null); }
  function submit(event: React.FormEvent) { event.preventDefault(); if (!prompt.trim()) return; const value = prompt.trim(); setTask(value); setHistory(h => [value, ...h]); setPreview(null); agent.submit(value, { mode: model, reference: attachment ?? undefined }); }
  return <div className="app-shell">
    <aside className="rail"><a className="brand-mark" href="#" onClick={e => { e.preventDefault(); reset(); }} aria-label="Forma home"><span/><span/><span/></a><div className="rail-top"><button className="rail-button new-button" onClick={reset} aria-label="New task"><Plus size={20}/></button><button className="rail-button" onClick={() => setModal('history')} aria-label="Task history"><Clock3 size={19}/></button></div><div className="rail-bottom"><button className="rail-button" onClick={() => setModal('guide')} aria-label="Help and connection guide"><CircleHelp size={19}/></button><button className="avatar" onClick={() => setModal('settings')} aria-label="Workspace preferences">JD</button></div></aside>
    <div className="workspace"><header><a className="wordmark" href="#" onClick={e => { e.preventDefault(); reset(); }}>forma<span> / </span><small>Your creative space</small></a><div className="header-right"><span className="workspace-label"><span className="tiny-square"/>Personal workspace</span><button className="header-guide" onClick={() => setModal('guide')}>A field guide <ArrowUpRight size={13}/></button></div></header>
    <main><div className="intro-label"><span className="status-dot"/> A LITTLE INTELLIGENCE. ENDLESS POSSIBILITY.</div>
      <div className="visual-stage"><span className="orb-coordinate coordinate-left">F / 01</span><Orb state={state}/><span className="orb-coordinate coordinate-right">{preview ? 'PREVIEW' : 'AGENT CORE'}</span><div className="orb-shadow"/></div>
      <div className="heading-block" aria-live="polite"><div className="eyebrow">{isWelcome ? 'FROM A FIRST THOUGHT TO WHAT’S NEXT' : preview ? 'EXPLORE THE AGENT · STATE PREVIEW' : 'YOUR IDEA, IN MOTION'}</div><h1>{isWelcome ? <>What are we<br className="mobile-break"/> designing today?</> : stateInfo[state].title}</h1><p>{isWelcome ? 'Big ideas start with a simple conversation.' : preview ? stateInfo[state].text : live.detail || stateInfo[state].text}</p></div>
      {isWelcome ? <><form className="composer" onSubmit={submit}><label className="sr-only" htmlFor="prompt">Describe what you want to design</label><textarea id="prompt" rows={2} placeholder="An idea, a challenge, a spark of something…" value={prompt} onChange={e => setPrompt(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(e); } }}/>{attachment && <div className="attachment-chip">{attachment.name}<button type="button" onClick={() => setAttachment(null)} aria-label="Remove attachment"><X size={12}/></button><span>Reference · local only</span></div>}<div className="composer-toolbar"><div className="composer-tools"><label className="attach-button" title="Add a reference file"><Paperclip size={17}/><input type="file" onChange={e => setAttachment(e.target.files?.[0] ?? null)}/></label><span className="tool-divider"/><span className="composer-hint">Give your idea a little context</span></div><div className="send-tools"><div className="model-select"><button type="button" onClick={() => setModelOpen(!modelOpen)} aria-expanded={modelOpen}>{model}<ChevronDown size={12}/></button>{modelOpen && <div className="model-menu">{['Auto', 'Creative', 'Precise'].map(m => <button key={m} type="button" onClick={() => { setModel(m); setModelOpen(false); }}>{m}{m === model && <Check size={13}/>}</button>)}</div>}</div><button className="send-button" disabled={!prompt.trim()} aria-label="Submit idea"><ArrowUp size={19}/></button></div></div></form><div className="suggestions"><button onClick={() => setPrompt('Design a thoughtful brand identity for ')}><ScanLine size={14}/>Build a brand</button><button onClick={() => setPrompt('Create a minimal website for ')}><PanelLeft size={14}/>Imagine a website</button><button onClick={() => setPrompt('Help me explore creative directions for ')}><SlidersHorizontal size={14}/>Explore an idea</button></div></> : <div className="task-panel"><div className="task-status"><span className={`status-dot ${state}`}/><span>{preview ? 'Visualization preview' : 'Agent status'}<b>{state === 'executing' ? 'Executing' : state.charAt(0).toUpperCase() + state.slice(1)}</b></span><span className="task-tag">{preview ? 'DEMO' : 'LIVE EVENTS'}</span></div>{task && <p className="task-description">{task}</p>}{state === 'executing' && <code>{preview ? 'Preview · awaiting a real command event' : live.command || 'Waiting for command details from the agent'}</code>}{state === 'blocked' && <button className="recovery-button" onClick={() => { if (preview || !agent.recover()) setModal('guide'); }}>{live.recoveryLabel || 'View connection guide'}<ArrowUpRight size={14}/></button>}<button className="back-button" onClick={reset}><ArrowLeft size={13}/>Back to your canvas</button></div>}
      <div className="state-explorer"><div className="explorer-label"><span>ONE AGENT. MANY STATES.</span><span className="explorer-note">Take a look under the surface <ArrowUpRight size={11}/></span></div><div className="state-controls">{previews.map(({ state: s, label, icon: Icon }) => <button key={s} className={state === s ? 'selected' : ''} aria-pressed={state === s} onClick={() => setPreview(s)}><Icon size={15}/><span>{label}</span>{state === s && <i/>}</button>)}</div>{preview && <button className="exit-preview" onClick={() => setPreview(null)}><RotateCcw size={11}/>Exit preview</button>}</div>
    </main><footer><span><span className="footer-dot"/>Considered by design. Capable by nature.</span><span>Made for the way you think.<span className="footer-key">⌘</span></span></footer></div>
    {modal && <div className="modal-backdrop" onClick={() => setModal(null)}><section className="modal" role="dialog" aria-modal="true" aria-label={modal === 'history' ? 'Task history' : modal === 'settings' ? 'Workspace preferences' : 'Connection guide'} onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setModal(null)} aria-label="Close dialog"><X size={19}/></button><BookOpen size={22} className="modal-icon"/><h2>{modal === 'history' ? 'Your recent ideas' : modal === 'settings' ? 'Your creative space' : 'Connect your intelligence.'}</h2>{modal === 'history' ? history.length ? <div className="history-list">{history.map((item, i) => <button key={i} onClick={() => { reset(); setPrompt(item); setModal(null); }}>{item}<ArrowUpRight size={15}/></button>)}</div> : <p>A fresh canvas. Your submitted ideas will appear here during this session.</p> : modal === 'settings' ? <><p>Personal workspace · JD</p><div className="settings-row">Motion preferences<span>Follows your device</span></div><div className="settings-row">Agent connection<span>External adapter</span></div><p className="fine-print">References stay local. This prototype does not upload files or execute tasks on its own.</p></> : <><p>Forma is ready for a real agent. Connect your service through the lifecycle adapter to receive live status, commands, and results.</p><pre>{`import { agent } from './agent';\n\nagent.connect({\n  async submit(prompt, emit, signal) {\n    // Connect your agent API here.\n    // Emit only actual lifecycle events.\n    emit({ state: 'thinking' });\n  }\n});`}</pre><p className="fine-print">Supported states: idle, thinking, executing, success, blocked. Preview controls only change the visualization.</p></>}<button className="modal-done" onClick={() => setModal(null)}>Got it <Check size={15}/></button></section></div>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
