"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MoonCard } from "../components/MoonCard";
import { MoonCard as MoonCardType, GameState, BoardNode, GamePhase } from "../types/game";
import { evaluateGraphPlacement, ScoringEvent } from "../utils/scoring";
import { motion, AnimatePresence } from 'framer-motion';
import { aiTurn } from "../utils/ai";
import { LEVEL_LAYOUTS } from "../constants/layouts";
import { TutorialOverlay } from "../components/TutorialOverlay";
import { LevelIntro } from "../components/LevelIntro";

const LEVEL_NAMES: Record<number, string> = {
  1: 'MARCH',
  2: 'APRIL',
  3: 'MAY',
  4: 'JUNE',
  5: 'JULY',
  6: 'AUGUST',
  7: 'SEPTEMBER',
  8: 'OCTOBER',
  9: 'NOVEMBER',
  10: 'DECEMBER'
};

const THEME_STYLES: Record<string, { bg: string, border: string, shadow: string, lineActive: string, lineInactive: string, nodeBorder: string, nodeDot: string }> = {
  blue: { bg: 'bg-blue-950/[0.05]', border: 'border-blue-500/10', shadow: 'shadow-[inner_0_0_100px_rgba(30,58,136,0.8)]', lineActive: 'stroke-blue-400', lineInactive: 'stroke-blue-800/40', nodeBorder: 'border-blue-500/20', nodeDot: 'bg-blue-500/50' },
  green: { bg: 'bg-green-950/[0.05]', border: 'border-green-500/10', shadow: 'shadow-[inner_0_0_100px_rgba(20,83,45,0.8)]', lineActive: 'stroke-green-400', lineInactive: 'stroke-green-800/40', nodeBorder: 'border-green-500/20', nodeDot: 'bg-green-500/50' },
  purple: { bg: 'bg-purple-950/[0.05]', border: 'border-purple-500/10', shadow: 'shadow-[inner_0_0_100px_rgba(88,28,135,0.8)]', lineActive: 'stroke-purple-400', lineInactive: 'stroke-purple-800/40', nodeBorder: 'border-purple-500/20', nodeDot: 'bg-purple-500/50' },
  indigo: { bg: 'bg-indigo-950/[0.05]', border: 'border-indigo-500/10', shadow: 'shadow-[inner_0_0_100px_rgba(49,46,129,0.8)]', lineActive: 'stroke-indigo-400', lineInactive: 'stroke-indigo-800/40', nodeBorder: 'border-indigo-500/20', nodeDot: 'bg-indigo-500/50' },
  red: { bg: 'bg-red-950/[0.05]', border: 'border-red-500/10', shadow: 'shadow-[inner_0_0_100px_rgba(127,29,29,0.8)]', lineActive: 'stroke-red-400', lineInactive: 'stroke-red-800/40', nodeBorder: 'border-red-500/20', nodeDot: 'bg-red-500/50' },
  yellow: { bg: 'bg-yellow-950/[0.05]', border: 'border-yellow-500/10', shadow: 'shadow-[inner_0_0_100px_rgba(113,63,18,0.8)]', lineActive: 'stroke-yellow-400', lineInactive: 'stroke-yellow-800/40', nodeBorder: 'border-yellow-500/20', nodeDot: 'bg-yellow-500/50' }
};

export type HighlightType = 'PAIR' | 'FULL_MOON' | 'CHAIN';

interface HighlightNode {
  nodeId: string;
  type: HighlightType;
}

interface HighlightEdge {
  id1: string;
  id2: string;
  type: HighlightType;
}

interface ScorePopupData {
  id: string;
  points: number;
  type: HighlightType;
  nodeId: string;
  owner?: 'player' | 'opponent';
}

const generateDeck = (size: number, owner: 'player' | 'opponent'): MoonCardType[] => {
  return Array(size).fill(null).map((_, i) => ({
    id: `${owner}-deck-${Date.now()}-${i}-${Math.random()}`,
    phase: Math.floor(Math.random() * 8),
    owner
  }));
};

const INITIAL_DECK_SIZE = 30; // 3 in hand, 27 in draw pile.

// ------------- AUDIO FUNCTIONS -------------
function playSimpleChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { }
}

function playChainSound(index: number, totalLength: number) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const frequency = 400 + (index * 100);
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) { }
}

function playCompletionSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [600, 750, 900].forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, i * 80);
    });
  } catch (e) { }
}

function playMultipleChainSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const notes = [400, 500, 600, 700, 800, 900];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }, i * 100);
    });
  } catch (e) { }
}

function playGameOverSound(result: 'win' | 'lose') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (result === 'win') {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.type = 'triangle';
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        }, i * 150);
      });
    } else {
      const notes = [440, 392, 349, 294];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.6);
        }, i * 200);
      });
    }
  } catch (e) { }
}

function useBackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const savedMute = localStorage.getItem('halfmoon_isMuted') === 'true';
    setIsMuted(savedMute);

    audioRef.current = new Audio('/bgm.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;
    audioRef.current.muted = savedMute;

    const playAudio = () => {
      audioRef.current?.play().catch(() => { });
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };

    document.addEventListener('click', playAudio);
    document.addEventListener('keydown', playAudio);

    return () => {
      audioRef.current?.pause();
      document.removeEventListener('click', playAudio);
      document.removeEventListener('keydown', playAudio);
    };
  }, []);

  const toggleMute = () => {
    setIsMuted(prev => {
      const next = !prev;
      localStorage.setItem('halfmoon_isMuted', String(next));
      if (audioRef.current) audioRef.current.muted = next;
      return next;
    });
  };

  return { isMuted, toggleMute };
}

// GameControls are now inline in the Layout.

