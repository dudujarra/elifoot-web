import { MatchCardsATA } from './decks/MatchCardsATA';
import { MatchCardsMEI } from './decks/MatchCardsMEI';
import { MatchCardsDEF } from './decks/MatchCardsDEF';
import { MatchCardsGOL } from './decks/MatchCardsGOL';

import { rng as systemRng } from './rng.js';
import { EngineLogger } from './EngineLogger.js';
import { getAtmosphere } from './BrazilianAtmosphere.js';

type Position = 'ATA' | 'MEI' | 'DEF' | 'GOL';
type Tier = 'common' | 'uncommon' | 'rare' | 'legendary';

interface MatchCard {
    tier?: Tier;
    text?: string;
    minRenown?: number;
    [key: string]: unknown;
}

interface EnrichedCard extends MatchCard {
    _atmosphereApplied?: string;
}

export const MatchEventsDeck: Record<Position, MatchCard[]> = {
    ATA: MatchCardsATA as MatchCard[],
    MEI: MatchCardsMEI as MatchCard[],
    DEF: MatchCardsDEF as MatchCard[],
    GOL: MatchCardsGOL as MatchCard[],
};

// Tier weights for draw probability
const TIER_WEIGHTS: Record<Tier, number> = { common: 60, uncommon: 25, rare: 12, legendary: 3 };

/**
 * Draws a card from the deck based on position, renown, and personality.
 */
export function drawCard(position: Position, renown: number = 0, _personality: string | null = null): MatchCard | null {
    const deck = MatchEventsDeck[position];
    if (!deck || deck.length === 0) return null;

    // Filter by renown (legendary cards need minRenown)
    const eligible = deck.filter((card: MatchCard) => {
        if (card.minRenown && renown < card.minRenown) return false;
        return true;
    });

    if (eligible.length === 0) return null;

    // Weighted random by tier
    const totalWeight = eligible.reduce((sum: number, card: MatchCard) => sum + (TIER_WEIGHTS[card.tier as Tier] || 10), 0);
    let roll = systemRng() * totalWeight;

    for (const card of eligible) {
        roll -= (TIER_WEIGHTS[card.tier as Tier] || 10);
        if (roll <= 0) return card;
    }

    return eligible[eligible.length - 1];
}

/**
 * SPEC-B6.2: Wrap card com atmosfera BR baseada em eventType/seed.
 * Pure: retorna cópia do card com text prefixado por atmosphere string.
 */
export function enrichCardWithAtmosphere(card: MatchCard | null, eventType: string, seed: number = 0): EnrichedCard | null {
    if (!card) return card;
    try {
        const atmo = getAtmosphere(eventType, seed);
        if (!atmo.flavorString) return card;
        return {
            ...card,
            text: `${atmo.flavorString} ${card.text || ''}`.trim(),
            _atmosphereApplied: eventType,
        };
    } catch (err) {
        EngineLogger.capture(err as Error, 'MatchEventsDeck.enrichAtmosphere');
        return card;
    }
}
