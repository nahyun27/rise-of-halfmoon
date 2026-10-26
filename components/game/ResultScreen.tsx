"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ArrowRightIcon, ExitIcon, RetryIcon } from '../ui/Icons';
import { MoonPhase } from '../MoonPhase';
import { OWNER_COLORS } from '../../constants/theme';

export type GameOutcome = 'win' | 'lose' | 'draw';

interface ResultScreenProps {
  outcome: GameOutcome;
  levelLabel: string;
  playerScore: number;
  opponentScore: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetryLevel: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

const COPY: Record<GameOutcome, { title: string, message: string, glow: string, phase: number, color: string }> = {
  win: { title: 'Victory', message: 'The moon rises in your favor.', glow: 'rgba(246,210,122,0.45)', phase: 4, color: '#f6d27a' },
  lose: { title: 'Defeat', message: 'The Half Moon prevails. Your journey begins anew from Level 1.', glow: 'rgba(255,122,144,0.4)', phase: 0, color: OWNER_COLORS.opponent },
  draw: { title: 'Balanced', message: 'The moon is perfectly balanced. Try again to break the tie.', glow: 'rgba(185,140,255,0.4)', phase: 2, color: '#b98cff' },
};

export function ResultScreen({
  outcome,
  levelLabel,
  playerScore,
  opponentScore,
  hasNextLevel,
  onNextLevel,
  onRetryLevel,
  onRestart,
  onMenu,
}: ResultScreenProps) {
  const copy = COPY[outcome];

  return (
    <Modal glow={copy.glow}>
      <div className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.4, rotate: -40, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}
          className="size-24 sm:size-28 -mt-2 mb-4"
          style={{ filter: `drop-shadow(0 0 30px ${copy.glow})` }}
        >
          <MoonPhase phase={copy.phase} />
        </motion.div>

        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-ink-faint">{levelLabel}</p>
        <h2 className="font-display text-4xl sm:text-5xl font-black tracking-[0.12em] uppercase mt-1" style={{ color: copy.color, textShadow: `0 0 30px ${copy.glow}` }}>
          {copy.title}
        </h2>
        <p className="text-sm text-ink-muted mt-3 max-w-xs">{copy.message}</p>

        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center gap-3 my-7">
          <ScoreBlock label="You" score={playerScore} color={OWNER_COLORS.player} highlight={outcome === 'win'} />
          <span className="text-xs font-semibold tracking-[0.3em] text-ink-faint">VS</span>
          <ScoreBlock label="Half Moon" score={opponentScore} color={OWNER_COLORS.opponent} highlight={outcome === 'lose'} />
        </div>

        <div className="w-full flex flex-col gap-3">
          {outcome === 'win' && (
            <Button variant="primary" size="lg" icon={<ArrowRightIcon size={18} />} onClick={onNextLevel} autoFocus>
              {hasNextLevel ? 'Next Level' : 'Finish'}
            </Button>
          )}
          {outcome === 'draw' && (
            <Button variant="primary" size="lg" icon={<RetryIcon size={18} />} onClick={onRetryLevel} autoFocus>Retry Level</Button>
          )}
          {outcome === 'lose' && (
            <Button variant="primary" size="lg" icon={<RetryIcon size={18} />} onClick={onRestart} autoFocus>Try Again</Button>
          )}
          <Button variant="ghost" icon={<ExitIcon size={16} />} onClick={onMenu}>Main Menu</Button>
        </div>
      </div>
    </Modal>
  );
}

function ScoreBlock({ label, score, color, highlight }: { label: string, score: number, color: string, highlight: boolean }) {
  return (
    <div
      className="rounded-2xl border px-3 py-3 flex flex-col items-center"
      style={{ borderColor: highlight ? `${color}66` : 'rgba(255,255,255,0.08)', background: highlight ? `${color}12` : 'rgba(255,255,255,0.02)' }}
    >
      <span className="text-[10px] font-semibold tracking-[0.25em] uppercase" style={{ color }}>{label}</span>
      <span className="font-sans tracking-tight text-3xl sm:text-4xl font-black tabular-nums mt-1 text-ink">{score}</span>
    </div>
  );
}
