"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BoardLayout, BoardNode, MoonCard as MoonCardType } from '../../types/game';
import { BOARD_THEMES, SCORE_COLORS, SCORE_LABELS, ScoreType } from '../../constants/theme';
import { MoonCard } from '../MoonCard';

export interface HighlightNode {
  nodeId: string;
  type: ScoreType;
}

export interface HighlightEdge {
  id1: string;
  id2: string;
  type: ScoreType;
}

export interface ScorePopupData {
  id: string;
  points: number;
  type: ScoreType;
  nodeId: string;
  owner?: 'player' | 'opponent';
}

interface BoardProps {
  layout: BoardLayout;
  selectedCard: MoonCardType | null;
  hoveredNodeId: string | null;
  highlightedNodes: HighlightNode[];
  highlightedEdges: HighlightEdge[];
  scorePopups: ScorePopupData[];
  isValidPlacement: (nodeId: string) => boolean;
  onNodeClick: (nodeId: string) => void;
  onNodeDrop: (nodeId: string, cardId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

const sameEdge = (e: { id1: string, id2: string }, a: string, b: string) =>
  (e.id1 === a && e.id2 === b) || (e.id1 === b && e.id2 === a);

export function Board({
  layout,
  selectedCard,
  hoveredNodeId,
  highlightedNodes,
  highlightedEdges,
  scorePopups,
  isValidPlacement,
  onNodeClick,
  onNodeDrop,
  onNodeHover,
}: BoardProps) {
  const theme = BOARD_THEMES[layout.theme || 'indigo'];
  const nodesById = new Map(layout.nodes.map(n => [n.id, n]));

  // Shrink cards on dense layouts so neighbors never overlap
  let minGap = Infinity;
  layout.nodes.forEach((a, i) => layout.nodes.slice(i + 1).forEach(b => {
    minGap = Math.min(minGap, Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y));
  }));
  const cardSize = Math.min(13.5, minGap - 2.5);

  const connections = new Set<string>();
  layout.nodes.forEach(node => {
    node.connectedTo.forEach(targetId => {
      connections.add([node.id, targetId].sort().join('-'));
    });
  });

  return (
      <div
        className="board relative z-40 shrink-0 aspect-square rounded-[2rem] border border-white/[0.07] animate-in fade-in zoom-in-95 duration-700"
        style={{
          width: 'var(--board-size)',
          ['--card' as string]: `clamp(28px, ${cardSize.toFixed(2)}cqmin, 80px)`,
          background: `radial-gradient(circle at 50% 45%, ${theme.glow}, transparent 70%),
                       radial-gradient(circle at 80% 15%, ${theme.glow2}, transparent 55%),
                       linear-gradient(180deg, rgba(17,19,48,0.55), rgba(10,11,29,0.7))`,
          boxShadow: `inset 0 0 80px -20px ${theme.glow}, 0 30px 80px -40px rgba(0,0,0,0.9)`,
        }}
      >
        {/* Faint star-chart grid */}
        <div
          className="absolute inset-0 rounded-[2rem] opacity-40 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black 30%, transparent 75%)',
          }}
        />

        {/* Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" aria-hidden="true">
          <defs>
            {/* userSpaceOnUse: a horizontal or vertical line has a zero-height/width bounding box,
                so the default objectBoundingBox filter region would clip it away entirely */}
            <filter id="edge-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {Array.from(connections).map(pair => {
            const [id1, id2] = pair.split('-');
            const n1 = nodesById.get(id1);
            const n2 = nodesById.get(id2);
            if (!n1 || !n2) return null;

            const highlight = highlightedEdges.find(e => sameEdge(e, id1, id2));
            const permanent = layout.scoredEdges?.find(e => sameEdge(e, id1, id2));
            const scoreType = highlight?.type ?? permanent?.type;
            const isOccupied = n1.card !== null && n2.card !== null;

            const { x: x1, y: y1 } = n1.position;
            const { x: x2, y: y2 } = n2.position;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            // Perpendicular offset for the pair decorator's two circles
            const dist = Math.hypot(x2 - x1, y2 - y1) || 1;
            const perpX = -(y2 - y1) / dist;
            const perpY = (x2 - x1) / dist;
            const offset = 1.8;

            const color = scoreType ? SCORE_COLORS[scoreType] : isOccupied ? theme.lineActive : theme.line;
            const lineStyle: React.CSSProperties = { transition: 'stroke 0.6s, stroke-width 0.6s' };
            if (highlight?.type === 'CHAIN') {
              lineStyle.strokeDasharray = 1000;
              lineStyle.animation = 'dash 0.4s linear forwards';
            } else if (!scoreType && !isOccupied) {
              lineStyle.strokeDasharray = '3 6';
            }

