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
  const events: ScoringEvent[] = [];
  const card = placedNode.card;
  if (!card) return [];

  function dfs(currentId: string, phaseDelta: 1 | -1, visited: Set<string>): string[] {
    const node = nodeMap.get(currentId);
    if (!node || !node.card) return [];

    let longestPath: string[] = [];
    visited.add(currentId);

    const neighbors = Array.from(nodeMap.values()).filter(n =>
      node.connectedTo.includes(n.id) || n.connectedTo.includes(node.id)
    );

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.id)) {
        if (neighbor && neighbor.card) {
          const expectedPhase = (node.card.phase + phaseDelta + 8) % 8;
          if (neighbor.card.phase === expectedPhase) {
            const subPath = dfs(neighbor.id, phaseDelta, new Set(visited));
            if (subPath.length > longestPath.length) {
              longestPath = subPath;
            }
          }
        }
      }
    }

    visited.delete(currentId);
    return [currentId, ...longestPath];
  }

  // Find longest path going "up" the phases
  const forwardAsc = dfs(placedNode.id, 1, new Set()); // [placed, +1, +2, ...]

  // Find longest path going "down" the phases
  const backwardAsc = dfs(placedNode.id, -1, new Set()); // [placed, -1, -2, ...]

  // backwardAsc is [placed, -1, -2]. Reversing it gives [-2, -1, placed].
  // forwardAsc is [placed, +1, +2]. Slicing it gives [+1, +2].
  // chain = [-2, -1, placed, +1, +2]
  const chainAsc = [...backwardAsc.reverse().slice(0, -1), ...forwardAsc];

  if (chainAsc.length >= 3) {
    events.push({
      points: chainAsc.length,
      owner: card.owner as 'player' | 'opponent',
      type: 'CHAIN',
      nodeIds: chainAsc
    });
  }

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
