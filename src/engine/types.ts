import { DetailedAttributes } from './PlayerAttributes.js';

export interface PlayerCareerStats {
    totalGoals: number;
    totalAssists: number;
    totalApps: number;
    totalCards: number;
    totalMotm: number;
    hatTricks: number;
    seasonGoals: number;
    seasonAssists: number;
    seasonApps: number;
    seasonCards: number;
    seasonMotm: number;
    history: { season: number, team: string, goals: number, assists: number, apps: number, cards: number, motm: number }[];
}

export interface Player {
    id: string | number;
    name: string;
    seasonGoals?: number;
    isBenched?: boolean;
    checkBenchStatus?: () => void;
    energy?: number;
    moral?: number;
    isTitular?: boolean;
    injury?: { weeks: number, type: string } | null;
    contract?: { weeksLeft: number, salary: number };
    value?: number;
    attributes: DetailedAttributes;
    position: string;
    ovr: number;
    potential?: number;
    loanResult?: string;
    fatigue?: number;
    form?: { last5: number[]; trend: string };
    age?: number;
    traits?: string[];
    salary?: number;
    loyalty?: number;
    personality?: string;
    isYouth?: boolean;
    trend?: number;
    last5?: number;
    _streak?: number;
    career?: PlayerCareerStats;
    naturalPosition?: string;
    _peakVariance?: number;
    _retired?: boolean;
    marketValue?: number;
    gamesThisSeason?: number;
    [key: string]: unknown;
}

export interface Team {
    id: number | string;
    name: string;
    squad: Player[];
    tactics?: unknown;
    formation?: string;
    money?: number;
    confidence?: number;
    history?: unknown[];
    teamId?: string | number | null;
    division?: number;
    balance?: number;
    stadium?: number;
    _lowMaintenanceWeeks?: number;
    [key: string]: unknown;
}

export interface Tournament {
    id: string;
    name: string;
    standings?: unknown[];
    fixtures?: unknown[][];
    currentMatches?: unknown[];
    scheduleWeeks?: number[];
    currentPhaseIndex?: number;
    isActive?: boolean;
    winner?: string | number | null;
    advanceWeek?: (engine: unknown, week: number) => unknown;
    [key: string]: unknown;
}

export interface MatchResult {
    home: number | string;
    away: number | string;
    played?: boolean;
    homeGoals?: number;
    awayGoals?: number;
    prePlayedResult?: unknown;
    score?: unknown;
    [key: string]: unknown;
}

export interface Manager {
    name: string;
    teamId?: string | number | null;
    money?: number;
    salary?: number;
    reputation?: number;
    tacticHistory?: Record<string, number>;
    careerHistory?: unknown[];
    hatTricks?: number;
    [key: string]: unknown;
}

export interface ModOptions {
    id?: string;
    text?: string;
    options?: unknown[];
    tier?: number;
    minuteRange?: number[];
    derby?: boolean;
    reactiveType?: string;
    [key: string]: unknown;
}