function GamePauseMenu({ onResume, onExit, onOpenTutorial, currentLevel, playerScore }: { onResume: () => void, onExit: () => void, onOpenTutorial: () => void, currentLevel: string, playerScore: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center"
    >
      <div className="bg-gradient-to-br from-[#1a1a3e] to-[#0a0a1a] border-2 border-indigo-400/30 rounded-[2rem] p-12 min-w-[400px] text-center shadow-[0_0_50px_rgba(99,102,241,0.2)]">
        <h2 className="text-4xl font-black text-white mb-10 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">⏸️ PAUSED</h2>

        <div className="flex flex-col gap-5 my-8">
          <button
            onClick={onResume}
            className="py-4 px-8 rounded-xl text-lg font-bold uppercase tracking-widest bg-gradient-to-br from-indigo-600 to-purple-600 text-white hover:scale-105 hover:shadow-[0_8px_20px_rgba(99,102,241,0.4)] transition-all border-none outline-none cursor-pointer"
          >
            ▶️ Continue
          </button>

          <button
            onClick={onOpenTutorial}
            className="py-4 px-8 rounded-xl text-lg font-bold uppercase tracking-widest bg-indigo-950/40 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-900/60 transition-all outline-none cursor-pointer"
          >
            📖 How to Play
          </button>

          <button
            onClick={onExit}
            className="py-4 px-8 rounded-xl text-lg font-bold uppercase tracking-widest bg-red-500/20 text-red-500 border border-red-500 hover:bg-red-500/30 transition-all outline-none cursor-pointer"
          >
            🚪 Exit to Menu
          </button>
        </div>

        <div className="text-indigo-200/80 font-mono tracking-widest mt-8 pt-8 border-t border-indigo-500/30">
          <p className="mb-2 uppercase text-sm">{currentLevel}</p>
          <p className="font-bold text-white text-lg">{playerScore} PTS</p>
        </div>
      </div>
    </motion.div>
  );
}

