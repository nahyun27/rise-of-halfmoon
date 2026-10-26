"use client";

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SCORE_COLORS } from '../../constants/theme';

interface AnnouncementsProps {
  chainLabels: { id: string, text: string }[];
  multipleChains: { count: number, points: number } | null;
  isCounting: boolean;
}

// Center-screen banners shown during scoring sequences
export function Announcements({ chainLabels, multipleChains, isCounting }: AnnouncementsProps) {
  const chain = SCORE_COLORS.CHAIN;
  const gold = SCORE_COLORS.FULL_MOON;

  return (
    <div className="fixed inset-0 z-[900] pointer-events-none flex items-center justify-center" aria-live="polite">
      <AnimatePresence>
        {chainLabels.map(label => (
          <motion.div
            key={label.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-[38%] px-5 py-2 rounded-full border font-semibold text-sm tracking-[0.25em] uppercase bg-night-900/90"
            style={{ color: chain, borderColor: `${chain}66`, boxShadow: `0 0 30px -6px ${chain}` }}
          >
            {label.text}
          </motion.div>
        ))}

        {multipleChains && (
          <motion.div
            key="multi"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="px-8 py-6 sm:px-12 sm:py-8 rounded-3xl border text-center bg-night-900/90 backdrop-blur-md"
            style={{ borderColor: `${gold}55`, boxShadow: `0 0 80px -10px ${gold}88` }}
          >
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-ink-muted">{multipleChains.count} cycles at once</p>
            <p className="font-display text-2xl sm:text-3xl font-bold tracking-wider mt-1" style={{ color: chain }}>Multiple Cycles</p>
            <p className="font-sans tracking-tight text-5xl sm:text-6xl font-black mt-3" style={{ color: gold, textShadow: `0 0 30px ${gold}` }}>+{multipleChains.points}</p>
          </motion.div>
        )}

        {isCounting && !multipleChains && (
          <motion.div
            key="counting"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-[18%] px-5 py-2 rounded-full border border-white/15 bg-night-900/85 text-ink text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase backdrop-blur-md"
          >
            Final count · +1 per card
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
