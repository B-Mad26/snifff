// Cross-app constants. Single source of truth.

export const APP_NAME = 'Snifff';
export const APP_TAGLINE = 'The home page of pet life.';

// Daily swipe quotas
export const DAILY_SWIPE_LIMITS: Record<string, number> = {
  FREE: 50, PLUS: -1, GOLD: -1, BREEDER_PRO: -1,
};

// Compatibility weights — keep in sync with apps/api/src/modules/matches/compatibility.service.ts
export const COMPATIBILITY_WEIGHTS = {
  distance: 0.25,
  breed: 0.15,
  personality: 0.15,
  size: 0.10,
  age: 0.10,
  activity: 0.10,
  health: 0.10,
  owner: 0.05,
} as const;

// Bumble-style 24h initiation window for matches
export const MATCH_INITIATOR_WINDOW_MS = 24 * 60 * 60 * 1000;

// Toxicity score threshold above which messages are blocked
export const TOXICITY_BLOCK_THRESHOLD = 0.9;

// Subscription tier rank
export const TIER_RANK = ['FREE', 'PLUS', 'GOLD', 'BREEDER_PRO'] as const;
