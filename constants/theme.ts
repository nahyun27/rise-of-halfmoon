import { BoardLayout } from '../types/game';

export type ScoreType = 'PAIR' | 'FULL_MOON' | 'CHAIN';

// Keep in sync with the --color-pair / --color-fullmoon / --color-chain tokens in globals.css
export const SCORE_COLORS: Record<ScoreType, string> = {
  PAIR: '#5fb8ff',
  FULL_MOON: '#f6d27a',
  CHAIN: '#b98cff',
};

export const SCORE_LABELS: Record<ScoreType, string> = {
  PAIR: 'Pair',
  FULL_MOON: 'Full Moon',
  CHAIN: 'Lunar Cycle',
};

export const OWNER_COLORS = {
  player: '#a9c1ff',
  opponent: '#ff7a90',
} as const;

export interface BoardTheme {
  // Nebula glow behind the board
  glow: string;
  // Secondary glow, offset for depth
  glow2: string;
  // Edge between two nodes that do not score together
  line: string;
  // Edge between two placed cards
  lineActive: string;
}

export const BOARD_THEMES: Record<BoardLayout['theme'], BoardTheme> = {
  blue:   { glow: 'rgba(56, 109, 255, 0.28)',  glow2: 'rgba(0, 190, 255, 0.12)',  line: 'rgba(120, 150, 255, 0.22)', lineActive: 'rgba(150, 180, 255, 0.7)' },
  green:  { glow: 'rgba(40, 200, 150, 0.22)',  glow2: 'rgba(80, 140, 255, 0.12)', line: 'rgba(110, 220, 180, 0.22)', lineActive: 'rgba(140, 235, 200, 0.7)' },
  purple: { glow: 'rgba(160, 90, 255, 0.28)',  glow2: 'rgba(255, 110, 200, 0.10)', line: 'rgba(180, 140, 255, 0.24)', lineActive: 'rgba(200, 170, 255, 0.7)' },
  indigo: { glow: 'rgba(99, 102, 241, 0.30)',  glow2: 'rgba(56, 189, 248, 0.10)', line: 'rgba(140, 145, 255, 0.24)', lineActive: 'rgba(170, 175, 255, 0.7)' },
  red:    { glow: 'rgba(255, 80, 110, 0.22)',  glow2: 'rgba(255, 170, 80, 0.10)', line: 'rgba(255, 140, 160, 0.22)', lineActive: 'rgba(255, 170, 185, 0.7)' },
  yellow: { glow: 'rgba(246, 190, 80, 0.22)',  glow2: 'rgba(255, 120, 80, 0.10)', line: 'rgba(246, 210, 122, 0.22)', lineActive: 'rgba(250, 225, 160, 0.7)' },
};

export const PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
];
