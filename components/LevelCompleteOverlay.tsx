import React from 'react';

interface LevelCompleteOverlayProps {
  levelNumber: number;
  levelName: string;
  playerScore: number;
  opponentScore: number;
  onNextLevel: () => void;
  onRetry: () => void;
  hasNextLevel: boolean;
}

export function LevelCompleteOverlay({
  levelNumber,
  levelName,
  playerScore,
  opponentScore,
  onNextLevel,
  onRetry,
  hasNextLevel
}: LevelCompleteOverlayProps) {
  const isWin = playerScore > opponentScore;
  const isTie = playerScore === opponentScore;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      {/* Background celestial glow based on outcome */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 ${isWin ? 'bg-green-900/30' : isTie ? 'bg-gray-700/30' : 'bg-red-900/30'}`}></div>

      <div className={`relative w-full max-w-xl bg-[#0a0a1a] border rounded-3xl p-10 shadow-[0_0_100px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col items-center animate-in zoom-in-95 duration-500 delay-150
        ${isWin ? 'border-green-500/30 shadow-[0_0_50px_rgba(34,197,94,0.2)]' : isTie ? 'border-gray-500/30' : 'border-red-500/30 shadow-[0_0_50px_rgba(239,68,68,0.2)]'}
      `}>

        <h2 className="text-xl font-bold tracking-[0.3em] text-indigo-400 uppercase mb-2">
          Level {levelNumber}: {levelName}
        </h2>

        <h1 className={`text-6xl font-black mb-12 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]
          ${isWin ? 'text-green-400' : isTie ? 'text-gray-300' : 'text-red-500'}
        `}>
          {isWin ? 'VICTORY' : isTie ? 'DRAW' : 'DEFEAT'}
        </h1>

        <div className="w-full flex justify-between items-center mb-12 px-8">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-indigo-300 mb-2 tracking-[0.2em]">YOU</span>
            <span className={`text-5xl font-mono ${isWin ? 'text-white' : 'text-gray-400'}`}>{playerScore}</span>
          </div>

          <div className="text-2xl font-black text-indigo-500/50">VS</div>

          <div className="flex flex-col items-center">
            <span className="text-sm font-bold text-red-400 mb-2 tracking-[0.2em]">OPPONENT</span>
            <span className={`text-5xl font-mono ${!isWin && !isTie ? 'text-white' : 'text-gray-400'}`}>{opponentScore}</span>
          </div>
        </div>

        <div className="flex gap-6 w-full mt-4">
          {hasNextLevel && isWin && (
            <button
              onClick={onNextLevel}
              className="flex-1 py-4 font-black tracking-widest uppercase rounded-xl transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] border border-green-400 hover:scale-105"
            >
              Next Level
            </button>
          )}
          <button
            onClick={onRetry}
            className={`flex-1 py-4 font-black tracking-widest uppercase rounded-xl transition-all border
                 ${!isWin || !hasNextLevel
                ? 'hover:scale-105 bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                : 'bg-indigo-950/40 hover:bg-indigo-900/60 border-indigo-500/30 text-indigo-200'}
              `}
          >
            Retry Level
          </button>
        </div>

      </div>
    </div>
  );
}
