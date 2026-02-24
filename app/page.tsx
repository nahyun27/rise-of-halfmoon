"use client";

import React, { useState, useEffect } from 'react';
import { MoonCard } from "../components/MoonCard";
import { MoonCard as MoonCardType, GameState, BoardNode } from "../types/game";
import { evaluateGraphPlacement, ScoringEvent } from "../utils/scoring";
import { LEVEL_LAYOUTS } from "../constants/layouts";
import { TutorialOverlay } from "../components/TutorialOverlay";

interface ScorePopupData {
  id: string;
  points: number;
  type: string;
  nodeId: string;
}

export default function Home() {
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const currentLayout = LEVEL_LAYOUTS[currentLevelIndex];

  const [gameState, setGameState] = useState<GameState>({
    layout: JSON.parse(JSON.stringify(currentLayout)), // deep copy to allow mutations
    playerHand: [
      { id: 'p1', phase: 0, owner: 'player' },
      { id: 'p2', phase: 4, owner: 'player' },
      { id: 'p3', phase: 2, owner: 'player' },
      { id: 'p4', phase: 3, owner: 'player' },
      { id: 'p5', phase: 1, owner: 'player' },
    ],
    opponentHand: [],
    playerScore: 0,
    opponentScore: 0,
    playerHealth: 3,
    opponentHealth: 3,
    currentTurn: 'player'
  });

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Visual effects state
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCardId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isBoardEmpty = gameState.layout.nodes.every(node => node.card === null);

  const isValidPlacement = (nodeId: string) => {
    const node = gameState.layout.nodes.find(n => n.id === nodeId);
    if (!node || node.card !== null) return false;
    if (isBoardEmpty) return true;

    // Check if connected to any placed card
    for (const neighborId of node.connectedTo) {
      const neighbor = gameState.layout.nodes.find(n => n.id === neighborId);
      if (neighbor && neighbor.card !== null) return true;
    }
    return false;
  };

  const handleNodeClick = (nodeId: string) => {
    if (!selectedCardId) return;
    if (!isValidPlacement(nodeId)) return;

    const selectedCardIndex = gameState.playerHand.findIndex(card => card.id === selectedCardId);
    if (selectedCardIndex === -1) return;

    const card = gameState.playerHand[selectedCardIndex];

    const newNodes = gameState.layout.nodes.map(n =>
      n.id === nodeId ? { ...n, card: { ...card, owner: 'player' as const } } : { ...n }
    );

    // Evaluate Scorings
    const events = evaluateGraphPlacement(newNodes, nodeId);

    let addedPlayerScore = 0;

    const newPopups: ScorePopupData[] = [];
    const newHighlights: string[] = [];

    events.forEach((event, i) => {
      if (event.owner === 'player') addedPlayerScore += event.points;

      // If it's a chain, steal cards by changing ownership
      if (event.type === 'CHAIN') {
        event.nodeIds.forEach(id => {
          const targetNode = newNodes.find(n => n.id === id);
          if (targetNode && targetNode.card) {
            targetNode.card.owner = 'player';
          }
        });
      }

      newHighlights.push(...event.nodeIds);

      newPopups.push({
        id: `popup-${Date.now()}-${i}`,
        points: event.points,
        type: event.type,
        nodeId: nodeId
      });
    });

    const newHand = [...gameState.playerHand];
    newHand.splice(selectedCardIndex, 1);

    setGameState(prev => ({
      ...prev,
      layout: { ...prev.layout, nodes: newNodes },
      playerHand: newHand,
      playerScore: prev.playerScore + addedPlayerScore
    }));

    setSelectedCardId(null);
    setHoveredNodeId(null);

    if (newPopups.length > 0) {
      setScorePopups(prev => [...prev, ...newPopups]);
      setHighlightedNodes(newHighlights);

      setTimeout(() => {
        setScorePopups(prev => prev.filter(p => !newPopups.find(np => np.id === p.id)));
        setHighlightedNodes([]);
      }, 2000);
    }
  };

  const selectedCard = gameState.playerHand.find(c => c.id === selectedCardId);

  // Create unique edges for rendering
  const connections = new Set<string>();
  gameState.layout.nodes.forEach(node => {
    node.connectedTo.forEach(targetId => {
      const sortedPair = [node.id, targetId].sort().join('-');
      connections.add(sortedPair);
    });
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-8 bg-[#0a0a1a] text-white font-sans selection:bg-indigo-500/30">

      <div className="flex flex-col items-center gap-8 w-full max-w-5xl relative">

        {/* Level Controls / Header */}
        <div className="w-full flex justify-between items-center text-sm font-bold tracking-[0.2em] text-indigo-400">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const next = (currentLevelIndex + 1) % LEVEL_LAYOUTS.length;
                setCurrentLevelIndex(next);
                setGameState(prev => ({ ...prev, layout: JSON.parse(JSON.stringify(LEVEL_LAYOUTS[next])) }));
              }}
              className="px-4 py-2 border border-indigo-500/30 rounded-full hover:bg-indigo-500/20 transition disabled:opacity-50"
            >
              NEXT LEVEL
            </button>
            <span>LEVEL {gameState.layout.levelNumber}: {gameState.layout.name.toUpperCase()}</span>
          </div>

          <button
            onClick={() => setShowTutorial(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-indigo-500/30 hover:bg-indigo-500/20 transition text-lg font-black text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            title="How to Play"
          >
            ?
          </button>
        </div>

        {/* Score Popups overlay */}
        {scorePopups.map((popup) => {
          const targetNode = gameState.layout.nodes.find(n => n.id === popup.nodeId);
          if (!targetNode) return null;
          return (
            <div
              key={popup.id}
              className="absolute z-50 animate-bounce pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
              style={{
                left: `calc(${targetNode.position.x}% - 20px)`,
                top: `calc(${targetNode.position.y}% - 60px)`
              }}
            >
              <div className="text-3xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                +{popup.points}
              </div>
              <div className="text-xs font-bold text-center text-yellow-100 uppercase mt-1">
                {popup.type.replace('_', ' ')}
              </div>
            </div>
          )
        })}

        {/* Opponent Area */}
        <div className="w-full flex justify-between items-center px-8 py-4 bg-gradient-to-r from-red-950/20 to-black/40 border border-red-500/20 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(220,38,38,0.05)]">
          <div className="text-xl font-bold tracking-widest text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">OPPONENT</div>
          <div className="flex gap-8 items-center">
            <span className="text-lg font-mono text-gray-300 transition-all duration-300">{gameState.opponentScore} PTS</span>
            <span className="text-2xl drop-shadow-[0_0_5px_rgba(220,38,38,0.8)] z-10">{'❤️'.repeat(gameState.opponentHealth)}</span>
          </div>
        </div>

        {/* Game Board (Node Graph) */}
        <div className="w-full max-w-4xl h-[600px] p-8 rounded-[2rem] bg-indigo-950/[0.05] backdrop-blur-xl border border-indigo-500/10 shadow-[inner_0_0_100px_rgba(30,27,75,0.8)] relative overflow-hidden">

          {/* SVG Connections Container */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.3))' }}>
            {Array.from(connections).map(pair => {
              const [id1, id2] = pair.split('-');
              const n1 = gameState.layout.nodes.find(n => n.id === id1);
              const n2 = gameState.layout.nodes.find(n => n.id === id2);
              if (!n1 || !n2) return null;

              // Light up line if both nodes have cards
              const isActive = n1.card !== null && n2.card !== null;

              return (
                <line
                  key={pair}
                  x1={`${n1.position.x}%`}
                  y1={`${n1.position.y}%`}
                  x2={`${n2.position.x}%`}
                  y2={`${n2.position.y}%`}
                  className={`transition-all duration-1000 ${isActive ? 'stroke-indigo-400 stroke-[3]' : 'stroke-indigo-800/40 stroke-[2] stroke-dasharray-[4,4]'}`}
                />
              );
            })}
          </svg>

          {/* Node Render Loop */}
          {gameState.layout.nodes.map(node => {
            const isValid = selectedCardId ? isValidPlacement(node.id) : false;
            const isHovered = hoveredNodeId === node.id;
            const isHighlighted = highlightedNodes.includes(node.id);

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className={`
                   absolute transform -translate-x-1/2 -translate-y-1/2 w-[80px] h-[120px] rounded-xl z-10 flex flex-col items-center justify-center transition-all duration-300
                   ${node.card ? 'cursor-default' : isValid && selectedCardId ? 'cursor-pointer' : selectedCardId ? 'cursor-not-allowed opacity-50 saturate-0' : 'cursor-default opacity-80'}
                 `}
                style={{
                  left: `${node.position.x}%`,
                  top: `${node.position.y}%`,
                }}
              >
                {/* Empty Node Slot Styling */}
                {!node.card && (
                  <div className={`
                       absolute inset-0 rounded-xl border-2 transition-all duration-300
                       ${isValid && selectedCardId ? 'border-green-400 bg-green-500/10 shadow-[0_0_30px_rgba(74,222,128,0.5)] animate-pulse' : 'border-indigo-500/20 bg-black/40 border-dashed'}
                       ${!isValid && selectedCardId ? 'border-red-500/20 bg-red-900/10' : ''}
                       ${isHovered && isValid && selectedCardId ? 'border-green-300 bg-green-400/20 scale-105' : ''}
                     `}>
                    {/* Center Dot for Empty node */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-indigo-500/50"></div>
                  </div>
                )}

                {/* Placed Card */}
                {node.card && (
                  <div className={`absolute inset-0 w-full h-full animate-in zoom-in spin-in-1 max-w-[80px] max-h-[120px]`}>
                    <MoonCard card={node.card} />
                  </div>
                )}

                {/* Placement Preview */}
                {!node.card && isValid && isHovered && selectedCard && (
                  <div className="absolute inset-0 opacity-40 scale-95 pointer-events-none transition-all">
                    <MoonCard card={selectedCard} />
                  </div>
                )}

                {/* Highlight Ring (Scoring effect) */}
                {isHighlighted && (
                  <div className="absolute -inset-2 rounded-2xl border-4 border-yellow-300/80 pointer-events-none animate-ping opacity-50 z-20"></div>
                )}
                {isHighlighted && (
                  <div className="absolute -inset-1 rounded-xl border-4 border-yellow-300 pointer-events-none shadow-[0_0_30px_rgba(253,224,71,1)] z-20"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Player Hand Area */}
        <div className="w-full flex flex-col p-6 bg-gradient-to-r from-indigo-950/30 to-black/40 border border-indigo-500/20 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.05)]">
          {/* Hand Cards */}
          <div className="flex justify-center gap-6 h-[150px] items-center">
            {gameState.playerHand.map((card) => {
              const isSelected = selectedCardId === card.id;
              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(isSelected ? null : card.id)}
                  className={`
                    transition-all duration-400 cubic-bezier(0.4, 0, 0.2, 1) transform cursor-pointer
                    ${selectedCardId && !isSelected ? 'opacity-40 scale-90 saturate-50' : 'opacity-100 scale-100'}
                    ${isSelected ? '-translate-y-6 scale-110 drop-shadow-[0_20px_30px_rgba(255,255,255,0.2)]' : 'hover:-translate-y-2'}
                  `}
                >
                  <MoonCard card={card} />
                </div>
              );
            })}

            {gameState.playerHand.length === 0 && (
              <div className="text-white/20 italic font-medium tracking-widest text-sm">
                NO CARDS LEFT
              </div>
            )}
          </div>

          {/* Player Stats */}
          <div className="flex justify-between items-center px-4 pt-6 mt-2 border-t border-indigo-500/20">
            <div className="text-xl font-bold tracking-widest text-indigo-300 drop-shadow-[0_0_8px_rgba(165,180,252,0.5)]">YOU</div>
            <div className="flex gap-8 items-center">
              <span className={`text-lg font-mono transition-colors duration-500 ${scorePopups.length > 0 ? 'text-yellow-300 font-bold scale-110' : 'text-gray-300'}`}>
                {gameState.playerScore} PTS
              </span>
              <span className="text-2xl drop-shadow-[0_0_5px_rgba(220,38,38,0.8)] z-10">{'❤️'.repeat(gameState.playerHealth)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tutorial Overlay */}
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
    </div>
  );
}
