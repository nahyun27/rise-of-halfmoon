"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { OWNER_COLORS } from '../../constants/theme';

interface PlayerPanelProps {
  side: 'player' | 'opponent';
  name: string;
  score: number;
  status: string;
  isActive: boolean;
  children: React.ReactNode; // the hand
  className?: string;
}

export function PlayerPanel({ side, name, score, status, isActive, children, className = '' }: PlayerPanelProps) {
  const color = OWNER_COLORS[side];

  return (
    <div
      className={`relative w-full grid grid-cols-[minmax(0,1fr)_auto_auto] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3 rounded-2xl border backdrop-blur-md transition-[border-color,box-shadow,background-color] duration-500 ${className}`}
      style={{
        borderColor: isActive ? `${color}55` : 'rgba(255,255,255,0.07)',
        background: isActive
          ? `linear-gradient(90deg, ${color}14, rgba(17,19,48,0.55) 40%, rgba(17,19,48,0.55) 60%, ${color}14)`
          : 'rgba(17,19,48,0.45)',
        boxShadow: isActive ? `0 0 30px -10px ${color}aa` : 'none',
      }}
    >
      <div className="min-w-0 flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 shrink-0 rounded-full ${isActive ? 'animate-pulse-soft' : 'opacity-40'}`}
            style={{ background: color, boxShadow: isActive ? `0 0 10px ${color}` : 'none' }}
          />
          <span className="font-display font-bold text-[13px] sm:text-base tracking-[0.08em] sm:tracking-[0.18em] whitespace-nowrap" style={{ color }}>
            {name}
          </span>
        </div>
        <span className="mt-0.5 pl-4 text-[10px] sm:text-xs leading-tight text-ink-muted line-clamp-2" aria-live="polite">
          {status}
        </span>
      </div>

      <div className="flex gap-2 sm:gap-3 justify-center">{children}</div>

      <div className="flex flex-col items-end min-w-8">
        <motion.span
          key={score}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="font-sans tracking-tight font-black text-2xl sm:text-4xl leading-none tabular-nums"
          style={{ color: 'var(--color-ink)', textShadow: `0 0 18px ${color}88` }}
          aria-label={`${name} score ${score}`}
        >
          {score}
        </motion.span>
        <span className="mt-1 text-[9px] sm:text-[10px] font-semibold tracking-[0.25em] text-ink-faint">PTS</span>
      </div>
    </div>
  );
}
