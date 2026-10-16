'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function createTextTexture(
  text: string[],
  colors: string[],
  width = 2048,
  height = 2048,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, width, height);

  const lineHeight = height / (text.length + 1.4);
  const fontSize = Math.min(lineHeight * 0.9, width / 5);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  text.forEach((line, i) => {
    const y = height * 0.5 + (i - (text.length - 1) / 2) * lineHeight;
    ctx.font = `900 ${fontSize}px "Nohemi", "Arial Black", "Impact", sans-serif`;
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillText(line, width / 2, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const VERTEX_SHADER = /* glsl */ `
uniform vec2 uMouse;
varying vec2 vUv;

float circle(vec2 uv, vec2 center, float radius, float border) {
  float dist = length(uv - center);
  return 1.0 - smoothstep(radius - border, radius + border, dist);
}

float elevation(vec2 uv, vec2 mouse, float radius, float intensity) {
  return circle(uv, mouse, radius, radius * 0.6) * intensity;
}

void main() {
  vUv = uv;
  vec3 pos = position;
  pos.z += elevation(uv, uMouse, 0.2, 0.7);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const FRAGMENT_SHADER = /* glsl */ `
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
  vec4 texColor = texture2D(uTexture, vUv);
  gl_FragColor = texColor;
}
`;

interface BulgePlaneProps {
  lines: string[];
  colors: string[];
}

function BulgePlane({ lines, colors }: BulgePlaneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const smoothMouse = useRef(new THREE.Vector2(0.5, 0.5));
  const { viewport } = useThree();
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    document.fonts.ready.then(() => setFontReady(true));
  }, []);

  const texture = useMemo(() => {
    if (!fontReady) return null;
    return createTextTexture(lines, colors);
  }, [lines, colors, fontReady]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture ?? new THREE.Texture() },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    [texture],
  );

  const planeW = viewport.width * 0.95;
  const planeH = planeW;

  useFrame((state) => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    const mouse = state.pointer;
    const mx = (mouse.x + 1) / 2;
    const my = (mouse.y + 1) / 2;
    smoothMouse.current.x = THREE.MathUtils.lerp(smoothMouse.current.x, mx, 0.1);
    smoothMouse.current.y = THREE.MathUtils.lerp(smoothMouse.current.y, my, 0.1);
    mat.uniforms.uMouse.value.set(smoothMouse.current.x, smoothMouse.current.y);
  });

  if (!texture) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[planeW, planeH, 254, 254]} />
      <shaderMaterial
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}

export interface BulgeTextProps {
  lines?: string[];
  colors?: string[];
  className?: string;
}

export function BulgeText({
  lines = ['GET IN', 'TOUCH'],
  colors = ['#f0f0f0', '#ff6900'],
  className = '',
}: BulgeTextProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 55, near: 0.1, far: 200 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent' }}
      >
        <BulgePlane lines={lines} colors={colors} />
      </Canvas>
    </div>
  );
}
