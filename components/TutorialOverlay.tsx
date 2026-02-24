"use client";

import React, { useState, useEffect } from 'react';

interface TutorialOverlayProps {
  onClose: () => void;
}

function TutorialCard({ phase, owner = 'player', isFaceDown = false }: { phase: number, owner?: 'player' | 'opponent', isFaceDown?: boolean }) {
  const emojis = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

  return (
    <div
      className="tutorial-card transition-transform hover:-translate-y-2 relative w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px] text-[24px] sm:text-[32px] md:text-[40px]"
      style={{
        borderRadius: '8px',
        border: `3px solid ${owner === 'player' ? '#fff' : '#000'}`,
        background: isFaceDown ? 'linear-gradient(135deg, #1a1a3e, #2d2d5f)' : 'linear-gradient(135deg, #1a1a2e, #16213e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: owner === 'player' ? '0 0 15px rgba(255,255,255,0.3)' : '0 0 15px rgba(0,0,0,0.5)',
      }}
    >
      <span style={{ opacity: isFaceDown ? 0.3 : 1, filter: isFaceDown ? 'none' : 'drop-shadow(0 0 8px rgba(255,255,255,0.5))' }}>
        {isFaceDown ? '🌙' : emojis[phase]}
      </span>
      {!isFaceDown && (
        <div className="absolute bottom-2 h-1 w-6 rounded-full bg-white/10 transition-colors duration-300"></div>
      )}
    </div>
  );
}

const EmptySlot = ({ highlight = false }: { highlight?: boolean }) => (
  <div className={`w-[60px] h-[60px] sm:w-[70px] sm:h-[70px] md:w-[80px] md:h-[80px]
    rounded-[8px] border-2 border-dashed ${highlight ? 'border-indigo-400 bg-indigo-900/50' : 'border-indigo-500/30 bg-indigo-950/30'}
    flex items-center justify-center transition-all duration-200`}>
    <div className="w-2 h-2 rounded-full bg-indigo-500/50"></div>
  </div>
);

const DemoPlacement = () => (
  <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:gap-6 my-4 sm:my-8 relative z-10 w-full">
    <div className="flex items-center gap-4 sm:gap-8 md:gap-12">
      <div className="flex flex-col items-center gap-2 sm:gap-3">
        <TutorialCard phase={1} />
        <span className="text-xs sm:text-sm md:text-base font-mono font-bold tracking-widest text-indigo-300">HAND</span>
      </div>
      <div className="text-2xl sm:text-3xl md:text-4xl text-indigo-400 font-black px-2 sm:px-4">→</div>
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6 relative">
        <div className="absolute top-1/2 left-[20px] sm:left-[30px] md:left-[40px] right-[20px] sm:right-[30px] md:right-[40px] h-0.5 bg-indigo-500/50 -z-10" />
        <div className="flex flex-col items-center gap-2 sm:gap-3 relative">
          <TutorialCard phase={1} />
          <span className="text-xs sm:text-sm md:text-base font-mono font-bold tracking-widest text-indigo-300">BOARD</span>
          <div className="absolute -inset-2 sm:-inset-3 rounded-xl border-2 border-green-400 bg-green-500/10 shadow-[0_0_20px_rgba(74,222,128,0.4)] animate-pulse -z-10"></div>
        </div>
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <EmptySlot />
          <span className="text-sm font-mono font-bold tracking-widest opacity-0">EMPTY</span>
        </div>
      </div>
    </div>
  </div>
);

