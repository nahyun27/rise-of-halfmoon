"use client";

import React, { useId } from 'react';
import { motion } from 'framer-motion';

interface ModalProps {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  // Tints the panel glow, e.g. a win/lose color
  glow?: string;
  size?: 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
}

export function Modal({ title, eyebrow, glow = 'rgba(139,123,255,0.35)', size = 'md', className = '', children }: ModalProps) {
  const titleId = useId();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-night-950/70 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className={`relative w-full ${size === 'lg' ? 'max-w-lg' : 'max-w-md'} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-3xl p-6 sm:p-8
          bg-gradient-to-b from-night-800/95 to-night-900/95 border border-white/10 ${className}`}
        style={{ boxShadow: `0 30px 80px -20px rgba(0,0,0,0.8), 0 0 60px -10px ${glow}, inset 0 1px 0 rgba(255,255,255,0.06)` }}
      >
        {(eyebrow || title) && (
          <div className="text-center mb-6">
            {eyebrow && <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-ink-faint mb-2">{eyebrow}</p>}
            {title && <h2 id={titleId} className="font-display text-3xl sm:text-4xl font-bold tracking-wider text-ink">{title}</h2>}
          </div>
        )}
        {children}
      </motion.div>
    </motion.div>
  );
}
