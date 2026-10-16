'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { buildParticleGeometry, buildConnectionLines, generateRibbonPoints } from '@/lib/particle-utils';

const vertexShader = `
  attribute float size;
  attribute vec3 color;
  attribute float opacity;
  varying vec3 vColor;
  varying float vOpacity;
  uniform float uTime;
  uniform vec2 uMouse;

  void main() {
    vColor = color;
    vOpacity = opacity;

    vec3 pos = position;

    // Organic breathing animation
    float phase = pos.x * 0.5 + pos.y * 0.8 + pos.z * 0.3;
    pos.x += sin(uTime * 0.4 + phase) * 0.015;
    pos.y += cos(uTime * 0.35 + phase * 1.2) * 0.012;
    pos.z += sin(uTime * 0.3 + phase * 0.7) * 0.01;

    // Mouse attraction (subtle)
    vec2 diff = uMouse - pos.xy;
    float proximity = 1.0 - clamp(length(diff) / 3.0, 0.0, 1.0);
    pos.xy += diff * proximity * 0.015;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;

  void main() {
    // Circular soft dot
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Soft glow falloff
    float alpha = (1.0 - dist * 2.0) * vOpacity;
    alpha = pow(alpha, 1.5);

    // Glow corona
    float glow = exp(-dist * 6.0) * 0.4;

    gl_FragColor = vec4(vColor + glow * 0.3, alpha + glow * 0.3);
  }
`;

interface ParticleFieldProps {
  particleCount: number;
}

export function ParticleField({ particleCount }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const timeRef = useRef(0);
  const mouseRef = useRef(new THREE.Vector2(0, 0));

  const { geometry, lineGeometry, uniforms } = useMemo(() => {
    const points = generateRibbonPoints(particleCount);
    const geo = buildParticleGeometry(points);

    const { positions, count } = buildConnectionLines(points, 0.52, 2000);
    const lineGeo = new THREE.BufferGeometry();
    if (count > 0) {
      lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    }

    const unis = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    };

    return { geometry: geo, lineGeometry: lineGeo, uniforms: unis };
  }, [particleCount]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
      }),
    [uniforms]
  );

  const lineMaterial = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color('#C90008'),
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    []
  );

  useFrame((state) => {
    timeRef.current = state.clock.elapsedTime;
    uniforms.uTime.value = timeRef.current;

    // Slow overall rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.y = timeRef.current * 0.04;
      pointsRef.current.rotation.x = Math.sin(timeRef.current * 0.025) * 0.08;
    }
    if (linesRef.current) {
      linesRef.current.rotation.y = timeRef.current * 0.04;
      linesRef.current.rotation.x = Math.sin(timeRef.current * 0.025) * 0.08;
    }
  });

  return (
    <group>
      <points ref={pointsRef} geometry={geometry} material={material} />
      <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />
    </group>
  );
}
