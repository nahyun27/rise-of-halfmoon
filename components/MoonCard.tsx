"use client";

import React from 'react';
import { MoonCard as MoonCardType } from '../types/game';

const MOON_EMOJIS = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

interface MoonCardProps {
  card: MoonCardType;
  onClick?: (card: MoonCardType) => void;
}

export const MoonCard: React.FC<MoonCardProps> = ({ card, onClick }) => {
  const getBorderColor = () => {
    switch (card.owner) {
      case 'player': return 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]';
      case 'opponent': return 'border-black shadow-[0_0_15px_rgba(0,0,0,0.8)]';
      default: return 'border-gray-500';
    }
  };

  return (
    <div
      onClick={() => onClick?.(card)}
      className={`
        group relative w-[80px] h-[120px] 
        rounded-xl 
        border-[3px]
        flex flex-col items-center justify-between
        pt-2 pb-3 px-2
        bg-gradient-to-b from-[#1a1a2e] to-[#16213e]
        cursor-pointer select-none
        transition-all duration-300 ease-out
        hover:scale-105 hover:-translate-y-1
        hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:brightness-110
        active:scale-95 active:translate-y-0
        ${getBorderColor()}
      `}
      style={{
        boxShadow: card.owner === 'player' ? '0 0 15px rgba(255,255,255,0.3)' :
          card.owner === 'opponent' ? '0 0 15px rgba(0,0,0,0.4)' : undefined
      }}
    >
      <div className="text-[12px] text-gray-400 font-bold self-start leading-none opacity-80">
        {card.phase}
      </div>

      <div className="text-4xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-transform duration-300 group-hover:scale-110 flex-grow flex items-center justify-center">
        {MOON_EMOJIS[card.phase]}
      </div>

      {/* Decorative bottom element */}
      <div className="h-1 w-6 rounded-full bg-white/10 group-hover:bg-white/30 transition-colors duration-300"></div>
    </div>
  );
};
