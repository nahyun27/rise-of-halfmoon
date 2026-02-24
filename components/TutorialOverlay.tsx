"use client";

import React, { useState, useEffect } from 'react';
import { MoonCard } from './MoonCard';
import { MoonCard as MoonCardType } from '../types/game';

interface TutorialOverlayProps {
  onClose: () => void;
}

// Helper to quickly create a mock card
const makeCard = (phase: number, owner: 'player' | 'opponent' = 'player'): MoonCardType => ({
  id: `mock-${Math.random()}`,
  phase,
  owner
});

const MiniNode = ({ card, highlight = false, connected = false }: { card: MoonCardType | null, highlight?: boolean, connected?: boolean }) => (
  <div className="relative flex items-center justify-center">
    {connected && (
      <div className="absolute top-1/2 left-[-40px] w-[40px] h-0.5 bg-indigo-500/50 -z-10"></div>
    )}
    <div className={`w-[60px] h-[90px] rounded-xl border-2 flex items-center justify-center transition-all duration-500
      ${card ? 'border-transparent' : highlight ? 'border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(74,222,128,0.4)] animate-pulse' : 'border-indigo-500/20 bg-black/40 border-dashed'}
    `}>
      {!card && <div className="w-2 h-2 rounded-full bg-indigo-500/50"></div>}
      {card && (
        <div className="absolute inset-0 max-w-[60px] max-h-[60px] rounded-xl overflow-hidden scale-[0.75] origin-top-left -ml-1.5 mt-2">
          <MoonCard card={card} />
        </div>
      )}
    </div>
  </div>
);

const DemoPlacement = () => (
  <div className="flex justify-center items-center gap-6 my-8">
    <div className="flex items-center gap-12 relative z-10 w-full justify-center">
      {/* Underlying SVG for connections */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.3))' }}>
        <line x1="30%" y1="50%" x2="50%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
        <line x1="50%" y1="50%" x2="70%" y2="50%" className="stroke-indigo-800/40 stroke-[2] stroke-dasharray-[4,4]" />
      </svg>
      <MiniNode card={makeCard(0)} />
      <MiniNode card={makeCard(4)} />
      <MiniNode card={null} highlight={true} />
    </div>
  </div>
);

const DemoPhasePair = () => (
  <div className="flex flex-col items-center my-8 gap-4 relative">
    <div className="flex justify-center items-center gap-12 w-full relative z-10">
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
        <line x1="38%" y1="50%" x2="62%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
      </svg>
      <MiniNode card={makeCard(1)} />
      <MiniNode card={makeCard(1)} />
    </div>
    <div className="animate-bounce text-2xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mt-2">
      +1 PAIR
    </div>
  </div>
);

const DemoFullMoon = () => (
  <div className="flex flex-col items-center my-8 gap-4 relative">
    <div className="flex justify-center items-center gap-12 w-full relative z-10">
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
        <line x1="38%" y1="50%" x2="62%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
      </svg>
      <MiniNode card={makeCard(1)} />
      <MiniNode card={makeCard(5)} />
    </div>
    <div className="animate-bounce text-2xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mt-2">
      +2 FULL MOON
    </div>
  </div>
);

const DemoChain = () => (
  <div className="flex flex-col items-center my-8 gap-4 relative">
    <div className="flex justify-center items-center gap-8 w-full relative z-10">
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
        <line x1="20%" y1="50%" x2="40%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
        <line x1="40%" y1="50%" x2="60%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
        <line x1="60%" y1="50%" x2="80%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
      </svg>
      <div className="relative"><MiniNode card={makeCard(0)} /><div className="absolute -inset-2 rounded-2xl border-4 border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
      <div className="relative"><MiniNode card={makeCard(1)} /><div className="absolute -inset-2 rounded-2xl border-4 border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
      <div className="relative"><MiniNode card={makeCard(2)} /><div className="absolute -inset-2 rounded-2xl border-4 border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
      <div className="relative"><MiniNode card={makeCard(3)} /><div className="absolute -inset-2 rounded-2xl border-4 border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
    </div>
    <div className="animate-bounce text-2xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mt-4">
      +4 CHAIN
    </div>
  </div>
);

