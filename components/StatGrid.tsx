import React from 'react';
import { SCORE_COLORS } from '../constants/theme';
import { GameStats } from '../utils/records';

export interface StatItem {
  label: string;
  value: React.ReactNode;
  color?: string;
}

export function StatGrid({ items, columns = 4 }: { items: StatItem[], columns?: 2 | 3 | 4 }) {
  const cols = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns];
  return (
    <dl className={`grid ${cols} gap-2`}>
      {items.map(item => (
        <div key={item.label} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 py-2.5 flex flex-col items-center text-center">
          <dd className="font-sans text-xl font-bold tabular-nums leading-none" style={{ color: item.color ?? 'var(--color-ink)' }}>{item.value}</dd>
          <dt className="mt-1.5 text-[9px] sm:text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-faint leading-tight">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function gameStatItems(stats: GameStats): StatItem[] {
  return [
    { label: 'Pairs', value: stats.pairs, color: SCORE_COLORS.PAIR },
    { label: 'Full Moons', value: stats.fullMoons, color: SCORE_COLORS.FULL_MOON },
    { label: 'Longest Cycle', value: stats.longestCycle || '–', color: SCORE_COLORS.CHAIN },
    { label: 'Steals', value: stats.steals },
  ];
}
