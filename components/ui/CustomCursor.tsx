'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animId: number;
    let x = 0, y = 0;
    let ringX = 0, ringY = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const animate = () => {
      ringX += (x - ringX) * 0.12;
      ringY += (y - ringY) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringX}px, ${ringY}px)`;
      }
      animId = requestAnimationFrame(animate);
    };

    const onEnterInteractive = () => {
      ringRef.current?.classList.add('scale-150', 'border-[#FF6900]');
      ringRef.current?.classList.remove('border-[#FF6900]/40');
    };

    const onLeaveInteractive = () => {
      ringRef.current?.classList.remove('scale-150', 'border-[#FF6900]');
      ringRef.current?.classList.add('border-[#FF6900]/40');
    };

    document.addEventListener('mousemove', onMove);
    document.querySelectorAll('button, a, [data-interactive]').forEach((el) => {
      el.addEventListener('mouseenter', onEnterInteractive);
      el.addEventListener('mouseleave', onLeaveInteractive);
    });

    animId = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed top-0 left-0 z-[9999] w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6900]"
        aria-hidden="true"
      />
      <div
        ref={ringRef}
        className="pointer-events-none fixed top-0 left-0 z-[9998] w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FF6900]/40 transition-transform duration-300"
        aria-hidden="true"
      />
    </>
  );
}
