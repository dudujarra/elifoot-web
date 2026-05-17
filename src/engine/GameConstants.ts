/**
 * GameConstants.ts — Centralized game-balance constants
 *
 * Houses all physics, finance, and game-balance thresholds
 * that were previously scattered as magic numbers across the engine.
 *
 * Organized by domain to make balancing sessions easy.
 */

// ============================================================
// MORAL / MORALE
// ============================================================
export const MORALE = {
  MIN:            0,
  MAX:          100,
  DEFAULT:       50,
  CRISIS:        30,   // Below this = crisis mode
  HAPPY:         70,   // Above this = happy/bonus effects
  HIGH:          75,   // Satisfaction bonus threshold
  FLOOR_RELEGATION: 15, // Min moral after relegation
  FLOOR_MENTALIST: 40, // Mentalist trait prevents below this
} as const;

export type MoraleKey = keyof typeof MORALE;

// ============================================================
// PLAYER AGE
// ============================================================
export const AGE = {
  YOUTH_MAX:     21,   // Sub-21 = youth
  YOUTH_BONUS:   22,   // Below this = young player satisfaction bonus
  PRIME_START:   23,   // Peak season eligibility start
  PRIME_END:     27,   // Peak season eligibility end
  VETERAN_START: 32,   // Decline curve begins
  VETERAN_BONUS: 33,   // Above this = veteran satisfaction bonus
  DEFAULT:       25,   // Fallback age
} as const;

export type AgeKey = keyof typeof AGE;

// ============================================================
// OVR (Overall Rating)
// ============================================================
export const OVR = {
  FLOOR:         30,   // Absolute minimum
  CAP:           99,   // Absolute maximum
  DEFAULT:       50,   // Fallback OVR
  STAR:          75,   // Star player threshold
  ELITE:         80,   // Elite squad bonus threshold
  GOOD:          70,   // Good squad threshold
  DECENT:        60,   // Decent squad threshold
} as const;

export type OvrKey = keyof typeof OVR;

// ============================================================
// ENERGY / FITNESS
// ============================================================
export const ENERGY = {
  MIN:            0,
  MAX:          100,
  DEFAULT:      100,
  EXHAUSTED:     30,   // Below this = injury risk doubles
  CRITICAL:      15,   // Below this = injury risk triples
} as const;

// ============================================================
// SATISFACTION / AMBITION
// ============================================================
export const SATISFACTION = {
  MIN:            0,
  MAX:          100,
  DEFAULT:       50,
  CRISIS:        30,   // Below = morale drop + potential transfer request
  TRANSFER_REQ:  25,   // Below = may request transfer
  REBELLION:     15,   // Below = locker room instability
  HAPPY:         70,   // Above = positive effects
  WITHDRAW_REQ:  60,   // Above = may withdraw transfer request
} as const;

// ============================================================
// BOARD / CONFIDENCE
// ============================================================
export const BOARD = {
  INITIAL_CONFIDENCE: 60,
  FIRE_PROTECTION_WEEKS: 8,
  BUDGET_HIGH:   200_000_000,
} as const;

// ============================================================
// INJURY
// ============================================================
export const INJURY = {
  BASE_MATCH_CHANCE:    0.04,  // 4% per match
  BASE_TRAINING_DOUBLE: 0.06,  // 6% for double session
  BASE_TRAINING:        0.02,  // 2% for normal training
  EXHAUSTION_MULTIPLIER: 2.0,
  CRITICAL_MULTIPLIER:   3.0,
  VETERAN_MULTIPLIER:    1.5,
  YOUTH_MULTIPLIER:      0.7,
} as const;

// ============================================================
// TRANSFER MARKET
// ============================================================
export const MARKET = {
  WAGE_REDUCTION_RELEGATION: 0.65,  // Salaries cut to 65% on relegation
  RELEGATION_CLAUSE_RATE:    0.40,  // Player value * 40% = release clause
} as const;

// ============================================================
// GROWTH EVENTS
// ============================================================
export const GROWTH = {
  YOUTH_BREAKTHROUGH_CHANCE: 0.04,
  HOT_STREAK_CHANCE:         0.06,
  PEAK_SEASON_CHANCE:        0.08,
  TRAINING_BREAKTHROUGH_CHANCE: 0.12,
  HOT_STREAK_DURATION:       4,    // weeks
  PRIME_GAMES_THRESHOLD:     15,   // games this season to qualify
  WINNING_STREAK_THRESHOLD:  5,    // consecutive wins
} as const;

// ============================================================
// NPC TACTICS
// ============================================================
export const NPC = {
  DEFAULT_BOREDOM_THRESHOLD: 10,
  DEFAULT_BOREDOM_CHANCE:    0.30,
  RELEGATION_ZONE_OFFSET:   4,    // totalTeams - 4
  OVR_DIFF_EQUAL:           3,    // abs diff <= 3 = equal
  OVR_DIFF_BIG:             8,    // abs diff >= 8 = big mismatch
} as const;
