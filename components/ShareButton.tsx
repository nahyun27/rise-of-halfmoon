"use client";

import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { ShareIcon } from './ui/Icons';
import { shareText, ShareOutcome } from '../utils/share';

const LABELS: Record<ShareOutcome, string> = {
  shared: 'Shared',
  copied: 'Copied!',
  failed: "Couldn't share",
};

interface ShareButtonProps {
  text: string;
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'lg';
  className?: string;
}

export function ShareButton({ text, variant = 'primary', size = 'lg', className = '' }: ShareButtonProps) {
  const [status, setStatus] = useState<ShareOutcome | 'idle'>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const t = setTimeout(() => setStatus('idle'), 2200);
    return () => clearTimeout(t);
  }, [status]);

  return (
    <Button
      variant={variant}
      size={size}
      icon={<ShareIcon size={size === 'lg' ? 18 : 16} />}
      onClick={async () => setStatus(await shareText(text))}
      className={className}
      aria-live="polite"
    >
      {status === 'idle' ? (size === 'lg' ? 'Share Result' : 'Share') : LABELS[status]}
    </Button>
  );
}