const DemoPhasePair = () => (
  <div className="flex flex-col items-center my-4 sm:my-8 gap-4 sm:gap-6 z-10 w-full">
    <div className="flex items-center relative gap-8 sm:gap-12 md:gap-16">
      <div className="absolute top-1/2 left-[20px] right-[20px] h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent -translate-y-1/2 -z-10" />
      <TutorialCard phase={1} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-between h-8 sm:h-10 z-10 pointer-events-none">
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#111122] border-[2px] sm:border-[2.5px] border-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
        <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-[#111122] border-[2px] sm:border-[2.5px] border-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
      </div>
      <TutorialCard phase={1} />
    </div>
    <div className="animate-bounce text-xl sm:text-2xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mt-2 uppercase tracking-widest">
      +1 Pair!
    </div>
  </div>
);

const DemoFullMoon = () => (
  <div className="flex flex-col items-center my-4 sm:my-8 gap-4 sm:gap-6 z-10 w-full">
    <div className="flex items-center relative gap-8 sm:gap-12 md:gap-16">
      <div className="absolute top-1/2 left-[20px] right-[20px] h-[3px] bg-gradient-to-r from-transparent via-yellow-400 to-transparent -translate-y-1/2 -z-10" />
      <TutorialCard phase={1} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-yellow-400 border-[3px] border-yellow-400 z-10 drop-shadow-[0_0_8px_rgba(250,204,21,1)]"></div>
      <TutorialCard phase={5} />
    </div>
    <div className="animate-bounce text-xl sm:text-2xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mt-2 uppercase tracking-widest">
      +2 Full Moon!
    </div>
    <div className="text-xs sm:text-sm md:text-base font-mono text-indigo-200/60 tracking-widest bg-indigo-950/40 px-3 sm:px-6 py-1 sm:py-2 rounded-xl mt-2 border border-indigo-500/20">
      🌑 🌕 | 🌒 🌖 | 🌓 🌗 | 🌔 🌘
    </div>
  </div>
);

const DemoChain = () => (
  <div className="flex flex-col items-center my-4 sm:my-8 gap-3 sm:gap-4 md:gap-6 z-10 w-full">
    <div className="flex items-center relative gap-4 sm:gap-6 md:gap-8">
      <div className="absolute top-1/2 left-[15px] sm:left-[30px] md:left-[40px] right-[15px] sm:right-[30px] md:right-[40px] h-[3px] bg-purple-500 -translate-y-1/2 -z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
      <div className="relative"><TutorialCard phase={0} /><div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
      <div className="relative"><TutorialCard phase={1} /><div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
      <div className="relative"><TutorialCard phase={2} /><div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
      <div className="relative"><TutorialCard phase={3} /><div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-yellow-300 pointer-events-none shadow-[0_0_20px_rgba(253,224,71,0.6)] z-20"></div></div>
    </div>
    <div className="animate-bounce text-xl sm:text-2xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mt-2 sm:mt-4 uppercase tracking-widest">
      +4 Chain!
    </div>
  </div>
);

const DemoSteal = () => (
  <div className="flex flex-col items-center my-4 sm:my-8 gap-4 sm:gap-8 z-10 w-full">
    <div className="flex items-center relative gap-4 sm:gap-6 md:gap-8">
      <div className="absolute top-1/2 left-[15px] sm:left-[30px] md:left-[40px] right-[40px] sm:right-[70px] md:right-[100px] h-[3px] bg-purple-500 -translate-y-1/2 -z-10 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
      <div className="absolute top-1/2 left-[180px] sm:left-[210px] md:left-[250px] right-[15px] sm:right-[30px] md:right-[40px] h-[3px] bg-red-500 -translate-y-1/2 -z-10 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />

      <div className="relative">
        <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-red-400 font-bold tracking-widest w-[60px] sm:w-[80px] text-center bg-red-950/90 px-1 py-0.5 sm:px-2 sm:py-1 rounded border border-red-500/50 whitespace-nowrap z-30">STOLEN</div>
        <TutorialCard phase={0} owner="opponent" />
        <div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"></div>
      </div>
      <div className="relative">
        <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-red-400 font-bold tracking-widest w-[60px] sm:w-[80px] text-center bg-red-950/90 px-1 py-0.5 sm:px-2 sm:py-1 rounded border border-red-500/50 whitespace-nowrap z-30">STOLEN</div>
        <TutorialCard phase={1} owner="opponent" />
        <div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"></div>
      </div>
      <div className="relative">
        <div className="absolute -top-4 sm:-top-6 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs text-red-400 font-bold tracking-widest w-[60px] sm:w-[80px] text-center bg-red-950/90 px-1 py-0.5 sm:px-2 sm:py-1 rounded border border-red-500/50 whitespace-nowrap z-30">STOLEN</div>
        <TutorialCard phase={2} owner="opponent" />
        <div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.6)] z-20"></div>
      </div>
      <div className="relative">
        <div className="absolute -top-6 sm:-top-8 left-1/2 -translate-x-1/2 text-[8px] sm:text-[10px] text-red-200 font-bold tracking-widest w-[70px] sm:w-[90px] text-center bg-red-900 px-1 py-0.5 sm:px-2 sm:py-1 rounded border border-red-400 whitespace-nowrap z-30 uppercase leading-tight">Opponent<br />Move</div>
        <TutorialCard phase={3} owner="opponent" />
        <div className="absolute -inset-1 sm:-inset-2 rounded-xl border-[2px] sm:border-[3px] border-red-500 pointer-events-none shadow-[0_0_20px_rgba(239,68,68,0.8)] z-20"></div>
      </div>
    </div>
  </div>
);

