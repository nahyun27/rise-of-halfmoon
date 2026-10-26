"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MoonPhase } from './MoonPhase';
import { playLevelStartSound } from '../utils/sounds';

interface LevelIntroProps {
  levelNumber: number;
  levelName: string;
  // Replaces the "Level N" line, e.g. for the daily challenge
  eyebrow?: string;
  onComplete: () => void;
}

const INTRO_MS = 2800;

export function LevelIntro({ levelNumber, levelName, eyebrow, onComplete }: LevelIntroProps) {
  const [leaving, setLeaving] = useState(false);
  // The moon waxes from new to full while the intro plays
  const [phase, setPhase] = useState(0);
  // Parent passes a fresh callback each render; keep timers from restarting
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const complete = () => onCompleteRef.current();
    playLevelStartSound();
    const phaseTimer = setInterval(() => setPhase(p => Math.min(p + 1, 4)), 260);
    const leaveTimer = setTimeout(() => setLeaving(true), INTRO_MS - 600);
    const completeTimer = setTimeout(complete, INTRO_MS);
    return () => {
      clearInterval(phaseTimer);
      clearTimeout(leaveTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === 'Enter') onComplete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onComplete]);

  return (
    <motion.main
      className="fixed inset-0 z-[50] flex flex-col items-center justify-center px-4 cursor-pointer select-none"
      onClick={onComplete}
      initial={{ opacity: 0 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: leaving ? 0.6 : 0.5 }}
      aria-label={`Level ${levelNumber}: ${levelName}`}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
        className="relative size-28 sm:size-36 mb-8"
      >
        {/* Expanding halo rings */}
        {[0, 0.6, 1.2].map(delay => (
          <motion.div
            key={delay}
            className="absolute inset-0 rounded-full border border-accent/40"
            initial={{ scale: 1, opacity: 0.7 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 2.4, delay, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <div className="absolute inset-0 rounded-full bg-moon/25 blur-3xl" />
        <MoonPhase phase={phase} className="relative" />
      </motion.div>

      <motion.p
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="text-xs sm:text-sm font-semibold tracking-[0.6em] pl-[0.6em] uppercase text-ink-muted"
      >
        {eyebrow ?? `Level ${levelNumber}`}
      </motion.p>
      <motion.h1
        initial={{ y: 16, opacity: 0, letterSpacing: '0.5em' }}
        animate={{ y: 0, opacity: 1, letterSpacing: '0.18em' }}
        transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
        className="font-display font-black text-5xl sm:text-7xl uppercase mt-3 bg-gradient-to-b from-white via-moon-soft to-moon bg-clip-text text-transparent"
      >
        {levelName}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1 }}
        className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] text-[11px] tracking-[0.25em] uppercase text-ink-faint"
      >
        Tap to skip
      </motion.p>
    </motion.main>
  );
}
