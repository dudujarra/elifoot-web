import { MatchCardsATA } from './decks/MatchCardsATA';
import { MatchCardsMEI } from './decks/MatchCardsMEI';
import { MatchCardsDEF } from './decks/MatchCardsDEF';
import { MatchCardsGOL } from './decks/MatchCardsGOL';

import { rng as systemRng } from './rng.js';
import { getAtmosphere } from './BrazilianAtmosphere.js';

export const MatchEventsDeck = {
    ATA: MatchCardsATA,
    MEI: MatchCardsMEI,
    DEF: MatchCardsDEF,
    GOL: MatchCardsGOL
};

// Tier weights for draw probability
const TIER_WEIGHTS = { common: 60, uncommon: 25, rare: 12, legendary: 3 };

/**
 * Draws a card from the deck based on position, renown, and personality.
 * @param {string} position - GOL, DEF, MEI, ATA
 * @param {number} renown - Player renown (gates legendary cards)
 * @param {string} personality - maverick|virtuoso|heartbeat (future filter)
 * @returns {object|null} A card object or null
 */
export function drawCard(position, renown = 0, personality = null) {
    const deck = MatchEventsDeck[position];
    if (!deck || deck.length === 0) return null;

    // Filter by renown (legendary cards need minRenown)
    const eligible = deck.filter(card => {
        if (card.minRenown && renown < card.minRenown) return false;
        return true;
    });

    if (eligible.length === 0) return null;

    // Weighted random by tier
    const totalWeight = eligible.reduce((sum, card) => sum + (TIER_WEIGHTS[card.tier] || 10), 0);
    let roll = systemRng() * totalWeight;

    for (const card of eligible) {
        roll -= (TIER_WEIGHTS[card.tier] || 10);
        if (roll <= 0) return card;
    }

    return eligible[eligible.length - 1];
}

/**
 * SPEC-B6.2: Wrap card com atmosfera BR baseada em eventType/seed.
 * Pure: retorna cópia do card com text prefixado por atmosphere string.
 * Caller passa eventType ('goal','card','derby','late_drama','save','miss').
 *
 * @param {object} card — card from drawCard
 * @param {string} eventType — chave de BrazilianAtmosphere
 * @param {number} seed — seed determinístico
 * @returns {object} new card with enriched text
 */
export function enrichCardWithAtmosphere(card, eventType, seed = 0) {
    if (!card) return card;
    try {
        const atmo = getAtmosphere(eventType, seed);
        if (!atmo.flavorString) return card;
        return {
            ...card,
            text: `${atmo.flavorString} ${card.text || ''}`.trim(),
            _atmosphereApplied: eventType,
        };
    } catch {
        return card;
    }
}
