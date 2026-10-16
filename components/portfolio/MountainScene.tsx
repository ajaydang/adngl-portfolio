'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/contexts/ThemeContext';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';

// ── Shaders ──────────────────────────────────────────────────────────────────
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

attribute float aHeight;

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
  vec3 pos = position;

  // Gentle breathing / wave
  pos.y += sin(uTime * 0.8 + pos.x * 2.0 + pos.z * 1.5) * 0.01;

  vec4 mvBase = modelViewMatrix * vec4(pos, 1.0);
  vec4 clip   = projectionMatrix * mvBase;
  vec2 ndc    = clip.xy / clip.w;
  float dist  = distance(ndc, uMouse);
  float inf   = (1.0 - smoothstep(0.0, 0.5, dist)) * uHover;

  // Push dots upward near mouse
  vec3 displaced = pos;
  displaced.y += inf * 0.15;
  vec3 pushDir = normalize(pos - vec3(uMouse.x * 0.5, 0.0, 0.0));
  displaced += pushDir * inf * 0.06;

  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);

  float basePS = uBaseSize * (300.0 / -mv.z);
  float sizeScale = 0.7 + aHeight * 0.6;
  gl_PointSize = basePS * sizeScale * (1.0 + inf * 1.0);
  gl_Position  = projectionMatrix * mv;

  float colorT = clamp(aHeight * 0.85 + inf * 0.2, 0.0, 1.0);
  vColor = paletteSample(colorT);
  vAlpha = (0.5 + aHeight * 0.5) * (1.0 + inf * 0.4);
}
`;

const FRAG = /* glsl */ `
varying vec3  vColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - vec2(0.5));
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.15, d) * vAlpha;
  gl_FragColor = vec4(vColor, a);
}
`;

// ── Terrain generation ───────────────────────────────────────────────────────
function noise2D(x: number, z: number): number {
  const n = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, z: number): number {
  const ix = Math.floor(x), iz = Math.floor(z);
  const fx = x - ix, fz = z - iz;
  const sx = fx * fx * (3 - 2 * fx);
  const sz = fz * fz * (3 - 2 * fz);
  const n00 = noise2D(ix, iz);
  const n10 = noise2D(ix + 1, iz);
  const n01 = noise2D(ix, iz + 1);
  const n11 = noise2D(ix + 1, iz + 1);
  const nx0 = n00 + (n10 - n00) * sx;
  const nx1 = n01 + (n11 - n01) * sx;
  return nx0 + (nx1 - nx0) * sz;
}

function fbmNoise(x: number, z: number): number {
  let val = 0, amp = 0.5, freq = 1;
  for (let i = 0; i < 5; i++) {
    val += smoothNoise(x * freq, z * freq) * amp;
    amp *= 0.5;
    freq *= 2;
  }
  return val;
}

function getTerrainHeight(x: number, z: number): number {
  const scale = 2.5;
  let h = fbmNoise(x * scale + 5.3, z * scale + 1.7);
  const distFromCenter = Math.sqrt(x * x + z * z);
  const ridge = Math.max(0, 1 - distFromCenter * 0.8) * 0.4;
  h = h * 0.6 + ridge;
  const peakMask = Math.max(0, 1 - Math.abs(x) * 1.2) * Math.max(0, 1 - Math.abs(z + 0.2) * 1.5);
  h += peakMask * 0.35;
  return h;
}

interface SceneGeometry {
  positions: Float32Array;
  heights: Float32Array;
}

function buildTerrainGeometry(density: number): SceneGeometry {
  const grid = Math.floor(Math.sqrt(density));
  const extent = 4.0;
  const positions = new Float32Array(grid * grid * 3);
  const heights = new Float32Array(grid * grid);

  let idx = 0;
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      const x = (i / (grid - 1) - 0.5) * extent * 2;
      const z = (j / (grid - 1) - 0.5) * extent * 2;
      const jitter = 0.025;
      const jx = x + (noise2D(i * 7.1, j * 3.3) - 0.5) * jitter;
      const jz = z + (noise2D(i * 5.7, j * 11.3) - 0.5) * jitter;
      const h = getTerrainHeight(jx, jz);
      positions[idx * 3]     = jx;
      positions[idx * 3 + 1] = h * 0.7 - 0.2;
      positions[idx * 3 + 2] = jz;
      heights[idx] = h;
      idx++;
    }
  }

  return { positions: positions.subarray(0, idx * 3), heights: heights.subarray(0, idx) };
}

// ── Constants ────────────────────────────────────────────────────────────────
const DOT_COUNTS = { low: 8000, medium: 14000, high: 22000 } as const;
const CAM_DIST_INIT = 2.8;
const CAM_DIST_MIN  = 1.0;
const CAM_DIST_MAX  = 5.0;
const FOV        = 55;
const DAMP       = 0.22;
const AUTO_SPEED = 0.04;

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
  mouseX: number; mouseY: number;
  mouseInside: boolean;
  hoverT: number;
}

// ── Component ────────────────────────────────────────────────────────────────
export function MountainScene() {
  const canvasRef  = useRef<HTMLDivElement>(null);
  const rt         = useRef<Runtime | null>(null);
  const { theme }  = useTheme();
  const reduced    = useReducedMotion();
  const perf       = useDevicePerformance();

  useEffect(() => { if (rt.current) rt.current.reduced = reduced; }, [reduced]);

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
    camera.position.set(0, 1.8, CAM_DIST_INIT);
    camera.lookAt(0, -0.2, 0);

    const geomData = buildTerrainGeometry(dots);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(geomData.positions, 3));
    geo.setAttribute('aHeight', new THREE.BufferAttribute(geomData.heights, 1));

    const uniforms = {
      uTime:     { value: 0 },
      uBaseSize: { value: 0.048 },
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
      rotX: 0, rotY: 0.5,
      velX: 0, velY: 0,
      dragging: false, prevPx: 0, prevPy: 0,
      camZ: CAM_DIST_INIT, pinchDist: 0,
      reduced,
      mouseX: 0, mouseY: 0, mouseInside: false, hoverT: 0,
    };
    rt.current = s;

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
      s.velY = dx * 0.005;
      s.velX = dy * 0.003;
      s.rotX += s.velX;
      s.rotY += s.velY;
      s.rotX = Math.max(-0.6, Math.min(0.6, s.rotX));
      s.prevPx = e.clientX;
      s.prevPy = e.clientY;
    };
    const onPointerUp = (e: PointerEvent) => {
      s.dragging = false;
      wrap.releasePointerCapture(e.pointerId);
      wrap.style.cursor = 'grab';
    };
    const onPointerLeave = () => {
      s.mouseInside = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      s.camZ = Math.max(CAM_DIST_MIN, Math.min(CAM_DIST_MAX, s.camZ + e.deltaY * 0.004));
    };

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
      s.camZ = Math.max(CAM_DIST_MIN, Math.min(CAM_DIST_MAX, s.camZ - (dist - s.pinchDist) * 0.015));
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

    const ro = new ResizeObserver(() => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(wrap);

    let rafId: number;
    let prev = 0;

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      const r = rt.current!;
      uniforms.uTime.value += r.reduced ? dt * 0.3 : dt;

      const targetH = r.mouseInside && !r.dragging ? 1 : 0;
      r.hoverT += (targetH - r.hoverT) * Math.min(1, dt * 4);
      uniforms.uHover.value = r.hoverT;
      if (r.mouseInside) {
        (uniforms.uMouse.value as THREE.Vector2).set(r.mouseX, r.mouseY);
      }

      const targetZ = r.camZ;
      camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 8);
      const targetY = 1.8 * (r.camZ / CAM_DIST_INIT);
      camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 8);

      if (!r.dragging) {
        const decay = Math.pow(DAMP, dt);
        r.velX *= decay;
        r.velY *= decay;
        r.rotX += r.velX;
        r.rotY += r.velY;
        r.rotX = Math.max(-0.6, Math.min(0.6, r.rotX));

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

  return (
    <div
      ref={canvasRef}
      className="pointer-events-auto absolute inset-0 w-full h-full touch-pan-y select-none"
      aria-label="Interactive 3D terrain"
      role="img"
    />
  );
}