const DemoWin = () => (
  <div className="flex flex-col items-center justify-center my-4 sm:my-8 gap-4 sm:gap-6 relative w-full">
    <div className="flex items-center gap-4 sm:gap-8 md:gap-16 font-mono text-sm sm:text-lg md:text-xl">
      <div className="flex flex-col items-center opacity-50 scale-75 sm:scale-90 bg-red-950/30 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-red-500/20 backdrop-blur-sm shadow-[0_0_20px_rgba(220,38,38,0.1)]">
        <span className="text-red-400 font-bold mb-2 md:mb-4 tracking-widest text-sm sm:text-base md:text-lg px-2 md:px-4 py-1 border-b border-red-500/30">HALF MOON</span>
        <span className="text-2xl sm:text-3xl md:text-4xl text-gray-300 font-bold mt-2 md:mt-4">12 PTS</span>
      </div>
      <div className="text-3xl sm:text-4xl md:text-6xl font-black text-white/5 italic px-2 sm:px-4">VS</div>
      <div className="flex flex-col items-center drop-shadow-[0_0_30px_rgba(165,180,252,0.4)] scale-90 sm:scale-100 md:scale-110 bg-indigo-950/40 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl border border-indigo-400/40 backdrop-blur-md relative shadow-[0_0_40px_rgba(99,102,241,0.2)]">
        <div className="absolute -top-4 sm:-top-6 text-yellow-300 font-black tracking-widest text-sm sm:text-base md:text-xl animate-pulse bg-yellow-900/60 px-4 sm:px-6 py-1 sm:py-2 rounded-lg md:rounded-xl border border-yellow-500/50 whitespace-nowrap shadow-[0_0_15px_rgba(250,204,21,0.4)]">WINNER!</div>
        <span className="text-indigo-300 font-bold mb-2 md:mb-4 tracking-widest text-sm sm:text-base md:text-lg mt-1 sm:mt-2 px-2 sm:px-4 py-1 border-b border-indigo-500/30">YOU</span>
        <span className="text-3xl sm:text-4xl md:text-5xl text-yellow-400 font-black drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] mt-2 md:mt-4">18 PTS</span>
      </div>
    </div>
  </div>
);


