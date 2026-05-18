import { Team } from "../types.js";

/**
 * FormationMatrix.js
 * Deep Tactical Engine - Part of Phase 2
 * Implements the Rock-Paper-Scissors formation dynamics.
 */

/**
 * 6x6 Matrix from the ELIFOOT Tactical Reference.
 * Formats: '442', '433_6', '4231', '352', '343', '541'
 * 
 * Win -> +15% zone control for favored side (1.15)
 * Lose -> -15% zone control for favored side (0.85)
 * Even -> 1.0
 */

const BASE_MULTIPLIERS = {
    '442': {
        '442': 1.00,
        '433_6': 0.85, // Lose (mid 2v3)
        '4231': 0.85,  // Lose (#10 free)
        '352': 0.85,   // Lose (mid 2v3)
        '343': 1.00,
        '541': 1.15    // Win (2 strikers vs 3 CBs)
    },
    '433_6': {
        '442': 1.15,
        '433_6': 1.00,
        '4231': 1.00,
        '352': 0.85,   // Lose (mid 3v5)
        '343': 1.15,
        '541': 0.85    // Lose (low-block)
    },
    '4231': {
        '442': 1.15,
        '433_6': 1.00,
        '4231': 1.00,
        '352': 1.00,
        '343': 1.15,
        '541': 0.85
    },
    '352': {
        '442': 1.15,
        '433_6': 1.15, // Win (mid 5v3)
        '4231': 1.00,
        '352': 1.00,
        '343': 0.85,   // Lose (wide forwards pin WB)
        '541': 1.15
    },
    '343': {
        '442': 1.15,
        '433_6': 0.85, // Lose (mid 2v3)
        '4231': 0.85,
        '352': 1.15,
        '343': 1.00,
        '541': 1.15    // Win (wide overload)
    },
    '541': {
        '442': 0.85,
        '433_6': 1.15,
        '4231': 1.15,
        '352': 0.85,
        '343': 0.85,
        '541': 1.00
    }
};

/**
 * Returns an array of 30 zone multipliers for Team A based on the formation matchup.
 * Example: if Team A uses 3-5-2 and B uses 4-4-2, Team A gets a boost in central zones.
 * @param {string} formA - Team A's formation (e.g., '352')
 * @param {string} formB - Team B's formation (e.g., '442')
 * @returns {Array} 30-element array of multipliers (e.g., [1.0, 1.15, ...])
 */
export function getFormationMultipliers(formA: unknown, formB: unknown) {
    // Determine base advantage from matrix
    const baseMultA = ((BASE_MULTIPLIERS as any)[formA as string] && (BASE_MULTIPLIERS as any)[formA as string][formB as string]) || 1.0;
    
    // Default: apply the multiplier uniformly to all 30 zones.
    // In a more advanced version, we can target specific zones (e.g., 3-5-2 boosts central lane, 3-4-3 boosts touchlines).
    let zoneMultipliers = new Array(30).fill(1.0);
    
    // Apply nuanced positional advantage
    // If it's a win, we boost the specific zones where the advantage occurs.
    if (baseMultA > 1.0) {
        // e.g. If 352 vs 442, boost center
        if (formA === '352' && formB === '442') {
            // Apply 1.15 to lanes 1, 2, 3 (Center and Half-spaces)
            for (let i = 0; i < 30; i++) {
                const lane = i % 5;
                if (lane >= 1 && lane <= 3) {
                    zoneMultipliers[i] = 1.15;
                } else {
                    zoneMultipliers[i] = 1.0;
                }
            }
        } else {
            // Generic fallback
            zoneMultipliers.fill(baseMultA);
        }
    } else if (baseMultA < 1.0) {
        zoneMultipliers.fill(baseMultA); // Generic debuff if disadvantage
    }

    return zoneMultipliers;
}

/**
 * Helper to map standard formation strings to our matrix keys
 */
export function mapFormationToKey(formationString: unknown) {
    if (formationString === '4-4-2' || formationString === '4-4-2 Diamond') return '442';
    if (formationString === '4-3-3' || formationString === '4-1-4-1') return '433_6';
    if (formationString === '4-2-3-1' || formationString === '4-4-1-1') return '4231';
    if (formationString === '3-5-2' || formationString === '5-3-2') return '352';
    if (formationString === '3-4-3' || formationString === '3-4-2-1') return '343';
    if (formationString === '5-4-1' || formationString === '5-2-3') return '541';
    
    return '442'; // default fallback
}
