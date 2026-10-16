'use client';

import { useEffect, useRef } from 'react';

interface DitheredSquareProps {
  className?: string;
}

const BAYER_8 = [
   0, 48, 12, 60,  3, 51, 15, 63,
  32, 16, 44, 28, 35, 19, 47, 31,
   8, 56,  4, 52, 11, 59,  7, 55,
  40, 24, 36, 20, 43, 27, 39, 23,
   2, 50, 14, 62,  1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29,
  10, 58,  6, 54,  9, 57,  5, 53,
  42, 26, 38, 22, 41, 25, 37, 21,
];

export default function DitheredSquare({ className }: DitheredSquareProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);

    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onPointerMove);

    const draw = (time: number) => {
      animRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      const t = reducedMotion ? 0 : time * 0.001;

      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, w, h);

      const cellSize = Math.max(6, Math.floor(8 * dpr));
      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);
      const cx = w / 2;
      const cy = h / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      const mx = mouseRef.current.x * w;
      const my = mouseRef.current.y * h;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const px = c * cellSize + cellSize / 2;
          const py = r * cellSize + cellSize / 2;

          const dx = px - cx;
          const dy = py - cy;
          const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;

          const mdx = px - mx;
          const mdy = py - my;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy) / maxDist;

          const wave1 = Math.sin(dist * 6 - t * 1.2) * 0.4 + 0.5;
          const wave2 = Math.cos(c * 0.15 + r * 0.12 + t * 0.8) * 0.3;
          const mouseWave = Math.max(0, 1 - mDist * 2.5) * 0.4;
          const luminance = Math.max(0, Math.min(1, wave1 + wave2 + mouseWave));

          const bayerIdx = (r % 8) * 8 + (c % 8);
          const threshold = BAYER_8[bayerIdx] / 64;

          if (luminance > threshold) {
            const brightness = luminance * 0.6 + 0.35;
            const hue = 25 + dist * 20;
            ctx.fillStyle = `hsla(${hue}, 80%, ${brightness * 50}%, ${0.5 + luminance * 0.5})`;

            const size = cellSize * 0.75;
            const half = size / 2;
            ctx.fillRect(px - half, py - half, size, size);
          }
        }
      }

      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, maxDist * 0.4);
      grad.addColorStop(0, 'rgba(255, 105, 0, 0.08)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