const tutorialSteps = [
  {
    title: "How to Play",
    content: (
      <div className="text-left w-full sm:w-4/5 mx-auto">
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 mb-2 sm:mb-4 leading-relaxed tracking-wide">
          Welcome to <span className="text-indigo-300 font-bold">Rise of the Half Moon</span>.
        </p>
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed mb-2 sm:mb-4 tracking-wide">
          Target: Score more points than your opponent by placing moon phase cards strategically on the star map.
        </p>
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed tracking-wide">
          Place cards <strong className="text-indigo-200">anywhere</strong> on the star map!
        </p>
      </div>
    ),
    visual: <DemoPlacement />
  },
  {
    title: "Phase Pair = 1 Point",
    content: (
      <div className="text-left w-full sm:w-4/5 mx-auto">
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed mb-2 sm:mb-4 tracking-wide">
          Match <strong className="text-indigo-300">identical moon phases</strong> directly connected to score exactly <strong className="text-yellow-300">+1 point</strong>.
        </p>
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed tracking-wide">
          E.g., Waxing Crescent + Waxing Crescent = 1 Point!
        </p>
      </div>
    ),
    visual: <DemoPhasePair />
  },
  {
    title: "Full Moon Pair = 2 Points",
    content: (
      <div className="text-left w-full sm:w-4/5 mx-auto">
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed tracking-wide">
          Place <strong className="text-yellow-300">opposite phases</strong> adjacent to each other to form a Full Moon and score <strong className="text-yellow-300">+2 points</strong>!
        </p>
      </div>
    ),
    visual: <DemoFullMoon />
  },
  {
    title: "Lunar Cycle = N Points",
    content: (
      <div className="text-left w-full sm:w-4/5 mx-auto">
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed mb-2 sm:mb-4 tracking-wide">
          The most powerful move. Connect 3 or more phases in chronological order (<strong className="text-yellow-300">🌑&rarr;🌒&rarr;🌓</strong> or <strong className="text-yellow-300">🌘&rarr;🌑&rarr;🌒</strong>).
        </p>
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed tracking-wide">
          You will score points equal to the <strong className="text-yellow-300">entire length of the chain</strong> you just completed. (a 4-card chain = 4 points!).
        </p>
      </div>
    ),
    visual: <DemoChain />
  },
  {
    title: "⚠️ Chain Steal",
    content: (
      <div className="text-left w-full sm:w-4/5 mx-auto">
        <p className="text-sm sm:text-base md:text-lg text-red-200/90 leading-relaxed mb-2 sm:mb-4 tracking-wide">
          Be careful with chains! If your opponent places a card that <strong className="text-red-400">extends your chain</strong>, they will <strong className="text-red-400 font-bold uppercase underline">STEAL</strong> the entire chain!
        </p>
        <p className="text-sm sm:text-base md:text-lg text-red-200/90 leading-relaxed tracking-wide">
          All stolen cards become theirs, and they instantly get the points for the full new length! Long chains are high risk.
        </p>
      </div>
    ),
    visual: <DemoSteal />
  },
  {
    title: "Win the Round!",
    content: (
      <div className="text-left w-full sm:w-4/5 mx-auto">
        <p className="text-sm sm:text-base md:text-lg text-indigo-100/80 leading-relaxed mb-2 sm:mb-4 tracking-wide">
          The game ends when the board is <strong className="text-indigo-300">completely full</strong>.
        </p>
        <ul className="text-sm sm:text-base md:text-lg text-indigo-200/70 text-left list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 mb-2 sm:mb-4 tracking-wide">
          <li><strong className="text-indigo-300">Final Score:</strong> Player with the most points wins.</li>
        </ul>
        <p className="text-base sm:text-xl md:text-2xl text-indigo-100/80 leading-relaxed italic text-center mt-4 sm:mt-6">
          Good luck, and may the moon guide your path.
        </p>
      </div>
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
          }, 150);
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
    <div className="fixed flex inset-0 z-[100] items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-300 min-h-[100vh] p-4 sm:p-6 md:p-8">

      {/* Background celestial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[800px] md:h-[800px] rounded-full bg-indigo-900/20 blur-[60px] md:blur-[100px] pointer-events-none"></div>

      <div className="relative w-full max-w-[95vw] sm:max-w-[90vw] md:max-w-[600px] lg:max-w-4xl bg-[#0a0a1a] border border-indigo-500/30 rounded-2xl md:rounded-[2rem] p-6 sm:p-8 md:p-12 shadow-[0_0_100px_rgba(30,27,75,0.9)] overflow-hidden flex flex-col min-h-[500px] sm:min-h-[600px] md:min-h-[750px]">

        {/* Dynamic content rendering with sliding transition classes */}
        <div className={`flex-grow flex flex-col justify-between transition-all duration-300 transform 
           ${slideDirection === 'left' ? '-translate-x-full opacity-0' : slideDirection === 'right' ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        `}>
          <div className="flex flex-col h-full">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 md:mb-8 tracking-widest uppercase flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 mt-2 sm:mt-4 text-center ${step === 4 ? 'text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.8)]' : 'text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.8)]'}`}>
              {step === 0 && <span className="text-yellow-200">🌙</span>}
              {currentStep.title}
            </h2>

            <div className="w-full flex-grow flex items-center justify-center bg-indigo-950/20 rounded-xl sm:rounded-2xl md:rounded-3xl border border-indigo-500/10 shadow-inner mb-4 sm:mb-6 md:mb-8 py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 min-h-[150px] sm:min-h-[250px] md:min-h-[300px]">
              {currentStep.visual}
            </div>

            <div className="text-center px-2 sm:px-4 md:px-8 min-h-[100px] sm:min-h-[120px] md:min-h-[150px] flex items-center justify-center">
              {currentStep.content}
            </div>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-4 sm:mt-6 md:mt-8 pt-4 sm:pt-6 md:pt-8 border-t border-indigo-500/20 flex flex-col gap-4 sm:gap-6 md:gap-8">
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 flex-wrap">
            {tutorialSteps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${i === step ? 'bg-indigo-300 scale-125 shadow-[0_0_15px_rgba(165,180,252,0.8)]' : 'bg-indigo-900/60 hover:bg-indigo-700/80 cursor-pointer'}`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4 sm:gap-0">
            <button
              onClick={onClose}
              className="text-indigo-400/60 hover:text-indigo-300 font-bold tracking-widest text-xs sm:text-sm md:text-lg transition-colors uppercase px-4 py-2 order-2 sm:order-1"
            >
              Skip Tutorial
            </button>

            <div className="flex gap-3 sm:gap-4 md:gap-6 order-1 sm:order-2">
              <button
                onClick={handlePrev}
                disabled={step === 0}
                className={`px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 font-bold tracking-widest uppercase rounded-lg sm:rounded-xl border border-indigo-500/30 transition-all shadow-lg text-xs sm:text-sm md:text-lg
                     ${step === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-indigo-900/40 hover:border-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] text-indigo-200'}
                   `}
              >
                ← Back
              </button>
              <button
                onClick={handleNext}
                className={`px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 font-bold tracking-widest uppercase rounded-lg sm:rounded-xl transition-all shadow-lg text-xs sm:text-sm md:text-lg
                     ${step === tutorialSteps.length - 1
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-[0_0_40px_rgba(99,102,241,0.6)] border border-indigo-300 border-2 scale-105'
                    : 'bg-indigo-900/60 border border-indigo-500/50 hover:bg-indigo-800/80 hover:border-indigo-400 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] text-white'}
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
