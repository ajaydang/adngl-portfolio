'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import type { NavSection } from '@/types/portfolio';
import { portfolioData } from '@/lib/portfolio-data';

const navItems: Array<{ id: NavSection; label: string }> = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
];

interface AccessibleNavigationProps {
  activeSection: NavSection;
  onNavigate: (section: NavSection) => void;
}

function MenuWindow({
  activeSection,
  onNavigate,
  onClose,
}: AccessibleNavigationProps & { onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.querySelector<HTMLElement>('[aria-current="page"], button')?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab' || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href]'));
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      ref={dialogRef}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0B0202]/95 backdrop-blur-md lg:hidden"
    >
      <div className="flex items-center justify-between px-6 pt-6">
        <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#FFA000]/70">Navigation</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="flex h-10 w-10 items-center justify-center rounded border border-[#FF6900]/40 text-[#FF6900] focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2"
        >
          <X size={18} />
        </button>
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col justify-center px-6">
        <ul className="border-t border-white/10">
          {navItems.map(({ id, label }, i) => {
            const active = activeSection === id;
            return (
              <motion.li
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.35 }}
                className="border-b border-white/10"
              >
                <button
                  type="button"
                  onClick={() => {
                    onNavigate(id);
                    onClose();
                  }}
                  aria-current={active ? 'page' : undefined}
                  className="group flex w-full items-baseline gap-4 py-5 text-left focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2"
                >
                  <span className="font-mono text-xs text-[#FFA000]/60">0{i + 1}</span>
                  <span
                    className={`font-display text-4xl sm:text-5xl uppercase tracking-tight transition-colors ${
                      active ? 'text-[#FF6900]' : 'text-white group-hover:text-[#FFA000]'
                    }`}
                  >
                    {label}
                  </span>
                  {active && (
                    <span className="ml-auto h-2 w-2 self-center rounded-full bg-[#FF6900] shadow-[0_0_10px_#FF6900]" />
                  )}
                </button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 pb-8 font-mono text-xs text-white/40">
        <a href={`mailto:${portfolioData.email}`} className="hover:text-[#FF6900]">
          {portfolioData.email}
        </a>
      </div>
    </motion.div>
  );
}

export function AccessibleNavigation({ activeSection, onNavigate }: AccessibleNavigationProps) {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  return (
    <>
      <nav aria-label="Main navigation" className="fixed top-6 right-6 z-40 hidden gap-1 lg:flex">
        {navItems.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={activeSection === id ? 'page' : undefined}
            className={`px-3 py-1.5 rounded text-xs tracking-[0.15em] uppercase transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2 ${
              activeSection === id
                ? 'text-[#FF6900] bg-[#FF6900]/10 border border-[#FF6900]/30'
                : 'text-white/40 hover:text-white/80 border border-transparent hover:border-[#790B20]/40'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <button
        ref={toggleRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="fixed top-6 right-6 z-40 flex h-10 items-center gap-2 rounded border border-[#FF6900]/40 bg-[#0B0202]/70 px-3 text-[#FF6900] backdrop-blur-sm focus-visible:outline-2 focus-visible:outline-[#FF6900] focus-visible:outline-offset-2 lg:hidden"
      >
        <Menu size={16} />
        <span className="text-xs tracking-[0.2em] uppercase">Menu</span>
      </button>

      <AnimatePresence>
        {open && <MenuWindow activeSection={activeSection} onNavigate={onNavigate} onClose={close} />}
      </AnimatePresence>
    </>
  );
}