const DemoSteal = () => (
  <div className="flex flex-col items-center my-8 gap-4 relative">
    <div className="flex justify-center items-center gap-8 w-full relative z-10">
      <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10">
        <line x1="20%" y1="50%" x2="40%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
        <line x1="40%" y1="50%" x2="60%" y2="50%" className="stroke-indigo-400 stroke-[3]" />
        <line x1="60%" y1="50%" x2="80%" y2="50%" className="stroke-red-500 stroke-[3]" />
      </svg>
      <div className="relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-red-400 font-bold w-[60px] text-center bg-red-950/80 px-1 py-0.5 rounded border border-red-500/30 whitespace-nowrap z-30">STOLEN</div>
        <MiniNode card={makeCard(0, 'opponent')} />
        <div className="absolute -inset-2 rounded-2xl border-4 border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"></div>
      </div>
      <div className="relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-red-400 font-bold w-[60px] text-center bg-red-950/80 px-1 py-0.5 rounded border border-red-500/30 whitespace-nowrap z-30">STOLEN</div>
        <MiniNode card={makeCard(1, 'opponent')} />
        <div className="absolute -inset-2 rounded-2xl border-4 border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"></div>
      </div>
      <div className="relative">
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-red-400 font-bold w-[60px] text-center bg-red-950/80 px-1 py-0.5 rounded border border-red-500/30 whitespace-nowrap z-30">STOLEN</div>
        <MiniNode card={makeCard(2, 'opponent')} />
        <div className="absolute -inset-2 rounded-2xl border-4 border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"></div>
      </div>
      <div className="relative">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] text-red-300 font-bold w-[70px] text-center bg-red-900/90 px-1 py-0.5 rounded border border-red-400/50 whitespace-nowrap z-30 mb-1 leading-tight">OPPONENT<br />MOVED</div>
        <MiniNode card={makeCard(3, 'opponent')} />
        <div className="absolute -inset-2 rounded-2xl border-4 border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"></div>
      </div>
    </div>
  </div>
);

const DemoWin = () => (
  <div className="flex flex-col items-center justify-center my-6 gap-6 relative">
    <div className="flex items-center gap-12 font-mono text-xl">
      <div className="flex flex-col items-center opacity-50 scale-90">
        <span className="text-red-400 font-bold mb-2 tracking-widest text-sm">OPPONENT</span>
        <span className="text-3xl">12 PTS</span>
        <span className="text-xl mt-2 tracking-widest drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">💔💔💔</span>
      </div>
      <div className="text-4xl font-black text-white/20">VS</div>
      <div className="flex flex-col items-center drop-shadow-[0_0_15px_rgba(165,180,252,0.8)] scale-110">
        <span className="text-indigo-300 font-bold mb-2 tracking-widest text-sm text-yellow-300 animate-pulse">! YOU WIN !</span>
        <span className="text-4xl text-yellow-300 font-black">18 PTS</span>
        <span className="text-2xl mt-2 tracking-widest drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">❤️❤️❤️</span>
      </div>
    </div>
  </div>
);


const tutorialSteps = [
  {
    title: "How to Play",
    content: (
      <>
        <p className="text-lg text-indigo-100/80 mb-4 leading-relaxed">
          Welcome to <span className="text-indigo-300 font-bold">Lunar Duel</span>.
        </p>
        <p className="text-lg text-indigo-100/80 leading-relaxed mb-4">
          The goal is to score more points than your opponent by placing moon phase cards strategically on the star map.
        </p>
        <p className="text-lg text-indigo-100/80 leading-relaxed">
          The first card can be placed anywhere. Subsequent cards <strong className="text-indigo-200">must connect</strong> to a previously placed card via the dotted lines.
        </p>
      </>
    ),
    visual: <DemoPlacement />
  },
  {
    title: "Phase Pair = 1 Point",
    content: (
      <>
        <p className="text-lg text-indigo-100/80 leading-relaxed mb-4">
          Match identical moon phases directly connected to each other to score exactly <strong className="text-yellow-300">1 point</strong>.
        </p>
        <p className="text-lg text-indigo-100/80 leading-relaxed">
          E.g., Waxing Crescent + Waxing Crescent = 1 Point!
        </p>
      </>
    ),
    visual: <DemoPhasePair />
  },
  {
    title: "Full Moon Pair = 2 Points",
    content: (
      <>
        <p className="text-lg text-indigo-100/80 leading-relaxed mb-4">
          Place <strong className="text-yellow-300">opposite phases</strong> adjacent to each other to form a Full Moon and score <strong className="text-yellow-300">2 points</strong>!
        </p>
        <ul className="text-md text-indigo-200/70 text-left w-3/4 mx-auto list-disc pl-6 space-y-2">
          <li>New Moon (0) + Full Moon (4)</li>
          <li>Waxing Crescent (1) + Waning Gibbous (5)</li>
          <li>First Quarter (2) + Last Quarter (6)</li>
          <li>Waxing Gibbous (3) + Waning Crescent (7)</li>
        </ul>
      </>
    ),
    visual: <DemoFullMoon />
  },
  {
    title: "Lunar Cycle = N Points",
    content: (
      <>
        <p className="text-lg text-indigo-100/80 leading-relaxed mb-4">
          The most powerful move. Connect 3 or more phases in chronological order (<strong className="text-yellow-300">0 → 1 → 2 ...</strong> or <strong className="text-yellow-300">7 → 0 → 1 ...</strong>) across the graph lines.
        </p>
        <p className="text-lg text-indigo-100/80 leading-relaxed">
          You will score points equal to the <strong className="text-yellow-300">entire length of the chain</strong> you just completed. (e.g., 4 chain = 4 points).
        </p>
      </>
    ),
    visual: <DemoChain />
  },
  {
    title: "⚠️ Chain Steal",
    content: (
      <>
        <p className="text-lg text-red-200/90 leading-relaxed mb-4">
          Be careful building long chains! If your opponent places a card that <strong className="text-red-400">extends your existing chain</strong>, they will <strong className="text-red-400 font-bold uppercase">STEAL</strong> ownership of the entire chain!
        </p>
        <p className="text-lg text-red-200/90 leading-relaxed">
          All stolen cards become theirs, and they instantly get the points for the full new length! Long chains are high risk, high reward.
        </p>
      </>
    ),
    visual: <DemoSteal />
  },
  {
    title: "Win the Round!",
    content: (
      <>
        <p className="text-lg text-indigo-100/80 leading-relaxed mb-4">
          The game ends when the board is completely full or neither player has cards left.
        </p>
        <ul className="text-md text-indigo-200/70 text-left w-3/4 mx-auto list-disc pl-6 space-y-2 mb-4">
          <li><strong className="text-indigo-300">Final Score:</strong> The player with the most accumulated points wins!</li>
          <li><strong className="text-yellow-300">Bonus:</strong> At the end of the game, you gain +1 bonus point for every card you still control on the board!</li>
        </ul>
        <p className="text-lg text-indigo-100/80 leading-relaxed italic">
          Good luck, and may the moon guide your path.
        </p>
      </>
    ),
    visual: <DemoWin />
  }
];

