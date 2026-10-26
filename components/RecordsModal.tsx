"use client";

import React, { useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button, IconButton } from './ui/Button';
import { CloseIcon } from './ui/Icons';
import { StarRating } from './ui/StarRating';
import { StatGrid } from './StatGrid';
import { LEVEL_LAYOUTS } from '../constants/layouts';
import { SCORE_COLORS } from '../constants/theme';
import { getDailyStreak, Records } from '../utils/records';

interface RecordsModalProps {
  records: Records;
  todayKey: string;
  onClose: () => void;
}

export function RecordsModal({ records, todayKey, onClose }: RecordsModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const { totals, bests } = records;
  const winRate = totals.games ? Math.round((totals.wins / totals.games) * 100) : 0;
  const totalStars = LEVEL_LAYOUTS.reduce((sum, l) => sum + (records.levels[l.levelNumber]?.stars ?? 0), 0);
  const dailiesPlayed = Object.keys(records.daily).length;

  return (
    <Modal eyebrow="Your journey" title="Records" size="lg">
      <IconButton label="Close records" size="sm" onClick={onClose} className="absolute top-4 right-4">
        <CloseIcon size={16} />
      </IconButton>

      <section aria-label="Overall">
        <StatGrid
          columns={4}
          items={[
            { label: 'Games', value: totals.games },
            { label: 'Win Rate', value: `${winRate}%` },
            { label: 'Stars', value: `${totalStars}/${LEVEL_LAYOUTS.length * 3}`, color: '#f6d27a' },
            { label: 'Daily Streak', value: getDailyStreak(records, todayKey) },
          ]}
        />
      </section>

      <h3 className="mt-6 mb-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-ink-faint">Best moments</h3>
      <StatGrid
        columns={4}
        items={[
          { label: 'High Score', value: bests.score },
          { label: 'Biggest Win', value: bests.margin > 0 ? `+${bests.margin}` : '–' },
          { label: 'Longest Cycle', value: bests.longestCycle || '–', color: SCORE_COLORS.CHAIN },
          { label: 'Dailies', value: dailiesPlayed },
        ]}
      />

      <h3 className="mt-6 mb-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-ink-faint">Lifetime</h3>
      <StatGrid
        columns={4}
        items={[
          { label: 'Pairs', value: totals.pairs, color: SCORE_COLORS.PAIR },
          { label: 'Full Moons', value: totals.fullMoons, color: SCORE_COLORS.FULL_MOON },
          { label: 'Cycles', value: totals.cycles, color: SCORE_COLORS.CHAIN },
          { label: 'Steals', value: totals.steals },
        ]}
      />

      <h3 className="mt-6 mb-2 text-[11px] font-semibold tracking-[0.25em] uppercase text-ink-faint">Levels</h3>
      <ul className="rounded-xl border border-white/[0.07] divide-y divide-white/[0.06]">
        {LEVEL_LAYOUTS.map(layout => {
          const rec = records.levels[layout.levelNumber];
          return (
            <li key={layout.levelNumber} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <span className="w-5 text-ink-faint tabular-nums">{layout.levelNumber}</span>
              <span className="flex-1 font-display font-semibold tracking-wider text-ink">{layout.name}</span>
              <span className="text-xs text-ink-faint tabular-nums">{rec ? `Best ${rec.bestScore}` : 'Not played'}</span>
              <StarRating stars={rec?.stars ?? 0} size={14} />
            </li>
          );
        })}
      </ul>

      <Button onClick={onClose} className="w-full mt-6">Close</Button>
    </Modal>
  );
}
