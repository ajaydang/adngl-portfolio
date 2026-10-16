'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { DotField } from '@/lib/halftone';

const FOV = 35;
const HALF_VIEW = 1.02;
const CAM_Z = HALF_VIEW / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
const DEPTH = 0.45;

export interface PointerState {
  x: number;
  y: number;
  inside: boolean;
}

export interface LeaderLayout {
  offX: number;
  offY: number;
  anchors: { x: number; y: number; elbowX: number }[];
}

export interface Landmark {
  u: number;
  v: number;
  lum: number;
}

interface SceneProps {
  field: DotField;
  landmarks: Landmark[];
  edges: [number, number][];
  navIdx: number[];
  navLit: boolean[];
  pointer: React.RefObject<PointerState>;
  leaderLines: React.RefObject<(SVGPolylineElement | null)[]>;
  layout: React.RefObject<LeaderLayout>;
  reducedMotion: boolean;
  palette?: [string, string, string, string];
  lineColor?: string;
  markColor?: string;
  markColorLit?: string;
}

const dotVertex = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform float uDepth;
  uniform float uPx;
  uniform float uCamZ;
  uniform float uRadius;
  uniform float uMotion;
  uniform vec2 uMouse;
  uniform vec3 uC0;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  attribute float aLum;
  attribute float aSize;
  attribute float aLayer;
  attribute float aRand;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 ramp(float t) {
    t = clamp(t, 0.0, 1.0);
    if (t < 0.33) return mix(uC0, uC1, t / 0.33);
    if (t < 0.66) return mix(uC1, uC2, (t - 0.33) / 0.33);
    return mix(uC2, uC3, (t - 0.66) / 0.34);
  }

  void main() {
    vec3 p = position;
    float d = distance(p.xy, uMouse);
    float inf = (1.0 - smoothstep(0.0, uRadius, d)) * uHover;

    // Brighter regions rise toward the viewer; layers separate on hover.
    p.z = aLum * uDepth * (0.35 + 0.65 * uHover) + (aLayer - 0.5) * 0.3 * uHover;
    p.z += sin(uTime * 1.3 + aRand * 6.2831) * 0.012 * uMotion;

    vec2 dir = d > 0.0001 ? (p.xy - uMouse) / d : vec2(0.0);
    p.xy += dir * inf * 0.14;
    p.z += inf * 0.4;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPx * (1.0 + inf * 0.9) * (uCamZ / -mv.z);

    vColor = ramp(aLum * 1.15 + aLayer * 0.22 + inf * 0.45);
    vAlpha = mix(0.95, 0.8, aLayer);
  }
`;

const dotFragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    gl_FragColor = vec4(vColor, smoothstep(0.5, 0.36, r) * vAlpha);
  }
`;

const markVertex = /* glsl */ `
  uniform float uPx;
  uniform float uCamZ;
  attribute float aLit;
  varying float vLit;
  void main() {
    vLit = aLit;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.035 + aLit * 0.04) * uPx * (uCamZ / -mv.z);
  }
`;

const markFragment = /* glsl */ `
  uniform vec3 uMarkColor;
  uniform vec3 uMarkColorLit;
  varying float vLit;
  void main() {
    float r = length(gl_PointCoord - 0.5);
    if (r > 0.5) discard;
    float core = smoothstep(0.22, 0.12, r);
    float ring = smoothstep(0.5, 0.44, r) * smoothstep(0.34, 0.4, r);
    vec3 col = mix(uMarkColor, uMarkColorLit, vLit);
    gl_FragColor = vec4(col, max(core, ring * (0.55 + vLit * 0.45)));
  }
`;

