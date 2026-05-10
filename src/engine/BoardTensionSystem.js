/**
 * BoardTensionSystem — SPEC-072: Tensão Acumulada com Presidente
 *
 * Sistema de tensão -100..+100 entre técnico e board.
 * Expand SPEC-006 BoardSystem: demissões com causa explícita, carta branca, ultimato.
 *
 * Stateless: recebe eventos, retorna novo estado de tensão.
 */

const TENSION_FLOOR = -100;
const TENSION_CAP   = +100;

const EVENT_DELTAS = {
    board_sold_player:          -20,
    board_forced_tactic:        -15,
    board_denied_signing:       -10,
    win_streak:                 +8,
    title_won:                  +25,
    loss_streak:                -15,
    press_conference_positive:  +5,
    press_conference_hostile:   -10,
    contract_fulfilled:         +20,
};

const BOARD_MESSAGES = {
    carta_branca: 'O presidente está satisfeito. Você tem total autonomia.',
    cobrado:      'O presidente está de olho. Resultados são esperados.',
    ultimato:     'Ultimato: mais uma temporada ruim e você será demitido.',
    demitido:     'O clube decidiu demiti-lo. Boa sorte na sua próxima aventura.',
};

/**
 * Aplica evento de tensão e retorna novo estado.
 *
 * @param {object} opts
 * @param {number} [opts.currentTension=50]
 * @param {string} opts.eventType
 * @returns {{ newTension, tensionDelta, threshold, thresholdChanged, boardMessage? }}
 */
export function apply({ currentTension = 50, eventType }) {
    const delta = EVENT_DELTAS[eventType] ?? 0;
    const rawNew = currentTension + delta;
    const newTension = clamp(rawNew);
    const tensionDelta = delta; // report intended delta, not clamped

    const prevThreshold = computeThreshold(currentTension);
    const threshold = computeThreshold(newTension);
    const thresholdChanged = threshold !== prevThreshold;
    const boardMessage = thresholdChanged ? BOARD_MESSAGES[threshold] : undefined;

    return { newTension, tensionDelta, threshold, thresholdChanged, boardMessage };
}

/**
 * Retorna se o board pode interferir (falso em carta_branca).
 *
 * @param {object} opts
 * @param {number} opts.tension
 * @returns {boolean}
 */
export function canBoardInterfere({ tension }) {
    return computeThreshold(tension) !== 'carta_branca';
}

/**
 * Season end — tensão NÃO reseta (memória de longo prazo).
 * Apenas garante que o estado persistido é válido.
 *
 * @param {object} save
 * @param {number} managerId
 * @returns {object} save atualizado (idempotente)
 */
export function endSeason(save, managerId) {
    if (!save.managers) save.managers = {};
    if (!save.managers[managerId]) save.managers[managerId] = {};
    // Tension persists — no reset. Just validate bounds.
    const t = save.managers[managerId].boardTension ?? 50;
    save.managers[managerId].boardTension = clamp(t);
    return save;
}

// ─── helpers ────────────────────────────────────────────────

function computeThreshold(tension) {
    if (tension >= 80)  return 'carta_branca';
    if (tension >= 40)  return 'normal';
    if (tension >= 10)  return 'cobrado';
    if (tension >= -20) return 'ultimato';
    return 'demitido';
}

function clamp(v) {
    return Math.max(TENSION_FLOOR, Math.min(TENSION_CAP, v));
}
