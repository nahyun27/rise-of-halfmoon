"use client";

import React, { useState, useEffect, useRef } from 'react';
import { MotionConfig, AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MoonCard } from "../components/MoonCard";
import { MoonPhase } from "../components/MoonPhase";
import { MoonCard as MoonCardType, GameState, GamePhase } from "../types/game";
import { evaluateGraphPlacement, ScoringEvent } from "../utils/scoring";
import { aiTurn } from "../utils/ai";
import { LEVEL_LAYOUTS } from "../constants/layouts";
import { BOARD_THEMES, ScoreType } from "../constants/theme";
import { TutorialOverlay } from "../components/TutorialOverlay";
import { LevelIntro } from "../components/LevelIntro";
import { StartScreen } from "../components/StartScreen";
import { CosmicBackground } from "../components/ui/CosmicBackground";
import { Board, HighlightEdge, HighlightNode, ScorePopupData } from "../components/game/Board";
import { HandCard } from "../components/game/HandCard";
import { PlayerPanel } from "../components/game/PlayerPanel";
import { TopBar } from "../components/game/TopBar";
import { Announcements } from "../components/game/Announcements";
import { PauseMenu } from "../components/game/PauseMenu";
import { CampaignSummary, DailySummary, GameOutcome, ResultScreen } from "../components/game/ResultScreen";
import { useBackgroundMusic } from "../hooks/useBackgroundMusic";
import {
  buildShareText,
  emptyRecords,
  EMPTY_STATS,
  GameStats,
  getDailyKey,
  getDailyNumber,
  getDailyStreak,
  loadRecords,
  recordCampaignGame,
  recordDailyGame,
  Records,
  saveRecords,
  starThresholds,
} from "../utils/records";
import { hashString, mulberry32, Rng } from "../utils/random";
import {
  playChainSound,
  playCompletionSound,
  playDrawSound,
  playFullMoonSound,
  playGameOverSound,
  playMultipleChainSound,
  playPairSound,
  playSelectSound,
} from "../utils/sounds";

type HighlightType = ScoreType;

const generateDeck = (size: number, owner: 'player' | 'opponent', rng: Rng = Math.random): MoonCardType[] => {
  return Array(size).fill(null).map((_, i) => ({
    id: `${owner}-deck-${Date.now()}-${i}-${Math.random()}`,
    phase: Math.floor(rng() * 8),
    owner
  }));
};

type GameMode = 'campaign' | 'daily';

// Each day's challenge cycles through the level boards
const dailyLayoutIndex = (dailyNumber: number) =>
  (((dailyNumber - 1) % LEVEL_LAYOUTS.length) + LEVEL_LAYOUTS.length) % LEVEL_LAYOUTS.length;

const needsTutorial = () => {
  const seenTut = localStorage.getItem('halfmoon_hasSeenTutorial');
  return !seenTut || seenTut === 'false';
};

const INITIAL_DECK_SIZE = 30; // 3 in hand, 27 in draw pile.

