'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEMES } from '@/lib/themes';
import { useTheme } from '@/contexts/ThemeContext';

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onClickOut = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOut);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClickOut);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-40">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Change color theme"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded border border-[var(--c-accent-40)] bg-[var(--c-bg-70)] text-[var(--c-accent)] backdrop-blur-sm transition-colors hover:border-[var(--c-accent)] focus-visible:outline-2 focus-visible:outline-[var(--c-accent)] focus-visible:outline-offset-2"
      >
        <Palette size={15} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            aria-label="Theme options"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-11 right-0 w-44 overflow-hidden rounded border border-[var(--c-accent-30)] bg-[var(--c-bg-95)] backdrop-blur-sm"
          >
            <p className="px-3 py-2 font-mono text-[10px] tracking-[0.25em] uppercase text-[var(--c-text-dim)]">
              Theme
            </p>
            {THEMES.map((t) => {
              const active = t.key === theme.key;
              return (
                <button
                  key={t.key}
                  role="menuitem"
                  type="button"
                  onClick={() => {
                    setTheme(t.key);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-xs tracking-wide transition-colors ${
                    active
                      ? 'text-[var(--c-accent)] bg-[var(--c-accent-10)]'
                      : 'text-[var(--c-text-muted)] hover:text-[var(--c-text)] hover:bg-[var(--c-accent-10)]'
                  }`}
                >
                  {/* Swatch */}
                  <span
                    className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                    style={{ background: t.vars['--c-accent'] }}
                    aria-hidden="true"
                  />
                  {t.label}
                  {active && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--c-accent)]" />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
