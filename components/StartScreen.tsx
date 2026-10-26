"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonPhase } from './MoonPhase';
import { Button, IconButton } from './ui/Button';
import { BookIcon, ChartIcon, GithubIcon, PlayIcon, SoundOffIcon, SoundOnIcon } from './ui/Icons';
import { DailyCard } from './DailyCard';
import { LevelPath } from './LevelPath';
import { RecordsModal } from './RecordsModal';
import { LEVEL_LAYOUTS } from '../constants/layouts';
import { DailyResult, Records } from '../utils/records';

export interface DailyInfo {
  key: string;
  number: number;
  boardName: string;
  result: DailyResult | undefined;
  streak: number;
  shareText: string | null;
}

interface StartScreenProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
  onSelectLevel: (index: number) => void;
  onPlayDaily: () => void;
  currentLevel: number;
  bestLevel: number;
  records: Records;
  daily: DailyInfo;
  isMuted: boolean;
  onToggleMute: () => void;
}

const ARC_PHASES = [0, 1, 2, 3, 4, 5, 6, 7];

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item = {
  hidden: { y: 16, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' as const } },
};

export function StartScreen({
  onStartGame,
  onShowTutorial,
  onSelectLevel,
  onPlayDaily,
  currentLevel,
  bestLevel,
  records,
  daily,
  isMuted,
  onToggleMute,
}: StartScreenProps) {
  const [showRecords, setShowRecords] = useState(false);

  return (
    <main className="relative min-h-dvh w-full flex flex-col items-center justify-center px-4 py-12 overflow-x-hidden">
      <div className="absolute top-[max(16px,env(safe-area-inset-top))] right-4">
        <IconButton label={isMuted ? 'Unmute music' : 'Mute music'} onClick={onToggleMute}>
          {isMuted ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
        </IconButton>
      </div>

      <motion.div variants={container} initial="hidden" animate="visible" className="w-full max-w-xl flex flex-col items-center text-center">
        {/* Lunar cycle arc with the half moon rising in the middle */}
        <motion.div variants={item} className="relative w-full max-w-[280px] sm:max-w-[340px] aspect-[2/1] mb-2">
          {ARC_PHASES.map((phase, i) => {
            const angle = Math.PI - (i / (ARC_PHASES.length - 1)) * Math.PI;
            return (
              <motion.div
                key={phase}
                className="absolute size-7 sm:size-8 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${50 + Math.cos(angle) * 46}%`, top: `${92 - Math.sin(angle) * 84}%` }}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 0.85, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
              >
                <MoonPhase phase={phase} glow={false} />
              </motion.div>
            );
          })}
          <div className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 size-24 sm:size-32 animate-float">
            <div className="absolute inset-0 rounded-full bg-moon/30 blur-3xl" />
            <MoonPhase phase={2} className="relative" />
          </div>
        </motion.div>

        <motion.h1 variants={item} className="font-display font-black leading-none">
          <span className="block text-sm sm:text-base tracking-[0.5em] text-ink-muted pl-[0.5em]">RISE OF THE</span>
          <span
            className="block mt-3 text-[2.75rem] sm:text-6xl tracking-[0.08em] bg-gradient-to-b from-moon-soft via-moon to-[#c99a3e] bg-clip-text text-transparent"
            style={{ filter: 'drop-shadow(0 0 24px rgba(246,210,122,0.35))' }}
          >
            HALF MOON
          </span>
        </motion.h1>

        <motion.p variants={item} className="mt-4 text-sm text-ink-muted tracking-wide">
          A strategic moon phase card game
        </motion.p>

        <motion.div variants={item} className="w-full max-w-sm flex flex-col gap-3 mt-8">
          <Button variant="primary" size="lg" icon={<PlayIcon size={18} />} onClick={onStartGame}>
            {currentLevel > 1 ? `Continue · Level ${currentLevel}` : 'Start Game'}
          </Button>
          <DailyCard
            dailyNumber={daily.number}
            boardName={daily.boardName}
            result={daily.result}
            streak={daily.streak}
            shareText={daily.shareText}
            onPlay={onPlayDaily}
          />
          <div className="grid grid-cols-2 gap-3">
            <Button icon={<BookIcon size={16} />} onClick={onShowTutorial} className="px-3! tracking-[0.06em]! whitespace-nowrap">How to Play</Button>
            <Button icon={<ChartIcon size={16} />} onClick={() => setShowRecords(true)} className="px-3! tracking-[0.06em]! whitespace-nowrap">Records</Button>
          </div>
        </motion.div>

        <motion.div variants={item} className="w-full max-w-sm mt-8">
          <LevelPath
            levels={LEVEL_LAYOUTS}
            records={records}
            unlocked={Math.min(bestLevel, LEVEL_LAYOUTS.length)}
            currentLevel={currentLevel}
            onSelect={onSelectLevel}
          />
        </motion.div>

        <motion.div variants={item} className="mt-8 flex flex-col items-center gap-1.5">
          <a
            href="https://github.com/nahyun27/rise-of-halfmoon"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink px-3 py-1.5 rounded-lg border border-white/[0.07] hover:border-white/20 bg-white/[0.02] transition-colors"
          >
            <GithubIcon size={14} />
            View on GitHub
          </a>
          <p className="text-[11px] text-ink-faint">Enjoyed it? Star the repo · Found a bug? Open an issue</p>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showRecords && <RecordsModal key="records" records={records} todayKey={daily.key} onClose={() => setShowRecords(false)} />}
      </AnimatePresence>
    </main>
  );
}
