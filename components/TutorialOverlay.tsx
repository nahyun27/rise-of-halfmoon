"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonCard } from './MoonCard';
import { MoonPhase } from './MoonPhase';
import { Button, IconButton } from './ui/Button';
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from './ui/Icons';
import { OWNER_COLORS, SCORE_COLORS } from '../constants/theme';

interface TutorialOverlayProps {
  onClose: () => void;
}

type Owner = 'player' | 'opponent';

interface DemoCard {
  phase: number;
  scoredBy?: Owner;
  tag?: string;
  empty?: boolean;
  focus?: boolean;
}

// Inline moon glyph for use inside sentences
const Moon = ({ phase }: { phase: number }) => (
  <MoonPhase phase={phase} glow={false} size="1.15em" className="inline-block align-[-0.2em] mx-0.5" />
);

function CardRow({ cards, line, decorator }: { cards: DemoCard[], line?: string, decorator?: 'pair' | 'fullmoon' }) {
  return (
    <div className="relative flex items-center gap-5 sm:gap-8 [--tc:48px] sm:[--tc:64px]">
      {line && (
        <div
          className="absolute top-1/2 h-[3px] -translate-y-1/2 left-[calc(var(--tc)/2)] right-[calc(var(--tc)/2)] rounded-full"
          style={{ background: line, boxShadow: `0 0 12px ${line}` }}
        />
      )}
      {decorator === 'pair' && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
          {[0, 1].map(i => <span key={i} className="size-2.5 rounded-full bg-night-900 border-2" style={{ borderColor: SCORE_COLORS.PAIR }} />)}
        </div>
      )}
      {decorator === 'fullmoon' && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 size-3.5 rounded-full z-10" style={{ background: SCORE_COLORS.FULL_MOON, boxShadow: `0 0 10px ${SCORE_COLORS.FULL_MOON}` }} />
      )}
      {cards.map((c, i) => (
        <div key={i} className="relative">
          {c.tag && (
            <span
              className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold tracking-[0.15em] uppercase border bg-night-900"
              style={{ color: OWNER_COLORS.opponent, borderColor: `${OWNER_COLORS.opponent}55` }}
            >
              {c.tag}
            </span>
          )}
          {c.empty ? (
            <div className="size-[var(--tc)] rounded-[22%] border-[1.5px] border-dashed border-white/20 bg-night-900/80 flex items-center justify-center">
              <span className="size-1.5 rounded-full bg-white/25" />
            </div>
          ) : (
            <div className={`rounded-[22%] ${c.focus ? 'ring-2 ring-accent ring-offset-4 ring-offset-night-900 animate-pulse-soft' : ''}`}>
              <MoonCard card={c} className="size-[var(--tc)]" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ScoreTag({ text, color }: { text: string, color: string }) {
  return (
    <span className="font-sans tracking-tight text-xl sm:text-2xl font-black tracking-wider" style={{ color, textShadow: `0 0 18px ${color}88` }}>
      {text}
    </span>
  );
}

const Caption = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-ink-faint">{children}</span>
);

const DemoPlacement = () => (
  <div className="flex items-center gap-4 sm:gap-8">
    <div className="flex flex-col items-center gap-3">
      <CardRow cards={[{ phase: 1, focus: true }]} />
      <Caption>Hand</Caption>
    </div>
    <ArrowRightIcon className="text-accent shrink-0" size={28} />
    <div className="flex flex-col items-center gap-3">
      <CardRow cards={[{ phase: 1 }, { phase: 0, empty: true }]} line="rgba(140,145,255,0.35)" />
      <Caption>Star map</Caption>
    </div>
  </div>
);

const DemoPair = () => (
  <div className="flex flex-col items-center gap-5">
    <CardRow cards={[{ phase: 1, scoredBy: 'player' }, { phase: 1, scoredBy: 'player' }]} line={SCORE_COLORS.PAIR} decorator="pair" />
    <ScoreTag text="+1 Pair" color={SCORE_COLORS.PAIR} />
  </div>
);

const DemoFullMoon = () => (
  <div className="flex flex-col items-center gap-5">
    <CardRow cards={[{ phase: 1, scoredBy: 'player' }, { phase: 5, scoredBy: 'player' }]} line={SCORE_COLORS.FULL_MOON} decorator="fullmoon" />
    <ScoreTag text="+2 Full Moon" color={SCORE_COLORS.FULL_MOON} />
    <div className="flex flex-wrap justify-center gap-2 text-lg">
      {[[0, 4], [1, 5], [2, 6], [3, 7]].map(([a, b]) => (
        <span key={a} className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.07]"><Moon phase={a} /><Moon phase={b} /></span>
      ))}
    </div>
  </div>
);

const DemoChain = () => (
  <div className="flex flex-col items-center gap-5">
    <CardRow cards={[0, 1, 2, 3].map(phase => ({ phase, scoredBy: 'player' as const }))} line={SCORE_COLORS.CHAIN} />
    <ScoreTag text="+4 Lunar Cycle" color={SCORE_COLORS.CHAIN} />
  </div>
);

const DemoSteal = () => (
  <div className="flex flex-col items-center gap-4">
    <div className="flex flex-col items-center gap-2">
      <Caption>Your cycle</Caption>
      <CardRow cards={[{ phase: 0, scoredBy: 'player' }, { phase: 1, scoredBy: 'player' }, { phase: 2, scoredBy: 'player' }, { phase: 3, empty: true }]} line={SCORE_COLORS.CHAIN} />
    </div>
    <ArrowRightIcon className="rotate-90 text-opponent" size={22} />
    <div className="flex flex-col items-center gap-2 pt-5">
      <CardRow
        cards={[{ phase: 0, scoredBy: 'opponent', tag: 'Stolen' }, { phase: 1, scoredBy: 'opponent', tag: 'Stolen' }, { phase: 2, scoredBy: 'opponent', tag: 'Stolen' }, { phase: 3, scoredBy: 'opponent', tag: 'Played' }]}
        line={OWNER_COLORS.opponent}
      />
    </div>
  </div>
);

const DemoWin = () => (
  <div className="flex items-center gap-4 sm:gap-8">
    {[{ label: 'Half Moon', score: 12, color: OWNER_COLORS.opponent, win: false }, { label: 'You', score: 18, color: OWNER_COLORS.player, win: true }].map(s => (
      <div
        key={s.label}
        className={`relative rounded-2xl border px-6 py-4 sm:px-8 sm:py-5 flex flex-col items-center ${s.win ? 'scale-110' : 'opacity-60'}`}
        style={{ borderColor: s.win ? `${s.color}66` : 'rgba(255,255,255,0.08)', background: s.win ? `${s.color}12` : 'transparent' }}
      >
        {s.win && <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-moon text-night-950 text-[10px] font-bold tracking-[0.2em]">WINNER</span>}
        <span className="text-[10px] font-semibold tracking-[0.25em] uppercase" style={{ color: s.color }}>{s.label}</span>
        <span className="font-sans tracking-tight text-3xl sm:text-4xl font-black mt-1">{s.score}</span>
      </div>
    ))}
  </div>
);

const Strong = ({ children, color }: { children: React.ReactNode, color?: string }) => (
  <strong className="font-semibold text-ink" style={color ? { color } : undefined}>{children}</strong>
);

const tutorialSteps: { eyebrow: string, title: string, visual: React.ReactNode, body: React.ReactNode, danger?: boolean }[] = [
  {
    eyebrow: 'Welcome',
    title: 'How to Play',
    visual: <DemoPlacement />,
    body: (
      <>
        <p>Score more points than the <Strong color={OWNER_COLORS.opponent}>Half Moon</Strong> by placing moon phase cards on the star map.</p>
        <p>Tap a card in your hand, then tap <Strong>any empty spot</Strong>. You can also drag it there.</p>
      </>
    ),
  },
  {
    eyebrow: 'Scoring · 1 point',
    title: 'Phase Pair',
    visual: <DemoPair />,
    body: <p>Place a card next to a connected card with the <Strong color={SCORE_COLORS.PAIR}>same phase</Strong>, like <Moon phase={1} /> + <Moon phase={1} />.</p>,
  },
  {
    eyebrow: 'Scoring · 2 points',
    title: 'Full Moon Pair',
    visual: <DemoFullMoon />,
    body: <p>Connect two <Strong color={SCORE_COLORS.FULL_MOON}>opposite phases</Strong>. Together they make a full moon.</p>,
  },
  {
    eyebrow: 'Scoring · N points',
    title: 'Lunar Cycle',
    visual: <DemoChain />,
    body: (
      <>
        <p>Link <Strong color={SCORE_COLORS.CHAIN}>3 or more phases in order</Strong>, like <Moon phase={0} /><Moon phase={1} /><Moon phase={2} /> or <Moon phase={7} /><Moon phase={0} /><Moon phase={1} />.</p>
        <p>You score one point for every card in the cycle.</p>
      </>
    ),
  },
  {
    eyebrow: 'Watch out',
    title: 'Cycle Steal',
    danger: true,
    visual: <DemoSteal />,
    body: <p>If your opponent <Strong color={OWNER_COLORS.opponent}>extends your cycle</Strong>, they steal every card in it and score the full new length. Long cycles are high risk.</p>,
  },
  {
    eyebrow: 'Endgame',
    title: 'Win the Round',
    visual: <DemoWin />,
    body: (
      <>
        <p>The round ends when the board is full. Each card you scored adds <Strong>+1 bonus</Strong>.</p>
        <p className="italic text-ink-muted">May the moon guide your path.</p>
      </>
    ),
  },
];

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [[step, direction], setStepState] = useState<[number, number]>([0, 0]);
  const current = tutorialSteps[step];
  const isLast = step === tutorialSteps.length - 1;

  const goTo = useCallback((next: number) => {
    if (next < 0 || next >= tutorialSteps.length) return;
    setStepState(([prev]) => [next, next > prev ? 1 : -1]);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goTo(step + 1);
      else if (e.key === 'ArrowLeft') goTo(step - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onClose, goTo]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6 bg-night-950/75 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="How to play"
    >
      <motion.div
        initial={{ y: 16, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        className="relative w-full max-w-2xl max-h-[calc(100dvh-1.5rem)] flex flex-col rounded-3xl overflow-hidden bg-gradient-to-b from-night-800/95 to-night-900/95 border border-white/10"
        style={{ boxShadow: '0 30px 80px -20px rgba(0,0,0,0.8), 0 0 60px -10px rgba(139,123,255,0.35)' }}
      >
        <IconButton label="Close tutorial" onClick={onClose} className="absolute top-3 right-3 z-10 size-9">
          <CloseIcon size={16} />
        </IconButton>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="flex flex-col"
            >
              <div className="text-center pt-8 px-6">
                <p className={`text-[11px] font-semibold tracking-[0.3em] uppercase ${current.danger ? 'text-opponent' : 'text-ink-faint'}`}>{current.eyebrow}</p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-wider mt-1 text-ink">{current.title}</h2>
              </div>

              <div className="mx-4 sm:mx-8 mt-6 rounded-2xl border border-white/[0.06] bg-night-950/50 min-h-[220px] sm:min-h-[260px] flex items-center justify-center px-3 py-8">
                {current.visual}
              </div>

              <div className="px-6 sm:px-12 py-6 text-center text-sm sm:text-base text-ink-muted leading-relaxed space-y-2 min-h-[120px]">
                {current.body}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="shrink-0 border-t border-white/[0.07] px-4 sm:px-8 py-4 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={onClose} className="px-3">Skip</Button>

          <div className="flex gap-1.5" role="tablist" aria-label="Tutorial steps">
            {tutorialSteps.map((s, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === step}
                aria-label={`Step ${i + 1}: ${s.title}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === step ? 'w-6 bg-accent' : 'w-1.5 bg-white/20 hover:bg-white/40'}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <IconButton label="Previous step" onClick={() => goTo(step - 1)} disabled={step === 0} className="size-11 disabled:opacity-30 disabled:pointer-events-none">
              <ArrowLeftIcon size={18} />
            </IconButton>
            {isLast ? (
              <Button variant="primary" onClick={onClose} autoFocus>Let&apos;s go</Button>
            ) : (
              <IconButton label="Next step" onClick={() => goTo(step + 1)} className="size-11 text-ink bg-accent/20 border-accent/40 hover:bg-accent/30">
                <ArrowRightIcon size={18} />
              </IconButton>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
