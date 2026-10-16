'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { portfolioData } from '@/lib/portfolio-data';
import { buildDotField, loadLuminance, type DotField, type LuminanceMap } from '@/lib/halftone';
import { useDevicePerformance } from '@/hooks/useDevicePerformance';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useTheme } from '@/contexts/ThemeContext';
import type { Landmark, LeaderLayout, PointerState } from './HalftonePortrait';

const HalftonePortrait = dynamic(() => import('./HalftonePortrait').then((m) => m.HalftonePortrait), {
  ssr: false,
});

const DoodlePortrait = dynamic(() => import('./DoodlePortrait').then((m) => m.DoodlePortrait), {
  ssr: false,
});

const SRC = '/profile.jpg';

// Landmark coordinates in the 512×512 source image space.
const P = {
  crown: [255, 70],
  forehead: [262, 150],
  browL: [205, 215],
  browR: [335, 210],
  eyeL: [230, 258],
  eyeR: [330, 252],
  temL: [150, 250],
  temR: [378, 240],
  nose: [282, 330],
  mouthL: [245, 385],
  mouth: [288, 390],
  mouthR: [330, 380],
  jawL: [178, 375],
  jawR: [372, 360],
  chin: [282, 452],
} satisfies Record<string, [number, number]>;

type Key = keyof typeof P;
const KEYS = Object.keys(P) as Key[];
const idx = (k: Key) => KEYS.indexOf(k);

const EDGES: [number, number][] = (
  [
    ['crown', 'forehead'], ['forehead', 'browL'], ['forehead', 'browR'],
    ['browL', 'eyeL'], ['browR', 'eyeR'], ['eyeL', 'eyeR'],
    ['eyeL', 'nose'], ['eyeR', 'nose'], ['browL', 'temL'], ['browR', 'temR'],
    ['temL', 'eyeL'], ['temR', 'eyeR'], ['temL', 'jawL'], ['temR', 'jawR'],
    ['nose', 'mouthL'], ['nose', 'mouthR'], ['mouthL', 'mouth'], ['mouth', 'mouthR'],
    ['jawL', 'mouthL'], ['jawR', 'mouthR'], ['mouthL', 'chin'], ['mouthR', 'chin'],
    ['jawL', 'chin'], ['jawR', 'chin'],
  ] as [Key, Key][]
).map(([a, b]) => [idx(a), idx(b)]);

// Label slots around the portrait; each leads to a face landmark.
const SLOTS: { from: Key; top: number; side: 'left' | 'right' }[] = [
  { from: 'forehead', top: 14, side: 'left' },
  { from: 'eyeR', top: 26, side: 'right' },
  { from: 'eyeL', top: 50, side: 'left' },
  { from: 'mouthR', top: 62, side: 'right' },
  { from: 'jawL', top: 80, side: 'left' },
  { from: 'chin', top: 86, side: 'right' },
];

export interface PortraitMenuItem {
  id: string;
  label: string;
  /** Index into the label slots; defaults to the item's position. */
  slot?: number;
}

const DENSITY = { low: [72, 3500], medium: [96, 6000], high: [124, 9000] } as const;

let lumCache: Promise<LuminanceMap> | null = null;

