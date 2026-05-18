export const LOSS_AVERSION_LAMBDA = 2.0;   // Kahneman: losses hurt 2x more
export const DIMINISHING_GAINS_ALPHA = 0.88; // concavity for gains
export const RISK_SEEKING_LOSSES_BETA = 0.88; // convexity for losses

/**
 * Prospect Theory value function.
 * - Gains: v(x) = x^α           (concave → risk-averse when winning)
 * - Losses: v(x) = -λ·|x|^β     (convex → risk-seeking when losing)
 *
 * @param {number} x — raw reward delta
 * @returns {number} perceived value
 */
export function prospectValue(x) {
    if (x >= 0) {
        return Math.pow(x, DIMINISHING_GAINS_ALPHA);
    }
    return -LOSS_AVERSION_LAMBDA * Math.pow(Math.abs(x), RISK_SEEKING_LOSSES_BETA);
}

/**
 * Compute reward from match + state delta.
 * Now uses Prospect Theory (Fase 3):
 *   - Losses weighted 2x heavier (loss aversion)
 *   - Gains have diminishing returns (risk aversion when ahead)
 *   - Reference point = expected position for division
 *
 * @param {Object} params
 * @param {number} [params.emotionalLossMod=1.0] — from EmotionalEngine
 */
export function computeReward({
    matchResult, balanceDelta, positionDelta, promoted, relegated, title,
    goalsScored = 0, goalsAllowed = 0, scoreDiff = 0,
    emotionalLossMod = 1.0
}) {
    let r = 0;

    // Match result base (raw, before Prospect Theory)
    if (matchResult === 'W') r += 10;
    else if (matchResult === 'D') r += 2;
    else if (matchResult === 'L') {
        // BUG-041: soften crushing losses but reward narrow ones
        if (Math.abs(scoreDiff) <= 1) r -= 1;
        else if (Math.abs(scoreDiff) <= 3) r -= 3;
        else r -= 5;
        // Emotional amplification: ANXIOUS/TILTED feel losses harder
        r *= emotionalLossMod;
    }

    // BUG-041: own scoring is intrinsic positive signal even in loss
    r += Math.min(5, goalsScored * 1.5);
    // Defensive performance
    if (matchResult !== 'L' && goalsAllowed === 0) r += 3;

    // Balance trend — apply Prospect Theory
    if (balanceDelta) {
        const balReward = balanceDelta / 1_000_000;
        r += prospectValue(Math.max(-10, Math.min(10, balReward)));
    }

    // Position movement — apply Prospect Theory
    if (positionDelta) {
        r += prospectValue(positionDelta * 2);
    }

    // Season events — BUG-RC1 fix: rewards MUST be symmetric to avoid
    // Q-value collapse during yo-yo cycles. Previous: promoted=+50, relegated=-100
    // caused net=-50 per cycle × 93 cycles = -4650 cumulative bias.
    if (promoted) r += 60;
    if (relegated) r -= 60 * emotionalLossMod;
    if (title) r += 200;

    return r;
}