export function TutorialOverlay({ onClose }: TutorialOverlayProps) {
  const [step, setStep] = useState(0);
  const currentStep = tutorialSteps[step];

  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        if (step < tutorialSteps.length - 1) {
          setSlideDirection('left');
          setTimeout(() => {
            setStep(prev => prev + 1);
            setSlideDirection(null);
          }, 150); // slight delay for animation
        }
      } else if (e.key === 'ArrowLeft') {
        if (step > 0) {
          setSlideDirection('right');
          setTimeout(() => {
            setStep(prev => prev - 1);
            setSlideDirection(null);
          }, 150);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onClose]);

  const handleNext = () => {
    if (step < tutorialSteps.length - 1) {
      setSlideDirection('left');
      setTimeout(() => {
        setStep(prev => prev + 1);
        setSlideDirection(null);
      }, 150);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setSlideDirection('right');
      setTimeout(() => {
        setStep(prev => prev - 1);
        setSlideDirection(null);
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">

      {/* Background celestial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-900/20 blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-2xl bg-[#0a0a1a] border border-indigo-500/30 rounded-3xl p-10 shadow-[0_0_100px_rgba(30,27,75,0.9)] overflow-hidden flex flex-col min-h-[600px]">

        {/* Dynamic content rendering with sliding transition classes */}
        <div className={`flex-grow flex flex-col justify-between transition-all duration-300 transform 
           ${slideDirection === 'left' ? '-translate-x-full opacity-0' : slideDirection === 'right' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        `}>
          <div>
            <h2 className={`text-4xl font-black mb-8 tracking-widest uppercase flex items-center gap-4 ${step === 4 ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]' : 'text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.8)]'}`}>
              {step === 0 && <span className="text-yellow-200">🌙</span>}
              {currentStep.title}
            </h2>

            <div className="w-full min-h-[220px] flex items-center justify-center bg-indigo-950/20 rounded-2xl border border-indigo-500/10 shadow-inner mb-8">
              {currentStep.visual}
            </div>

            <div className="text-center px-4">
              {currentStep.content}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 pt-6 border-t border-indigo-500/20 flex flex-col gap-6">
          {/* Progress Dots */}
          <div className="flex justify-center gap-3">
            {tutorialSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === step ? 'bg-indigo-300 scale-125 shadow-[0_0_10px_rgba(165,180,252,0.8)]' : 'bg-indigo-900/60 hover:bg-indigo-700/80 cursor-pointer'}`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center w-full">
            <button
              onClick={onClose}
              className="text-indigo-400/60 hover:text-indigo-300 font-bold tracking-widest text-sm transition-colors uppercase px-4 py-2"
            >
              Skip Tutorial
            </button>

            <div className="flex gap-4">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className={`px-6 py-3 font-bold tracking-widest uppercase rounded-xl border border-indigo-500/30 transition-all shadow-lg
                     ${step === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-900/40 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] text-indigo-200'}
                   `}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className={`px-6 py-3 font-bold tracking-widest uppercase rounded-xl transition-all shadow-lg
                     ${step === tutorialSteps.length - 1
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.5)] border border-indigo-300 border-2'
                    : 'bg-indigo-900/60 border border-indigo-500/50 hover:bg-indigo-800/80 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] text-white'}
                   `}
              >
                {step === tutorialSteps.length - 1 ? 'Start Game' : 'Next →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
