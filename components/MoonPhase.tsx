import React, { useId } from 'react';
import { PHASE_NAMES } from '../constants/theme';

interface MoonPhaseProps {
  phase: number; // 0 (new) – 7 (waning crescent)
  size?: number | string;
  className?: string;
  glow?: boolean;
  title?: string;
}

const R = 40;
const C = 50;

// Lit area of the moon as seen from the northern hemisphere: waxing phases are lit
// on the right. The terminator is a half-ellipse whose x-radius is r·|cos θ|.
function litPath(phase: number): string | null {
  if (phase === 0) return null;
  if (phase === 4) return `M ${C} ${C - R} A ${R} ${R} 0 1 1 ${C} ${C + R} A ${R} ${R} 0 1 1 ${C} ${C - R} Z`;

  const theta = (phase / 8) * Math.PI * 2;
  const k = Math.cos(theta);
  const side = phase < 4 ? 1 : -1;
  const rx = Math.abs(R * k);
  const outerSweep = side === 1 ? 1 : 0;
  const terminatorSweep = side * k > 0 ? 0 : 1;

  return `M ${C} ${C - R} A ${R} ${R} 0 0 ${outerSweep} ${C} ${C + R} A ${rx.toFixed(3)} ${R} 0 0 ${terminatorSweep} ${C} ${C - R} Z`;
}

const CRATERS = [
  { cx: 38, cy: 36, r: 6 },
  { cx: 60, cy: 30, r: 3.5 },
  { cx: 62, cy: 58, r: 7.5 },
  { cx: 40, cy: 64, r: 4 },
  { cx: 28, cy: 50, r: 2.5 },
  { cx: 72, cy: 44, r: 2.5 },
];

export function MoonPhase({ phase, size = '100%', className = '', glow = true, title }: MoonPhaseProps) {
  const id = useId().replace(/:/g, '');
  const lit = litPath(phase);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={title ?? PHASE_NAMES[phase]}
    >
      <defs>
        <radialGradient id={`${id}-lit`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="55%" stopColor="#f8e7b8" />
          <stop offset="100%" stopColor="#d9bd7a" />
        </radialGradient>
        <radialGradient id={`${id}-dark`} cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#2a2e5c" />
          <stop offset="100%" stopColor="#151735" />
        </radialGradient>
        <clipPath id={`${id}-clip`}>
          {lit && <path d={lit} />}
        </clipPath>
        {glow && (
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Unlit disc */}
      <circle cx={C} cy={C} r={R} fill={`url(#${id}-dark)`} stroke="rgba(170,180,255,0.22)" strokeWidth="1.2" />
      {CRATERS.map((c, i) => (
        <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="rgba(0,0,0,0.18)" />
      ))}

      {/* Lit area */}
      {lit && (
        <g filter={glow ? `url(#${id}-glow)` : undefined}>
          <path d={lit} fill={`url(#${id}-lit)`} />
          <g clipPath={`url(#${id}-clip)`}>
            {CRATERS.map((c, i) => (
              <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="rgba(160,125,60,0.22)" />
            ))}
          </g>
        </g>
      )}
    </svg>
  );
}
