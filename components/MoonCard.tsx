"use client";

import React from 'react';
import { MoonCard as MoonCardType } from '../types/game';

const MOON_EMOJIS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

interface MoonCardProps {
  card: MoonCardType;
  onClick?: (card: MoonCardType) => void;
  isFaceDown?: boolean;
}

export const MoonCard: React.FC<MoonCardProps> = ({ card, onClick, isFaceDown = false }) => {
  const getBorderColor = () => {
    if (!card.scoredBy) return 'border-transparent shadow-none';

    switch (card.scoredBy) {
      case 'player': return 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]';
      case 'opponent': return 'border-black shadow-[0_0_15px_rgba(0,0,0,0.8)]';
      default: return 'border-transparent shadow-none';
    }
  };

  return (
    <div
      onClick={() => onClick?.(card)}
      className={`
        group relative w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px]
        rounded-[8px]
        border-[3px]
        flex items-center justify-center
        p-2
        bg-gradient-to-b from-[#1a1a2e] to-[#16213e]
        cursor-pointer select-none
        transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-1
        hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:brightness-110
        active:scale-95 active:translate-y-0
        ${getBorderColor()}
      `}
      style={{
        boxShadow: card.scoredBy === 'player' ? '0 0 15px rgba(255,255,255,0.3)' :
          card.scoredBy === 'opponent' ? '0 0 15px rgba(0,0,0,0.4)' : undefined
      }}
    >
      {isFaceDown ? (
        <div className="flex-grow flex items-center justify-center opacity-40 text-4xl drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
          🌙
        </div>
      ) : (
        <div className="text-[20px] sm:text-[28px] md:text-[38px] filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-transform duration-300 group-hover:scale-110 flex-grow flex items-center justify-center">
          {MOON_EMOJIS[card.phase]}
        </div>
      )}
    </div>
  );
};
