import { useEffect, useState } from 'react';

type Tier = 'low' | 'medium' | 'high';

export function useDevicePerformance(): Tier {
  const [tier, setTier] = useState<Tier>('high');

  useEffect(() => {
    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 2;

    // Check device memory (Chrome only)
    const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;

    // Check if mobile
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isTablet = /Tablet|iPad/i.test(navigator.userAgent);

    if (isMobile && cores <= 4) {
      setTier('low');
    } else if (isMobile || isTablet || (memory && memory <= 4) || cores <= 4) {
      setTier('medium');
    } else {
      setTier('high');
    }
  }, []);

  return tier;
}

export function getParticleCount(tier: Tier): number {
  switch (tier) {
    case 'low': return 1200;
    case 'medium': return 2500;
    case 'high': return 5000;
  }
}
