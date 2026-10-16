'use client';

import { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import type { NavSection } from '@/types/portfolio';
import { ABOUT_TABS, AboutSection, type AboutTab } from './AboutSection';
import { ALL_PROJECTS, ProjectShowcase, WORK_TABS } from './ProjectShowcase';
import { ContactSection } from './ContactSection';
import { TelemetryPortrait, type PortraitMenuItem } from './TelemetryPortrait';
import { HeroName } from './HeroName';
import { portfolioData } from '@/lib/portfolio-data';

const NAV_ITEMS: PortraitMenuItem[] = [
  { id: 'home', label: 'Home', slot: 0 },
  { id: 'about', label: 'About', slot: 2 },
  { id: 'work', label: 'Work', slot: 1 },
  { id: 'contact', label: 'Contact', slot: 3 },
];

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, scale: 0.98, transition: { duration: 0.3 } },
};

interface NavProps {
  activeSection: NavSection;
  hoveredNode: NavSection | null;
  onNavigate: (section: NavSection) => void;
  onHover: (section: NavSection | null) => void;
}

function NavPortrait({ activeSection, hoveredNode, onNavigate, onHover }: NavProps) {
  return (
    <TelemetryPortrait
      items={NAV_ITEMS}
      activeId={activeSection}
      hoveredId={hoveredNode}
      onSelect={(id) => onNavigate(id as NavSection)}
      onHover={(id) => onHover(id as NavSection | null)}
      menuLabel="Portrait navigation"
      kind="page"
    />
  );
}

function HomeOverlay(nav: NavProps) {
  const { onNavigate } = nav;
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 flex flex-col lg:flex-row items-start lg:items-center justify-center lg:justify-between gap-6 lg:gap-12 px-8 md:px-16 lg:px-24 pointer-events-none z-20"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="order-first lg:order-last w-full max-w-sm sm:max-w-md lg:max-w-none lg:w-[min(46vw,660px,calc((100vh-6rem)*1.35))] shrink-0"
      >
        <NavPortrait {...nav} />
      </motion.div>

      <div className="max-w-xl">
        <HeroName name={portfolioData.name} />

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 mb-6 flex items-center gap-3 text-[#FF6900] text-xs md:text-sm tracking-[0.35em] uppercase font-medium"
        >
          <span aria-hidden="true" className="h-px w-10 bg-[#FF6900]" />
          {portfolioData.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="text-white/50 text-sm md:text-base leading-relaxed mb-8 max-w-md"
        >
          {portfolioData.intro}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex gap-4 pointer-events-auto"
        >
          <button
            onClick={() => onNavigate('work')}
            className="px-5 py-2.5 bg-[#FF6900] text-[#0B0202] text-sm font-semibold rounded tracking-wide hover:bg-[#FFA000] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#FFA000] focus-visible:outline-offset-2"
          >
            Explore My Work
          </button>
          <button
            onClick={() => onNavigate('contact')}
            className="px-5 py-2.5 border border-[#FF6900]/40 text-[#FF6900] text-sm font-medium rounded tracking-wide hover:border-[#FF6900] hover:text-[#FFA000] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2"
          >
            Let&apos;s Connect
          </button>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2 }}
        className="hidden sm:block absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs tracking-[0.2em] uppercase text-center"
      >
        Select a node on the portrait to navigate
      </motion.p>
    </motion.div>
  );
}

function SectionWithPortrait({
  portrait,
  side,
  children,
}: {
  portrait: React.ReactNode;
  side: 'left' | 'right';
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-20 overflow-y-auto"
    >
      <div className="min-h-full flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-0 px-4 md:px-10 lg:px-12 xl:px-16 pt-20 pb-8 lg:py-0">
        {/* Sticky full-height column keeps the portrait centred in its half of the viewport. */}
        <div
          className={`w-full flex justify-center lg:w-1/2 lg:h-screen lg:sticky lg:top-0 lg:items-center ${
            side === 'right' ? 'lg:order-last' : ''
          }`}
        >
          <motion.div
            initial={{ opacity: 0, x: side === 'left' ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="w-full max-w-sm sm:max-w-md lg:max-w-[min(620px,calc((100vh-7rem)*1.35))]"
          >
            {portrait}
          </motion.div>
        </div>
        <div className="w-full min-w-0 lg:w-1/2 lg:py-20 *:mx-auto">{children}</div>
      </div>
    </motion.div>
  );
}

export function PortfolioContent(nav: NavProps) {
  const { activeSection, onNavigate } = nav;
  const [aboutTab, setAboutTab] = useState<AboutTab>('profile');
  const [workFilter, setWorkFilter] = useState(ALL_PROJECTS);
  // Scoped to the page so a hover left behind on unmount can't resurface later.
  const [hover, setHover] = useState<{ section: NavSection; id: string | null }>({ section: 'home', id: null });
  const tabHover = hover.section === activeSection ? hover.id : null;
  const setTabHover = (id: string | null) => setHover({ section: activeSection, id });
  const back = () => onNavigate('home');

  return (
    <AnimatePresence mode="wait">
      {activeSection === 'home' && <HomeOverlay key="home" {...nav} />}

      {activeSection === 'about' && (
        <SectionWithPortrait
          key="about"
          side="left"
          portrait={
            <TelemetryPortrait
              items={ABOUT_TABS}
              activeId={aboutTab}
              hoveredId={tabHover}
              onSelect={(id) => setAboutTab(id as AboutTab)}
              onHover={setTabHover}
              menuLabel="About sections"
              kind="tab"
            />
          }
        >
          <AboutSection tab={aboutTab} onBack={back} />
        </SectionWithPortrait>
      )}

      {activeSection === 'work' && (
        <SectionWithPortrait
          key="work"
          side="left"
          portrait={
            <TelemetryPortrait
              items={WORK_TABS}
              activeId={workFilter}
              hoveredId={tabHover}
              onSelect={setWorkFilter}
              onHover={setTabHover}
              menuLabel="Project categories"
              kind="tab"
            />
          }
        >
          {/* Remounting on filter change closes any open project detail. */}
          <ProjectShowcase key={workFilter} filter={workFilter} onBack={back} />
        </SectionWithPortrait>
      )}

      {activeSection === 'contact' && (
        <SectionWithPortrait key="contact" side="right" portrait={<NavPortrait {...nav} />}>
          <ContactSection onBack={back} />
        </SectionWithPortrait>
      )}
    </AnimatePresence>
  );
}
