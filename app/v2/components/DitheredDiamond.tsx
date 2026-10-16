'use client';

import { useEffect, useRef } from 'react';

interface DitheredDiamondProps {
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

export default function DitheredDiamond({ className }: DitheredDiamondProps) {
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

          const wave = Math.sin(dist * 8 - t * 1.5) * 0.5 + 0.5;
          const wave2 = Math.cos(c * 0.1 + r * 0.08 + t * 0.6) * 0.2;
          const mouseWave = Math.max(0, 1 - mDist * 2) * 0.5;
          const luminance = Math.max(0, Math.min(1, wave * (1 - dist * 0.5) + wave2 + mouseWave));

          const bayerIdx = (r % 8) * 8 + (c % 8);
          const threshold = BAYER_8[bayerIdx] / 64;

          if (luminance > threshold) {
            const brightness = luminance * 0.7 + 0.3;
            const hue = 25 + dist * 15;
            ctx.fillStyle = `hsla(${hue}, 85%, ${brightness * 55}%, ${0.5 + luminance * 0.5})`;

            const size = cellSize * 0.7;
            const half = size / 2;
            ctx.beginPath();
            ctx.moveTo(px, py - half);
            ctx.lineTo(px + half, py);
            ctx.lineTo(px, py + half);
            ctx.lineTo(px - half, py);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      const grad = ctx.createRadialGradient(mx, my, 0, mx, my, maxDist * 0.5);
      grad.addColorStop(0, 'rgba(255, 105, 0, 0.08)');
      grad.addColorStop(0.5, 'rgba(255, 70, 0, 0.04)');
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
