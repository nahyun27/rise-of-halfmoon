import React from 'react';
import { MoonCard as MoonCardType } from '../types/game';
import { OWNER_COLORS } from '../constants/theme';
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

  const owner = card.scoredBy;
  const ownerColor = owner ? OWNER_COLORS[owner] : null;

  return (
    <div
      className={`${className} relative rounded-[22%] flex items-center justify-center select-none transition-shadow duration-500`}
      style={{
        background: 'linear-gradient(160deg, #1f2257 0%, #13153a 55%, #0c0d2a 100%)',
        boxShadow: ownerColor
          ? `0 0 0 2.5px ${ownerColor}, 0 0 18px -2px ${ownerColor}, 0 8px 18px -6px rgba(0,0,0,0.7)`
          : '0 0 0 1px rgba(255,255,255,0.09), 0 8px 18px -6px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)',
      }}
    >
      <MoonPhase phase={card.phase} className="w-[74%] h-[74%]" />
      {owner && (
        <span
          className="absolute -top-1 -right-1 size-[18%] min-w-2 min-h-2 rounded-full border-2 border-night-900"
          style={{ background: ownerColor! }}
          aria-label={owner === 'player' ? 'Scored by you' : 'Scored by Half Moon'}
        />
      )}
    </div>
  );
}
