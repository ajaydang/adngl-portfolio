'use client';

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Stars } from '@react-three/drei';
import { ParticleField } from './ParticleField';
import { CameraController } from './CameraController';
import type { NavSection } from '@/types/portfolio';
import { useDevicePerformance, getParticleCount } from '@/hooks/useDevicePerformance';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface PortfolioSceneProps {
  activeSection: NavSection;
}

function SceneBackground() {
  return (
    <>
      <color attach="background" args={['#0B0202']} />
      <fog attach="fog" args={['#0B0202', 8, 22]} />
      <ambientLight intensity={0.15} color="#FF6900" />
      <pointLight position={[3, 3, 3]} intensity={0.6} color="#FFA000" />
      <pointLight position={[-3, -2, 2]} intensity={0.3} color="#C90008" />
      <Stars
        radius={20}
        depth={8}
        count={800}
        factor={0.3}
        saturation={0}
        fade
        speed={0.3}
      />
    </>
  );
}

export function PortfolioScene({ activeSection }: PortfolioSceneProps) {
  const mouse = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const tier = useDevicePerformance();
  const reducedMotion = useReducedMotion();
  const [webglError, setWebglError] = useState(false);

  const particleCount = reducedMotion ? 800 : getParticleCount(tier);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }, []);

  useEffect(() => {
    // Test WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) setWebglError(true);
  }, []);

  if (webglError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0B0202]">
        <div className="text-center text-white/50 text-sm px-8">
          <p className="text-[#FF6900] text-lg mb-2">WebGL not supported</p>
          <p>Your browser or device does not support the 3D experience.</p>
          <p className="mt-4 text-xs">Use the navigation above to explore the portfolio.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0"
      onMouseMove={handleMouseMove}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 60, near: 0.1, far: 50 }}
        gl={{
          antialias: tier !== 'low',
          powerPreference: 'high-performance',
          alpha: false,
        }}
        dpr={[1, tier === 'high' ? 2 : 1.5]}
        frameloop={reducedMotion ? 'demand' : 'always'}
      >
        <AdaptiveDpr pixelated />
        <AdaptiveEvents />

        <Suspense fallback={null}>
          <SceneBackground />
          <ParticleField particleCount={particleCount} />
          <CameraController mouse={mouse} targetSection={activeSection} />
        </Suspense>
      </Canvas>
    </div>
  );
}