function PortraitScene({
  field,
  landmarks,
  edges,
  navIdx,
  navLit,
  pointer,
  leaderLines,
  layout,
  reducedMotion,
  palette = ['#790B20', '#C90008', '#FF6900', '#FFA000'],
  lineColor = '#FF6900',
  markColor = '#FF6900',
  markColorLit = '#FFA000',
}: SceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const dotMatRef = useRef<THREE.ShaderMaterial>(null);
  const markRef = useRef<THREE.Points>(null);
  const markMatRef = useRef<THREE.ShaderMaterial>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const hover = useRef(0);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const tmp = useRef(new THREE.Vector3());

  const dotGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(field.positions, 3));
    g.setAttribute('aLum', new THREE.BufferAttribute(field.lum, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(field.size, 1));
    g.setAttribute('aLayer', new THREE.BufferAttribute(field.layer, 1));
    g.setAttribute('aRand', new THREE.BufferAttribute(field.rand, 1));
    return g;
  }, [field]);

  const dotUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHover: { value: 0 },
      uDepth: { value: DEPTH },
      uPx: { value: 300 },
      uCamZ: { value: CAM_Z },
      uRadius: { value: 0.42 },
      uMotion: { value: reducedMotion ? 0 : 1 },
      uMouse: { value: new THREE.Vector2(9, 9) },
      uC0: { value: new THREE.Color(palette[0]) },
      uC1: { value: new THREE.Color(palette[1]) },
      uC2: { value: new THREE.Color(palette[2]) },
      uC3: { value: new THREE.Color(palette[3]) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reducedMotion, palette.join(',')]
  );

  const markUniforms = useMemo(
    () => ({
      uPx: { value: 300 },
      uCamZ: { value: CAM_Z },
      uMarkColor: { value: new THREE.Color(markColor) },
      uMarkColorLit: { value: new THREE.Color(markColorLit) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [markColor, markColorLit]
  );

  const markGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(landmarks.length * 3), 3));
    g.setAttribute('aLit', new THREE.BufferAttribute(new Float32Array(landmarks.length), 1));
    return g;
  }, [landmarks]);

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    return g;
  }, [edges]);

  useFrame((state, delta) => {
    const p = pointer.current;
    const h = THREE.MathUtils.damp(hover.current, p.inside ? 1 : 0, 4, delta);
    hover.current = h;
    if (p.inside) mouse.current.set(p.x * HALF_VIEW, p.y * HALF_VIEW);

    const px = (state.size.height * state.viewport.dpr) / (2 * HALF_VIEW);
    const t = state.clock.elapsedTime;

    const dm = dotMatRef.current;
    if (dm) {
      dm.uniforms.uTime.value = t;
      dm.uniforms.uHover.value = h;
      dm.uniforms.uPx.value = px;
      (dm.uniforms.uMouse.value as THREE.Vector2).copy(mouse.current);
    }
    if (markMatRef.current) markMatRef.current.uniforms.uPx.value = px;

    const g = groupRef.current;
    if (g) {
      const idle = reducedMotion ? 0 : 1;
      const ry = p.inside ? p.x * 0.38 : Math.sin(t * 0.35) * 0.1 * idle;
      const rx = p.inside ? -p.y * 0.3 : Math.sin(t * 0.27) * 0.05 * idle;
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, ry, 3, delta);
      g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rx, 3, delta);
      g.updateMatrixWorld();
    }

    // Keep landmarks sitting on the displaced dot surface.
    const zScale = DEPTH * (0.35 + 0.65 * h);
    const marks = markRef.current;
    if (marks) {
      const pos = marks.geometry.attributes.position as THREE.BufferAttribute;
      const lit = marks.geometry.attributes.aLit as THREE.BufferAttribute;
      landmarks.forEach((l, i) => {
        pos.setXYZ(i, l.u * 2 - 1, 1 - l.v * 2, l.lum * zScale + 0.05);
        lit.setX(i, 0);
      });
      navIdx.forEach((li, n) => {
        const cur = lit.getX(li);
        lit.setX(li, Math.max(cur, navLit[n] ? 1 : 0));
      });
      pos.needsUpdate = true;
      lit.needsUpdate = true;

      const lines = linesRef.current;
      if (lines) {
        const lp = lines.geometry.attributes.position as THREE.BufferAttribute;
        edges.forEach(([a, b], i) => {
          lp.setXYZ(i * 2, pos.getX(a), pos.getY(a), pos.getZ(a));
          lp.setXYZ(i * 2 + 1, pos.getX(b), pos.getY(b), pos.getZ(b));
        });
        lp.needsUpdate = true;
      }

      const L = layout.current;
      const svgLines = leaderLines.current;
      if (g && L && svgLines) {
        navIdx.forEach((li, n) => {
          const el = svgLines[n];
          const a = L.anchors[n];
          if (!el || !a) return;
          const v = tmp.current.set(pos.getX(li), pos.getY(li), pos.getZ(li));
          v.applyMatrix4(g.matrixWorld).project(state.camera);
          const sx = (v.x * 0.5 + 0.5) * state.size.width + L.offX;
          const sy = (-v.y * 0.5 + 0.5) * state.size.height + L.offY;
          el.setAttribute('points', `${a.x},${a.y} ${a.elbowX},${a.y} ${sx.toFixed(1)},${sy.toFixed(1)}`);
        });
      }
    }
  });

  return (
    <group ref={groupRef}>
      <points geometry={dotGeometry}>
        <shaderMaterial
          ref={dotMatRef}
          vertexShader={dotVertex}
          fragmentShader={dotFragment}
          uniforms={dotUniforms}
          transparent
          depthWrite={false}
        />
      </points>
      <lineSegments ref={linesRef} geometry={lineGeometry}>
        <lineBasicMaterial color={lineColor} transparent opacity={0.45} depthWrite={false} />
      </lineSegments>
      <points ref={markRef} geometry={markGeometry}>
        <shaderMaterial
          ref={markMatRef}
          vertexShader={markVertex}
          fragmentShader={markFragment}
          uniforms={markUniforms}
          transparent
          depthWrite={false}
          depthTest={false}
        />
      </points>
    </group>
  );
}

export function HalftonePortrait(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAM_Z], fov: FOV, near: 0.1, far: 20 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      style={{ position: 'absolute', inset: 0 }}
    >
      <PortraitScene {...props} />
    </Canvas>
  );
}
