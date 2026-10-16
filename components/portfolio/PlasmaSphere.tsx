'use client';

import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

export interface PlasmaSphereProps {
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onSelectTab?: (id: string) => void;
}

// ── Label slot positions (mirrors TelemetryPortrait layout) ───────────────
const LABEL_SLOTS: { top: number; side: 'left' | 'right' }[] = [
  { top: 14, side: 'left' },
  { top: 26, side: 'right' },
  { top: 50, side: 'left' },
  { top: 62, side: 'right' },
  { top: 80, side: 'left' },
  { top: 86, side: 'right' },
];

// ── Theme-aware plasma dot shaders ────────────────────────────────────────
const VERT = /* glsl */ `
uniform float uTime;
uniform float uBaseSize;
uniform vec2  uMouse;
uniform float uHover;
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
uniform vec3 uC4;

varying vec3  vColor;
varying float vAlpha;

vec3 paletteSample(float t) {
  vec3 c = uC0;
  c = mix(c, uC1, smoothstep(0.0,  0.25, t));
  c = mix(c, uC2, smoothstep(0.25, 0.5,  t));
  c = mix(c, uC3, smoothstep(0.5,  0.75, t));
  c = mix(c, uC4, smoothstep(0.75, 1.0,  t));
  return c;
}

void main() {
  vec3  n   = normalize(position);
  float lon = atan(n.z, n.x);
  float lat = asin(clamp(n.y, -1.0, 1.0));

  float plasma =
      sin(lon * 3.0 + uTime * 0.70) * 0.35
    + cos(lat * 4.0 + uTime * 0.90) * 0.25
    + sin((lon - lat) * 2.0 + uTime * 0.55) * 0.25
    + cos(lon * 5.0 + lat * 2.0 - uTime * 1.10) * 0.15;
  plasma = plasma * 0.5 + 0.5;

  // Hover: push dots outward near the mouse, enlarge and brighten them
  vec4 mvBase = modelViewMatrix * vec4(position, 1.0);
  vec4 clip   = projectionMatrix * mvBase;
  vec2 ndc    = clip.xy / clip.w;
  float dist  = distance(ndc, uMouse);
  float inf   = (1.0 - smoothstep(0.0, 0.45, dist)) * uHover;

  vec3 displaced = position + n * inf * 0.18;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);

  gl_PointSize = uBaseSize * (300.0 / -mv.z) * (0.85 + plasma * 0.3) * (1.0 + inf * 0.9);
  gl_Position  = projectionMatrix * mv;

  vColor = paletteSample(clamp(plasma + inf * 0.35, 0.0, 1.0));
  vAlpha = (0.55 + plasma * 0.45) * (1.0 + inf * 0.3);
}
`;

