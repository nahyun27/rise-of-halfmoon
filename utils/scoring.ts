import { BoardNode, MoonCard } from "../types/game";

export interface ScoringEvent {
  points: number;
  owner: 'player' | 'opponent';
  type: 'PAIR' | 'FULL_MOON' | 'CHAIN';
  nodeIds: string[];
}

// Convert nodes to a lookup map for easy access
type NodeMap = Map<string, BoardNode>;

function getNodesMap(nodes: BoardNode[]): NodeMap {
  const map = new Map<string, BoardNode>();
  for (const n of nodes) {
    if (n.card) map.set(n.id, n);
  }
  return map;
}

export function checkPhasePairs(nodeMap: NodeMap, placedNode: BoardNode): ScoringEvent[] {
  const events: ScoringEvent[] = [];
  const card = placedNode.card;
  if (!card) return [];

  const neighbors = Array.from(nodeMap.values()).filter(n =>
    placedNode.connectedTo.includes(n.id) || n.connectedTo.includes(placedNode.id)
  );

  for (const neighbor of neighbors) {
    if (neighbor && neighbor.card && neighbor.card.phase === card.phase) {
      events.push({
        points: 1,
        owner: card.owner as 'player' | 'opponent',
        type: 'PAIR',
        nodeIds: [placedNode.id, neighbor.id]
      });
    }
  }
  return events;
}

export function checkFullMoonPairs(nodeMap: NodeMap, placedNode: BoardNode): ScoringEvent[] {
  const events: ScoringEvent[] = [];
  const card = placedNode.card;
  if (!card) return [];

  const neighbors = Array.from(nodeMap.values()).filter(n =>
    placedNode.connectedTo.includes(n.id) || n.connectedTo.includes(placedNode.id)
  );

  for (const neighbor of neighbors) {
    if (neighbor && neighbor.card && Math.abs(neighbor.card.phase - card.phase) === 4) {
      events.push({
        points: 2,
        owner: card.owner as 'player' | 'opponent',
        type: 'FULL_MOON',
        nodeIds: [placedNode.id, neighbor.id]
      });
    }
  }
  return events;
}

export function findLunarChains(nodeMap: NodeMap, placedNode: BoardNode): ScoringEvent[] {
  const card = placedNode.card;
  if (!card) return [];

  // Every maximal path from currentId following phases in one direction. Each path starts
  // with currentId. At a fork, both branches are kept, so one placement can score several cycles.
  function allPaths(currentId: string, phaseDelta: 1 | -1, visited: Set<string>): string[][] {
    const node = nodeMap.get(currentId);
    if (!node || !node.card) return [];

    visited.add(currentId);
    const expectedPhase = (node.card.phase + phaseDelta + 8) % 8;
    const nextIds = Array.from(nodeMap.values())
      .filter(n =>
        !visited.has(n.id) &&
        n.card?.phase === expectedPhase &&
        (node.connectedTo.includes(n.id) || n.connectedTo.includes(node.id))
      )
      .map(n => n.id);

    const paths = nextIds.length === 0
      ? [[currentId]]
      : nextIds.flatMap(nextId => allPaths(nextId, phaseDelta, visited).map(path => [currentId, ...path]));
    visited.delete(currentId);
    return paths;
  }

  const forwardPaths = allPaths(placedNode.id, 1, new Set()); // [placed, +1, +2, ...]
  const backwardPaths = allPaths(placedNode.id, -1, new Set()); // [placed, -1, -2, ...]

  const chains: string[][] = [];
  for (const backward of backwardPaths) {
    for (const forward of forwardPaths) {
      // On a ring the two directions can meet; stop the backward half where the forward half begins
      const forwardIds = new Set(forward);
      const overlapAt = backward.findIndex((id, i) => i > 0 && forwardIds.has(id));
      const trimmedBackward = overlapAt === -1 ? backward : backward.slice(0, overlapAt);

      // [-2, -1, placed] + [+1, +2]
      const chain = [...[...trimmedBackward].reverse(), ...forward.slice(1)];
      if (chain.length >= 3) chains.push(chain);
    }
  }

  // Drop repeats and chains fully contained in a longer one
  const distinct = chains.filter((chain, i) =>
    !chains.some((other, j) =>
      j !== i &&
      (other.length > chain.length || (other.length === chain.length && j < i)) &&
      chain.every(id => other.includes(id))
    )
  );

  const events: ScoringEvent[] = distinct.map(chain => ({
    points: chain.length,
    owner: card.owner as 'player' | 'opponent',
    type: 'CHAIN',
    nodeIds: chain
  }));

  return events;
}

export function evaluateGraphPlacement(nodes: BoardNode[], placedId: string): ScoringEvent[] {
  const nodeMap = getNodesMap(nodes);
  const placedNode = nodeMap.get(placedId);
  if (!placedNode) return [];

  const pairs = checkPhasePairs(nodeMap, placedNode);
  const fullMoons = checkFullMoonPairs(nodeMap, placedNode);
  const chains = findLunarChains(nodeMap, placedNode);

  return [...pairs, ...fullMoons, ...chains];
}