function useTimecode() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => f + 1), 1000 / 24);
    return () => clearInterval(id);
  }, []);
  const s = Math.floor(frame / 24);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(frame % 24)}`;
}

interface TelemetryPortraitProps {
  className?: string;
  items: PortraitMenuItem[];
  activeId: string;
  hoveredId: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  /** Accessible name for the menu, e.g. "Portrait navigation" or "About sections". */
  menuLabel: string;
  /** 'page' for site navigation, 'tab' for in-page sections/filters. */
  kind: 'page' | 'tab';
}

export function TelemetryPortrait({
  className = '',
  items,
  activeId,
  hoveredId,
  onSelect,
  onHover,
  menuLabel,
  kind,
}: TelemetryPortraitProps) {
  const nav = useMemo(() => items.map((it, i) => ({ ...it, ...SLOTS[it.slot ?? i] })), [items]);
  const navIdx = useMemo(() => nav.map((n) => idx(n.from)), [nav]);
  const timecode = useTimecode();
  const tier = useDevicePerformance();
  const reducedMotion = useReducedMotion();
  const { theme } = useTheme();
  const [webgl] = useState(() => {
    if (typeof document === 'undefined') return true;
    try {
      const c = document.createElement('canvas');
      return !!(c.getContext('webgl2') || c.getContext('webgl'));
    } catch {
      return false;
    }
  });
  const [scene, setScene] = useState<{ field: DotField; landmarks: Landmark[] } | null>(null);
  const [tracking, setTracking] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const leaderLines = useRef<(SVGPolylineElement | null)[]>([]);
  const layout = useRef<LeaderLayout>({ offX: 0, offY: 0, anchors: [] });
  const pointer = useRef<PointerState>({ x: 0, y: 0, inside: false });

  useEffect(() => {
    if (!webgl) return;
    let cancelled = false;
    lumCache ??= loadLuminance(SRC);
    lumCache
      .then((map) => {
        if (cancelled) return;
        const [grid, stipple] = DENSITY[tier];
        setScene({
          field: buildDotField(map, grid, stipple),
          landmarks: KEYS.map((k) => {
            const u = P[k][0] / 512;
            const v = P[k][1] / 512;
            return { u, v, lum: map.sample(u, v) };
          }),
        });
      })
      .catch(() => {
        lumCache = null;
      });
    return () => {
      cancelled = true;
    };
  }, [tier, webgl]);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    const box = boxRef.current;
    if (!wrap || !box) return;
    const w = wrap.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const offX = b.left - w.left;
    const offY = b.top - w.top;
    const anchors = nav.map((n, i) => {
      const d = dotRefs.current[i]?.getBoundingClientRect();
      const x = d ? d.left + d.width / 2 - w.left : 0;
      const y = d ? d.top + d.height / 2 - w.top : 0;
      const elbowX = n.side === 'left' ? offX + b.width * 0.05 : offX + b.width * 0.95;
      return { x, y, elbowX };
    });
    layout.current = { offX, offY, anchors };

    if (!webgl) {
      nav.forEach((n, i) => {
        const a = anchors[i];
        const [lx, ly] = P[n.from];
        const sx = offX + (lx / 512) * b.width;
        const sy = offY + (ly / 512) * b.height;
        leaderLines.current[i]?.setAttribute('points', `${a.x},${a.y} ${a.elbowX},${a.y} ${sx},${sy}`);
      });
    }
  }, [webgl, nav]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (wrapRef.current) ro.observe(wrapRef.current);
    dotRefs.current.forEach((d) => d?.parentElement && ro.observe(d.parentElement));
    return () => ro.disconnect();
  }, [measure]);

  const updatePointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    pointer.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.current.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    pointer.current.inside = true;
  };

  const navLit = nav.map((n) => activeId === n.id || hoveredId === n.id);

  return (
    <figure className={`relative select-none ${className}`}>
      <div ref={wrapRef} className="relative px-[19%] sm:px-[16%] lg:px-[14%]">
        <div
          ref={boxRef}
          role="img"
          aria-label={`Portrait of ${portfolioData.name}, rendered as an interactive halftone dot field`}
          className="pointer-events-auto relative aspect-square w-full touch-pan-y"
          onPointerEnter={(e) => {
            updatePointer(e);
            setTracking(true);
          }}
          onPointerMove={updatePointer}
          onPointerDown={updatePointer}
          onPointerLeave={() => {
            pointer.current.inside = false;
            setTracking(false);
          }}
        >
          {webgl ? (
            scene && (
              theme.key === 'black-white' ? (
                <DoodlePortrait
                  field={scene.field}
                  landmarks={scene.landmarks}
                  edges={EDGES}
                  navIdx={navIdx}
                  navLit={navLit}
                  pointer={pointer}
                  leaderLines={leaderLines}
                  layout={layout}
                  reducedMotion={reducedMotion}
                />
              ) : (
                <HalftonePortrait
                  field={scene.field}
                  landmarks={scene.landmarks}
                  edges={EDGES}
                  navIdx={navIdx}
                  navLit={navLit}
                  pointer={pointer}
                  leaderLines={leaderLines}
                  layout={layout}
                  reducedMotion={reducedMotion}
                  palette={theme.scene.portraitPalette}
                  lineColor={theme.scene.portraitLineColor}
                  markColor={theme.scene.portraitMarkColor}
                  markColorLit={theme.scene.portraitMarkColorLit}
                />
              )
            )
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={SRC}
              alt=""
              className="absolute inset-0 h-full w-full object-cover grayscale sepia-[.6] hue-rotate-[-20deg] saturate-200 opacity-80"
            />
          )}

          {webgl && !scene && (
            <p className="absolute inset-0 flex items-center justify-center font-mono text-[10px] tracking-[0.3em] text-(--c-accentH-60)">
              CALIBRATING…
            </p>
          )}

          <div className="telemetry-scan pointer-events-none absolute inset-x-0 h-16 bg-linear-to-b from-transparent via-(--c-scan) to-transparent" />

          <svg viewBox="0 0 512 512" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
            {[[8, 8, 1, 1], [504, 8, -1, 1], [8, 504, 1, -1], [504, 504, -1, -1]].map(([x, y, dx, dy], i) => (
              <path
                key={i}
                d={`M${x} ${y + dy * 28} V${y} H${x + dx * 28}`}
                fill="none"
                stroke="var(--c-accent)"
                strokeWidth={1.5}
                opacity={0.7}
              />
            ))}
            {Array.from({ length: 15 }, (_, i) => 48 + i * 30).map((v, i) => (
              <g key={v} stroke="var(--c-accentH)" opacity={0.35}>
                <line x1={v} y1={8} x2={v} y2={i % 3 === 0 ? 18 : 13} />
                <line x1={8} y1={v} x2={i % 3 === 0 ? 18 : 13} y2={v} />
              </g>
            ))}
            <text x={40} y={34} fill="var(--c-accentH)" fontSize={11} fontFamily="Nohemi, system-ui, sans-serif" letterSpacing={1.5}>
              SUBJECT · {portfolioData.name.toUpperCase()}
            </text>
          </svg>
        </div>

        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" aria-hidden="true">
          {nav.map((n, i) => (
            <polyline
              key={n.id}
              ref={(el) => {
                leaderLines.current[i] = el;
              }}
              fill="none"
              stroke={navLit[i] ? 'var(--c-accentH)' : 'var(--c-accent)'}
              strokeWidth={navLit[i] ? 1.5 : 1}
              strokeOpacity={navLit[i] ? 1 : 0.55}
              strokeDasharray={navLit[i] ? undefined : '4 3'}
              className="transition-[stroke,stroke-opacity] duration-300"
            />
          ))}
        </svg>

        <nav aria-label={menuLabel}>
          {nav.map((n, i) => {
            const active = activeId === n.id;
            const hovered = hoveredId === n.id;
            return (
              <motion.button
                key={n.id}
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.4 }}
                onClick={() => onSelect(n.id)}
                onPointerEnter={() => onHover(n.id)}
                onPointerLeave={() => onHover(null)}
                onFocus={() => onHover(n.id)}
                onBlur={() => onHover(null)}
                aria-label={kind === 'page' ? `Go to ${n.label}` : `Show ${n.label}`}
                aria-current={active ? (kind === 'page' ? 'page' : 'true') : undefined}
                style={{ top: `${n.top}%` }}
                className={`pointer-events-auto absolute flex max-w-[19%] -translate-y-1/2 items-center gap-1.5 rounded p-1.5 sm:max-w-[16%] sm:gap-2 lg:max-w-[14%] ${
                  n.side === 'left' ? 'left-0 text-right' : 'right-0 flex-row-reverse text-left'
                }`}
              >
                <span
                  className={`font-mono text-[10px] leading-tight sm:text-xs uppercase tracking-[0.12em] lg:tracking-[0.16em] transition-colors duration-300 ${
                    active ? 'text-(--c-accent)' : hovered ? 'text-(--c-accentH)' : 'text-(--c-text-muted)'
                  }`}
                >
                  {n.label}
                </span>
                <span
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className={`relative block h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0 rounded-full border transition-all duration-300 ${
                    active
                      ? 'border-(--c-accent) bg-(--c-accent) shadow-[0_0_12px_var(--c-accent)]'
                      : hovered
                        ? 'border-(--c-accentH) bg-(--c-accentH-60) shadow-[0_0_10px_var(--c-accentH)]'
                        : 'border-(--c-accent) bg-(--c-bg)'
                  }`}
                >
                  <span className="telemetry-pulse absolute -inset-1.5 rounded-full border border-(--c-accent-60)" />
                </span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      <figcaption className="mx-[19%] sm:mx-[16%] lg:mx-[14%] mt-2 flex items-center justify-between gap-3 border-t border-(--c-border-50) pt-2 font-mono text-[10px] tracking-[0.15em] text-(--c-text-muted)">
        <span className="flex items-center gap-1.5">
          <span className="telemetry-blink inline-block h-1.5 w-1.5 rounded-full bg-(--c-danger)" />
          REC <span className="tabular-nums text-(--c-accentH-80)">{timecode}</span>
        </span>
        <span className={tracking ? 'text-(--c-accentH)' : 'text-(--c-accent-70)'}>{tracking ? 'TRACKING' : 'SCANNING'}</span>
      </figcaption>
    </figure>
  );
}
