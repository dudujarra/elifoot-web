import { Player, Team } from "../types.js";

/**
 * FatigueFamiliarity.js
 * Deep Tactical Engine - Part of Phase 1
 * Handles dynamic adjustments to player attributes based on fatigue, morale, and tactical familiarity.
 */

/**
 * Calculates the effective attribute after applying fatigue decay.
 * @param {number} baseAttribute - The original attribute value (1-20)
 * @param {string} attributeType - 'physical', 'mental', or 'technical'
 * @param {number} currentFitness - Fitness level between 0.0 (exhausted) and 1.0 (fresh)
 * @returns {number} The degraded attribute value
 */
export function applyFatigue(baseAttribute: number, attributeType: string, currentFitness: number) {
    // k is the decay factor. Physicals decay the most, mentals the least.
    let k = 0.20; 
    if (attributeType === 'physical') {
        k = 0.40;
    } else if (attributeType === 'mental') {
        k = 0.10;
    }

    // A^eff_s = A_s * [1 - k(1 - F)]
    const effective = baseAttribute * (1 - k * (1 - currentFitness));
    return Math.max(1, effective);
}

/**
 * Calculates fitness drop per minute of gameplay.
 * @param {number} stamina - Player's stamina attribute (1-20)
 * @param {number} naturalFitness - Player's natural fitness attribute (1-20)
 * @param {string} teamStyle - 'gegenpress', 'normal', 'low_block'
 * @returns {number} Fitness loss per minute
 */
export function calculateFitnessDecayPerMinute(stamina: number, naturalFitness: number, teamStyle: string) {
    let intensity = 1.0;
    if (teamStyle === 'gegenpress') intensity = 1.4;
    if (teamStyle === 'low_block') intensity = 0.6;

    // Delta F = -(c / (Stamina + NaturalFitness)) * intensity
    // We want a typical player (10, 10) at normal intensity to drop about 30% over 90 mins.
    // 0.30 / 90 = 0.0033 drop per minute.
    // c / 20 = 0.0033 => c = 0.066
    const c = 0.066;
    const baseResistance = Math.max(2, stamina + naturalFitness); // Prevent division by zero
    
    return (c / baseResistance) * intensity;
}

/**
 * Applies tactical familiarity modifier to the player's effective quality.
 * @param {number} effectiveQuality - The base effective quality (e.g., from RoleTaxonomy)
 * @param {number} tacticalFamiliarity - Value between 0.0 (clueless) and 1.0 (master)
 * @returns {number} The modified quality
 */
export function applyTacticalFamiliarity(effectiveQuality: number, tacticalFamiliarity: number) {
    // A player completely unfamiliar plays at 85% capacity.
    // A^eff'' = A^eff' * (0.85 + 0.15 * F_T)
    const multiplier = 0.85 + (0.15 * Math.max(0, Math.min(1, tacticalFamiliarity)));
    return effectiveQuality * multiplier;
}

/**
 * Applies morale and form modifiers.
 * @param {number} effectiveQuality - Quality after fatigue
 * @param {number} morale - Value from 0.0 to 1.0 (0.5 is neutral)
 * @param {number} form - Value from 0.0 to 1.0 (0.5 is neutral)
 * @returns {number} The modified quality
 */
export function applyMoraleAndForm(effectiveQuality: number, morale: number, form: number) {
    // Both scale from -5% to +5% around the neutral point.
    const mu = 0.10; // Max 10% swing total (+5% from morale, +5% from form)
    
    // Normalize morale and form so 0.5 is 0, 1.0 is +0.5, 0.0 is -0.5
    const moraleMod = (morale - 0.5);
    const formMod = (form - 0.5);

    const multiplier = 1 + (mu * moraleMod) + (mu * formMod);
    return effectiveQuality * multiplier;
}
