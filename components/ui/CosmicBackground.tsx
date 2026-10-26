import React from 'react';

// Deterministic pseudo-random so server and client render the same stars
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seeded(42);
const STARS = Array.from({ length: 90 }, (_, i) => ({
  id: i,
  x: rand() * 100,
  y: rand() * 100,
  size: rand() < 0.85 ? 1 + rand() : 2 + rand() * 1.5,
  delay: rand() * 4,
  duration: 3 + rand() * 4,
}));

interface CosmicBackgroundProps {
  // Main nebula color; changes per level
  glow?: string;
  glow2?: string;
}

export function CosmicBackground({ glow = 'rgba(99,102,241,0.25)', glow2 = 'rgba(56,189,248,0.08)' }: CosmicBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-night-950" aria-hidden="true">
      <div
        className="absolute inset-0 transition-[background] duration-1000"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 45%, ${glow}, transparent 70%),
                       radial-gradient(ellipse 50% 40% at 85% 10%, ${glow2}, transparent 70%),
                       radial-gradient(ellipse 60% 50% at 10% 95%, ${glow2}, transparent 70%)`,
        }}
      />
      {STARS.map(star => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
            boxShadow: star.size > 2 ? '0 0 6px rgba(255,255,255,0.8)' : undefined,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}
