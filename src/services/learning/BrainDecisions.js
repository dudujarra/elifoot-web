/**
 * Encode engine state to bucket key.
 * @param {Object} ctx
 * @param {number} ctx.position - league position 1..N
 * @param {number} ctx.totalTeams
 * @param {number} ctx.balance
 * @param {number} ctx.formAvg - 0-100 squad avg form
 * @param {number} ctx.week - currentWeek 0-37
 * @param {string} [ctx.lastResult] - 'W'|'D'|'L'|'-'
 * @returns {string}
 */
export function encodeState(ctx = {}) {
    const totalTeams = ctx.totalTeams || 20;
    const top4Threshold = Math.max(4, Math.floor(totalTeams * 0.25));
    const midThreshold = Math.floor(totalTeams * 0.6);
    const pos = ctx.position || totalTeams;
    const posTier = pos <= top4Threshold ? 'T4' : (pos <= midThreshold ? 'MD' : 'BT');

    const bal = ctx.balance || 0;
    const balTier = bal < 0 ? 'NEG' : (bal < 5_000_000 ? 'LOW' : (bal < 50_000_000 ? 'MID' : 'RCH'));

    const f = ctx.formAvg || 50;
    const formTier = f < 40 ? 'PR' : (f <= 70 ? 'AV' : 'GD');

    const w = ctx.week || 0;
    const phase = w < 13 ? 'E' : (w < 26 ? 'M' : 'L');

    const last = ctx.lastResult || '-';
    // BUG-042: add squadTier to diversify state space
    const squadSize = ctx.squadSize || 0;
    const squadTier = squadSize < 11 ? 'TN' : (squadSize < 18 ? 'NR' : 'DP');
    // AUDIT-FIX #10: Division-aware encoding — separate policy per division tier
    const div = ctx.division || 4;
    const divTier = div <= 1 ? 'E' : (div <= 2 ? 'P' : 'L');
    
    // SPEC-NEW: Opponent Scouting Context
    const oppTac = ctx.oppTactic || 'N';
    const oppForm = ctx.oppFormation || '4';
    const oppFormTier = oppForm.startsWith('3') ? '3B' : (oppForm.startsWith('5') ? '5B' : '4B');
    const oppTacTier = oppTac === 'offensive' ? 'O' : (oppTac === 'defensive' ? 'D' : (oppTac === 'counter' ? 'C' : 'N'));

    return `${formTier}|${posTier}|${balTier}|${phase}|${last}|${squadTier}|${divTier}|${oppTacTier}|${oppFormTier}`;
}

/**
 * Detect active goals based on state context + personality traits.
 * Returns array of { goal, weight }.
 */
export function detectGoals(ctx = {}, personality = null) {
    const goals = [];
    const totalTeams = ctx.totalTeams || 20;
    const pos = ctx.position || totalTeams;

    // Base weights
    let relW = 1.0;
    let finW = 0.8;
    let climbW = 0.6;
    let squadW = 0.4;
    let winW = 0.3;

    // Modulate by OCEAN-derived traits
    const traits = personality?.traits || personality || {};
    if (traits.ambition != null) {
        winW += traits.ambition * 0.5;
        climbW += traits.ambition * 0.3;
    }
    if (traits.loyalty != null) {
        squadW += traits.loyalty * 0.4;
    }
    // Conscientiousness → financial discipline
    const conscient = personality?.ocean?.C ?? 0.5;
    finW += conscient * 0.4;

    if (pos > totalTeams * 0.75) goals.push({ goal: 'AVOID_RELEGATION', weight: relW });
    if ((ctx.balance || 0) < 0) goals.push({ goal: 'FINANCIAL_HEALTH', weight: finW });
    if (pos > 4 && pos <= totalTeams * 0.6) goals.push({ goal: 'CLIMB_POSITION', weight: climbW });
    if ((ctx.squadSize || 0) < 18) goals.push({ goal: 'SQUAD_DEPTH', weight: squadW });
    if (pos <= 4) goals.push({ goal: 'WIN_TITLE', weight: winW });

    return goals;
}

export const GOAL_RELEVANCE = {
    AVOID_RELEGATION: {
        TACTIC_defensive: 0.7, TACTIC_normal: 0.4, TACTIC_offensive: -0.2,
        TRAIN_fitness: 0.6, TRAIN_tactical: 0.5,
        UPGRADE_STADIUM: -0.5, UPGRADE_ACADEMY: -0.3, SQUAD_REPLENISH: 0.7,
        MKT_BUY_YES: 0.3, MKT_BUY_NO: -0.1, MKT_SELL_YES: -0.4, MKT_SELL_NO: 0.3
    },
    FINANCIAL_HEALTH: {
        UPGRADE_STADIUM: -0.8, UPGRADE_ACADEMY: -0.5, ACCEPT_OFFER: 0.9,
        TACTIC_defensive: 0.2, SQUAD_REPLENISH: -0.2,
        MKT_BUY_YES: -0.6, MKT_BUY_NO: 0.4, MKT_SELL_YES: 0.8, MKT_SELL_NO: -0.5
    },
    CLIMB_POSITION: {
        TACTIC_offensive: 0.7, TACTIC_counter: 0.5,
        TRAIN_attack: 0.6, TRAIN_technical: 0.5, FORMATION: 0.4,
        MKT_BUY_YES: 0.5, MKT_BUY_NO: -0.2, MKT_SELL_YES: -0.3, MKT_SELL_NO: 0.2
    },
    SQUAD_DEPTH: {
        SQUAD_REPLENISH: 1.0, UPGRADE_ACADEMY: 0.6, ACCEPT_OFFER: -0.4, TRAIN_fitness: 0.2,
        MKT_BUY_YES: 0.8, MKT_BUY_NO: -0.5, MKT_SELL_YES: -0.6, MKT_SELL_NO: 0.4
    },
    WIN_TITLE: {
        TACTIC_offensive: 0.6, TACTIC_counter: 0.5,
        TRAIN_attack: 0.5, TRAIN_technical: 0.4, UPGRADE_STADIUM: 0.3,
        MKT_BUY_YES: 0.4, MKT_BUY_NO: -0.1, MKT_SELL_YES: -0.5, MKT_SELL_NO: 0.3
    }
};

export function actionRelevance(action, goal) {
    const map = GOAL_RELEVANCE[goal] || {};
    return map[action] ?? 0;
}
