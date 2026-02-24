export interface MoonCard {
  id: string;
  phase: number; // 0-7
  owner: 'player' | 'opponent' | null;
}

export interface GameState {
  board: (MoonCard | null)[][]; // 2D grid
  playerHand: MoonCard[];
  opponentHand: MoonCard[];
  playerScore: number;
  opponentScore: number;
  playerHealth: number;
  opponentHealth: number;
  currentTurn: 'player' | 'opponent';
}
