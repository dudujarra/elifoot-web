import { rng as systemRng } from './rng.js';
import { getNpcProfile } from './NpcBehaviorProfile.js';
import { NPC } from './GameConstants.js';
import { Team } from "./types.js";

/**
 * NpcTacticAdvisor — SPEC-131: AI Tactic Pivot
 *
 * Detecta tática ineficaz em times NPC e sugere adaptação.
 * Resolve TACTIC_STUCK (100+ eventos em 203 seasons, Monotony score=11).
 * SPEC-137: suporta 4 levels de dificuldade via NpcBehaviorProfile.
 *
 * Stateless: não muta nada, retorna sugestão.
 */

const TACTIC_KEYS: string[] = ['normal', 'offensive', 'defensive', 'pressing', 'counter', 'possession'];

export interface TacticAdviceOptions {
    currentTactic: string;
    recentResults?: string[];
    squadOvr?: number;
    opponentOvr?: number;
    tacticAge?: number;
    seed?: number | null;
    npcLevel?: string | null;
    isHome?: boolean;
    position?: number;
    totalTeams?: number;
}

export interface TacticAdviceResult {
    tactic: string;
    changed: boolean;
    reason: string | null;
}

export interface NpcTacticState {
    currentTactic: string;
    tacticAge: number;
    recentResults: string[];
}

export interface TacticContext {
    isHome?: boolean;
    losses?: number;
    position?: number;
    totalTeams?: number;
}

export function adviseTactic({ currentTactic, recentResults = [], squadOvr = 65, opponentOvr = 65, tacticAge = 0, seed = null, npcLevel = null, isHome = true, position = 10, totalTeams = 20 }: TacticAdviceOptions): TacticAdviceResult {
    const rand = seed !== null ? seededRandom(seed) : systemRng;
    const profile = npcLevel ? getNpcProfile(npcLevel as any) : null;

    const losses = countTrailingLosses(recentResults);
    const ovrDiff = squadOvr - opponentOvr;

    // SPEC-137: usar tacticFlexibility do profile se fornecido
    const boredomThreshold = profile ? Math.round(1 / (profile.tacticFlexibility || 0.10)) : NPC.DEFAULT_BOREDOM_THRESHOLD;
    const boredomChance = profile ? profile.tacticFlexibility * 3 : NPC.DEFAULT_BOREDOM_CHANCE;

    if (tacticAge >= boredomThreshold && rand() < boredomChance) {
        const newTactic = selectNewTactic(currentTactic, ovrDiff, rand, { isHome, losses, position, totalTeams });
        return { tactic: newTactic, changed: true, reason: 'boredom_rotation' };
    }

    // Stabilize after 2+ wins with current tactic (don't change a winning formula)
    const recentWins = recentResults.slice(0, 2).filter((r: unknown) => r === 'W').length;
    if (recentWins >= 2 && tacticAge >= 2) {
        return { tactic: currentTactic, changed: false, reason: null };
    }

    // Determine pivot probability based on losing streak
    let pivotChance = 0;
    if (losses >= 5) pivotChance = 0.95;
    else if (losses >= 3) pivotChance = 0.70;
    else if (losses >= 2) pivotChance = 0.30;

    if (pivotChance === 0 || rand() > pivotChance) {
        return { tactic: currentTactic, changed: false, reason: null };
    }

    // Pick new tactic (not current one, considering context)
    const newTactic = selectNewTactic(currentTactic, ovrDiff, rand, { isHome, losses, position, totalTeams });
    const reason = losses >= 5 ? 'losing_streak' : losses >= 3 ? 'losing_streak' : 'ovr_mismatch';

    return { tactic: newTactic, changed: true, reason };
}

/**
 * Inicializa estado de tática para um time NPC.
 */
export function initNpcTacticState(): NpcTacticState {
    return {
        currentTactic: 'normal',
        tacticAge: 0,
        recentResults: [],
    };
}

/**
 * Atualiza estado após partida (registra resultado).
 */
export function recordNpcResult(state: NpcTacticState, result: string): NpcTacticState {
    const updated = { ...state };
    updated.recentResults = [result, ...state.recentResults].slice(0, 10);
    updated.tacticAge = state.tacticAge + 1;
    return updated;
}

/**
 * Aplica sugestão de tática ao estado.
 */
export function applyNpcTacticAdvice(state: NpcTacticState, advice: TacticAdviceResult): NpcTacticState {
    if (!advice.changed) return { ...state, tacticAge: state.tacticAge };
    return { ...state, currentTactic: advice.tactic, tacticAge: 0 };
}

// ─── helpers ────────────────────────────────────────────────

function countTrailingLosses(results: string[]): number {
    let count = 0;
    for (const r of results) {
        if (r === 'L') count++;
        else break;
    }
    return count;
}

function selectNewTactic(current: string, ovrDiff: number, rand: () => number, context: TacticContext = {}): string {
    const { isHome = true, losses = 0, position = 10, totalTeams = 20 } = context;
    let preferred: string[];

    const isRelegationZone = position > totalTeams - NPC.RELEGATION_ZONE_OFFSET;
    const isEqual = Math.abs(ovrDiff) <= NPC.OVR_DIFF_EQUAL;
    const needsResult = isHome && (losses === 1 || losses === 2); // perdeu recente e agora joga em casa

    if (losses >= 3 || isRelegationZone) {
        // "Se perdendo ou ruim no campeonato, ele joga na defesa"
        preferred = ['defensive', 'counter'];
    } else if (isEqual || needsResult) {
        // "Se ele tiver no igual ele joga solto" / "Se ele precisa de resultado joga solto"
        preferred = isHome ? ['offensive', 'pressing'] : ['normal', 'counter'];
    } else if (ovrDiff <= -NPC.OVR_DIFF_BIG) {
        // Muito mais fraco
        preferred = isHome ? ['defensive', 'counter'] : ['defensive'];
    } else if (ovrDiff >= NPC.OVR_DIFF_BIG) {
        // Muito mais forte
        preferred = isHome ? ['offensive', 'possession'] : ['normal', 'offensive'];
    } else {
        // Balanced/fallback
        preferred = isHome ? ['normal', 'offensive'] : ['normal', 'defensive'];
    }

    const candidates = preferred.filter((t: string) => t !== current);
    if (candidates.length === 0) {
        // Fallback: any tactic except current
        const fallback = TACTIC_KEYS.filter((t: string) => t !== current);
        return fallback[Math.floor(rand() * fallback.length)];
    }
    return candidates[Math.floor(rand() * candidates.length)];
}

function seededRandom(seed: number): () => number {
    let s = seed;
    return function () {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}
