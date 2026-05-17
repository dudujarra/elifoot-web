/**
 * LossStreakResponseSystem — SPEC-077: Resposta a Sequência de Derrotas
 *
 * Sequências de derrotas geram choices de gestão de crise para player,
 * resposta automática para NPCs.
 *
 * Partially stateful: rastreia streak por time.
 */

import { rng as systemRng } from './rng.js';

const MORALE_FLOOR = 5;

export type StreakSeverity = 'none' | 'mild' | 'serious' | 'crisis' | 'collapse';
export type MatchResult = 'W' | 'D' | 'L';

export interface NpcResponse {
    readonly action: string;
    readonly description: string;
}

const NPC_RESPONSES: readonly NpcResponse[] = [
    { action: 'tactic_change', description: 'Time NPC muda tática para sair da crise.' },
    { action: 'emergency_training', description: 'Time NPC intensifica treinos.' },
    { action: 'star_benched', description: 'Time NPC banca estrela para reação.' },
];

export interface ResponseEffect {
    readonly moraleDelta: number;
    readonly tensionDelta: number;
}

export interface ResponseOption {
    readonly id: string;
    readonly label: string;
    readonly effect: ResponseEffect;
}

const RESPONSE_OPTIONS: readonly ResponseOption[] = [
    { id: 'squad_meeting', label: 'Reunião de elenco', effect: { moraleDelta: +10, tensionDelta: 0 } },
    { id: 'intensive_training', label: 'Semana de treino intensivo', effect: { moraleDelta: +5, tensionDelta: 0 } },
    { id: 'change_tactic', label: 'Mudar tática radicalmente', effect: { moraleDelta: 0, tensionDelta: -5 } },
    { id: 'public_statement', label: 'Coletiva de imprensa positiva', effect: { moraleDelta: +8, tensionDelta: +5 } },
    { id: 'resign', label: 'Pedir demissão', effect: { moraleDelta: 0, tensionDelta: 0 } },
];

const _streaks: Map<number, number> = new Map();

export interface EvaluateOpts {
    readonly teamId?: number;
    readonly managerId?: number;
    readonly streakLength?: number;
    readonly currentTension?: number;
    readonly squadMorale?: number;
    readonly isPlayerManager?: boolean;
    readonly week?: number;
}

export interface LossStreakResult {
    readonly streakSeverity: StreakSeverity;
    readonly forcedEvent: boolean;
    readonly moraleFloorApplied: boolean;
    readonly newMorale: number;
    readonly tensionApplied: number | null;
    readonly npcResponse?: NpcResponse;
    readonly responseOptions?: readonly ResponseOption[];
}

/**
 * Avalia resposta necessária para sequência de derrotas.
 */
export function evaluate({
    teamId: _teamId = 0,
    managerId: _managerId = 0,
    streakLength = 0,
    currentTension: _currentTension = 50,
    squadMorale = 50,
    isPlayerManager = true,
    week: _week = 1,
}: EvaluateOpts = {}): LossStreakResult {
    const severity: StreakSeverity = computeSeverity(streakLength);
    const forcedEvent: boolean = isPlayerManager && streakLength >= 8;

    const moraleFloorApplied: boolean = squadMorale < MORALE_FLOOR;
    const newMorale: number = Math.max(MORALE_FLOOR, squadMorale);

    let tensionApplied: number | null = null;
    if (streakLength >= 11) {
        tensionApplied = -40;
    }

    if (!isPlayerManager) {
        const npcResponse: NpcResponse = NPC_RESPONSES[Math.floor(systemRng() * NPC_RESPONSES.length)];
        return { streakSeverity: severity, forcedEvent: false, npcResponse, moraleFloorApplied, newMorale, tensionApplied };
    }

    const result: LossStreakResult = { streakSeverity: severity, forcedEvent, moraleFloorApplied, newMorale, tensionApplied,
        ...(streakLength >= 5 ? { responseOptions: RESPONSE_OPTIONS } : {}),
    };

    return result;
}

/**
 * Registra resultado de uma partida (W/D/L).
 */
export function recordResult({ teamId, result }: { teamId: number; result: MatchResult }): void {
    if (result === 'W') {
        _streaks.set(teamId, 0);
    } else if (result === 'L') {
        _streaks.set(teamId, (_streaks.get(teamId) || 0) + 1);
    }
    // Draw: no change
}

/**
 * Retorna streak atual de um time.
 */
export function getCurrentStreak(teamId: number): number {
    return _streaks.get(teamId) || 0;
}

// ─── helpers ────────────────────────────────────────────────

function computeSeverity(streak: number): StreakSeverity {
    if (streak >= 11) return 'collapse';
    if (streak >= 8)  return 'crisis';
    if (streak >= 5)  return 'serious';
    if (streak >= 3)  return 'mild';
    return 'none';
}
