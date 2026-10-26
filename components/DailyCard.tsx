"use client";

import React, { useEffect, useState } from 'react';
import { CalendarIcon, FlameIcon, PlayIcon } from './ui/Icons';
import { ShareButton } from './ShareButton';
import { DailyResult, msUntilNextDaily } from '../utils/records';
import { OWNER_COLORS } from '../constants/theme';

interface DailyCardProps {
  dailyNumber: number;
  boardName: string;
  result: DailyResult | undefined;
  streak: number;
  shareText: string | null;
  onPlay: () => void;
}

function formatCountdown(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const RESULT_LABEL = { win: 'Victory', lose: 'Defeat', draw: 'Draw' } as const;
const RESULT_COLOR = { win: '#f6d27a', lose: OWNER_COLORS.opponent, draw: '#b98cff' } as const;

export function DailyCard({ dailyNumber, boardName, result, streak, shareText, onPlay }: DailyCardProps) {
  const [countdown, setCountdown] = useState(() => formatCountdown(msUntilNextDaily()));

  useEffect(() => {
    const t = setInterval(() => setCountdown(formatCountdown(msUntilNextDaily())), 30_000);
    return () => clearInterval(t);
  }, []);

  const header = (
    <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.25em] uppercase text-moon">
      <CalendarIcon size={13} />
      Daily #{dailyNumber}
      {streak > 0 && (
        <span className="ml-auto flex items-center gap-1 normal-case tracking-normal text-[11px] text-opponent">
          <FlameIcon size={12} />
          {streak} day{streak > 1 ? 's' : ''}
        </span>
      )}
    </div>
  );

  if (!result) {
    return (
      <button
        type="button"
        onClick={onPlay}
        className="group w-full text-left rounded-2xl border border-moon/25 bg-gradient-to-br from-moon/[0.08] to-transparent px-4 py-3.5 cursor-pointer hover:border-moon/45 hover:from-moon/[0.12] transition-colors"
      >
        {header}
        <div className="mt-1.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-lg tracking-wider text-ink">Daily Challenge</p>
            <p className="text-xs text-ink-muted truncate">{boardName} board · same deck for everyone</p>
          </div>
          <span className="size-10 shrink-0 rounded-full bg-moon text-night-950 flex items-center justify-center group-hover:scale-105 transition-transform">
            <PlayIcon size={16} />
          </span>
        </div>
      </button>
    );
  }

  return (
    <div className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
      {header}
      <div className="mt-1.5 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-lg tracking-wider" style={{ color: RESULT_COLOR[result.outcome] }}>
            {RESULT_LABEL[result.outcome]} <span className="font-sans tabular-nums text-ink">{result.playerScore}–{result.opponentScore}</span>
          </p>
          <p className="text-xs text-ink-muted">Next challenge in {countdown}</p>
        </div>
        {shareText && <ShareButton text={shareText} variant="secondary" size="md" className="shrink-0 px-3!" />}
      </div>
    </div>
  );
}