const FRAG = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.18, d) * vAlpha;
  gl_FragColor = vec4(vColor, a);
}
`;

// ── Fibonacci sphere point distribution ───────────────────────────────────
function fibSphere(count: number): Float32Array {
  const buf = new Float32Array(count * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y  = 1 - (i / (count - 1)) * 2;
    const r  = Math.sqrt(1 - y * y);
    const th = golden * i;
    buf[i * 3]     = Math.cos(th) * r;
    buf[i * 3 + 1] = y;
    buf[i * 3 + 2] = Math.sin(th) * r;
  }
  return buf;
}

// ── Constants ─────────────────────────────────────────────────────────────
const DOT_COUNTS = { low: 2500, medium: 5000, high: 8000 } as const;
const CAM_Z_INIT = 3.5;
const CAM_Z_MIN  = 2.0;
const CAM_Z_MAX  = 5.5;
const FOV        = 46;
const DAMP       = 0.22;
const AUTO_SPEED = 0.15;

function hexToVec3(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

interface Runtime {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  material: THREE.ShaderMaterial;
  rotX: number; rotY: number;
  velX: number; velY: number;
  dragging: boolean;
  prevPx: number; prevPy: number;
  camZ: number;
  pinchDist: number;
  reduced: boolean;
  lastInteract: number;
  mouseX: number; mouseY: number;
  mouseInside: boolean;
  hoverT: number;
}

// ── Component ─────────────────────────────────────────────────────────────
export function PlasmaSphere({
  tabs = [], activeTab, onSelectTab,
}: PlasmaSphereProps) {
  const outerRef   = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLDivElement>(null);
  const dotRefs    = useRef<(HTMLSpanElement | null)[]>([]);
  const polyRefs   = useRef<(SVGPolylineElement | null)[]>([]);
  const rt         = useRef<Runtime | null>(null);
  const { theme }  = useTheme();
  const reduced    = useReducedMotion();
  const perf       = useDevicePerformance();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  // ── Leader-line measurement ───────────────────────────────────────────
  const measure = useCallback(() => {
    const outer  = outerRef.current;
    const canvas = canvasRef.current;
    if (!outer || !canvas) return;

    const oRect = outer.getBoundingClientRect();
    const cRect = canvas.getBoundingClientRect();
    const cOffX = cRect.left - oRect.left;
    const cOffY = cRect.top  - oRect.top;
    const sCX   = cOffX + cRect.width / 2;
    const sCY   = cOffY + cRect.height / 2;

    const camZ = rt.current?.camZ ?? CAM_Z_INIT;
    const halfTan = Math.tan((FOV / 2) * Math.PI / 180);
    const projR = (1 / (camZ * halfTan)) * 0.5 * cRect.width;

    tabs.forEach((_, i) => {
      const dot  = dotRefs.current[i];
      const poly = polyRefs.current[i];
      if (!dot || !poly) return;

      const dRect = dot.getBoundingClientRect();
      const dx    = dRect.left + dRect.width / 2 - oRect.left;
      const dy    = dRect.top  + dRect.height / 2 - oRect.top;
      const slot  = LABEL_SLOTS[i % LABEL_SLOTS.length];

      const elbowX = slot.side === 'left'
        ? cOffX + cRect.width * 0.05
        : cOffX + cRect.width * 0.95;

      const relY       = dy - sCY;
      const clampedY   = Math.max(-projR * 0.95, Math.min(projR * 0.95, relY));
      const edgeDx     = Math.sqrt(Math.max(0, projR * projR - clampedY * clampedY));
      const sphereX    = slot.side === 'left' ? sCX - edgeDx : sCX + edgeDx;
      const sphereY    = sCY + clampedY;

      poly.setAttribute('points', `${dx},${dy} ${elbowX},${dy} ${sphereX},${sphereY}`);
    });
  }, [tabs]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (outerRef.current) ro.observe(outerRef.current);
    dotRefs.current.forEach((d) => d?.parentElement && ro.observe(d.parentElement));
    return () => ro.disconnect();
  }, [measure]);

  // ── Keep reduced-motion preference in sync ────────────────────────────
  useEffect(() => { if (rt.current) rt.current.reduced = reduced; }, [reduced]);

  // ── React to theme changes ────────────────────────────────────────────
  useEffect(() => {
    const s = rt.current;
    if (!s) return;
    const pal = theme.scene.particlePalette;
    const u = s.material.uniforms;
    u.uC0.value = hexToVec3(pal[0] ?? '#ffffff');
    u.uC1.value = hexToVec3(pal[1] ?? pal[0] ?? '#ffffff');
    u.uC2.value = hexToVec3(pal[2] ?? pal[0] ?? '#ffffff');
    u.uC3.value = hexToVec3(pal[3] ?? pal[0] ?? '#ffffff');
    u.uC4.value = hexToVec3(pal[4] ?? pal[0] ?? '#ffffff');
    s.material.blending = theme.scene.useAdditiveBlending
      ? THREE.AdditiveBlending
      : THREE.NormalBlending;
    s.material.needsUpdate = true;
  }, [theme]);

  // ── Mount Three.js ────────────────────────────────────────────────────
  useEffect(() => {
    const wrap = canvasRef.current;
    if (!wrap) return;

    const W = wrap.clientWidth || 300;
    const H = wrap.clientHeight || 300;
    const dots = DOT_COUNTS[perf];
    const pal = theme.scene.particlePalette;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H);
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;touch-action:none';
    wrap.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, W / H, 0.1, 50);
    camera.position.z = CAM_Z_INIT;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(fibSphere(dots), 3));

    const uniforms = {
      uTime:     { value: 0 },
      uBaseSize: { value: 0.032 },
      uMouse:    { value: new THREE.Vector2(9, 9) },
      uHover:    { value: 0 },
      uC0: { value: hexToVec3(pal[0] ?? '#ffffff') },
      uC1: { value: hexToVec3(pal[1] ?? pal[0] ?? '#ffffff') },
      uC2: { value: hexToVec3(pal[2] ?? pal[0] ?? '#ffffff') },
      uC3: { value: hexToVec3(pal[3] ?? pal[0] ?? '#ffffff') },
      uC4: { value: hexToVec3(pal[4] ?? pal[0] ?? '#ffffff') },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      blending: theme.scene.useAdditiveBlending
        ? THREE.AdditiveBlending
        : THREE.NormalBlending,
    });
    scene.add(new THREE.Points(geo, material));

    const s: Runtime = {
      renderer, camera, scene, material,
      rotX: 0, rotY: 0, velX: 0, velY: 0,
      dragging: false, prevPx: 0, prevPy: 0,
      camZ: CAM_Z_INIT, pinchDist: 0,
      reduced, lastInteract: 0,
      mouseX: 0, mouseY: 0, mouseInside: false, hoverT: 0,
    };
    rt.current = s;

    // ── Pointer drag ──────────────────────────────────────────────────
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      s.dragging = true;
      s.prevPx = e.clientX;
      s.prevPy = e.clientY;
      s.velX = 0; s.velY = 0;
      wrap.setPointerCapture(e.pointerId);
      wrap.style.cursor = 'grabbing';
    };
    const updateMouse = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      s.mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      s.mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      s.mouseInside = true;
    };
    const onPointerMove = (e: PointerEvent) => {
      updateMouse(e);
      if (!s.dragging) return;
      const dx = e.clientX - s.prevPx;
      const dy = e.clientY - s.prevPy;
      s.velY = dx * 0.006;
      s.velX = dy * 0.006;
      s.rotX += s.velX;
      s.rotY += s.velY;
      s.prevPx = e.clientX;
      s.prevPy = e.clientY;
      s.lastInteract = performance.now();
    };
    const onPointerUp = (e: PointerEvent) => {
      s.dragging = false;
      wrap.releasePointerCapture(e.pointerId);
      wrap.style.cursor = 'grab';
    };
    const onPointerLeave = () => {
      s.mouseInside = false;
    };

    // ── Wheel zoom ────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.camZ = Math.max(CAM_Z_MIN, Math.min(CAM_Z_MAX, s.camZ + e.deltaY * 0.004));
    };

    // ── Touch pinch zoom ──────────────────────────────────────────────
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        s.dragging = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        s.pinchDist = Math.hypot(dx, dy);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      s.camZ = Math.max(CAM_Z_MIN, Math.min(CAM_Z_MAX, s.camZ - (dist - s.pinchDist) * 0.015));
      s.pinchDist = dist;
    };

    wrap.addEventListener('pointerdown', onPointerDown);
    wrap.addEventListener('pointermove', onPointerMove);
    wrap.addEventListener('pointerup', onPointerUp);
    wrap.addEventListener('pointercancel', onPointerUp);
    wrap.addEventListener('pointerleave', onPointerLeave);
    wrap.addEventListener('wheel', onWheel, { passive: false });
    wrap.addEventListener('touchstart', onTouchStart, { passive: true });
    wrap.addEventListener('touchmove', onTouchMove, { passive: false });
    wrap.style.cursor = 'grab';

    // ── Resize ────────────────────────────────────────────────────────
    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(wrap);

    // ── Render loop ───────────────────────────────────────────────────
    let rafId: number;
    let prev = 0;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const r = rt.current!;
      uniforms.uTime.value += r.reduced ? dt * 0.3 : dt;

      // Smooth hover transition
      const targetH = r.mouseInside && !r.dragging ? 1 : 0;
      r.hoverT += (targetH - r.hoverT) * Math.min(1, dt * 4);
      uniforms.uHover.value = r.hoverT;
      if (r.mouseInside) {
        (uniforms.uMouse.value as THREE.Vector2).set(r.mouseX, r.mouseY);
      }

      camera.position.z += (r.camZ - camera.position.z) * Math.min(1, dt * 8);

      if (!r.dragging) {
        const decay = Math.pow(DAMP, dt);
        r.velX *= decay;
        r.velY *= decay;
        r.rotX += r.velX;
        r.rotY += r.velY;

        if (!r.reduced && Math.abs(r.velY) < 0.002 && Math.abs(r.velX) < 0.002) {
          r.rotY += AUTO_SPEED * dt;
        }
      }

      scene.rotation.x = r.rotX;
      scene.rotation.y = r.rotY;
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      wrap.removeEventListener('pointerdown', onPointerDown);
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerup', onPointerUp);
      wrap.removeEventListener('pointercancel', onPointerUp);
      wrap.removeEventListener('pointerleave', onPointerLeave);
      wrap.removeEventListener('wheel', onWheel);
      wrap.removeEventListener('touchstart', onTouchStart);
      wrap.removeEventListener('touchmove', onTouchMove);
      geo.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      rt.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perf, reduced]);

  // ── Render ────────────────────────────────────────────────────────────
  const navLit = tabs.map(t => t.id === activeTab || t.id === hoveredTab);

  return (
    <figure className="relative select-none">
      <div ref={outerRef} className="relative px-[19%] sm:px-[16%] lg:px-[14%]">
        {/* Three.js canvas */}
        <div
          ref={canvasRef}
          className="pointer-events-auto relative aspect-square w-full touch-pan-y"
        >
        </div>

        {/* Leader polylines */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {tabs.map((tab, i) => (
            <polyline
              key={tab.id}
              ref={(el) => { polyRefs.current[i] = el; }}
              fill="none"
              stroke={navLit[i] ? 'var(--c-accentH)' : 'var(--c-accent)'}
              strokeWidth={navLit[i] ? 1.5 : 1}
              strokeOpacity={navLit[i] ? 1 : 0.55}
              strokeDasharray={navLit[i] ? undefined : '4 3'}
              className="transition-[stroke,stroke-opacity] duration-300"
            />
          ))}
        </svg>

        {/* Category labels with dots */}
        <nav aria-label="Project categories">
          {tabs.map((tab, i) => {
            const slot    = LABEL_SLOTS[i % LABEL_SLOTS.length];
            const active  = tab.id === activeTab;
            const hovered = tab.id === hoveredTab;
            return (
              <motion.button
                key={tab.id}
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.4 }}
                onClick={() => onSelectTab?.(tab.id)}
                onPointerEnter={() => setHoveredTab(tab.id)}
                onPointerLeave={() => setHoveredTab(null)}
                onFocus={() => setHoveredTab(tab.id)}
                onBlur={() => setHoveredTab(null)}
                aria-label={`Show ${tab.label}`}
                aria-current={active ? 'true' : undefined}
                style={{ top: `${slot.top}%` }}
                className={`pointer-events-auto absolute flex max-w-[19%] -translate-y-1/2 items-center gap-1.5 rounded p-1.5 sm:max-w-[16%] sm:gap-2 lg:max-w-[14%] ${
                  slot.side === 'left' ? 'left-0 text-right' : 'right-0 flex-row-reverse text-left'
                }`}
              >
                <span
                  className={`text-[10px] leading-tight sm:text-xs uppercase tracking-[0.12em] lg:tracking-[0.16em] transition-colors duration-300 ${
                    active ? 'text-(--c-accent)' : hovered ? 'text-(--c-accentH)' : 'text-(--c-text-muted)'
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  ref={(el) => { dotRefs.current[i] = el; }}
                  className={`relative block h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 rounded-full border transition-all duration-300 ${
                    active
                      ? 'border-(--c-accent) bg-(--c-accent) shadow-[0_0_12px_var(--c-accent)]'
                      : hovered
                        ? 'border-(--c-accentH) bg-(--c-accentH-60) shadow-[0_0_10px_var(--c-accentH)]'
                        : 'border-(--c-accent) bg-(--c-bg)'
                  }`}
                >
                  <span className="telemetry-pulse absolute -inset-1.5 rounded-full border border-(--c-accent-60)" />
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>
    </figure>
  );
}
