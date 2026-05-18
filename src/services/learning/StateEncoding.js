/**
 * StateEncoding — Submodule for AdaptiveBrain
 *
 * Encodes engine state into a compact bucket key for the Q-Table.
 */

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
