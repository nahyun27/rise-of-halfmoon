"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MoonPhase } from './MoonPhase';
import { Button, IconButton } from './ui/Button';
import { BookIcon, GithubIcon, MapPinIcon, PlayIcon, SoundOffIcon, SoundOnIcon, TrophyIcon } from './ui/Icons';

interface StartScreenProps {
  onStartGame: () => void;
  onShowTutorial: () => void;
  currentLevel: number;
  bestLevel: number;
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

export function StartScreen({ onStartGame, onShowTutorial, currentLevel, bestLevel, isMuted, onToggleMute }: StartScreenProps) {
  return (
    <main className="relative min-h-dvh w-full flex flex-col items-center justify-center px-4 py-10 overflow-x-hidden">
      <div className="absolute top-[max(16px,env(safe-area-inset-top))] right-4">
        <IconButton label={isMuted ? 'Unmute music' : 'Mute music'} onClick={onToggleMute}>
          {isMuted ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
        </IconButton>
      </div>

      <motion.div variants={container} initial="hidden" animate="visible" className="w-full max-w-md flex flex-col items-center text-center">
        {/* Lunar cycle arc with the half moon rising in the middle */}
        <motion.div variants={item} className="relative w-full max-w-[340px] aspect-[2/1] mb-2">
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
          <div className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 size-28 sm:size-32 animate-float">
            <div className="absolute inset-0 rounded-full bg-moon/30 blur-3xl" />
            <MoonPhase phase={2} className="relative" />
          </div>
        </motion.div>

        <motion.h1 variants={item} className="font-display font-black leading-none">
          <span className="block text-sm sm:text-base tracking-[0.5em] text-ink-muted pl-[0.5em]">RISE OF THE</span>
          <span
            className="block mt-3 text-5xl sm:text-6xl tracking-[0.08em] bg-gradient-to-b from-moon-soft via-moon to-[#c99a3e] bg-clip-text text-transparent"
            style={{ filter: 'drop-shadow(0 0 24px rgba(246,210,122,0.35))' }}
          >
            HALF MOON
          </span>
        </motion.h1>

        <motion.p variants={item} className="mt-4 text-sm text-ink-muted tracking-wide">
          A strategic moon phase card game
        </motion.p>

        <motion.div variants={item} className="w-full max-w-xs flex flex-col gap-3 mt-10">
          <Button variant="primary" size="lg" icon={<PlayIcon size={18} />} onClick={onStartGame}>
            {currentLevel > 1 ? `Continue · Level ${currentLevel}` : 'Start Game'}
          </Button>
          <Button size="lg" icon={<BookIcon size={18} />} onClick={onShowTutorial}>
            How to Play
          </Button>
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-3 mt-8">
          <StatChip icon={<MapPinIcon size={14} />} label="Level" value={currentLevel} />
          <StatChip icon={<TrophyIcon size={14} />} label="Best" value={bestLevel} />
        </motion.div>

        <motion.div variants={item} className="mt-10 flex flex-col items-center gap-1.5">
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
    </main>
  );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div className="flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-md">
      <span className="text-moon">{icon}</span>
      <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ink-faint">{label}</span>
      <span className="font-sans tracking-tight font-bold text-ink tabular-nums">{value}</span>
    </div>
  );
}