function DraggableCard({ card, isSelected, onClick, disabled, onDragStart, onDragEnd }: { card: MoonCardType, isSelected: boolean, onClick: () => void, disabled: boolean, onDragStart: () => void, onDragEnd: () => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const drawCardVariants = {
    initial: { scale: 0.5, y: 100, rotateY: 180, opacity: 0 },
    animate: { scale: 1, y: 0, rotateY: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
    exit: { scale: [1, 1.15, 0.9], y: -200, opacity: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  return (
    <motion.div
      variants={drawCardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="relative drop-shadow-xl"
    >
      <div
        draggable={!disabled}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={onClick}
        className={`transform transition-all duration-300 touch-none will-change-transform
            ${!disabled ? 'cursor-grab active:cursor-grabbing' : ''}
            ${isSelected && !isDragging ? '-translate-y-6 scale-110 shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : !isDragging ? 'hover:-translate-y-2 hover:scale-105 shadow-[0_10px_20px_rgba(0,0,0,0.5)]' : ''}
            ${isDragging ? 'scale-110 shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-50 cursor-grabbing opacity-50' : ''}`}
      >
        <MoonCard card={card} />
      </div>
    </motion.div>
  );
}

function DroppableNode({ node, children, isValid, isHovered, onClick, onDrop, onDragEnter, onDragLeave }: { node: BoardNode, children: React.ReactNode, isValid: boolean, isHovered: boolean, onClick: () => void, onDrop: (cardId: string) => void, onDragEnter: () => void, onDragLeave: () => void }) {
  const handleDragOver = (e: React.DragEvent) => {
    if (isValid) {
      e.preventDefault(); // Necessary to allow dropping
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isValid) {
      const cardId = e.dataTransfer.getData('text/plain');
      if (cardId) {
        onDrop(cardId);
      }
    }
    onDragLeave();
  };

  return (
    <div
      id={`node-${node.id}`}
      onClick={onClick}
      onDragOver={handleDragOver}
      onDragEnter={(e) => {
        if (isValid) {
          e.preventDefault();
          onDragEnter();
        }
      }}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      className={`
         absolute transform -translate-x-1/2 -translate-y-1/2 w-[80px] h-[100px] rounded-[8px] z-10 flex flex-col items-center justify-center transition-all duration-300
         ${isHovered && isValid ? 'scale-110' : ''}
         ${node.card ? 'cursor-default' : isValid ? 'cursor-pointer' : 'cursor-default opacity-80'}
       `}
      style={{
        left: `${node.position.x}%`,
        top: `${node.position.y}%`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [bestLevelReached, setBestLevelReached] = useState(1);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const { isMuted, toggleMute } = useBackgroundMusic();

  const [gameState, setGameState] = useState<GameState>({
    phase: 'start',
    layout: JSON.parse(JSON.stringify(LEVEL_LAYOUTS[0])),
    playerHand: [],
    playerDrawPile: [],
    opponentHand: [],
    opponentDrawPile: [],
    playerScore: 0,
    opponentScore: 0,
    playerHealth: 3,
    opponentHealth: 3,
    currentTurn: 'player'
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [aiActionState, setAiActionState] = useState<{ phase: 'idle' | 'thinking' | 'highlight' | 'play', cardId: string | null, targetNodeId: string | null }>({ phase: 'idle', cardId: null, targetNodeId: null });
  const [isPaused, setIsPaused] = useState(false);
  const [chainPopups, setChainPopups] = useState<{ id: string, text: string }[]>([]);
  const [multipleChainsPopup, setMultipleChainsPopup] = useState<{ count: number, points: number } | null>(null);
  const [aiPlayOffset, setAiPlayOffset] = useState({ x: 0, y: 0 });

  // Visual effects state
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<HighlightNode[]>([]);
  const [highlightedEdges, setHighlightedEdges] = useState<HighlightEdge[]>([]);

  useEffect(() => {
    setHasMounted(true);
    const savedLevel = localStorage.getItem('halfmoon_currentLevel');
    const savedBest = localStorage.getItem('halfmoon_bestLevel');

    let startLvl = 0;
    let startBest = 1;
    if (savedLevel) startLvl = parseInt(savedLevel, 10);
    if (savedBest) startBest = parseInt(savedBest, 10);

    // Safeguard bounds
    if (startLvl >= LEVEL_LAYOUTS.length) startLvl = 0;

    setCurrentLevelIndex(startLvl);
    setBestLevelReached(startBest);

    resetGameToLevel(startLvl, 'start');
  }, []);

  const resetGameToLevel = (levelIndex: number, phase: GamePhase) => {
    const pDeck = generateDeck(INITIAL_DECK_SIZE, 'player');
    const oDeck = generateDeck(INITIAL_DECK_SIZE, 'opponent');
    setGameState({
      phase,
      layout: JSON.parse(JSON.stringify(LEVEL_LAYOUTS[levelIndex])),
      playerHand: pDeck.slice(0, 3),
      playerDrawPile: pDeck.slice(3),
      opponentHand: oDeck.slice(0, 3),
      opponentDrawPile: oDeck.slice(3),
      playerScore: 0,
      opponentScore: 0,
      playerHealth: 3,
      opponentHealth: 3,
      currentTurn: 'player'
    });
    setScorePopups([]);
  };

  const isBoardEmpty = gameState.layout.nodes.every(node => node.card === null);
  const isGameOver = gameState.playerHand.length === 0 || gameState.layout.nodes.every(node => node.card !== null);

  useEffect(() => {
    if (gameState.phase === 'playing' && isGameOver) {
      setGameState(prev => ({ ...prev, phase: 'endGameCounting' as GamePhase }));

      let currentOpponentScore = gameState.opponentScore;
      let currentPlayerScore = gameState.playerScore;

      const nodes = gameState.layout.nodes;
      const opponentNodes = nodes.filter(n => n.card && n.card.scoredBy === 'opponent');
      const playerNodes = nodes.filter(n => n.card && n.card.scoredBy === 'player');

      // Helper function to animate score counting
      const renderCounting = async () => {
        // 1. Wait a moment
        await delay(1000);

        // 2. Count Opponent Cards
        for (let i = 0; i < opponentNodes.length; i++) {
          const node = opponentNodes[i];
          setHighlightedNodes(prev => [...prev, { nodeId: node.id, type: 'PAIR' }]);
          playSimpleChime();
          currentOpponentScore += 1;
          setGameState(prev => ({ ...prev, opponentScore: prev.opponentScore + 1 }));
          await delay(300);
          setHighlightedNodes(prev => prev.filter(n => n.nodeId !== node.id));
        }

        await delay(1000);

        // 3. Count Player Cards
        for (let i = 0; i < playerNodes.length; i++) {
          const node = playerNodes[i];
          setHighlightedNodes(prev => [...prev, { nodeId: node.id, type: 'FULL_MOON' }]);
          playSimpleChime();
          currentPlayerScore += 1;
          setGameState(prev => ({ ...prev, playerScore: prev.playerScore + 1 }));
          await delay(300);
          setHighlightedNodes(prev => prev.filter(n => n.nodeId !== node.id));
        }

        await delay(1500);

        // 4. Decide Winner
        if (currentPlayerScore > currentOpponentScore) {
          playGameOverSound('win');
          const nextLvl = currentLevelIndex + 1;
          const nextBest = Math.max(bestLevelReached, nextLvl + 1);
          setBestLevelReached(nextBest);
          localStorage.setItem('halfmoon_bestLevel', nextBest.toString());
          setGameState(prev => ({ ...prev, phase: 'levelWin' }));
        } else {
          playGameOverSound('lose');
          setGameState(prev => ({ ...prev, phase: 'gameOver' }));
        }
      };

      renderCounting();
    }
  }, [isGameOver, gameState.phase, gameState.playerScore, gameState.opponentScore, currentLevelIndex, bestLevelReached]);

  const handleNextLevel = () => {
    const next = currentLevelIndex + 1;
    if (next < LEVEL_LAYOUTS.length) {
      setCurrentLevelIndex(next);
      localStorage.setItem('halfmoon_currentLevel', next.toString());
      resetGameToLevel(next, 'levelIntro');
    } else {
      // Beat all levels! Loop to 0
      setCurrentLevelIndex(0);
      localStorage.setItem('halfmoon_currentLevel', '0');
      resetGameToLevel(0, 'start');
    }
  };

  const handleRetryGame = () => {
    setCurrentLevelIndex(0);
    localStorage.setItem('halfmoon_currentLevel', '0');
    resetGameToLevel(0, 'levelIntro');
  };

  const startGame = () => {
    const seenTut = localStorage.getItem('halfmoon_hasSeenTutorial');
    if (!seenTut || seenTut === 'false') {
      setGameState(prev => ({ ...prev, phase: 'tutorial' }));
    } else {
      setGameState(prev => ({ ...prev, phase: 'levelIntro' }));
    }
  };

  const openTutorial = () => {
    setGameState(prev => ({ ...prev, phase: 'tutorial' }));
  };

  const handleTutorialButton = () => {
    if (gameState.phase === 'playing') {
      setIsPaused(true);
    } else {
      openTutorial();
    }
  };

  const finishTutorial = () => {
    localStorage.setItem('halfmoon_hasSeenTutorial', 'true');
    setGameState(prev => ({ ...prev, phase: 'levelIntro' }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCardId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    if (gameState.phase === 'playing' && gameState.currentTurn === 'opponent' && !isGameOver && aiActionState.phase === 'idle') {
      const executeAiTurn = async () => {
        setAiActionState({ phase: 'thinking', cardId: null, targetNodeId: null });
        await delay(800);

        const difficulty = currentLevelIndex > 2 ? 2 : currentLevelIndex;
        const move = aiTurn(gameState, difficulty);

        if (!move) {
          setGameState(prev => ({ ...prev, currentTurn: 'player' }));
          setAiActionState({ phase: 'idle', cardId: null, targetNodeId: null });
          return;
        }

        setAiActionState({ phase: 'highlight', cardId: move.cardId, targetNodeId: move.nodeId });
        await delay(600);

        const targetEl = document.getElementById(`node-${move.nodeId}`);
        const cardEl = document.getElementById(`ai-card-${move.cardId}`);
        if (targetEl && cardEl) {
          const targetRect = targetEl.getBoundingClientRect();
          const cardRect = cardEl.getBoundingClientRect();
          setAiPlayOffset({
            x: targetRect.left - cardRect.left,
            y: targetRect.top - cardRect.top,
          });
        }

        setAiActionState({ phase: 'play', cardId: move.cardId, targetNodeId: move.nodeId });
        await delay(500);

        handleNodeClick(move.nodeId, move.cardId, true);
        setAiActionState({ phase: 'idle', cardId: null, targetNodeId: null });
      };
      executeAiTurn();
    }
  }, [gameState.phase, gameState.currentTurn, isGameOver, aiActionState.phase, currentLevelIndex]);

  const isValidPlacement = (nodeId: string) => {
    const node = gameState.layout.nodes.find(n => n.id === nodeId);
    if (!node || node.card !== null) return false;
    return true; // Any empty node is valid in the new rules
  };

  const handleNodeClick = (nodeId: string, overrideCardId?: string, isAiTurn: boolean = false) => {
    if (!isAiTurn && gameState.currentTurn !== 'player') return;

    const useCardId = overrideCardId || selectedCardId;
    if (!useCardId) return;
    if (!isValidPlacement(nodeId)) return;

    const handToUse = isAiTurn ? gameState.opponentHand : gameState.playerHand;
    const drawPileToUse = isAiTurn ? gameState.opponentDrawPile : gameState.playerDrawPile;

    const selectedCardIndex = handToUse.findIndex(card => card.id === useCardId);
    if (selectedCardIndex === -1) return;

    const card = handToUse[selectedCardIndex];
    const newOwner = isAiTurn ? 'opponent' : 'player';

    const newNodes = gameState.layout.nodes.map(n =>
      n.id === nodeId ? { ...n, card: { ...card, owner: newOwner as 'player' | 'opponent' } }
        : { ...n, card: n.card ? { ...n.card } : null }
    );

    const events = evaluateGraphPlacement(newNodes, nodeId);

    const chainEvents = events.filter(e => e.type === 'CHAIN');
    const otherEvents = events.filter(e => e.type !== 'CHAIN');

    let addedPlayerScore = 0;
    let addedOpponentScore = 0;
    const newPopups: ScorePopupData[] = [];
    const newHighlightNodes: HighlightNode[] = [];
    const newHighlightEdges: HighlightEdge[] = [];
    const newScoredEdges: { id1: string, id2: string, type: HighlightType }[] = [...(gameState.layout.scoredEdges || [])];

    events.forEach((event: ScoringEvent) => {
      if (event.owner === 'player') addedPlayerScore += event.points;
      else if (event.owner === 'opponent') addedOpponentScore += event.points;

      if (event.type === 'CHAIN') {
        event.nodeIds.forEach((id: string) => {
          const targetNode = newNodes.find(n => n.id === id);
          if (targetNode && targetNode.card) {
            targetNode.card.owner = newOwner;
            targetNode.card.scoredBy = event.owner;
          }
        });
      }

      event.nodeIds.forEach((id: string) => {
        const targetNode = newNodes.find(n => n.id === id);
        if (targetNode && targetNode.card) {
          targetNode.card.scoredBy = event.owner;
        }
      });

      // Save permanent edges
      if (event.type === 'CHAIN') {
        for (let i = 0; i < event.nodeIds.length - 1; i++) {
          newScoredEdges.push({ id1: event.nodeIds[i], id2: event.nodeIds[i + 1], type: 'CHAIN' });
        }
      } else {
        newScoredEdges.push({ id1: event.nodeIds[0], id2: event.nodeIds[1], type: event.type });
      }
    });

    const newHand = [...handToUse];
    const newDrawPile = [...drawPileToUse];
    newHand.splice(selectedCardIndex, 1);
    if (newDrawPile.length > 0) newHand.push(newDrawPile.shift()!);

    // Apply immediate game state (board + hands)
    setGameState(prev => ({
      ...prev,
      layout: { ...prev.layout, nodes: newNodes, scoredEdges: newScoredEdges },
      playerHand: isAiTurn ? prev.playerHand : newHand,
      playerDrawPile: isAiTurn ? prev.playerDrawPile : newDrawPile,
      opponentHand: isAiTurn ? newHand : prev.opponentHand,
      opponentDrawPile: isAiTurn ? newDrawPile : prev.opponentDrawPile,
      currentTurn: isAiTurn ? 'player' : 'opponent',
      // Delay score application if there are chain events
      playerScore: chainEvents.length > 0 ? prev.playerScore : prev.playerScore + addedPlayerScore,
      opponentScore: chainEvents.length > 0 ? prev.opponentScore : prev.opponentScore + addedOpponentScore
    }));

    if (!isAiTurn) {
      setSelectedCardId(null);
      setHoveredNodeId(null);
    }

    // Sequence Animations
    if (chainEvents.length > 0) {
      let maxDelay = 0;
      let totalChainPoints = 0;

      chainEvents.forEach((chainEv, evIndex) => {
        const cLength = chainEv.nodeIds.length;
        totalChainPoints += chainEv.points;
        const chainStartTime = evIndex * 2000;

        if (chainEvents.length > 1) {
          setTimeout(() => {
            const popupId = `chain-label-${Date.now()}-${evIndex}`;
            setChainPopups(prev => [...prev, { id: popupId, text: `CHAIN ${evIndex + 1} OF ${chainEvents.length}` }]);
            setTimeout(() => {
              setChainPopups(prev => prev.filter(p => p.id !== popupId));
            }, 1500);
          }, chainStartTime);
        }

        const startIndex = chainEv.nodeIds.indexOf(nodeId) !== -1 ? chainEv.nodeIds.indexOf(nodeId) : 0;

        chainEv.nodeIds.forEach((id, i) => {
          const distance = Math.abs(i - startIndex);
          setTimeout(() => {
            playChainSound(distance, cLength);
            setHighlightedNodes(prev => [...prev, { nodeId: id, type: 'CHAIN' }]);

            const cardEl = document.getElementById(`card-wrapper-${id}`);
            if (cardEl) {
              cardEl.style.animation = 'chainPulse 0.4s ease-out';
              setTimeout(() => { if (cardEl) cardEl.style.animation = ''; }, 400);
            }

            if (i < cLength - 1) {
              setHighlightedEdges(prev => [...prev, { id1: id, id2: chainEv.nodeIds[i + 1], type: 'CHAIN' }]);
            }
          }, distance * 250 + chainStartTime);
        });

        const burstTime = Math.max(startIndex, cLength - 1 - startIndex) * 250 + 400 + chainStartTime;
        if (burstTime > maxDelay) maxDelay = burstTime;

        setTimeout(() => {
          playCompletionSound();
          setScorePopups(prev => [...prev, { id: `popup-${Date.now()}-${evIndex}`, points: chainEv.points, type: 'CHAIN', nodeId: nodeId, owner: chainEv.owner }]);
        }, burstTime);

        setTimeout(() => {
          setHighlightedNodes(prev => prev.filter(n => !chainEv.nodeIds.includes(n.nodeId)));
          setHighlightedEdges(prev => prev.filter(e => e.type !== 'CHAIN'));
          setScorePopups(prev => prev.filter(p => p.type !== 'CHAIN'));
        }, burstTime + 2000);
      });

      if (chainEvents.length > 1) {
        setTimeout(() => {
          setMultipleChainsPopup({ count: chainEvents.length, points: totalChainPoints });
          playMultipleChainSound();
          setTimeout(() => {
            setMultipleChainsPopup(null);
          }, 3000);
        }, maxDelay + 500);
        maxDelay += 4000;
      }

      // Apply delayed scores
      setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          playerScore: prev.playerScore + addedPlayerScore,
          opponentScore: prev.opponentScore + addedOpponentScore
        }));
      }, maxDelay);

    }

    if (otherEvents.length > 0) {
      playSimpleChime();

      otherEvents.forEach((event: ScoringEvent, i: number) => {
        event.nodeIds.forEach((id: string) => newHighlightNodes.push({ nodeId: id, type: event.type as HighlightType }));
        newHighlightEdges.push({ id1: event.nodeIds[0], id2: event.nodeIds[1], type: event.type as HighlightType });
        newPopups.push({ id: `popup-${Date.now()}-${i}`, points: event.points, type: event.type as HighlightType, nodeId: nodeId, owner: event.owner });
      });

      setScorePopups(prev => [...prev, ...newPopups]);
      setHighlightedNodes(prev => [...prev, ...newHighlightNodes]);
      setHighlightedEdges(prev => [...prev, ...newHighlightEdges]);

      setTimeout(() => {
        setScorePopups(prev => prev.filter(p => !newPopups.find(np => np.id === p.id)));
        setHighlightedNodes(prev => prev.filter(n => !newHighlightNodes.find(nn => nn === n)));
        setHighlightedEdges(prev => prev.filter(e => !newHighlightEdges.find(ne => ne === e)));
      }, 2000);
    }
  };

  if (!hasMounted) return null;

  // --------------------------------------------------------------------------
  // SCREENS
  // --------------------------------------------------------------------------

  if (gameState.phase === 'levelIntro') {
    return (
      <LevelIntro
        levelNumber={currentLevelIndex + 1}
        levelName={LEVEL_NAMES[currentLevelIndex + 1] || 'UNKNOWN'}
        onComplete={() => setGameState(prev => ({ ...prev, phase: 'playing' }))}
        onSkip={() => setGameState(prev => ({ ...prev, phase: 'playing' }))}
      />
    );
  }

  if (gameState.phase === 'start') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#0a0a1a] text-white selection:bg-indigo-500/30">
        <div className="border border-indigo-500/30 rounded-3xl p-12 bg-indigo-950/20 shadow-[0_0_50px_rgba(49,46,129,0.5)] backdrop-blur-sm max-w-lg w-full flex flex-col items-center gap-8">
          <h1 className="text-4xl font-black tracking-widest text-center text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.8)] flex items-center gap-4 uppercase">
            🌙 Rise of the<br />Half Moon
          </h1>
          <div className="w-full flex flex-col gap-4 mt-4">
            <button onClick={startGame} className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-bold uppercase tracking-wider hover:brightness-125 transition-all outline-none">
              🎮 Start Game
            </button>
            <button onClick={openTutorial} className="w-full py-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 font-bold uppercase tracking-wider hover:bg-indigo-900/60 transition-all outline-none text-indigo-200">
              📖 How to Play
            </button>
          </div>
          <div className="text-indigo-400 font-mono tracking-widest text-sm flex gap-8 mt-4">
            <span>Current Level: {currentLevelIndex + 1}</span>
            <span>Best Level: {bestLevelReached}</span>
          </div>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'levelWin') {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 bg-[#0a0a1a] text-white">
        <div className="border border-green-500/30 rounded-3xl p-12 bg-green-950/20 shadow-[0_0_50px_rgba(20,83,45,0.8)] backdrop-blur-sm max-w-lg w-full flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-green-400 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]">
            LEVEL COMPLETE! 🎉
          </h2>
          <div className="text-xl font-bold tracking-widest text-green-200 uppercase">
            Level {currentLevelIndex + 1}: {LEVEL_LAYOUTS[currentLevelIndex].name}
          </div>

          <div className="flex flex-col w-full gap-2 my-6 font-mono text-lg bg-black/40 p-6 rounded-xl border border-green-900/50">
            <div className="flex justify-between text-green-300">
              <span>You:</span> <span>{gameState.playerScore} points</span>
            </div>
            <div className="flex justify-between text-red-300">
              <span>Half Moon:</span> <span>{gameState.opponentScore} points</span>
            </div>
          </div>

          <div className="text-4xl font-black text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] animate-pulse mb-4">
            YOU WIN!
          </div>

          <button onClick={handleNextLevel} className="w-full py-4 rounded-xl bg-green-600 hover:bg-green-500 font-bold uppercase tracking-wider transition-all outline-none">
            ➡️ NEXT LEVEL
          </button>
        </div>
      </div>
    );
  }

  if (gameState.phase === 'gameOver') {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 bg-[#0a0a1a] text-white">
        <div className="border border-red-500/30 rounded-3xl p-12 bg-red-950/20 shadow-[0_0_50px_rgba(153,27,27,0.8)] backdrop-blur-sm max-w-lg w-full flex flex-col items-center gap-6">
          <h2 className="text-3xl font-black text-red-500 tracking-widest uppercase drop-shadow-[0_0_10px_rgba(2ef,68,68,0.8)]">
            GAME OVER 💔
          </h2>
          <div className="text-xl font-bold tracking-widest text-red-300 uppercase">
            Level {currentLevelIndex + 1}: {LEVEL_LAYOUTS[currentLevelIndex].name}
          </div>

          <div className="flex flex-col w-full gap-2 my-6 font-mono text-lg bg-black/40 p-6 rounded-xl border border-red-900/50">
            <div className="flex justify-between text-green-300">
              <span>You:</span> <span>{gameState.playerScore} points</span>
            </div>
            <div className="flex justify-between text-red-400 font-bold">
              <span>Half Moon:</span> <span>{gameState.opponentScore} points</span>
            </div>
          </div>

          <div className="text-3xl font-black text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] mb-2">
            HALF MOON WINS
          </div>

          <div className="text-sm font-mono text-red-300/60 mb-6 uppercase tracking-widest">
            Returning to Level 1...
          </div>

          <button onClick={handleRetryGame} className="w-full py-4 rounded-xl bg-red-900 border border-red-500 hover:bg-red-800 hover:border-red-400 font-bold uppercase tracking-wider transition-all outline-none shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            🔄 TRY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // Active Connections set
  const connections = new Set<string>();
  gameState.layout.nodes.forEach(node => {
    node.connectedTo.forEach(targetId => {
      const sortedPair = [node.id, targetId].sort().join('-');
      connections.add(sortedPair);
    });
  });

  // GAME PLAYING PHASE
  return (
    <div className="flex min-h-screen flex-col items-center justify-between py-8 px-8 bg-[#0a0a1a] text-white font-sans selection:bg-indigo-500/30">

      {gameState.phase === 'tutorial' && (
        <TutorialOverlay onClose={finishTutorial} />
      )}

      {/* TOP: LAYOUT WRAPPER */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-6">

        {/* HEADER: Level & Controls */}
        <div className="w-full flex items-center relative py-2 mb-2">
          <div className="flex-1 flex justify-center">
            <div className="text-xl font-bold tracking-[0.2em] text-indigo-300 uppercase drop-shadow-[0_0_8px_rgba(165,180,252,0.8)]">
              Level {gameState.layout.levelNumber}: {gameState.layout.name}
            </div>
          </div>
          <div className="absolute right-0 flex gap-4">
            <button onClick={handleTutorialButton} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/30 text-indigo-200 hover:text-white hover:bg-black/60 transition-all shadow-xl flex items-center justify-center text-lg">❓</button>
            <button onClick={toggleMute} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 hover:border-white/30 text-indigo-200 hover:text-white hover:bg-black/60 transition-all shadow-xl flex items-center justify-center text-lg">{isMuted ? '🔇' : '🔊'}</button>
          </div>
        </div>

        {isPaused && (
          <GamePauseMenu
            onResume={() => setIsPaused(false)}
            onExit={() => {
              if (confirm('Exit to menu? Current progress will be lost.')) {
                setIsPaused(false);
                setGameState(prev => ({ ...prev, phase: 'start' }));
              }
            }}
            onOpenTutorial={() => {
              setIsPaused(false);
              setGameState(prev => ({ ...prev, phase: 'tutorial' }));
            }}
            currentLevel={`Level ${gameState.layout.levelNumber}: ${gameState.layout.name}`}
            playerScore={gameState.playerScore}
          />
        )}

        {/* TOP: HALF MOON AREA */}
        <div className="w-full flex justify-between items-center px-8 py-4 bg-gradient-to-r from-red-950/30 to-black/60 border border-red-500/20 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.05)] relative overflow-hidden">
          <div className="flex flex-col">
            <div className="text-2xl font-black tracking-widest text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)] z-10">HALF MOON</div>
          </div>

          {aiActionState.phase === 'thinking' && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-sm z-0">
              <div className="text-red-300 font-mono tracking-[0.3em] flex items-center gap-2 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]">
                THINKING
                <span className="flex gap-1 ml-2">
                  <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-end justify-center z-10 opacity-80" style={{ opacity: aiActionState.phase !== 'idle' ? 0.2 : 0.8 }}>
            <span className="text-2xl font-mono text-gray-200 font-bold">{gameState.opponentScore} PTS</span>
          </div>
        </div>

        {/* AI Face-down Cards */}
        <div className="flex gap-6 justify-center z-20 h-[100px] items-center">
          {gameState.opponentHand.map(card => {
            const isActing = aiActionState.cardId === card.id;
            const aiCardPlayVariants = {
              initial: { scale: 1, y: 0, x: 0 },
              highlight: { scale: 1.1, boxShadow: '0 0 20px rgba(255, 80, 100, 0.6)', transition: { duration: 0.3 } },
              play: { scale: 1.0, x: aiPlayOffset.x, y: aiPlayOffset.y, transition: { duration: 0.5, ease: "easeInOut" as const } }
            };

            return (
              <motion.div
                id={`ai-card-${card.id}`}
                key={card.id}
                className="transform shadow-[0_10px_20px_rgba(0,0,0,0.5)] rounded-[8px] pointer-events-none"
                style={{ zIndex: isActing ? 50 : 20 }}
                variants={aiCardPlayVariants}
                initial="initial"
                animate={isActing && aiActionState.phase === 'highlight' ? 'highlight' : isActing && aiActionState.phase === 'play' ? ['highlight', 'play'] : 'initial'}
              >
                <MoonCard card={card} isFaceDown={true} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* MIDDLE: GRAPH BOARD */}
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl relative flex-grow justify-center my-4">
        {/* Score Popups overlay */}
        {scorePopups.map((popup) => {
          const targetNode = gameState.layout.nodes.find(n => n.id === popup.nodeId);
          if (!targetNode) return null;

          let textColor = 'text-white';
          if (popup.type === 'CHAIN') textColor = 'text-purple-300 drop-shadow-[0_4px_4px_rgba(168,85,247,0.8)]';
          else if (popup.type === 'FULL_MOON') textColor = 'text-yellow-300 drop-shadow-[0_4px_4px_rgba(253,224,71,0.8)]';
          else if (popup.type === 'PAIR') textColor = 'text-blue-300 drop-shadow-[0_4px_4px_rgba(59,130,246,0.8)]';

          const xDir = popup.owner === 'player' ? -50 : 50;
          const yDir = popup.owner === 'player' ? 300 : -300;

          return (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, scale: 0.5, y: 0, x: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0.5, 1.2, 1, 0.5],
                y: [0, -20, yDir],
                x: [0, 0, xDir]
              }}
              transition={{ duration: 2.0, times: [0, 0.2, 0.7, 1], ease: "easeInOut" }}
              className="absolute z-50 pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{
                left: `calc(${targetNode.position.x}% - 20px)`,
                top: `calc(${targetNode.position.y}% - 60px)`
              }}
            >
              <div className={`text-3xl font-black ${textColor} drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]`}>
                +{popup.points}
              </div>
              <div className={`text-xs font-bold text-center uppercase mt-1 ${textColor}`}>
                {popup.type.replace('_', ' ')}
              </div>
            </motion.div>
          )
        })}

        {chainPopups.map((popup) => (
          <div key={popup.id} className="fixed top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600/90 text-white border border-indigo-400 px-6 py-3 rounded-xl font-bold text-lg tracking-widest z-[999] shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300 pointer-events-none uppercase">
            {popup.text}
          </div>
        ))}

        {multipleChainsPopup && (
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 rounded-3xl text-center z-[1001] shadow-[0_10px_80px_rgba(253,224,71,0.6)] border-[4px] border-yellow-200 animate-in zoom-in-75 fade-in duration-300 pointer-events-none">
            <div className="text-3xl font-black mb-2 uppercase drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)] text-indigo-950">MULTIPLE CHAINS! 🎉</div>
            <div className="text-xl mb-3 font-bold text-indigo-900 tracking-wide">{multipleChainsPopup.count} chains found</div>
            <div className="text-6xl font-black drop-shadow-[0_4px_4px_rgba(255,255,255,0.4)] text-white mt-4 tracking-tighter">+{multipleChainsPopup.points} PTS</div>
          </div>
        )}

        {/* Game Board Container */}
        <div className={`w-full max-w-4xl h-[550px] rounded-[2rem] backdrop-blur-xl border relative overflow-hidden transition-colors duration-1000 animate-in fade-in zoom-in-95
           ${THEME_STYLES[gameState.layout.theme || 'indigo'].bg} 
           ${THEME_STYLES[gameState.layout.theme || 'indigo'].border} 
           ${THEME_STYLES[gameState.layout.theme || 'indigo'].shadow}
        `}>

          {/* SVG Connections Container */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.3))' }}>
            {Array.from(connections).map(pair => {
              const [id1, id2] = pair.split('-');
              const n1 = gameState.layout.nodes.find(n => n.id === id1);
              const n2 = gameState.layout.nodes.find(n => n.id === id2);
              if (!n1 || !n2) return null;

              const isHighlighted = highlightedEdges.find(e => (e.id1 === id1 && e.id2 === id2) || (e.id1 === id2 && e.id2 === id1));
              const highlightEdge = highlightedEdges.find(e => (e.id1 === id1 && e.id2 === id2) || (e.id1 === id2 && e.id2 === id1));

              const permanentEdge = gameState.layout.scoredEdges?.find(e =>
                (e.id1 === id1 && e.id2 === id2) || (e.id1 === id2 && e.id2 === id1)
              );

              const isOccupied = n1.card !== null && n2.card !== null;
              const themeStyle = THEME_STYLES[gameState.layout.theme || 'indigo'];

              let lineClass = isOccupied ? `${themeStyle.lineActive} stroke-[3]` : `${themeStyle.lineInactive} stroke-[2] stroke-dasharray-[4,4]`;
              let lineStyle: React.CSSProperties = { transition: 'all 1s' };

              if (permanentEdge) {
                if (permanentEdge.type === 'CHAIN') {
                  lineClass = 'stroke-purple-400 stroke-[5] drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]';
                } else if (permanentEdge.type === 'FULL_MOON') {
                  lineClass = 'stroke-yellow-400 stroke-[4] drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
                } else if (permanentEdge.type === 'PAIR') {
                  lineClass = 'stroke-blue-400 stroke-[4] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]';
                }
              }

              // Highlight overrides permanent styling temporarily during animations
              if (isHighlighted && highlightEdge) {
                if (highlightEdge.type === 'CHAIN') {
                  lineClass = 'stroke-yellow-400 stroke-[5] drop-shadow-[0_0_15px_rgba(253,224,71,0.8)]';
                  lineStyle = { strokeDasharray: '100', animation: 'dash 0.4s linear forwards' };
                }
                else if (highlightEdge.type === 'FULL_MOON') lineClass = 'stroke-yellow-400 stroke-[4] drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
                else if (highlightEdge.type === 'PAIR') lineClass = 'stroke-blue-400 stroke-[4] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]';
              }

              // Calculate positions for decorators
              const x1 = n1.position.x;
              const y1 = n1.position.y;
              const x2 = n2.position.x;
              const y2 = n2.position.y;

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              // Pair decorators (two empty circles) requires calculating a perpendicular offset
              const dx = x2 - x1;
              const dy = y2 - y1;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const dirX = dx / dist; // normalized direction vector
              const dirY = dy / dist;

              // Move along the line slightly from the midpoint for the two circles
              const offsetDist = 1.2; // percentage distance
              const pairX1 = midX - (dirX * offsetDist);
              const pairY1 = midY - (dirY * offsetDist);
              const pairX2 = midX + (dirX * offsetDist);
              const pairY2 = midY + (dirY * offsetDist);

              return (
                <g key={pair}>
                  <line
                    x1={`${x1}%`}
                    y1={`${y1}%`}
                    x2={`${x2}%`}
                    y2={`${y2}%`}
                    className={lineClass}
                    style={lineStyle}
                  />

                  {/* Decorators */}
                  {permanentEdge?.type === 'FULL_MOON' && (
                    <circle
                      cx={`${midX}%`}
                      cy={`${midY}%`}
                      r="7"
                      className="fill-white stroke-yellow-400 stroke-[3] drop-shadow-[0_0_8px_rgba(250,204,21,1)]"
                    />
                  )}
                  {permanentEdge?.type === 'PAIR' && (
                    <>
                      <circle
                        cx={`${pairX1}%`}
                        cy={`${pairY1}%`}
                        r="6"
                        className="fill-transparent stroke-blue-200 stroke-[3] drop-shadow-[0_0_8px_rgba(59,130,246,1)]"
                      />
                      <circle
                        cx={`${pairX2}%`}
                        cy={`${pairY2}%`}
                        r="6"
                        className="fill-transparent stroke-blue-200 stroke-[3] drop-shadow-[0_0_8px_rgba(59,130,246,1)]"
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Node Render Loop */}
          {gameState.layout.nodes.map(node => {
            const isValid = selectedCardId ? isValidPlacement(node.id) : false;
            const isHovered = hoveredNodeId === node.id;

            const nodeHighlights = highlightedNodes.filter(hn => hn.nodeId === node.id).map(hn => hn.type);
            const isChain = nodeHighlights.includes('CHAIN');
            const isFullMoon = nodeHighlights.includes('FULL_MOON');
            const isPair = nodeHighlights.includes('PAIR');

            let ringColor = '';
            if (isChain) ringColor = 'border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)]';
            else if (isFullMoon) ringColor = 'border-yellow-300 shadow-[0_0_30px_rgba(253,224,71,1)]';
            else if (isPair) ringColor = 'border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.8)]';

            const themeStyle = THEME_STYLES[gameState.layout.theme || 'indigo'];

            return (
              <DroppableNode
                key={node.id}
                node={node}
                isValid={isValid}
                isHovered={isHovered}
                onClick={() => handleNodeClick(node.id)}
                onDrop={(cardId) => handleNodeClick(node.id, cardId, false)}
                onDragEnter={() => setHoveredNodeId(node.id)}
                onDragLeave={() => setHoveredNodeId(null)}
              >
                {!node.card && (
                  <div className={`
                       absolute inset-0 rounded-[8px] border-2 transition-all duration-300
                       ${isValid && isHovered ? 'border-green-300 bg-green-400/20 scale-105 border-solid' : isValid ? 'border-green-400 bg-green-500/10 shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-pulse border-solid' : `${themeStyle.nodeBorder} bg-[#141428] border-dashed`}
                     `}>
                    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${themeStyle.nodeDot}`}></div>
                  </div>
                )}

                {node.card && (
                  <div id={`card-wrapper-${node.id}`} className={`absolute inset-0 w-full h-full animate-in zoom-in spin-in-1`}>
                    <MoonCard card={node.card} />
                  </div>
                )}

                {isHovered && isValid && selectedCardId && !node.card && (
                  <div className="absolute inset-0 w-full h-full opacity-40 scale-90 pointer-events-none z-0">
                    <MoonCard card={gameState.playerHand.find(c => c.id === selectedCardId)!} />
                  </div>
                )}

                {ringColor && (
                  <div className={`absolute -inset-2 rounded-2xl border-4 pointer-events-none animate-in zoom-in spin-in-2 ${ringColor} z-20`}></div>
                )}
              </DroppableNode>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: PLAYER AREA */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-6">

        {/* Player Hand */}
        <div className="flex gap-6 justify-center z-20">
          {gameState.playerHand.map((card, index) => {
            const isSelected = selectedCardId === card.id;
            return (
              <DraggableCard
                key={card.id}
                card={card}
                isSelected={isSelected}
                onClick={() => {
                  if (gameState.currentTurn === 'player') {
                    setSelectedCardId(isSelected ? null : card.id);
                  }
                }}
                onDragStart={() => setSelectedCardId(card.id)}
                onDragEnd={() => setSelectedCardId(null)}
                disabled={gameState.currentTurn !== 'player'}
              />
            )
          })}
        </div>

        <div className="w-full flex justify-between items-center px-8 py-4 bg-gradient-to-r from-blue-950/30 to-black/60 border border-indigo-500/20 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden">
          <div className="flex flex-col">
            <div className="text-2xl font-black tracking-widest text-indigo-400 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)] z-10">YOU</div>
          </div>
          <div className="flex flex-col items-end justify-center z-10">
            <span className="text-2xl font-mono text-gray-200 font-bold">{gameState.playerScore} PTS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
