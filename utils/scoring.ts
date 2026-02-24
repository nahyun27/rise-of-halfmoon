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

  // Finding sequences: A valid chain must be ascending (+1) or descending (-1).
  // Wait, chronological order: either 0 -> 1 -> 2..., or 2 -> 1 -> 0... (reverse chronological is also a sequence visually on the board).
  // Actually, we can just do BFS to find paths of strictly +1 or -1 phase.
  // We'll search for paths extending outwards that match the +1 delta, and separately the -1 delta.

  function dfs(currentId: string, phaseDelta: 1 | -1, visited: Set<string>): string[] {
    const node = nodeMap.get(currentId);
    if (!node || !node.card) return [currentId];

    let longestPath: string[] = [currentId];
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
            if (subPath.length + 1 > longestPath.length) {
              longestPath = [currentId, ...subPath];
            }
          }
        }
      }
    }

    visited.delete(currentId);
    return longestPath;
  }

  // A path going forward (+1) and a path going backward (-1) connect through the placed node.
  // Ascending sequence mapping (e.g. 1 -> 2 -> 3)
  const forwardAsc = dfs(placedNode.id, 1, new Set()); // 2 -> 3
  const backwardAsc = dfs(placedNode.id, -1, new Set()); // 2 -> 1 -> 0

  // The actual chain is backwardAsc reversed + placed Node + forwardAsc without placed node
  // example: backward: [placed, 1, 0]. forward: [placed, 3, 4].
  // chain: [0, 1, placed, 3, 4] -> length 5.
  const chainAsc = [...backwardAsc.reverse(), ...forwardAsc.slice(1)];

  if (chainAsc.length >= 3) {
    events.push({
      points: chainAsc.length,
      owner: card.owner as 'player' | 'opponent',
      type: 'CHAIN',
      nodeIds: chainAsc
    });
  }

  // Descending sequence mapping (e.g. 3 -> 2 -> 1)
  // This is actually physically exactly the same chain but in reverse chronological order!
  // BUT the check in the prompt stated: "3+ consecutive phases in order. Can wrap around. Score = chain length."
  // Typically this means strictly 0,1,2,3... but on a graph, since the edges are undirected, if [0,1,2] exists,
  // that implies "0 is connected to 1, 1 is connected to 2". We already found it with the Ascending check.
  // There's no separate directed line. Finding it once is enough!

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
