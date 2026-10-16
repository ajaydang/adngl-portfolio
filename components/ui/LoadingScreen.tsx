'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        return p + Math.random() * 12;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0202]"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-8"
        >
          {/* Logo mark */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border border-[#FF6900]/30 animate-pulse" />
            <div className="absolute inset-2 rounded-full border border-[#FFA000]/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[#FF6900] font-bold text-xl tracking-wider">AD</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-[#FFA000]/60 text-xs tracking-[0.3em] uppercase">
              Initializing Experience
            </p>
            <div className="w-48 h-px bg-[#790B20]/40 relative overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#C90008] to-[#FF6900]"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <span className="text-[#790B20] text-xs font-mono">
              {Math.min(Math.floor(progress), 100)}%
            </span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
