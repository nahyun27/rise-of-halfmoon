import React from 'react';
import { MoonCard as MoonCardType } from '../types/game';
import { MoonPhase } from './MoonPhase';

interface MoonCardProps {
  card: Pick<MoonCardType, 'phase' | 'scoredBy'>;
  isFaceDown?: boolean;
  className?: string;
}

export function MoonCard({ card, isFaceDown = false, className = 'size-card' }: MoonCardProps) {
  if (isFaceDown) {
    return (
      <div
        className={`${className} relative rounded-[22%] overflow-hidden border border-opponent/25 select-none`}
        style={{
          background: 'linear-gradient(155deg, #2a1d4a 0%, #171433 60%, #110f28 100%)',
          boxShadow: '0 8px 18px -6px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
        aria-label="Face-down card"
      >
        <div className="absolute inset-[12%] rounded-[18%] border border-opponent/20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,122,144,0.18),transparent_65%)]" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 m-auto w-[44%] h-[44%] opacity-70" aria-hidden="true">
          <path d="M60 18a32 32 0 1 0 22 54A28 28 0 0 1 60 18z" fill="none" stroke="#ff9aab" strokeWidth="5" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  const surface = CARD_SURFACES[card.scoredBy ?? 'neutral'];

  return (
    <div
      className={`${className} relative rounded-[22%] flex items-center justify-center select-none`}
      style={{ background: surface.background, boxShadow: surface.shadow }}
    >
      <MoonPhase phase={card.phase} className="w-[74%] h-[74%]" />
      {card.scoredBy && <span className="sr-only">{card.scoredBy === 'player' ? 'Scored by you' : 'Scored by Half Moon'}</span>}
    </div>
  );
}

// Ownership is shown by the card surface, not a border, so it never competes with
// the colored rings that highlight pairs, full moons and cycles.
const CARD_SURFACES: Record<'neutral' | 'player' | 'opponent', { background: string, shadow: string }> = {
  neutral: {
    background: 'linear-gradient(160deg, #1f2257 0%, #13153a 55%, #0c0d2a 100%)',
    shadow: '0 0 0 1px rgba(255,255,255,0.09), 0 8px 18px -6px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
  },
  player: {
    background: 'linear-gradient(160deg, #8a96e6 0%, #6672c4 50%, #4d58a6 100%)',
    shadow: '0 0 0 1px rgba(255,255,255,0.25), 0 8px 20px -6px rgba(110,125,230,0.55), inset 0 1px 0 rgba(255,255,255,0.35)',
  },
  opponent: {
    background: 'linear-gradient(160deg, #1c0f1f 0%, #110916 55%, #09060d 100%)',
    shadow: '0 0 0 1px rgba(255,255,255,0.04), 0 8px 18px -6px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,140,160,0.08)',
  },
};
