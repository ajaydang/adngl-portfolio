'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import type { NavSection } from '@/types/portfolio';
import { PortfolioContent } from './PortfolioContent';
import { AccessibleNavigation } from './AccessibleNavigation';
import { NavigationPreview } from './NavigationPreview';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { GridOverlay } from '@/components/ui/GridOverlay';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

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

          {/* Logo mark */}
          <div className="fixed top-6 left-6 z-40 flex items-center gap-3">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 rounded-full border border-(--c-accent-20)" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-(--c-accent) font-bold text-sm tracking-wider">AD</span>
              </div>
            </div>
          </div>

          <ThemeSelector />

          <Link
            href="/v2"
            className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-4 py-2 rounded border text-xs font-medium tracking-wider uppercase transition-all duration-200"
            style={{
              borderColor: 'var(--c-accent-30)',
              color: 'var(--c-accent)',
              background: 'var(--c-bg-70)',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-accent-60)';
              e.currentTarget.style.background = 'var(--c-accent-10)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--c-accent-30)';
              e.currentTarget.style.background = 'var(--c-bg-70)';
            }}
          >
            New Version Site
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </Link>

          <NavigationPreview hoveredNode={hoveredNode} />

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
