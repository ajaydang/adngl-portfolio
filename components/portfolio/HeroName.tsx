'use client';

import { motion } from 'framer-motion';

export function HeroName({ name }: { name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="pointer-events-auto relative w-fit"
    >
      <h1 className="font-hero font-black uppercase flex flex-col gap-[0.14em] leading-none tracking-tight text-6xl sm:text-7xl lg:text-[clamp(4.5rem,7.5vw,8rem)]">
        {name.split(' ').map((word) => (
          <span key={word} className="hero-word">
            {word}
          </span>
        ))}
      </h1>
    </motion.div>
  );
}
