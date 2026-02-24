import { BoardNode, GameState, MoonCard } from "../types/game";
import { evaluateGraphPlacement } from "./scoring";

export interface AIMove {
  cardId: string;
  nodeId: string;
}

// 1. Find all valid placements
export function findValidPlacements(gameState: GameState): string[] {
  const isBoardEmpty = gameState.layout.nodes.every(node => node.card === null);
  const validNodes: string[] = [];

  for (const node of gameState.layout.nodes) {
    if (node.card !== null) continue;

    if (isBoardEmpty) {
      validNodes.push(node.id);
      continue;
    }

    // Check if connected to any placed card
    const hasAdjacent = node.connectedTo.some(neighborId => {
      const neighbor = gameState.layout.nodes.find(n => n.id === neighborId);
      return neighbor && neighbor.card !== null;
    });

    if (hasAdjacent) {
      validNodes.push(node.id);
    }
  }

  return validNodes;
}

// 2. Evaluate each move based on rules and difficulty
function evaluateMove(
  nodeId: string,
  card: MoonCard,
  gameState: GameState,
  levelIndex: number
): number {
  let score = 0;

  // Clone nodes to simulate the placement
  const simulatedNodes = gameState.layout.nodes.map(n =>
    n.id === nodeId ? { ...n, card: { ...card, owner: 'opponent' as const } } : { ...n }
  );

  const events = evaluateGraphPlacement(simulatedNodes, nodeId);
  let immediatePoints = 0;
  let stealingChains = 0;
  let ownChains = 0;
  let pairsOrMoons = 0;

  for (const event of events) {
    if (event.owner === 'opponent') {
      immediatePoints += event.points;

      if (event.type === 'CHAIN') {
        const stolenCards = event.nodeIds.filter(id => {
          const target = gameState.layout.nodes.find(n => n.id === id);
          return target && target.card && target.card.owner === 'player';
        });
        if (stolenCards.length > 0) stealingChains++;
        else ownChains++;
      } else {
        pairsOrMoons++;
      }
    }
  }

  // LEVEL 1 - BASIC (Random valid, avoid 0 if possible)
  if (levelIndex === 0) {
    score = immediatePoints > 0 ? immediatePoints : Math.random() * 0.5;
    return score;
  }

  // LEVEL 2 & 3 Foundations - STRATEGIC
  score += immediatePoints;
  if (stealingChains > 0) score += 10;
  if (ownChains > 0) score += 5;
  if (pairsOrMoons > 0) score += 2;

  // Prefer center proximity
  const node = gameState.layout.nodes.find(n => n.id === nodeId);
  if (node) {
    const distFromCenter = Math.sqrt(Math.pow(node.position.x - 50, 2) + Math.pow(node.position.y - 50, 2));
    score += Math.max(0, (50 - distFromCenter) / 10); // small bonus for center
  }

  // Prefer adjacency to own cards
  if (node) {
    const ownNeighbors = node.connectedTo.filter(id => {
      const n = gameState.layout.nodes.find(n => n.id === id);
      return n && n.card && n.card.owner === 'opponent';
    });
    score += ownNeighbors.length * 1.5;
  }

  // LEVEL 3 - ADVANCED (Predict player)
  if (levelIndex >= 2) {
    // Check what the player could do here on their next turn
    let maxPlayerCounterScore = 0;

    // Test this empty spot against the player's current hand
    const simulatedPlayerNodes = gameState.layout.nodes.map(n =>
      n.id === nodeId ? { ...n, card: { ...gameState.playerHand[0], owner: 'player' as const } } : { ...n }
    );

    for (const playerCard of gameState.playerHand) {
      simulatedPlayerNodes.find(n => n.id === nodeId)!.card = { ...playerCard, owner: 'player' };
      const playerEvents = evaluateGraphPlacement(simulatedPlayerNodes, nodeId);
      let potentialScore = 0;
      let steals = false;

      for (const e of playerEvents) {
        if (e.owner === 'player') {
          potentialScore += e.points;
          if (e.type === 'CHAIN') {
            const stealsOpponent = e.nodeIds.some(id => {
              const target = gameState.layout.nodes.find(n => n.id === id);
              return target && target.card && target.card.owner === 'opponent';
            });
            if (stealsOpponent) steals = true;
          }
        }
      }

      if (steals) potentialScore += 10; // Massive threat
      if (potentialScore > maxPlayerCounterScore) {
        maxPlayerCounterScore = potentialScore;
      }
    }

    // Add massive defensive bonus if playing here blocks the player from doing huge damage next turn
    score += maxPlayerCounterScore * 1.5;
  }

  return score;
}

export function aiTurn(gameState: GameState, levelIndex: number): AIMove | null {
  if (gameState.opponentHand.length === 0) return null;

  const validNodes = findValidPlacements(gameState);
  if (validNodes.length === 0) return null;

  let bestMove: AIMove | null = null;
  let bestScore = -Infinity;

  // Level 1 Basic sometimes just picks randomly without thinking
  if (levelIndex === 0 && Math.random() < 0.3) {
    return {
      cardId: gameState.opponentHand[Math.floor(Math.random() * gameState.opponentHand.length)].id,
      nodeId: validNodes[Math.floor(Math.random() * validNodes.length)]
    };
  }

  for (const nodeId of validNodes) {
    for (const card of gameState.opponentHand) {
      const score = evaluateMove(nodeId, card, gameState, levelIndex);

      // Add slight randomness to break ties
      const randomizedScore = score + (Math.random() * 0.1);

      if (randomizedScore > bestScore) {
        bestScore = randomizedScore;
        bestMove = { cardId: card.id, nodeId };
      }
    }
  }

  return bestMove;
}
