import React from 'react';
import { LockIcon } from './ui/Icons';
import { StarRating } from './ui/StarRating';
import { Records } from '../utils/records';

interface LevelPathProps {
  levels: { levelNumber: number, name: string }[];
  records: Records;
  unlocked: number; // highest playable level number
  currentLevel: number;
  onSelect: (index: number) => void;
}

// Row of level nodes; unlocked ones can be replayed to chase three stars
export function LevelPath({ levels, records, unlocked, currentLevel, onSelect }: LevelPathProps) {
  return (
    <nav aria-label="Levels" className="relative w-full">
      <div className="absolute left-[10%] right-[10%] top-[22px] h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <ol className="relative grid gap-1" style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(0, 1fr))` }}>
        {levels.map((level, index) => {
          const isLocked = level.levelNumber > unlocked;
          const isCurrent = level.levelNumber === currentLevel;
          const stars = records.levels[level.levelNumber]?.stars ?? 0;

          return (
            <li key={level.levelNumber} className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                disabled={isLocked}
                onClick={() => onSelect(index)}
                aria-label={isLocked ? `Level ${level.levelNumber}, locked` : `Play level ${level.levelNumber}: ${level.name}, ${stars} stars`}
                aria-current={isCurrent ? 'step' : undefined}
                className={`relative size-11 rounded-full flex items-center justify-center font-sans font-bold text-sm tabular-nums transition-all duration-200
                  ${isLocked
                    ? 'bg-night-900 border border-white/[0.06] text-ink-faint/60 cursor-not-allowed'
                    : `cursor-pointer bg-night-800 border hover:scale-110 active:scale-95 ${stars === 3 ? 'border-moon/70 text-moon' : 'border-white/15 text-ink hover:border-white/30'}`}`}
                style={isCurrent ? { boxShadow: '0 0 0 2px #8b7bff, 0 0 18px -2px rgba(139,123,255,0.8)' } : stars === 3 ? { boxShadow: '0 0 14px -4px rgba(246,210,122,0.8)' } : undefined}
              >
                {isLocked ? <LockIcon size={14} /> : level.levelNumber}
              </button>
              <span className={`text-[9px] sm:text-[10px] font-semibold tracking-[0.12em] uppercase truncate max-w-full ${isLocked ? 'text-ink-faint/50' : 'text-ink-faint'}`}>
                {level.name}
              </span>
              {!isLocked && <StarRating stars={stars} size={10} />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
