import { Canvas, useFrame } from '@react-three/fiber';
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import type { AgentState } from './agent';
const states: AgentState[] = ['idle', 'thinking', 'executing', 'success', 'blocked'];
function Particles({ state, reduced }: { state: AgentState; reduced: boolean }) {
  const points = useRef<THREE.Points>(null);
  const mix = useRef([1, 0, 0, 0, 0]);
  const time = useRef(0);
  const { geometry, material, base } = useMemo(() => {
    const count = 3500;
    const base = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const phi = i * Math.PI * (3 - Math.sqrt(5));
      base.set([Math.cos(phi) * radius, y, Math.sin(phi) * radius], i * 3);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(base.slice(), 3));
    const material = new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
      uniforms: { uRatio: { value: Math.min(window.devicePixelRatio, 2) } },
      vertexShader: `uniform float uRatio; varying float vDepth; void main(){ vec4 p=modelViewMatrix*vec4(position,1.); vDepth=clamp((p.z+5.5)/2.5,0.,1.); gl_Position=projectionMatrix*p; gl_PointSize=(2.4+vDepth*1.1)*uRatio*(3.7/-p.z); }`,
      fragmentShader: `varying float vDepth; void main(){float d=length(gl_PointCoord-.5); float a=1.-smoothstep(.32,.5,d); if(a<.01) discard; vec3 c=mix(vec3(.93,.49,.27),vec3(.95,.255,.065),vDepth); gl_FragColor=vec4(c,a*(.24+.76*vDepth));}` });
    return { geometry, material, base };
  }, []);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);
  useFrame(({ pointer }, delta) => {
    if (!points.current) return;
    const dt = Math.min(delta, .05);
    time.current += reduced ? 0 : dt;
    const t = time.current;
    const target = states.indexOf(state);
    mix.current.forEach((v, i) => { mix.current[i] = THREE.MathUtils.damp(v, i === target ? 1 : 0, 3, dt); });
    const [, thinking, executing, success, blocked] = mix.current;
    const pos = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < base.length / 3; i++) {
      const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2];
      const wave = Math.sin(y * 11 + Math.atan2(z, x) * 3 - t * 2.3);
      const band = Math.pow(Math.max(0, Math.sin(y * 16 + Math.atan2(z, x) * 2 - t * 3)), 8);
      const r = 1 + (reduced ? 0 : .009 * Math.sin(t * 1.2 + y * 4) + thinking * (.045 * wave + .075 * Math.pow(Math.max(0, wave), 5)) + executing * .09 * band + success * .003 * Math.sin(t));
      const cubeScale = .69 / Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
      const scale = r * (1 - blocked) + cubeScale * blocked;
      pos[i * 3] = x * scale; pos[i * 3 + 1] = y * scale; pos[i * 3 + 2] = z * scale;
    }
    geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = t * .075 * (1 - blocked * .85) + .4 + (reduced ? 0 : pointer.x * .045);
    points.current.rotation.x = .16 + (reduced ? 0 : Math.sin(t * .12) * .1 + pointer.y * .035);
    points.current.rotation.z = blocked * .12;
  });
  return <points ref={points} geometry={geometry} material={material} />;
}
class OrbBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }; static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <div className="orb-fallback" aria-label="Agent visualization unavailable" /> : this.props.children; }
}
export function Orb({ state }: { state: AgentState }) {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const query = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(query.matches); query.addEventListener('change', update); return () => query.removeEventListener('change', update); }, []);
  return <div className="orb" aria-hidden="true"><OrbBoundary><Canvas camera={{ position: [0, 0, 4.1], fov: 38 }} dpr={[1, 2]} gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}><Particles state={state} reduced={reduced} /></Canvas></OrbBoundary></div>;
}
