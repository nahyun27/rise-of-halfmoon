const fs = require('fs');
const path = require('path');

const pageContent = `"use client";

import React, { useState, useEffect } from 'react';
import { MoonCard } from "../components/MoonCard";
import { MoonCard as MoonCardType, GameState, BoardNode, GamePhase } from "../types/game";
import { evaluateGraphPlacement, ScoringEvent } from "../utils/scoring";
import { aiTurn } from "../utils/ai";
import { LEVEL_LAYOUTS } from "../constants/layouts";
import { TutorialOverlay } from "../components/TutorialOverlay";

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
}

const generateDeck = (size: number, owner: 'player' | 'opponent'): MoonCardType[] => {
  return Array(size).fill(null).map((_, i) => ({
    id: \`\${owner}-deck-\${Date.now()}-\${i}-\${Math.random()}\`,
    phase: Math.floor(Math.random() * 8),
    owner
  }));
};

const INITIAL_DECK_SIZE = 30; // 3 in hand, 27 in draw pile.

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [bestLevelReached, setBestLevelReached] = useState(1);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);

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
  const [isOpponentThinking, setIsOpponentThinking] = useState(false);

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
      const pScore = gameState.playerScore;
      const oScore = gameState.opponentScore;

      const timer = setTimeout(() => {
        if (pScore > oScore) {
          // Win
          const nextLvl = currentLevelIndex + 1;
          const nextBest = Math.max(bestLevelReached, nextLvl + 1);
          setBestLevelReached(nextBest);
          localStorage.setItem('halfmoon_bestLevel', nextBest.toString());
          setGameState(prev => ({ ...prev, phase: 'levelWin' }));
        } else {
          // Loss
          setGameState(prev => ({ ...prev, phase: 'gameOver' }));
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isGameOver, gameState.phase, gameState.playerScore, gameState.opponentScore, currentLevelIndex, bestLevelReached]);

  const handleNextLevel = () => {
    const next = currentLevelIndex + 1;
    if (next < LEVEL_LAYOUTS.length) {
      setCurrentLevelIndex(next);
      localStorage.setItem('halfmoon_currentLevel', next.toString());
      resetGameToLevel(next, 'playing');
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
    resetGameToLevel(0, 'playing');
  };

  const startGame = () => {
    const seenTut = localStorage.getItem('halfmoon_hasSeenTutorial');
    if (!seenTut || seenTut === 'false') {
      setGameState(prev => ({ ...prev, phase: 'tutorial' }));
    } else {
      setGameState(prev => ({ ...prev, phase: 'playing' }));
    }
  };

  const openTutorial = () => {
    setGameState(prev => ({ ...prev, phase: 'tutorial' }));
  };

  const finishTutorial = () => {
    localStorage.setItem('halfmoon_hasSeenTutorial', 'true');
    setGameState(prev => ({ ...prev, phase: 'playing' }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCardId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (gameState.phase === 'playing' && gameState.currentTurn === 'opponent' && !isGameOver) {
      setIsOpponentThinking(true);
      const timer = setTimeout(() => {
        const difficulty = currentLevelIndex > 2 ? 2 : currentLevelIndex;
        const move = aiTurn(gameState, difficulty);
        if (move) {
          handleNodeClick(move.nodeId, move.cardId, true);
        } else {
          setGameState(prev => ({ ...prev, currentTurn: 'player' }));
        }
        setIsOpponentThinking(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.phase, gameState.currentTurn, isGameOver, currentLevelIndex]);

  const isValidPlacement = (nodeId: string) => {
    const node = gameState.layout.nodes.find(n => n.id === nodeId);
    if (!node || node.card !== null) return false;
    if (isBoardEmpty) return true;

    for (const neighborId of node.connectedTo) {
      const neighbor = gameState.layout.nodes.find(n => n.id === neighborId);
      if (neighbor && neighbor.card !== null) return true;
    }
    return false;
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
      n.id === nodeId ? { ...n, card: { ...card, owner: newOwner as 'player' | 'opponent' } } : { ...n }
    );

    const events = evaluateGraphPlacement(newNodes, nodeId);
    let addedPlayerScore = 0;
    let addedOpponentScore = 0;

    const newPopups: ScorePopupData[] = [];
    const newHighlightNodes: HighlightNode[] = [];
    const newHighlightEdges: HighlightEdge[] = [];

    events.forEach((event, i) => {
      if (event.owner === 'player') addedPlayerScore += event.points;
      else if (event.owner === 'opponent') addedOpponentScore += event.points;

      if (event.type === 'CHAIN') {
        event.nodeIds.forEach(id => {
          const targetNode = newNodes.find(n => n.id === id);
          if (targetNode && targetNode.card) {
            targetNode.card.owner = newOwner;
          }
        });
      }

      event.nodeIds.forEach(id => {
        newHighlightNodes.push({ nodeId: id, type: event.type as HighlightType });
      });

      if (event.type === 'CHAIN') {
        for (let j = 0; j < event.nodeIds.length - 1; j++) {
          newHighlightEdges.push({ id1: event.nodeIds[j], id2: event.nodeIds[j + 1], type: 'CHAIN' });
        }
      } else {
        newHighlightEdges.push({ id1: event.nodeIds[0], id2: event.nodeIds[1], type: event.type as HighlightType });
      }

      newPopups.push({
        id: \`popup-\${Date.now()}-\${i}\`,
        points: event.points,
        type: event.type as HighlightType,
        nodeId: nodeId
      });
    });

    const newHand = [...handToUse];
    const newDrawPile = [...drawPileToUse];
    
    newHand.splice(selectedCardIndex, 1);
    
    if (newDrawPile.length > 0) {
      newHand.push(newDrawPile.shift()!);
    }

    setGameState(prev => ({
      ...prev,
      layout: { ...prev.layout, nodes: newNodes },
      playerHand: isAiTurn ? prev.playerHand : newHand,
      playerDrawPile: isAiTurn ? prev.playerDrawPile : newDrawPile,
      opponentHand: isAiTurn ? newHand : prev.opponentHand,
      opponentDrawPile: isAiTurn ? newDrawPile : prev.opponentDrawPile,
      playerScore: prev.playerScore + addedPlayerScore,
      opponentScore: prev.opponentScore + addedOpponentScore,
      currentTurn: isAiTurn ? 'player' : 'opponent'
    }));

    if (!isAiTurn) {
      setSelectedCardId(null);
      setHoveredNodeId(null);
    }

    if (newPopups.length > 0) {
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

  if (gameState.phase === 'start') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-[#0a0a1a] text-white selection:bg-indigo-500/30">
        <div className="border border-indigo-500/30 rounded-3xl p-12 bg-indigo-950/20 shadow-[0_0_50px_rgba(49,46,129,0.5)] backdrop-blur-sm max-w-lg w-full flex flex-col items-center gap-8">
           <h1 className="text-4xl font-black tracking-widest text-center text-indigo-300 drop-shadow-[0_0_10px_rgba(165,180,252,0.8)] flex items-center gap-4 uppercase">
              🌙 Rise of the<br/>Half Moon
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

      {/* TOP: OPPONENT AREA */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-4">
         <div className="w-full flex justify-between items-center px-8 py-3 bg-gradient-to-r from-red-950/30 to-black/60 border border-red-500/20 rounded-2xl shadow-[0_0_20px_rgba(220,38,38,0.05)] relative overflow-hidden">
             <div className="text-xl font-bold tracking-widest text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)] z-10 w-32">OPPONENT</div>
             
             {isOpponentThinking && (
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

             <div className="flex gap-8 items-center justify-end z-10 w-32 opacity-80" style={{ opacity: isOpponentThinking ? 0.2 : 0.8 }}>
                <span className="text-lg font-mono text-gray-300">{gameState.opponentScore} PTS</span>
                <span className="text-xl drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">{'❤️'.repeat(gameState.opponentHealth)}</span>
             </div>
         </div>
         
         {/* AI Face-down Cards */}
         <div className="flex gap-4 h-[100px] items-center justify-center -mb-8 z-20">
             {gameState.opponentHand.map(card => (
                <div key={card.id} className="pointer-events-none transform hover:scale-105 transition-transform duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                   <MoonCard card={card} isFaceDown={true} />
                </div>
             ))}
         </div>
      </div>

      {/* MIDDLE: GRAPH BOARD */}
      <div className="flex flex-col items-center gap-4 w-full max-w-5xl relative flex-grow justify-center my-4">
        {/* Level Controls / Header overlay above board visually */}
        <div className="w-full flex justify-between px-6 text-sm font-bold tracking-[0.2em] text-indigo-400/50 absolute top-4 z-20 pointer-events-none">
           <span className="tracking-widest capitalize">LEVEL {gameState.layout.levelNumber}: {gameState.layout.name}</span>
           <span>DECK: {gameState.playerDrawPile.length}</span>
        </div>

        {/* Score Popups overlay */}
        {scorePopups.map((popup) => {
          const targetNode = gameState.layout.nodes.find(n => n.id === popup.nodeId);
          if (!targetNode) return null;

          let textColor = 'text-white';
          if (popup.type === 'CHAIN') textColor = 'text-purple-300 drop-shadow-[0_4px_4px_rgba(168,85,247,0.8)]';
          else if (popup.type === 'FULL_MOON') textColor = 'text-yellow-300 drop-shadow-[0_4px_4px_rgba(253,224,71,0.8)]';
          else if (popup.type === 'PAIR') textColor = 'text-blue-300 drop-shadow-[0_4px_4px_rgba(59,130,246,0.8)]';

          return (
            <div
              key={popup.id}
              className="absolute z-50 animate-bounce pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{
                left: \`calc(\${targetNode.position.x}% - 20px)\`,
                top: \`calc(\${targetNode.position.y}% - 60px)\`
              }}
            >
              <div className={\`text-3xl font-black \${textColor} drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]\`}>
                +\{popup.points}
              </div>
              <div className={\`text-xs font-bold text-center uppercase mt-1 \${textColor}\`}>
                {popup.type.replace('_', ' ')}
              </div>
            </div>
          )
        })}

        {/* Game Board Container */}
        <div className={\`w-full max-w-4xl h-[550px] rounded-[2rem] backdrop-blur-xl border relative overflow-hidden transition-colors duration-1000 animate-in fade-in zoom-in-95
           \${THEME_STYLES[gameState.layout.theme || 'indigo'].bg} 
           \${THEME_STYLES[gameState.layout.theme || 'indigo'].border} 
           \${THEME_STYLES[gameState.layout.theme || 'indigo'].shadow}
        \`}>

          {/* SVG Connections Container */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.3))' }}>
            {Array.from(connections).map(pair => {
              const [id1, id2] = pair.split('-');
              const n1 = gameState.layout.nodes.find(n => n.id === id1);
              const n2 = gameState.layout.nodes.find(n => n.id === id2);
              if (!n1 || !n2) return null;

              const isHighlighted = highlightedEdges.find(e => (e.id1 === id1 && e.id2 === id2) || (e.id1 === id2 && e.id2 === id1));
              const highlightEdge = highlightedEdges.find(e => (e.id1 === id1 && e.id2 === id2) || (e.id1 === id2 && e.id2 === id1));

              const isOccupied = n1.card !== null && n2.card !== null;
              const themeStyle = THEME_STYLES[gameState.layout.theme || 'indigo'];

              let lineClass = isOccupied ? \`\${themeStyle.lineActive} stroke-[3]\` : \`\${themeStyle.lineInactive} stroke-[2] stroke-dasharray-[4,4]\`;

              if (isHighlighted && highlightEdge) {
                if (highlightEdge.type === 'CHAIN') lineClass = 'stroke-purple-400 stroke-[6] drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-pulse';
                else if (highlightEdge.type === 'FULL_MOON') lineClass = 'stroke-yellow-400 stroke-[4] drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
                else if (highlightEdge.type === 'PAIR') lineClass = 'stroke-blue-400 stroke-[4] drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]';
              }

              return (
                <line
                  key={pair}
                  x1={\`\${n1.position.x}%\`}
                  y1={\`\${n1.position.y}%\`}
                  x2={\`\${n2.position.x}%\`}
                  y2={\`\${n2.position.y}%\`}
                  className={\`transition-all duration-1000 \${lineClass}\`}
                />
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
              <div
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={\`
                   absolute transform -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full z-10 flex flex-col items-center justify-center transition-all duration-300
                   \${node.card ? 'cursor-default' : isValid && selectedCardId ? 'cursor-pointer' : selectedCardId ? 'cursor-not-allowed opacity-50 saturate-0' : 'cursor-default opacity-80'}
                 \`}
                style={{
                  left: \`\${node.position.x}%\`,
                  top: \`\${node.position.y}%\`,
                }}
              >
                {!node.card && (
                  <div className={\`
                       absolute inset-0 rounded-full border-2 transition-all duration-300
                       \${isValid && selectedCardId ? 'border-green-400 bg-green-500/10 shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-pulse' : \`\${themeStyle.nodeBorder} bg-black/40 border-dashed\`}
                       \${!isValid && selectedCardId ? 'border-red-500/20 bg-red-900/10' : ''}
                       \${isHovered && isValid && selectedCardId ? 'border-green-300 bg-green-400/20 scale-105' : ''}
                     \`}>
                    <div className={\`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full \${themeStyle.nodeDot}\`}></div>
                  </div>
                )}

                {node.card && (
                  <div className={\`absolute inset-0 w-full h-full animate-in zoom-in spin-in-1\`}>
                    <MoonCard card={node.card} />
                  </div>
                )}

                {isHovered && isValid && selectedCardId && !node.card && (
                  <div className="absolute inset-0 w-full h-full opacity-40 scale-90 pointer-events-none">
                    <MoonCard card={gameState.playerHand.find(c => c.id === selectedCardId)!} />
                  </div>
                )}
                
                {ringColor && (
                  <div className={\`absolute -inset-2 rounded-2xl border-4 pointer-events-none animate-in zoom-in spin-in-2 \${ringColor} z-20\`}></div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM: PLAYER AREA */}
      <div className="w-full max-w-5xl flex flex-col items-center gap-4">
          
         {/* Player Hand */}
         <div className="flex gap-6 h-[100px] items-center justify-center -mt-8 z-20">
             {gameState.playerHand.map((card, index) => {
               const isSelected = selectedCardId === card.id;
               return (
                  <div
                     key={card.id} 
                     className={\`transform transition-all duration-300 shadow-[0_10px_20px_rgba(0,0,0,0.5)] \${isSelected ? '-translate-y-6 scale-110' : 'hover:-translate-y-2 hover:scale-105'}\`}
                  >
                     <MoonCard 
                        card={card} 
                        onClick={() => {
                           if (gameState.currentTurn === 'player') {
                              setSelectedCardId(isSelected ? null : card.id);
                           }
                        }} 
                     />
                  </div>
               )
             })}
         </div>

         <div className="w-full flex justify-between items-center px-8 py-3 bg-gradient-to-r from-blue-950/30 to-black/60 border border-indigo-500/20 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden">
             <div className="text-xl font-bold tracking-widest text-indigo-400 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)] z-10 w-32">YOU</div>
             <div className="flex gap-8 items-center justify-end z-10 w-32">
                <span className="text-lg font-mono text-gray-300">{gameState.playerScore} PTS</span>
                <span className="text-xl drop-shadow-[0_0_5px_rgba(220,38,38,0.8)]">{'❤️'.repeat(gameState.playerHealth)}</span>
             </div>
         </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, 'app/page.tsx'), pageContent, 'utf-8');
console.log('Successfully rewrote page.tsx');