const OUTCOME_BY_PHASE: Partial<Record<GamePhase, GameOutcome>> = {
  levelWin: 'win',
  gameOver: 'lose',
  draw: 'draw',
};

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [bestLevelReached, setBestLevelReached] = useState(1);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

  const { isMuted, toggleMute } = useBackgroundMusic();

  const [mode, setMode] = useState<GameMode>('campaign');
  const [records, setRecords] = useState<Records>(emptyRecords);
  // Date of the daily challenge currently being played
  const [dailyKey, setDailyKey] = useState<string | null>(null);
  const [resultSummary, setResultSummary] = useState<{ stats: GameStats, campaign?: CampaignSummary, daily?: DailySummary } | null>(null);
  // The player's scoring this game; a ref because it only matters once the game ends
  const statsRef = useRef<GameStats>({ ...EMPTY_STATS });

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
  const [isAnimating, setIsAnimating] = useState(false);
  // A tapped card flying from the hand to its slot; dragged cards skip this
  const [playerPlay, setPlayerPlay] = useState<{ cardId: string, x: number, y: number, scale: number } | null>(null);
  const prefersReducedMotion = useReducedMotion();

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
    setRecords(loadRecords());

    resetGameToLevel(startLvl, 'start');
  }, []);

  const resetGameToLevel = (levelIndex: number, phase: GamePhase, options: { mode?: GameMode, rng?: Rng } = {}) => {
    const pDeck = generateDeck(INITIAL_DECK_SIZE, 'player', options.rng);
    const oDeck = generateDeck(INITIAL_DECK_SIZE, 'opponent', options.rng);
    setMode(options.mode ?? 'campaign');
    statsRef.current = { ...EMPTY_STATS };
    setResultSummary(null);
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
    setHighlightedNodes([]);
    setHighlightedEdges([]);
    setSelectedCardId(null);
  };

  const isBoardEmpty = gameState.layout.nodes.every(node => node.card === null);
  const isGameOver = gameState.playerHand.length === 0 || gameState.layout.nodes.every(node => node.card !== null);

  useEffect(() => {
    if (gameState.phase === 'playing' && isGameOver && !isAnimating) {
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
          playPairSound();
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
          playFullMoonSound();
          currentPlayerScore += 1;
          setGameState(prev => ({ ...prev, playerScore: prev.playerScore + 1 }));
          await delay(300);
          setHighlightedNodes(prev => prev.filter(n => n.nodeId !== node.id));
        }

        await delay(1500);

        // 4. Decide Winner
        const outcome: GameOutcome = currentPlayerScore > currentOpponentScore ? 'win' : currentPlayerScore < currentOpponentScore ? 'lose' : 'draw';
        if (outcome === 'draw') playDrawSound();
        else playGameOverSound(outcome);

        // 5. Save records
        const stats = { ...statsRef.current };
        if (mode === 'daily' && dailyKey) {
          const result = { outcome, playerScore: currentPlayerScore, opponentScore: currentOpponentScore, stats };
          const next = recordDailyGame(records, dailyKey, result);
          setRecords(next);
          saveRecords(next);
          const number = getDailyNumber(dailyKey);
          const shareText = buildShareText(number, next.daily[dailyKey] ?? result, getDailyStreak(next, dailyKey), window.location.origin);
          setResultSummary({ stats, daily: { number, shareText } });
        } else {
          const { layout } = gameState;
          const res = recordCampaignGame(records, layout.levelNumber, layout.nodes.length, outcome, currentPlayerScore, currentOpponentScore, stats);
          setRecords(res.records);
          saveRecords(res.records);
          setResultSummary({
            stats,
            campaign: { stars: res.stars, previousStars: res.previousStars, targets: starThresholds(layout.nodes.length), isNewBestScore: res.isNewBestScore },
          });
          if (outcome === 'win') {
            const nextBest = Math.max(bestLevelReached, currentLevelIndex + 2);
            setBestLevelReached(nextBest);
            localStorage.setItem('halfmoon_bestLevel', nextBest.toString());
          }
        }

        setGameState(prev => ({ ...prev, phase: outcome === 'win' ? 'levelWin' : outcome === 'lose' ? 'gameOver' : 'draw' }));
      };

      renderCounting();
    }
  }, [isGameOver, isAnimating, gameState.phase, gameState.playerScore, gameState.opponentScore, currentLevelIndex, bestLevelReached, mode, dailyKey, records]);

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

  const handleRetryLevel = () => {
    resetGameToLevel(currentLevelIndex, 'playing');
  };

  const startGame = () => {
    resetGameToLevel(currentLevelIndex, needsTutorial() ? 'tutorial' : 'levelIntro');
  };

  // Replay any unlocked level, e.g. to earn more stars
  const selectLevel = (levelIndex: number) => {
    setCurrentLevelIndex(levelIndex);
    localStorage.setItem('halfmoon_currentLevel', levelIndex.toString());
    resetGameToLevel(levelIndex, needsTutorial() ? 'tutorial' : 'levelIntro');
  };

  const todayKey = getDailyKey();
  const todayDailyNumber = getDailyNumber(todayKey);

  const startDaily = () => {
    if (records.daily[todayKey]) return;
    setDailyKey(todayKey);
    // Everyone gets the same decks today
    resetGameToLevel(dailyLayoutIndex(todayDailyNumber), needsTutorial() ? 'tutorial' : 'levelIntro', {
      mode: 'daily',
      rng: mulberry32(hashString(`daily:${todayKey}`)),
    });
  };

  const openTutorial = () => {
    setGameState(prev => ({ ...prev, phase: 'tutorial' }));
  };

  // Going to the menu keeps whatever progress the result earned
  const handleMenuFromResult = (outcome: GameOutcome) => {
    if (mode === 'daily') {
      resetGameToLevel(currentLevelIndex, 'start');
      return;
    }
    let levelIndex = currentLevelIndex;
    if (outcome === 'win') levelIndex = currentLevelIndex + 1 < LEVEL_LAYOUTS.length ? currentLevelIndex + 1 : 0;
    else if (outcome === 'lose') levelIndex = 0;
    setCurrentLevelIndex(levelIndex);
    localStorage.setItem('halfmoon_currentLevel', levelIndex.toString());
    resetGameToLevel(levelIndex, 'start');
  };

  const finishTutorial = () => {
    localStorage.setItem('halfmoon_hasSeenTutorial', 'true');
    // Opened mid-game from the pause menu: go straight back to the board
    setGameState(prev => ({ ...prev, phase: isBoardEmpty ? 'levelIntro' : 'playing' }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (selectedCardId) setSelectedCardId(null);
      else if (gameState.phase === 'playing') setIsPaused(prev => !prev);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCardId, gameState.phase]);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  useEffect(() => {
    // Wait for the previous move's scoring to settle so the AI sees the up-to-date board
    if (gameState.phase === 'playing' && gameState.currentTurn === 'opponent' && !isGameOver && !isAnimating && aiActionState.phase === 'idle') {
      const executeAiTurn = async () => {
        setAiActionState({ phase: 'thinking', cardId: null, targetNodeId: null });
        await delay(800);

        const difficulty = mode === 'daily' ? 2 : Math.min(currentLevelIndex, 2);
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
  }, [gameState.phase, gameState.currentTurn, isGameOver, isAnimating, aiActionState.phase, currentLevelIndex, mode]);

  const isValidPlacement = (nodeId: string) => {
    const node = gameState.layout.nodes.find(n => n.id === nodeId);
    if (!node || node.card !== null) return false;
    return true; // Any empty node is valid in the new rules
  };

  const handleNodeClick = (nodeId: string, overrideCardId?: string, isAiTurn: boolean = false) => {
    if (!isAiTurn && (gameState.currentTurn !== 'player' || isAnimating)) return;

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

    if (!isAiTurn) {
      const stats = statsRef.current;
      for (const event of events) {
        if (event.type === 'PAIR') stats.pairs++;
        else if (event.type === 'FULL_MOON') stats.fullMoons++;
        else {
          stats.cycles++;
          stats.longestCycle = Math.max(stats.longestCycle, event.nodeIds.length);
          const stealsCards = event.nodeIds.some(id => newNodes.find(n => n.id === id)?.card?.scoredBy === 'opponent');
          if (stealsCards) stats.steals++;
        }
      }
    }

    const chainEvents = events.filter(e => e.type === 'CHAIN');
    const fullMoonEvents = events.filter(e => e.type === 'FULL_MOON');
    const pairEvents = events.filter(e => e.type === 'PAIR');

    const newHand = [...handToUse];
    const newDrawPile = [...drawPileToUse];
    newHand.splice(selectedCardIndex, 1);
    if (newDrawPile.length > 0) newHand.push(newDrawPile.shift()!);

    // Apply immediate game state (board + hands)
    setGameState(prev => ({
      ...prev,
      layout: { ...prev.layout, nodes: newNodes },
      playerHand: isAiTurn ? prev.playerHand : newHand,
      playerDrawPile: isAiTurn ? prev.playerDrawPile : newDrawPile,
      opponentHand: isAiTurn ? newHand : prev.opponentHand,
      opponentDrawPile: isAiTurn ? newDrawPile : prev.opponentDrawPile,
      currentTurn: isAiTurn ? 'player' : 'opponent'
    }));

    if (!isAiTurn) {
      setSelectedCardId(null);
      setHoveredNodeId(null);
    }

    setIsAnimating(true);
    const runAnimations = async () => {
      let currentNodes = [...newNodes];
      const currentScoredEdges = [...(gameState.layout.scoredEdges || [])];

      const processEventGroup = async (evtGroup: ScoringEvent[], type: HighlightType) => {
        if (evtGroup.length === 0) return;

        let addedPlayerScore = 0;
        let addedOpponentScore = 0;
        const newPopups: ScorePopupData[] = [];
        const newHighlightNodes: HighlightNode[] = [];
        const newHighlightEdges: HighlightEdge[] = [];

        evtGroup.forEach(event => {
          if (event.owner === 'player') addedPlayerScore += event.points;
          else if (event.owner === 'opponent') addedOpponentScore += event.points;

          event.nodeIds.forEach(id => {
            currentNodes = currentNodes.map(n => {
              if (n.id === id && n.card) {
                return { ...n, card: { ...n.card, scoredBy: event.owner, owner: type === 'CHAIN' ? newOwner : n.card.owner } };
              }
              return n;
            });
          });

          if (type === 'CHAIN') {
            for (let j = 0; j < event.nodeIds.length - 1; j++) {
              currentScoredEdges.push({ id1: event.nodeIds[j], id2: event.nodeIds[j + 1], type: 'CHAIN' });
            }
          } else {
            currentScoredEdges.push({ id1: event.nodeIds[0], id2: event.nodeIds[1], type });
          }

          if (type === 'PAIR') {
            playPairSound();
            event.nodeIds.forEach(id => {
              const nodeEl = document.getElementById(`node-${id}`);
              if (nodeEl) {
                nodeEl.animate([
                  { transform: 'scale(1)', boxShadow: '0 0 0px rgba(59,130,246,0)', borderColor: 'transparent', zIndex: 10 },
                  { transform: 'scale(1.05)', boxShadow: '0 0 25px rgba(59,130,246,1)', borderColor: '#3b82f6', zIndex: 50 },
                  { transform: 'scale(1)', boxShadow: '0 0 10px rgba(59,130,246,0.5)', borderColor: '#3b82f6', zIndex: 10 }
                ], { duration: 400, easing: 'ease-out' });
              }
            });
          } else if (type === 'FULL_MOON') {
            playFullMoonSound();
            event.nodeIds.forEach((id, idx) => {
              setTimeout(() => {
                const nodeEl = document.getElementById(`node-${id}`);
                if (nodeEl) {
                  nodeEl.animate([
                    { transform: 'scale(1) rotate(0deg)', boxShadow: '0 0 0px rgba(250,204,21,0)', filter: 'brightness(1)', zIndex: 10 },
                    { transform: 'scale(1.05) rotate(5deg)', boxShadow: '0 0 35px rgba(250,204,21,1)', filter: 'brightness(1.5)', zIndex: 50 },
                    { transform: 'scale(1.02) rotate(0deg)', boxShadow: '0 0 20px rgba(250,204,21,0.8)', filter: 'brightness(1.2)', zIndex: 30 }
                  ], { duration: 500, easing: 'ease-out' });
                }
              }, idx * 100);
            });
          }

          event.nodeIds.forEach(id => newHighlightNodes.push({ nodeId: id, type }));
          if (type !== 'CHAIN') {
            newHighlightEdges.push({ id1: event.nodeIds[0], id2: event.nodeIds[1], type });
          }
          newPopups.push({ id: `popup-${Date.now()}-${Math.random()}`, points: event.points, type, nodeId: nodeId, owner: event.owner });
        });

        setGameState(prev => ({
          ...prev,
          layout: { ...prev.layout, nodes: currentNodes, scoredEdges: currentScoredEdges },
          playerScore: prev.playerScore + addedPlayerScore,
          opponentScore: prev.opponentScore + addedOpponentScore
        }));

        setHighlightedNodes(prev => [...prev, ...newHighlightNodes]);
        if (type !== 'CHAIN') setHighlightedEdges(prev => [...prev, ...newHighlightEdges]);
        setScorePopups(prev => [...prev, ...newPopups]);

        if (type === 'FULL_MOON') await delay(1000);
        else if (type === 'PAIR') await delay(800);

        setHighlightedNodes(prev => prev.filter(n => !newHighlightNodes.find(nn => nn.nodeId === n.nodeId)));
        setHighlightedEdges(prev => prev.filter(e => !newHighlightEdges.find(ne => ne.id1 === e.id1 && ne.id2 === e.id2)));
        setTimeout(() => {
          setScorePopups(prev => prev.filter(p => !newPopups.find(np => np.id === p.id)));
        }, 1000);
      };

      await processEventGroup(pairEvents, 'PAIR');
      await processEventGroup(fullMoonEvents, 'FULL_MOON');

      if (chainEvents.length > 0) {
        let totalChainPoints = 0;

        for (let evIndex = 0; evIndex < chainEvents.length; evIndex++) {
          const chainEv = chainEvents[evIndex];
          const cLength = chainEv.nodeIds.length;
          totalChainPoints += chainEv.points;

          if (chainEvents.length > 1) {
            const popupId = `chain-label-${Date.now()}-${evIndex}`;
            setChainPopups(prev => [...prev, { id: popupId, text: `CHAIN ${evIndex + 1} OF ${chainEvents.length}` }]);
            setTimeout(() => {
              setChainPopups(prev => prev.filter(p => p.id !== popupId));
            }, 1500);
          }

          const startIndex = chainEv.nodeIds.indexOf(nodeId) !== -1 ? chainEv.nodeIds.indexOf(nodeId) : 0;
          let localMaxDist = 0;
          chainEv.nodeIds.forEach((id, i) => {
            const d = Math.abs(i - startIndex);
            if (d > localMaxDist) localMaxDist = d;
          });

          const chainDuration = localMaxDist * 400 + 400;

          chainEv.nodeIds.forEach((id, i) => {
            const distFromPlaced = Math.abs(i - startIndex);
            const distance = localMaxDist - distFromPlaced;

            setTimeout(() => {
              playChainSound(distance);
              setHighlightedNodes(prev => [...prev, { nodeId: id, type: 'CHAIN' }]);

              const nodeEl = document.getElementById(`node-${id}`);
              if (nodeEl) {
                const isPlaced = id === nodeId;
                const glow = nodeEl.animate([
                  { transform: 'scale(1)', boxShadow: '0 0 0px rgba(168,85,247,0)', borderColor: 'transparent', zIndex: 10 },
                  { transform: `scale(${isPlaced ? 1.05 : 1.05})`, boxShadow: `0 0 ${isPlaced ? '40px' : '30px'} rgba(168,85,247,1)`, borderColor: '#a855f7', zIndex: 50 },
                  { transform: `scale(${isPlaced ? 1.02 : 1.02})`, boxShadow: `0 0 ${isPlaced ? '25px' : '20px'} rgba(168,85,247,0.8)`, borderColor: '#a855f7', zIndex: 30 }
                ], {
                  duration: 600,
                  easing: 'ease-out',
                  fill: 'forwards'
                });

                // Hold the glow while the cycle is highlighted, then drop it. A forwards-filled
                // animation outlives inline style changes, so it has to be cancelled.
                setTimeout(() => glow.cancel(), 2600);
              }

              if (i < cLength - 1) {
                setHighlightedEdges(prev => [...prev, { id1: id, id2: chainEv.nodeIds[i + 1], type: 'CHAIN' }]);
              }
            }, distance * 400);
          });

          setTimeout(() => {
            playCompletionSound();
            const popupId = `popup-${Date.now()}-${evIndex}`;
            setScorePopups(prev => [...prev, { id: popupId, points: chainEv.points, type: 'CHAIN', nodeId: nodeId, owner: chainEv.owner }]);

            currentNodes = currentNodes.map(n => {
              if (chainEv.nodeIds.includes(n.id) && n.card) {
                return { ...n, card: { ...n.card, scoredBy: chainEv.owner, owner: newOwner } };
              }
              return n;
            });
            for (let j = 0; j < chainEv.nodeIds.length - 1; j++) {
              currentScoredEdges.push({ id1: chainEv.nodeIds[j], id2: chainEv.nodeIds[j + 1], type: 'CHAIN' });
            }

            setGameState(prev => ({
              ...prev,
              layout: { ...prev.layout, nodes: currentNodes, scoredEdges: currentScoredEdges },
              playerScore: chainEv.owner === 'player' ? prev.playerScore + chainEv.points : prev.playerScore,
              opponentScore: chainEv.owner === 'opponent' ? prev.opponentScore + chainEv.points : prev.opponentScore
            }));

            setTimeout(() => {
              setScorePopups(prev => prev.filter(p => p.id !== popupId));
            }, 2000);
          }, chainDuration);

          setTimeout(() => {
            setHighlightedNodes(prev => prev.filter(n => !chainEv.nodeIds.includes(n.nodeId)));
            setHighlightedEdges(prev => prev.filter(e => e.type !== 'CHAIN'));
          }, chainDuration + 2000);

          await delay(chainDuration + 800);
        }

        if (chainEvents.length > 1) {
          setMultipleChainsPopup({ count: chainEvents.length, points: totalChainPoints });
          playMultipleChainSound();
          setTimeout(() => {
            setMultipleChainsPopup(null);
          }, 3000);
          await delay(1500);
        }
      }
      setIsAnimating(false);
    };

    runAnimations();
  };

  // Saved progress lives in localStorage, so the real screens wait for the client. Until then
  // (and in the server HTML search engines read) show a splash with the game's name and pitch.
  if (!hasMounted) {
    return (
      <>
        <CosmicBackground />
        <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
          <div className="size-24 mb-8 animate-float">
            <MoonPhase phase={2} />
          </div>
          <h1 className="font-display font-black leading-none">
            <span className="block text-sm tracking-[0.5em] text-ink-muted pl-[0.5em]">RISE OF THE</span>
            <span className="block mt-3 text-5xl tracking-[0.08em] text-moon">HALF MOON</span>
          </h1>
          <p className="mt-5 max-w-md text-sm text-ink-muted leading-relaxed">
            A moon phase card game. Match phases, form full moons and build lunar cycles to outscore the Half Moon.
          </p>
        </main>
      </>
    );
  }

  // --------------------------------------------------------------------------
  // SCREENS
  // --------------------------------------------------------------------------

  const layout = gameState.layout;
  const isDaily = mode === 'daily';
  const playingDailyNumber = dailyKey ? getDailyNumber(dailyKey) : todayDailyNumber;
  const levelLabel = isDaily ? layout.name : `Level ${layout.levelNumber} · ${layout.name}`;
  const levelEyebrow = isDaily ? `Daily #${playingDailyNumber}` : `Level ${layout.levelNumber}`;
  const theme = BOARD_THEMES[layout.theme || 'indigo'];
  const outcome = OUTCOME_BY_PHASE[gameState.phase];
  const selectedCard = gameState.playerHand.find(c => c.id === selectedCardId) ?? null;
  const isPlayerTurn = gameState.phase === 'playing' && gameState.currentTurn === 'player' && !isAnimating;

  // Tap-to-place: fly the selected card onto the slot like the AI's cards do, then place it
  const placeSelectedCard = (nodeId: string) => {
    const cardId = selectedCardId;
    if (!cardId || playerPlay || !isPlayerTurn || !isValidPlacement(nodeId)) return;
    const cardEl = document.getElementById(`hand-card-${cardId}`);
    const nodeEl = document.getElementById(`node-${nodeId}`);
    if (prefersReducedMotion || !cardEl || !nodeEl) {
      handleNodeClick(nodeId, cardId);
      return;
    }
    const from = cardEl.getBoundingClientRect();
    const to = nodeEl.getBoundingClientRect();
    setHoveredNodeId(null);
    setPlayerPlay({ cardId, x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width });
    setTimeout(() => {
      handleNodeClick(nodeId, cardId);
      setPlayerPlay(null);
    }, 450);
  };

  let playerStatus = `${gameState.playerDrawPile.length} in deck`;
  if (gameState.phase === 'endGameCounting') playerStatus = 'Counting the board…';
  else if (isPlayerTurn) playerStatus = selectedCard ? 'Place it on the star map' : 'Your turn · pick a card';

  const opponentThinking = gameState.phase === 'playing' && gameState.currentTurn === 'opponent';
  const opponentStatus = opponentThinking ? 'Thinking…' : `${gameState.opponentDrawPile.length} in deck`;

  let screen: React.ReactNode;

  if (gameState.phase === 'start') {
    screen = (
      <StartScreen
        onStartGame={startGame}
        onShowTutorial={openTutorial}
        onSelectLevel={selectLevel}
        onPlayDaily={startDaily}
        currentLevel={currentLevelIndex + 1}
        bestLevel={bestLevelReached}
        records={records}
        daily={{
          key: todayKey,
          number: todayDailyNumber,
          boardName: LEVEL_LAYOUTS[dailyLayoutIndex(todayDailyNumber)].name,
          result: records.daily[todayKey],
          streak: getDailyStreak(records, todayKey),
          shareText: records.daily[todayKey]
            ? buildShareText(todayDailyNumber, records.daily[todayKey], getDailyStreak(records, todayKey), window.location.origin)
            : null,
        }}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    );
  } else if (gameState.phase === 'levelIntro') {
    screen = (
      <LevelIntro
        levelNumber={layout.levelNumber}
        levelName={layout.name}
        eyebrow={levelEyebrow}
        onComplete={() => setGameState(prev => ({ ...prev, phase: 'playing' }))}
      />
    );
  } else {
    screen = (
      <main className="relative flex h-dvh w-full flex-col items-center overflow-hidden px-3 sm:px-6 pt-[max(12px,env(safe-area-inset-top))] pb-[max(12px,env(safe-area-inset-bottom))] sm:pt-5 sm:pb-5">
        <div className="w-full max-w-3xl shrink-0 z-30">
          <TopBar
            eyebrow={levelEyebrow}
            levelName={layout.name}
            isMuted={isMuted}
            onPause={() => setIsPaused(true)}
            onToggleMute={toggleMute}
          />
        </div>

        <div className="game-stage w-full max-w-3xl flex-1 min-h-0 mt-3 sm:mt-4 flex flex-col items-center justify-center gap-3 sm:gap-5">
          <PlayerPanel className="z-50" side="opponent" name="HALF MOON" score={gameState.opponentScore} status={opponentStatus} isActive={opponentThinking}>
            {gameState.opponentHand.map(card => {
              const isActing = aiActionState.cardId === card.id;
              const aiCardPlayVariants = {
                initial: { scale: 1, y: 0, x: 0 },
                highlight: { scale: 1.12, y: 4, transition: { duration: 0.3 } },
                play: { scale: 1.0, x: aiPlayOffset.x, y: aiPlayOffset.y, transition: { duration: 0.5, ease: "easeInOut" as const } }
              };

              return (
                <motion.div
                  id={`ai-card-${card.id}`}
                  key={card.id}
                  className="rounded-[22%] pointer-events-none"
                  style={{ zIndex: isActing ? 50 : 20, boxShadow: isActing ? '0 0 24px rgba(255,122,144,0.6)' : undefined }}
                  variants={aiCardPlayVariants}
                  initial="initial"
                  animate={isActing && aiActionState.phase === 'highlight' ? 'highlight' : isActing && aiActionState.phase === 'play' ? ['highlight', 'play'] : 'initial'}
                >
                  <MoonCard card={card} isFaceDown className="size-[calc(var(--card)*0.8)]" />
                </motion.div>
              );
            })}
          </PlayerPanel>

          <Board
            layout={layout}
            selectedCard={playerPlay ? null : selectedCard}
            hoveredNodeId={hoveredNodeId}
            highlightedNodes={highlightedNodes}
            highlightedEdges={highlightedEdges}
            scorePopups={scorePopups}
            isValidPlacement={isValidPlacement}
            onNodeClick={placeSelectedCard}
            onNodeDrop={(nodeId, cardId) => handleNodeClick(nodeId, cardId, false)}
            onNodeHover={setHoveredNodeId}
          />

          <PlayerPanel className={playerPlay ? 'z-[60]' : 'z-30'} side="player" name="YOU" score={gameState.playerScore} status={playerStatus} isActive={isPlayerTurn}>
            {gameState.playerHand.map(card => {
              const isSelected = selectedCardId === card.id;
              return (
                <HandCard
                  key={card.id}
                  card={card}
                  isSelected={isSelected}
                  onClick={() => {
                    if (isPlayerTurn && !playerPlay) {
                      if (!isSelected) playSelectSound();
                      setSelectedCardId(isSelected ? null : card.id);
                    }
                  }}
                  onDragStart={() => setSelectedCardId(card.id)}
                  onDragEnd={() => setSelectedCardId(null)}
                  disabled={!isPlayerTurn}
                  flyTo={playerPlay?.cardId === card.id ? playerPlay : null}
                />
              );
            })}
          </PlayerPanel>
        </div>

        <Announcements
          chainLabels={chainPopups}
          multipleChains={multipleChainsPopup}
          isCounting={gameState.phase === 'endGameCounting'}
        />

        <AnimatePresence>
          {gameState.phase === 'tutorial' && <TutorialOverlay key="tutorial" onClose={finishTutorial} />}

          {isPaused && (
            <PauseMenu
              key="pause"
              levelLabel={isDaily ? `${levelEyebrow} · ${layout.name}` : levelLabel}
              playerScore={gameState.playerScore}
              opponentScore={gameState.opponentScore}
              onResume={() => setIsPaused(false)}
              onOpenTutorial={() => {
                setIsPaused(false);
                setGameState(prev => ({ ...prev, phase: 'tutorial' }));
              }}
              onExit={() => {
                setIsPaused(false);
                resetGameToLevel(currentLevelIndex, 'start');
              }}
            />
          )}

          {outcome && resultSummary && (
            <ResultScreen
              key="result"
              outcome={outcome}
              stats={resultSummary.stats}
              campaign={resultSummary.campaign}
              daily={resultSummary.daily}
              levelLabel={levelLabel}
              playerScore={gameState.playerScore}
              opponentScore={gameState.opponentScore}
              hasNextLevel={currentLevelIndex + 1 < LEVEL_LAYOUTS.length}
              onNextLevel={handleNextLevel}
              onRetryLevel={handleRetryLevel}
              onRestart={handleRetryGame}
              onMenu={() => handleMenuFromResult(outcome)}
            />
          )}
        </AnimatePresence>
      </main>
    );
  }

  const inGame = gameState.phase !== 'start';
  return (
    <MotionConfig reducedMotion="user">
      <CosmicBackground glow={inGame ? theme.glow : undefined} glow2={inGame ? theme.glow2 : undefined} />
      {screen}
    </MotionConfig>
  );
}
