'use client';

import { Suspense, useRef, useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, AdaptiveEvents, Stars } from '@react-three/drei';
import { ParticleField } from './ParticleField';
import { CameraController } from './CameraController';
import type { NavSection } from '@/types/portfolio';
import { useDevicePerformance, getParticleCount } from '@/hooks/useDevicePerformance';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/lib/themes';

interface PortfolioSceneProps {
  activeSection: NavSection;
}

function SceneBackground({ theme }: { theme: Theme }) {
  const { bgColor, fogColor, ambientColor, light1Color, light2Color, showStars } = theme.scene;
  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[fogColor, 8, 22]} />
      <ambientLight intensity={0.15} color={ambientColor} />
      <pointLight position={[3, 3, 3]} intensity={0.6} color={light1Color} />
      <pointLight position={[-3, -2, 2]} intensity={0.3} color={light2Color} />
      {showStars && (
        <Stars
          radius={20}
          depth={8}
          count={800}
          factor={0.3}
          saturation={0}
          fade
          speed={0.3}
        />
      )}
    </>
  );
}

export function PortfolioScene({ activeSection }: PortfolioSceneProps) {
  const mouse = useRef({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);
  const tier = useDevicePerformance();
  const reducedMotion = useReducedMotion();
  const [webglError, setWebglError] = useState(false);
  const { theme } = useTheme();

  const particleCount = reducedMotion ? 800 : getParticleCount(tier);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
  }, []);

  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) setWebglError(true);
  }, []);

  if (webglError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-(--c-bg)">
        <div className="text-center text-(--c-text-muted) text-sm px-8">
          <p className="text-(--c-accent) text-lg mb-2">WebGL not supported</p>
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
          <SceneBackground theme={theme} />
          <ParticleField particleCount={particleCount} theme={theme} />
          <CameraController mouse={mouse} targetSection={activeSection} />
        </Suspense>
      </Canvas>
    </div>
  );
}
