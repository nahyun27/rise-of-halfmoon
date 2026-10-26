"use client";

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { BookIcon, ExitIcon, GithubIcon, PlayIcon } from '../ui/Icons';

interface PauseMenuProps {
  levelLabel: string;
  playerScore: number;
  opponentScore: number;
  onResume: () => void;
  onOpenTutorial: () => void;
  onExit: () => void;
}

export function PauseMenu({ levelLabel, playerScore, opponentScore, onResume, onOpenTutorial, onExit }: PauseMenuProps) {
  const [confirmingExit, setConfirmingExit] = useState(false);

  if (confirmingExit) {
    return (
      <Modal eyebrow="Leave game" title="Are you sure?" glow="rgba(255,122,144,0.3)">
        <p className="text-center text-sm text-ink-muted mb-6">Your progress in this level will be lost.</p>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setConfirmingExit(false)} autoFocus>Stay</Button>
          <Button variant="danger" onClick={onExit}>Leave</Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal eyebrow={levelLabel} title="Paused">
      <div className="flex justify-center items-baseline gap-4 mb-6 font-sans tracking-tight tabular-nums">
        <span className="text-2xl font-bold text-player">{playerScore}</span>
        <span className="text-xs tracking-[0.3em] text-ink-faint font-sans font-semibold">VS</span>
        <span className="text-2xl font-bold text-opponent">{opponentScore}</span>
      </div>

      <div className="flex flex-col gap-3">
        <Button variant="primary" size="lg" icon={<PlayIcon size={18} />} onClick={onResume} autoFocus>Continue</Button>
        <Button size="lg" icon={<BookIcon size={18} />} onClick={onOpenTutorial}>How to Play</Button>
        <Button variant="danger" size="lg" icon={<ExitIcon size={18} />} onClick={() => setConfirmingExit(true)}>Exit to Menu</Button>
      </div>

      <div className="mt-6 pt-5 border-t border-white/[0.07] flex justify-center">
        <a
          href="https://github.com/nahyun27/rise-of-halfmoon"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-ink-faint hover:text-ink transition-colors px-3 py-1.5 rounded-lg"
        >
          <GithubIcon size={14} />
          Source code · Star or report a bug
        </a>
      </div>
    </Modal>
  );
}