            return (
              <g key={pair} filter={scoreType ? 'url(#edge-glow)' : undefined}>
                <line
                  x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
                  stroke={color}
                  strokeWidth={scoreType === 'CHAIN' ? 4 : scoreType ? 3 : 1.5}
                  strokeLinecap="round"
                  style={lineStyle}
                />
                {permanent?.type === 'FULL_MOON' && (
                  <circle cx={`${midX}%`} cy={`${midY}%`} r={5.5} fill={SCORE_COLORS.FULL_MOON} />
                )}
                {permanent?.type === 'PAIR' && (
                  <>
                    <circle cx={`${midX - perpX * offset}%`} cy={`${midY - perpY * offset}%`} r={4} fill="#0a0b1d" stroke={SCORE_COLORS.PAIR} strokeWidth={2} />
                    <circle cx={`${midX + perpX * offset}%`} cy={`${midY + perpY * offset}%`} r={4} fill="#0a0b1d" stroke={SCORE_COLORS.PAIR} strokeWidth={2} />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {layout.nodes.map(node => {
          const isValid = selectedCard ? isValidPlacement(node.id) : false;
          const isHovered = hoveredNodeId === node.id;
          const types = highlightedNodes.filter(h => h.nodeId === node.id).map(h => h.type);
          const ringType: ScoreType | null = types.includes('CHAIN') ? 'CHAIN' : types.includes('FULL_MOON') ? 'FULL_MOON' : types.includes('PAIR') ? 'PAIR' : null;

          return (
            <BoardSlot
              key={node.id}
              node={node}
              isValid={isValid}
              isHovered={isHovered}
              onClick={() => onNodeClick(node.id)}
              onDrop={cardId => onNodeDrop(node.id, cardId)}
              onHover={hovering => onNodeHover(hovering ? node.id : null)}
            >
              {node.card ? (
                <div id={`card-wrapper-${node.id}`} className="absolute inset-0 animate-in zoom-in-75 fade-in duration-300">
                  <MoonCard card={node.card} className="w-full h-full" />
                </div>
              ) : (
                <EmptySlot isValid={isValid} isHovered={isHovered} />
              )}

              {isHovered && isValid && selectedCard && !node.card && (
                <div className="absolute inset-0 opacity-60 scale-90 pointer-events-none">
                  <MoonCard card={{ phase: selectedCard.phase }} className="w-full h-full" />
                </div>
              )}

              {ringType && (
                <div
                  className="absolute -inset-1.5 rounded-[26%] border-[3px] pointer-events-none animate-in zoom-in-110 fade-in duration-200 z-20"
                  style={{ borderColor: SCORE_COLORS[ringType], boxShadow: `0 0 24px ${SCORE_COLORS[ringType]}, inset 0 0 12px ${SCORE_COLORS[ringType]}66` }}
                />
              )}
            </BoardSlot>
          );
        })}

        {/* Score popups fly toward whoever scored */}
        {scorePopups.map(popup => {
          const node = nodesById.get(popup.nodeId);
          if (!node) return null;
          const travel = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
          const yDir = popup.owner === 'player' ? travel : -travel;
          const color = SCORE_COLORS[popup.type];

          return (
            <motion.div
              key={popup.id}
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.25, 1.1, 0.7], y: [0, -36, yDir] }}
              transition={{ duration: 1.5, times: [0, 0.15, 0.4, 1], ease: 'easeInOut' }}
              className="absolute z-50 pointer-events-none -translate-x-1/2 flex flex-col items-center"
              style={{ left: `${node.position.x}%`, top: `calc(${node.position.y}% - var(--card) * 0.9)` }}
            >
              <span className="font-sans tracking-tight text-3xl sm:text-4xl font-black leading-none" style={{ color, textShadow: `0 0 18px ${color}, 0 2px 4px rgba(0,0,0,0.8)` }}>
                +{popup.points}
              </span>
              <span
                className="mt-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.15em] uppercase whitespace-nowrap border"
                style={{ color, borderColor: `${color}66`, background: 'rgba(10,11,29,0.85)' }}
              >
                {SCORE_LABELS[popup.type]}
              </span>
            </motion.div>
          );
        })}
      </div>
  );
}

function EmptySlot({ isValid, isHovered }: { isValid: boolean, isHovered: boolean }) {
  return (
    <div
      className={`absolute inset-0 rounded-[22%] border-[1.5px] transition-all duration-300
        ${isValid
          ? `border-solid border-accent bg-accent/15 ${isHovered ? 'scale-105' : 'animate-pulse-soft'}`
          : 'border-dashed border-white/15 bg-night-900/70'}`}
      style={isValid ? { boxShadow: '0 0 20px -2px rgba(139,123,255,0.7)' } : undefined}
    >
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-1.5 rounded-full ${isValid ? 'bg-accent' : 'bg-white/25'}`} />
    </div>
  );
}

interface BoardSlotProps {
  node: BoardNode;
  isValid: boolean;
  isHovered: boolean;
  onClick: () => void;
  onDrop: (cardId: string) => void;
  onHover: (hovering: boolean) => void;
  children: React.ReactNode;
}

function BoardSlot({ node, isValid, isHovered, onClick, onDrop, onHover, children }: BoardSlotProps) {
  return (
    <div
      id={`node-${node.id}`}
      data-empty-node={node.card ? undefined : ''}
      role={isValid ? 'button' : undefined}
      tabIndex={isValid ? 0 : undefined}
      aria-label={isValid ? 'Place card here' : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (isValid && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      onPointerEnter={() => isValid && onHover(true)}
      onPointerLeave={() => isValid && onHover(false)}
      onDragOver={e => {
        if (isValid) {
          e.preventDefault(); // Necessary to allow dropping
          e.dataTransfer.dropEffect = 'move';
        }
      }}
      onDragEnter={e => {
        if (isValid) {
          e.preventDefault();
          onHover(true);
        }
      }}
      onDragLeave={() => onHover(false)}
      onDrop={e => {
        e.preventDefault();
        if (isValid) {
          const cardId = e.dataTransfer.getData('text/plain');
          if (cardId) onDrop(cardId);
        }
        onHover(false);
      }}
      className={`size-card absolute -translate-x-1/2 -translate-y-1/2 rounded-[22%] z-10 transition-transform duration-300
        ${isHovered && isValid ? 'scale-110' : ''}
        ${isValid ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
    >
      {children}
    </div>
  );
}
