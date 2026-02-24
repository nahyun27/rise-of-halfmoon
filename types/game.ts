export interface MoonCard {
  id: string;
  phase: number; // 0-7
  owner: 'player' | 'opponent' | null;
}

export interface BoardNode {
  id: string;
  position: { x: number; y: number }; // Visual position in percentage (0-100) or pixels. Let's use 0-100% for relative positioning inside a container.
  card: MoonCard | null;
  connectedTo: string[]; // IDs of connected nodes
}

export interface BoardLayout {
  levelNumber: number;
  name: string;
  theme: 'blue' | 'purple' | 'green' | 'red' | 'indigo' | 'yellow';
  nodes: BoardNode[];
}

export interface GameState {
  layout: BoardLayout;
  playerHand: MoonCard[];
  opponentHand: MoonCard[];
  playerScore: number;
  opponentScore: number;
  playerHealth: number;
  opponentHealth: number;
  currentTurn: 'player' | 'opponent';
}
