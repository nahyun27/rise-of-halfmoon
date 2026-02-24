import { MoonCard } from "../types/game";

export type BoardType = (MoonCard | null)[][];

export interface ScoringEvent {
  points: number;
  owner: 'player' | 'opponent';
  type: 'PAIR' | 'FULL_MOON' | 'CHAIN';
  cells: { r: number; c: number }[];
}

const ORTHOGONAL_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

export function checkPhasePairs(board: BoardType, row: number, col: number): ScoringEvent[] {
  const card = board[row][col];
  if (!card) return [];

  const events: ScoringEvent[] = [];

  for (const [dr, dc] of ORTHOGONAL_DIRS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 6 && nc >= 0 && nc < 8) {
      const neighbor = board[nr][nc];
      if (neighbor && neighbor.phase === card.phase) {
        events.push({
          points: 1,
          owner: card.owner as 'player' | 'opponent',
          type: 'PAIR',
          cells: [{ r: row, c: col }, { r: nr, c: nc }]
        });
      }
    }
  }
  return events;
}

export function checkFullMoonPairs(board: BoardType, row: number, col: number): ScoringEvent[] {
  const card = board[row][col];
  if (!card) return [];

  const events: ScoringEvent[] = [];

  for (const [dr, dc] of ORTHOGONAL_DIRS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < 6 && nc >= 0 && nc < 8) {
      const neighbor = board[nr][nc];
      if (neighbor && Math.abs(neighbor.phase - card.phase) === 4) {
        events.push({
          points: 2,
          owner: card.owner as 'player' | 'opponent',
          type: 'FULL_MOON',
          cells: [{ r: row, c: col }, { r: nr, c: nc }]
        });
      }
    }
  }
  return events;
}

export function findLunarChains(board: BoardType, row: number, col: number): ScoringEvent[] {
  const card = board[row][col];
  if (!card) return [];

  const events: ScoringEvent[] = [];

  // Two axes: Horizontal (left-right) and Vertical (up-down)
  const axes = [
    [[0, -1], [0, 1]], // Horizontal axis (Left, Right)
    [[-1, 0], [1, 0]]  // Vertical axis (Up, Down)
  ];

  for (const axis of axes) {
    // We check 2 sequence directions for this physical line (e.g. going left is +1 vs going left is -1)
    for (const forwardIsPlus of [true, false]) {
      const chainCells: { r: number, c: number, phase: number }[] = [{ r: row, c: col, phase: card.phase }];

      const dir1 = axis[0]; // expand backwards
      const dir1Delta = forwardIsPlus ? -1 : 1;
      let currPhase = card.phase;
      let r = row + dir1[0]; let c = col + dir1[1];
      while (r >= 0 && r < 6 && c >= 0 && c < 8 && board[r]?.[c]) {
        const expectedPhase = (currPhase + dir1Delta + 8) % 8;
        if (board[r][c]!.phase === expectedPhase) {
          chainCells.unshift({ r, c, phase: expectedPhase });
          currPhase = expectedPhase;
          r += dir1[0]; c += dir1[1];
        } else break;
      }

      const dir2 = axis[1]; // expand forwards
      const dir2Delta = forwardIsPlus ? 1 : -1;
      currPhase = card.phase;
      r = row + dir2[0]; c = col + dir2[1];
      while (r >= 0 && r < 6 && c >= 0 && c < 8 && board[r]?.[c]) {
        const expectedPhase = (currPhase + dir2Delta + 8) % 8;
        if (board[r][c]!.phase === expectedPhase) {
          chainCells.push({ r, c, phase: expectedPhase });
          currPhase = expectedPhase;
          r += dir2[0]; c += dir2[1];
        } else break;
      }

      if (chainCells.length >= 3) {
        events.push({
          points: chainCells.length,
          owner: card.owner as 'player' | 'opponent',
          type: 'CHAIN',
          cells: chainCells.map(cell => ({ r: cell.r, c: cell.c }))
        });
        break; // don't double count if somehow both forwardIsPlus and !forwardIsPlus pass (impossible unless all cards are same, but we already handled same phases in checkPhasePairs)
      }
    }
  }

  return events;
}

export function evaluatePlacement(board: BoardType, row: number, col: number): ScoringEvent[] {
  const pairs = checkPhasePairs(board, row, col);
  const fullMoons = checkFullMoonPairs(board, row, col);
  const chains = findLunarChains(board, row, col);

  // Combine all valid scoring events
  return [...pairs, ...fullMoons, ...chains];
}
