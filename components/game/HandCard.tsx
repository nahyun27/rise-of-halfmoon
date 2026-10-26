"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MoonCard as MoonCardType } from '../../types/game';
import { PHASE_NAMES } from '../../constants/theme';
import { MoonCard } from '../MoonCard';

interface HandCardProps {
  card: MoonCardType;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const drawCardVariants = {
  initial: { scale: 0.5, y: 80, rotateY: 180, opacity: 0 },
  animate: { scale: 1, y: 0, rotateY: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
  exit: { scale: [1, 1.15, 0.9], y: -200, opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

export function HandCard({ card, isSelected, disabled, onClick, onDragStart, onDragEnd }: HandCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div variants={drawCardVariants} initial="initial" animate="animate" exit="exit" className="relative">
      <button
        type="button"
        data-hand-card=""
        draggable={!disabled}
        disabled={disabled}
        aria-pressed={isSelected}
        aria-label={PHASE_NAMES[card.phase]}
        onClick={onClick}
        onDragStart={e => {
          setIsDragging(true);
          e.dataTransfer.setData('text/plain', card.id);
          e.dataTransfer.effectAllowed = 'move';
          onDragStart();
        }}
        onDragEnd={() => {
          setIsDragging(false);
          onDragEnd();
        }}
        className={`block rounded-[22%] transition-all duration-300 will-change-transform disabled:cursor-default
          ${!disabled ? 'cursor-grab active:cursor-grabbing' : 'opacity-60 saturate-50'}
          ${isDragging ? 'opacity-40 scale-105' : isSelected ? '-translate-y-3 scale-110' : !disabled ? 'hover:-translate-y-1.5 hover:scale-105' : ''}`}
        style={isSelected && !isDragging ? { boxShadow: '0 0 0 2.5px #8b7bff, 0 14px 30px -6px rgba(139,123,255,0.7)' } : undefined}
      >
        <MoonCard card={card} />
      </button>
    </motion.div>
  );
}
