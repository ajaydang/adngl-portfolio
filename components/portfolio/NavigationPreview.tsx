'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { NavSection } from '@/types/portfolio';
import { portfolioData } from '@/lib/portfolio-data';

const previewContent: Record<NavSection, { title: string; lines: string[] }> = {
  home: {
    title: 'Home',
    lines: ['Welcome to my portfolio', 'Explore my work and connect'],
  },
  about: {
    title: 'About Me',
    lines: [
      portfolioData.title,
      'Frontend & full-stack engineering',
      'Crafting performant, beautiful products',
    ],
  },
  work: {
    title: 'Selected Work',
    lines: [
      `${portfolioData.projects.length} featured projects`,
      'Design systems, dashboards, collaboration tools',
      'React · TypeScript · WebGL',
    ],
  },
  contact: {
    title: "Let's Connect",
    lines: [
      portfolioData.email,
      'Open to collaboration',
      'GitHub · LinkedIn',
    ],
  },
};

interface NavigationPreviewProps {
  hoveredNode: NavSection | null;
}

export function NavigationPreview({ hoveredNode }: NavigationPreviewProps) {
  const preview = hoveredNode ? previewContent[hoveredNode] : null;

  return (
    <AnimatePresence>
      {preview && hoveredNode !== 'home' && (
        <motion.div
          key={hoveredNode}
          initial={{ opacity: 0, y: 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="bg-[#0B0202]/80 backdrop-blur-md border border-[#790B20]/40 rounded-lg px-6 py-4 min-w-[220px] text-center">
            <p className="text-[#FF6900] text-xs tracking-[0.2em] uppercase font-medium mb-2">
              {preview.title}
            </p>
            {preview.lines.map((line, i) => (
              <p
                key={i}
                className={`text-sm ${i === 0 ? 'text-white/90' : 'text-white/50'} leading-relaxed`}
              >
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
