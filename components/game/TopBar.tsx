import React from 'react';
import { IconButton } from '../ui/Button';
import { PauseIcon, SoundOffIcon, SoundOnIcon } from '../ui/Icons';

interface TopBarProps {
  eyebrow: string;
  levelName: string;
  isMuted: boolean;
  onPause: () => void;
  onToggleMute: () => void;
}

export function TopBar({ eyebrow, levelName, isMuted, onPause, onToggleMute }: TopBarProps) {
  return (
    <header className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-3">
      <IconButton label="Pause" onClick={onPause}>
        <PauseIcon size={18} />
      </IconButton>
      <div className="text-center leading-tight">
        <p className="text-[10px] sm:text-[11px] font-semibold tracking-[0.35em] uppercase text-ink-faint">{eyebrow}</p>
        <h1 className="font-display text-lg sm:text-2xl font-bold tracking-[0.2em] uppercase text-ink">{levelName}</h1>
      </div>
      <IconButton label={isMuted ? 'Unmute music' : 'Mute music'} onClick={onToggleMute}>
        {isMuted ? <SoundOffIcon size={18} /> : <SoundOnIcon size={18} />}
      </IconButton>
    </header>
  );
}
