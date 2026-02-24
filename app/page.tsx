"use client";

import React, { useState, useEffect } from 'react';
import { MoonCard } from "../components/MoonCard";
import { MoonCard as MoonCardType, GameState } from "../types/game";
import { evaluatePlacement, ScoringEvent } from "../utils/scoring";

interface ScorePopupData {
  id: string;
  points: number;
  type: string;
  r: number;
  c: number;
}

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(6).fill(null).map(() => Array(8).fill(null)),
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
  const [hoveredCell, setHoveredCell] = useState<{ r: number, c: number } | null>(null);

  // Visual effects state
  const [scorePopups, setScorePopups] = useState<ScorePopupData[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<{ r: number, c: number }[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCardId(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isBoardEmpty = gameState.board.every(row => row.every(cell => cell === null));

  const isValidPlacement = (r: number, c: number) => {
    if (gameState.board[r][c] !== null) return false;
    if (isBoardEmpty) return true;

    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]]; // 8-way adjacent
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 6 && nc >= 0 && nc < 8 && gameState.board[nr][nc] !== null) {
        return true;
      }
    }
    return false;
  };

  const handleCellClick = (r: number, c: number) => {
    if (!selectedCardId) return;
    if (!isValidPlacement(r, c)) return;

    const selectedCardIndex = gameState.playerHand.findIndex(card => card.id === selectedCardId);
    if (selectedCardIndex === -1) return;

    const card = gameState.playerHand[selectedCardIndex];

    const newBoard = gameState.board.map(row => [...row]);
    newBoard[r][c] = { ...card, owner: 'player' };

    // Evaluate Scorings
    const events = evaluatePlacement(newBoard, r, c);

    let addedPlayerScore = 0;

    // Process Events (apply points, change chain ownership if stolen)
    const newPopups: ScorePopupData[] = [];
    const newHighlights: { r: number, c: number }[] = [];

    events.forEach((event, i) => {
      if (event.owner === 'player') addedPlayerScore += event.points;

      // If it's a chain, steal cards by changing ownership
      if (event.type === 'CHAIN') {
        event.cells.forEach(cell => {
          if (newBoard[cell.r][cell.c]) {
            newBoard[cell.r][cell.c]!.owner = 'player';
          }
        });
      }

      newHighlights.push(...event.cells);

      newPopups.push({
        id: `popup-${Date.now()}-${i}`,
        points: event.points,
        type: event.type,
        r,
        c
      });
    });

    const newHand = [...gameState.playerHand];
    newHand.splice(selectedCardIndex, 1);

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      playerHand: newHand,
      playerScore: prev.playerScore + addedPlayerScore
    }));

    setSelectedCardId(null);
    setHoveredCell(null);

    if (newPopups.length > 0) {
      setScorePopups(prev => [...prev, ...newPopups]);
      setHighlightedCells(newHighlights);

      setTimeout(() => {
        setScorePopups(prev => prev.filter(p => !newPopups.find(np => np.id === p.id)));
        setHighlightedCells([]);
      }, 2000);
    }
  };

  const selectedCard = gameState.playerHand.find(c => c.id === selectedCardId);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-8 bg-[#0a0a1a] text-white font-sans selection:bg-indigo-500/30">

      <div className="flex flex-col items-center gap-8 w-full max-w-5xl relative">

        {/* Score Popups overlay */}
        {scorePopups.map((popup) => (
          <div
            key={popup.id}
            className="absolute z-50 animate-bounce pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              left: `calc(50% + ${(popup.c - 3.5) * 92}px)`,
              top: `calc(50% + ${(popup.r - 2.5) * 132 - 40}px)`
            }}
          >
            <div className="text-3xl font-black text-yellow-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              +{popup.points}
            </div>
            <div className="text-xs font-bold text-center text-yellow-100 uppercase mt-1">
              {popup.type.replace('_', ' ')}
            </div>
          </div>
        ))}

        {/* Opponent Area */}
        <div className="w-full flex justify-between items-center px-8 py-4 bg-gradient-to-r from-red-950/20 to-black/40 border border-red-500/20 rounded-2xl backdrop-blur-md shadow-[0_0_30px_rgba(220,38,38,0.05)]">
          <div className="text-xl font-bold tracking-widest text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]">OPPONENT</div>
          <div className="flex gap-8 items-center">
            <span className="text-lg font-mono text-gray-300 transition-all duration-300">{gameState.opponentScore} PTS</span>
            <span className="text-2xl drop-shadow-[0_0_5px_rgba(220,38,38,0.8)] z-10">{'❤️'.repeat(gameState.opponentHealth)}</span>
          </div>
        </div>

        {/* Game Board Grid */}
        <div className="p-8 rounded-[2rem] bg-white/[0.02] backdrop-blur-xl border border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
          <div className="grid grid-rows-6 grid-cols-8 gap-3 relative">
            {gameState.board.map((row, r) =>
              row.map((cell, c) => {
                const isValid = selectedCardId ? isValidPlacement(r, c) : false;
                const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
                const isHighlighted = highlightedCells.some(hc => hc.r === r && hc.c === c);

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    onMouseEnter={() => setHoveredCell({ r, c })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`
                      relative w-[80px] h-[120px] rounded-xl border-2 flex items-center justify-center
                      transition-all duration-300 ease-out box-border
                      ${cell ? 'border-transparent' : 'border-white/[0.03] bg-white/[0.01]'}
                      ${!cell && !selectedCardId ? 'hover:bg-white/[0.03] hover:border-white/[0.08]' : ''}
                      ${isValid && !cell ? 'border-green-500/40 bg-green-500/5 hover:bg-green-500/20 hover:border-green-400/80 hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] cursor-pointer' : ''}
                      ${selectedCardId && !isValid && !cell ? 'hover:bg-red-500/10 hover:border-red-500/40 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-not-allowed border-red-500/10 bg-red-500/5' : ''}
                      ${isHighlighted ? 'scale-105 shadow-[0_0_25px_rgba(253,224,71,0.6)] z-20 transition-all duration-500' : 'z-0'}
                    `}
                  >
                    {/* Render placed card */}
                    {cell && (
                      <div className="absolute inset-0 animate-in fade-in zoom-in-95 duration-500">
                        <MoonCard card={cell} />
                      </div>
                    )}

                    {/* Render placement preview */}
                    {!cell && isValid && isHovered && selectedCard && (
                      <div className="absolute inset-0 opacity-40 scale-95 pointer-events-none transition-all animate-pulse">
                        <MoonCard card={selectedCard} />
                      </div>
                    )}

                    {isHighlighted && (
                      <div className="absolute inset-0 border-[3px] border-yellow-300 rounded-xl animate-pulse pointer-events-none"></div>
                    )}
                  </div>
                )
              })
            )}
          </div>
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
    </div>
  );
}
