import React from 'react';
import { motion } from 'framer-motion';

interface DrawScreenProps {
  currentLevel: number;
  levelName: string;
  score: number;
  onRetry: () => void;
}

export function DrawScreen({
  currentLevel,
  levelName,
  score,
  onRetry
}: DrawScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-lg flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-[#1a1a3e] to-[#0a0a1a] border-2 border-purple-500/30 rounded-3xl p-8 sm:p-10 max-w-[500px] w-full text-center"
      >
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl sm:text-4xl font-black mb-6 text-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] tracking-widest uppercase"
        >
          🌗 IT'S A TIE!
        </motion.h1>

        {/* Level info */}
        <div className="mb-6 font-mono text-purple-200/80 tracking-widest uppercase">
          <p className="text-base sm:text-lg">Level {currentLevel}: {levelName}</p>
        </div>

        {/* Score comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 sm:gap-6 mb-8 w-full max-w-md mx-auto"
        >
          {/* Half Moon score */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-sm font-bold tracking-widest text-red-400 mb-2 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">HALF MOON</span>
            <div className="bg-red-950/20 border border-red-500/30 rounded-xl px-4 py-3 sm:px-6 sm:py-4 w-full shadow-[0_0_20px_rgba(220,38,38,0.1)]">
              <span className="text-2xl sm:text-4xl font-black text-gray-200">{score}</span>
              <span className="text-sm sm:text-lg text-red-300/60 font-mono ml-1 sm:ml-2">PTS</span>
            </div>
          </div>

          {/* VS */}
          <span className="text-xl sm:text-3xl text-purple-500/50 font-black italic">VS</span>

          {/* Player score */}
          <div className="flex flex-col items-center flex-1">
            <span className="text-sm font-bold tracking-widest text-blue-400 mb-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">YOU</span>
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl px-4 py-3 sm:px-6 sm:py-4 w-full shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <span className="text-2xl sm:text-4xl font-black text-gray-200">{score}</span>
              <span className="text-sm sm:text-lg text-blue-300/60 font-mono ml-1 sm:ml-2">PTS</span>
            </div>
          </div>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8 space-y-2 font-mono"
        >
          <p className="text-base sm:text-lg text-purple-200 drop-shadow-[0_0_8px_rgba(233,213,255,0.8)]">
            The moon is perfectly balanced.
          </p>
          <p className="text-sm sm:text-base text-purple-300/60 italic">
            Try again to break the tie!
          </p>
        </motion.div>

        {/* Retry button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 text-white font-bold uppercase tracking-widest rounded-xl text-base sm:text-lg shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-500/50 transition-all"
        >
          🔄 RETRY LEVEL
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
