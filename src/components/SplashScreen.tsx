import { useState, useEffect } from 'react';
import { ParticleTextEffect } from '@/components/ui/particle-text-effect';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export function SplashScreen({ onComplete, duration = 3000 }: SplashScreenProps) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), duration - 500);
    const completeTimer = setTimeout(onComplete, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
    >
      <ParticleTextEffect words={["Welcome to", "HiAgent"]} />
    </div>
  );
}
