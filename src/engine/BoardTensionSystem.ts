/**
 * BoardTensionSystem — SPEC-072: Tensão Acumulada com Presidente
 *
 * Sistema de tensão -100..+100 entre técnico e board.
 * Expand SPEC-006 BoardSystem: demissões com causa explícita, carta branca, ultimato.
 *
 * Stateless: recebe eventos, retorna novo estado de tensão.
 */

const TENSION_FLOOR = -100;
const TENSION_CAP = +100;

export type BoardEventType =
    | 'board_sold_player'
    | 'board_forced_tactic'
    | 'board_denied_signing'
    | 'win_streak'
    | 'title_won'
    | 'loss_streak'
    | 'press_conference_positive'
    | 'press_conference_hostile'
    | 'contract_fulfilled';

export type BoardThreshold = 'carta_branca' | 'normal' | 'cobrado' | 'ultimato' | 'demitido';

const EVENT_DELTAS: Record<BoardEventType, number> = {
    board_sold_player: -20,
    board_forced_tactic: -15,
    board_denied_signing: -10,
    win_streak: +8,
    title_won: +25,
    loss_streak: -15,
    press_conference_positive: +5,
    press_conference_hostile: -10,
    contract_fulfilled: +20,
};

const BOARD_MESSAGES: Record<string, string> = {
    carta_branca: 'O presidente está satisfeito. Você tem total autonomia.',
    cobrado: 'O presidente está de olho. Resultados são esperados.',
    ultimato: 'Ultimato: mais uma temporada ruim e você será demitido.',
    demitido: 'O clube decidiu demiti-lo. Boa sorte na sua próxima aventura.',
};

export interface TensionResult {
    newTension: number;
    tensionDelta: number;
    threshold: BoardThreshold;
    thresholdChanged: boolean;
    boardMessage?: string;
}

/**
 * Aplica evento de tensão e retorna novo estado.
 */
export function apply({ currentTension = 50, eventType }: { currentTension?: number; eventType: BoardEventType }): TensionResult {
    const delta = EVENT_DELTAS[eventType] ?? 0;
    const rawNew = currentTension + delta;
    const newTension = clamp(rawNew);

    const prevThreshold = computeThreshold(currentTension);
    const threshold = computeThreshold(newTension);
    const thresholdChanged = threshold !== prevThreshold;
    const boardMessage = thresholdChanged ? BOARD_MESSAGES[threshold] : undefined;

    return { newTension, tensionDelta: delta, threshold, thresholdChanged, boardMessage };
}

/**
 * Retorna se o board pode interferir (falso em carta_branca).
 */
export function canBoardInterfere({ tension }: { tension: number }): boolean {
    return computeThreshold(tension) !== 'carta_branca';
}

interface ManagerSave {
    boardTension?: number;
    [key: string]: unknown;
}

interface SaveData {
    managers?: Record<number, ManagerSave>;
    [key: string]: unknown;
}

/**
 * Season end — tensão NÃO reseta (memória de longo prazo).
 */
export function endSeason(save: SaveData, managerId: number): SaveData {
    if (!save.managers) save.managers = {};
    if (!save.managers[managerId]) save.managers[managerId] = {};
    const t = save.managers[managerId].boardTension ?? 50;
    save.managers[managerId].boardTension = clamp(t);
    return save;
}

// ─── helpers ────────────────────────────────────────────────

function computeThreshold(tension: number): BoardThreshold {
    if (tension >= 80) return 'carta_branca';
    if (tension >= 40) return 'normal';
    if (tension >= 10) return 'cobrado';
    if (tension >= -20) return 'ultimato';
    return 'demitido';
}

function clamp(v: number): number {
    return Math.max(TENSION_FLOOR, Math.min(TENSION_CAP, v));
}
