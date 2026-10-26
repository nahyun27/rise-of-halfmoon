// Player records persisted in localStorage: per-level stars, lifetime totals and
// daily challenge results. Everything degrades to empty records if storage is unavailable.

export type Outcome = 'win' | 'lose' | 'draw';

export interface GameStats {
  pairs: number;
  fullMoons: number;
  cycles: number;
  longestCycle: number;
  steals: number;
}

export const EMPTY_STATS: GameStats = { pairs: 0, fullMoons: 0, cycles: 0, longestCycle: 0, steals: 0 };

export interface LevelRecord {
  stars: number; // best 0–3
  bestScore: number;
  bestMargin: number;
  wins: number;
  plays: number;
}

export interface DailyResult {
  outcome: Outcome;
  playerScore: number;
  opponentScore: number;
  stats: GameStats;
}

export interface Records {
  version: 1;
  levels: Record<number, LevelRecord>;
  totals: { games: number, wins: number, losses: number, draws: number, pairs: number, fullMoons: number, cycles: number, steals: number };
  bests: { score: number, margin: number, longestCycle: number };
  daily: Record<string, DailyResult>;
}

const STORAGE_KEY = 'halfmoon_records';

export function emptyRecords(): Records {
  return {
    version: 1,
    levels: {},
    totals: { games: 0, wins: 0, losses: 0, draws: 0, pairs: 0, fullMoons: 0, cycles: 0, steals: 0 },
    bests: { score: 0, margin: 0, longestCycle: 0 },
    daily: {},
  };
}

export function loadRecords(): Records {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyRecords();
    const parsed = JSON.parse(raw) as Partial<Records>;
    const base = emptyRecords();
    return {
      ...base,
      ...parsed,
      totals: { ...base.totals, ...parsed.totals },
      bests: { ...base.bests, ...parsed.bests },
      levels: parsed.levels ?? {},
      daily: parsed.daily ?? {},
    };
  } catch {
    return emptyRecords();
  }
}

export function saveRecords(records: Records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Storage full or blocked: records just won't persist
  }
}

// ---------------------------------------------------------------------------
// Stars
// ---------------------------------------------------------------------------

// Winning margins needed for 1, 2 and 3 stars. Bigger boards allow bigger margins.
export function starThresholds(nodeCount: number): [number, number, number] {
  return [1, Math.ceil(nodeCount / 3), Math.ceil((nodeCount * 2) / 3)];
}

export function computeStars(margin: number, nodeCount: number): number {
  const [one, two, three] = starThresholds(nodeCount);
  if (margin >= three) return 3;
  if (margin >= two) return 2;
  if (margin >= one) return 1;
  return 0;
}

function addGameToTotals(records: Records, outcome: Outcome, playerScore: number, margin: number, stats: GameStats): Records {
  const t = records.totals;
  return {
    ...records,
    totals: {
      games: t.games + 1,
      wins: t.wins + (outcome === 'win' ? 1 : 0),
      losses: t.losses + (outcome === 'lose' ? 1 : 0),
      draws: t.draws + (outcome === 'draw' ? 1 : 0),
      pairs: t.pairs + stats.pairs,
      fullMoons: t.fullMoons + stats.fullMoons,
      cycles: t.cycles + stats.cycles,
      steals: t.steals + stats.steals,
    },
    bests: {
      score: Math.max(records.bests.score, playerScore),
      margin: Math.max(records.bests.margin, margin),
      longestCycle: Math.max(records.bests.longestCycle, stats.longestCycle),
    },
  };
}

export interface CampaignResult {
  records: Records;
  stars: number;
  previousStars: number;
  isNewBestScore: boolean;
}

export function recordCampaignGame(
  records: Records,
  levelNumber: number,
  nodeCount: number,
  outcome: Outcome,
  playerScore: number,
  opponentScore: number,
  stats: GameStats,
): CampaignResult {
  const margin = playerScore - opponentScore;
  const stars = outcome === 'win' ? computeStars(margin, nodeCount) : 0;
  const prev = records.levels[levelNumber] ?? { stars: 0, bestScore: 0, bestMargin: 0, wins: 0, plays: 0 };

  const next = addGameToTotals(records, outcome, playerScore, margin, stats);
  next.levels = {
    ...records.levels,
    [levelNumber]: {
      stars: Math.max(prev.stars, stars),
      bestScore: Math.max(prev.bestScore, playerScore),
      bestMargin: Math.max(prev.bestMargin, margin),
      wins: prev.wins + (outcome === 'win' ? 1 : 0),
      plays: prev.plays + 1,
    },
  };

  return { records: next, stars, previousStars: prev.stars, isNewBestScore: prev.plays > 0 && playerScore > prev.bestScore };
}

// ---------------------------------------------------------------------------
// Daily challenge
// ---------------------------------------------------------------------------

// Daily #1 is the launch day
const DAILY_EPOCH = '2026-10-26';
const DAY_MS = 24 * 60 * 60 * 1000;

export function getDailyKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Keys are compared as UTC dates so daylight saving shifts can't skip a number
function keyToDayIndex(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function getDailyNumber(key: string): number {
  return keyToDayIndex(key) - keyToDayIndex(DAILY_EPOCH) + 1;
}

export function getDailyStreak(records: Records, todayKey: string): number {
  const today = keyToDayIndex(todayKey);
  const played = new Set(Object.keys(records.daily).map(keyToDayIndex));
  // Today not played yet doesn't break the streak
  let day = played.has(today) ? today : today - 1;
  let streak = 0;
  while (played.has(day)) {
    streak++;
    day--;
  }
  return streak;
}

export function msUntilNextDaily(now = new Date()): number {
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime() - now.getTime();
}

export function recordDailyGame(records: Records, key: string, result: DailyResult): Records {
  // Only the first finished attempt of the day counts
  if (records.daily[key]) return records;
  const next = addGameToTotals(records, result.outcome, result.playerScore, result.playerScore - result.opponentScore, result.stats);
  next.daily = { ...records.daily, [key]: result };
  return next;
}

const OUTCOME_LINE: Record<Outcome, string> = {
  win: '🌕 Victory',
  lose: '🌑 Defeat',
  draw: '🌗 Draw',
};

export function buildShareText(dailyNumber: number, result: DailyResult, streak: number, url: string): string {
  const { stats } = result;
  const lines = [
    `Rise of the Half Moon · Daily #${dailyNumber}`,
    `${OUTCOME_LINE[result.outcome]} ${result.playerScore}–${result.opponentScore}`,
    `🌒🌒 ${stats.pairs}  🌒🌖 ${stats.fullMoons}  🌑🌒🌓 ${stats.longestCycle || '–'}`,
  ];
  if (streak > 1) lines.push(`🔥 ${streak}-day streak`);
  lines.push(url);
  return lines.join('\n');
}
