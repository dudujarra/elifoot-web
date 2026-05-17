/**
 * WinStreakModifierSystem.ts — SPEC-180 implementação
 *
 * Simétrico a LossStreakResponseSystem (SPEC-077). Detecta sequências
 * consecutivas de vitórias por team e aplica modifiers positivos.
 *
 * Pure module. Stateful via Map por teamId. Determinístico.
 */

// ── Types ──────────────────────────────────────────────────────

type Severity = 'none' | 'mild' | 'strong' | 'phenom';
type MatchResult = 'W' | 'D' | 'L';

interface StreakModifier {
    readonly attrBoost: number;
    readonly moraleDelta: number;
    readonly tensionDelta: number;
    readonly mediaEvent: boolean;
    readonly descriptor: string;
}

interface EvaluateOptions {
    teamId?: number;
    streakLength?: number | null;
    currentMorale?: number;
    currentTension?: number;
}

interface EvaluateResult {
    streakLength: number;
    severity: Severity;
    attrBoost: number;
    moraleDelta: number;
    tensionDelta: number;
    mediaEvent: boolean;
    descriptor: string;
    currentMorale: number;
    currentTension: number;
}

interface MatchModifiers {
    attrBonus: number;
    descriptor: string;
    severity: Severity;
}

// ── State ──────────────────────────────────────────────────────

const _winStreaks = new Map<number, number>();

// ── Constants ──────────────────────────────────────────────────

const SEVERITY_THRESHOLDS = {
    mild: 3,
    strong: 5,
    phenom: 7, // revisado de 8 pra 7 após baseline
} as const;

const MODIFIERS: Record<Severity, StreakModifier> = {
    none:   { attrBoost: 0, moraleDelta: 0,  tensionDelta: 0,   mediaEvent: false, descriptor: 'Sem embalo' },
    mild:   { attrBoost: 2, moraleDelta: 5,  tensionDelta: 0,   mediaEvent: false, descriptor: 'Embalo leve — time confiante' },
    strong: { attrBoost: 4, moraleDelta: 10, tensionDelta: -3,  mediaEvent: false, descriptor: 'Embalo forte — time joga solto' },
    phenom: { attrBoost: 6, moraleDelta: 15, tensionDelta: 5,   mediaEvent: true,  descriptor: 'Fenômeno — imprensa em delírio, board com expectativa alta' },
} as const;

const FEATURE_FLAG = 'ENABLE_WIN_STREAK';

function isFeatureEnabled(): boolean {
    // Gap fix #5: default ON após baseline review (AKITA-288 showed +variance OK).
    // Override via globalThis[FEATURE_FLAG] = false em testes que precisam off.
    if (typeof globalThis !== 'undefined' && (globalThis as Record<string, unknown>)[FEATURE_FLAG] === false) return false;
    return true;
}

// ── Functions ──────────────────────────────────────────────────

/**
 * Computa severity baseado no streak count.
 */
export function computeSeverity(streak: number): Severity {
    if (streak >= SEVERITY_THRESHOLDS.phenom) return 'phenom';
    if (streak >= SEVERITY_THRESHOLDS.strong) return 'strong';
    if (streak >= SEVERITY_THRESHOLDS.mild) return 'mild';
    return 'none';
}

/**
 * Registra resultado de partida (W/D/L) atualizando streak interno.
 */
export function recordResult({ teamId, result }: { teamId: number; result: MatchResult } = { teamId: 0, result: 'D' }): void {
    if (typeof teamId !== 'number') return;
    if (result === 'W') {
        _winStreaks.set(teamId, (_winStreaks.get(teamId) || 0) + 1);
    } else if (result === 'D' || result === 'L') {
        _winStreaks.set(teamId, 0);
    }
}

/**
 * Retorna streak atual.
 */
export function getCurrentStreak(teamId: number): number {
    return _winStreaks.get(teamId) || 0;
}

/**
 * Avalia situação de streak: severity + modifiers aplicáveis.
 */
export function evaluate({ teamId = 0, streakLength = null, currentMorale = 50, currentTension = 50 }: EvaluateOptions = {}): EvaluateResult {
    const streak = streakLength !== null && streakLength !== undefined ? streakLength : getCurrentStreak(teamId);
    const severity = computeSeverity(streak);
    const mods = MODIFIERS[severity];

    return {
        streakLength: streak,
        severity,
        attrBoost: mods.attrBoost,
        moraleDelta: mods.moraleDelta,
        tensionDelta: mods.tensionDelta,
        mediaEvent: mods.mediaEvent,
        descriptor: mods.descriptor,
        currentMorale,
        currentTension,
    };
}

/**
 * Modifier ready para aplicar em pré-jogo. Feature-flag gated.
 */
export function getModifiersForMatch(teamId: number): MatchModifiers {
    if (!isFeatureEnabled()) {
        return { attrBonus: 0, descriptor: '', severity: 'none' };
    }
    const streak = getCurrentStreak(teamId);
    const severity = computeSeverity(streak);
    return {
        attrBonus: MODIFIERS[severity].attrBoost,
        descriptor: MODIFIERS[severity].descriptor,
        severity,
    };
}

/**
 * Reset streak (test/dev).
 */
export function reset(teamId: number): void {
    if (typeof teamId === 'number') _winStreaks.delete(teamId);
}

export function resetAll(): void {
    _winStreaks.clear();
}

export { SEVERITY_THRESHOLDS, MODIFIERS, FEATURE_FLAG, isFeatureEnabled };
