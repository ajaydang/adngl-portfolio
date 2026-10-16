'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { NavSection } from '@/types/portfolio';
import { PortfolioContent } from './PortfolioContent';
import { AccessibleNavigation } from './AccessibleNavigation';
import { NavigationPreview } from './NavigationPreview';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { GridOverlay } from '@/components/ui/GridOverlay';

const PortfolioScene = dynamic(
  () => import('./PortfolioScene').then((m) => m.PortfolioScene),
  { ssr: false }
);

export function ParticleArtwork() {
  const [loaded, setLoaded] = useState(false);
  const [activeSection, setActiveSection] = useState<NavSection>('home');
  const [hoveredNode, setHoveredNode] = useState<NavSection | null>(null);

  const handleNavigate = useCallback((section: NavSection) => {
    setActiveSection(section);
    setHoveredNode(null);
  }, []);

  const handleHover = useCallback((section: NavSection | null) => {
    setHoveredNode(section);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!loaded && <LoadingScreen onComplete={() => setLoaded(true)} />}
      </AnimatePresence>

      {loaded && (
        <>
          <CustomCursor />

          <PortfolioScene activeSection={activeSection} />
          <GridOverlay />

          <AccessibleNavigation
            activeSection={activeSection}
            onNavigate={handleNavigate}
          />

          <NavigationPreview hoveredNode={hoveredNode} />

          {/* Logo mark */}
          <div className="fixed top-6 left-6 z-40 flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full border border-[#FF6900]/20" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[#FF6900] font-bold text-sm tracking-wider">AD</span>
              </div>
            </div>
          </div>

          <PortfolioContent
            activeSection={activeSection}
            hoveredNode={hoveredNode}
            onNavigate={handleNavigate}
            onHover={handleHover}
          />
        </>
      )}
    </>
  );
}
