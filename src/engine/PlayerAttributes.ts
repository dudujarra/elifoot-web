import { rng } from './rng.js';
import { Player } from "./types.js";

export interface AttributeCategories {
    technical: string[];
    mental: string[];
    physical: string[];
    goalkeeping: string[];
}

export const ATTRIBUTE_CATEGORIES: AttributeCategories = {
    technical: [
        'crossing', 'dribbling', 'finishing', 'firstTouch', 'freeKick', 
        'heading', 'longShots', 'longThrows', 'marking', 'passing', 
        'penaltyTaking', 'tackling', 'technique'
    ],
    mental: [
        'aggression', 'anticipation', 'bravery', 'composure', 'concentration', 
        'decisions', 'determination', 'flair', 'leadership', 'offTheBall', 
        'positioning', 'teamwork', 'vision', 'workRate'
    ],
    physical: [
        'acceleration', 'agility', 'balance', 'jumpingReach', 
        'naturalFitness', 'pace', 'stamina', 'strength'
    ],
    goalkeeping: [
        'aerialReach', 'commandOfArea', 'communication', 'eccentricity', 
        'handling', 'kicking', 'oneOnOnes', 'reflexes', 'rushingOut', 
        'punching', 'throwing'
    ]
};

// All 46 attributes combined
export const ALL_ATTRIBUTES: string[] = [
    ...ATTRIBUTE_CATEGORIES.technical,
    ...ATTRIBUTE_CATEGORIES.mental,
    ...ATTRIBUTE_CATEGORIES.physical,
    ...ATTRIBUTE_CATEGORIES.goalkeeping
];

// Profile weights: how important is an attribute for a given macro position (0 to 3)
// Profile weights: how important is an attribute for a given macro position (0 to 3)
const POSITION_WEIGHTS: Record<string, Record<string, number>> = {
    GOL: {
        handling: 3, reflexes: 3, aerialReach: 3, commandOfArea: 2, communication: 2,
        kicking: 2, oneOnOnes: 3, rushingOut: 2, throwing: 2, agility: 3, 
        anticipation: 3, concentration: 3, positioning: 3,
        // out-field attributes get 0 or 1
        passing: 1, firstTouch: 1, composure: 2, decisions: 2
    },
    DEF: {
        marking: 3, tackling: 3, heading: 3, positioning: 3, bravery: 3,
        concentration: 3, anticipation: 3, strength: 3, jumpingReach: 3,
        pace: 2, acceleration: 2, passing: 2, composure: 2, decisions: 2,
        firstTouch: 2, aggression: 3, workRate: 2
    },
    MEI: {
        passing: 3, firstTouch: 3, technique: 3, vision: 3, composure: 3,
        decisions: 3, teamwork: 3, workRate: 3, stamina: 3, anticipation: 3,
        positioning: 2, offTheBall: 2, tackling: 2, dribbling: 2, longShots: 2
    },
    ATA: {
        finishing: 3, offTheBall: 3, composure: 3, anticipation: 3, pace: 3,
        acceleration: 3, dribbling: 3, technique: 3, heading: 2, firstTouch: 3,
        bravery: 2, agility: 2, decisions: 2, workRate: 2, jumpingReach: 2
    }
};

/**
 * Helper: generates a 1-20 attribute based on a target mean (which depends on OVR)
 * and the importance (weight) of the attribute for the position.
 */
function generateAttr1_20(targetMean20: number, weight: number, isWonderkid: boolean): number {
    // If weight is high (3), it should be close to or above targetMean
    // If weight is low (0), it is mostly random but generally lower
    let base = targetMean20;
    
    if (weight === 3) {
        base += rng.int(0, 3);
    } else if (weight === 2) {
        base += rng.int(-2, 2);
    } else if (weight === 1) {
        base += rng.int(-4, 0);
    } else {
        base -= rng.int(4, 8);
    }

    if (isWonderkid) {
        // Wonderkids have higher physicals but maybe lower mentals initially
        // We'll just add some noise
        base += rng.int(-1, 2);
    }

    // Add general noise
    base += rng.int(-2, 2);

    return Math.max(1, Math.min(20, Math.round(base)));
}

/**
 * Generates the full 1-20 attributes for a player based on their OVR and macro position.
 */
export interface DetailedAttributes {
    technical: Record<string, number>;
    mental: Record<string, number>;
    physical: Record<string, number>;
    goalkeeping: Record<string, number>;
    [key: string]: Record<string, number>;
}

export function generateDetailedAttributes(ovr: number, macroPosition: string, age: number, isWonderkid: boolean = false): DetailedAttributes {
    // Convert 0-100 OVR to roughly 1-20 scale for target mean
    // An OVR of 50 -> ~10, 75 -> ~15, 99 -> ~20
    const targetMean20 = Math.max(1, Math.min(20, Math.round(ovr / 5)));
    
    const weights = POSITION_WEIGHTS[macroPosition] || POSITION_WEIGHTS.MEI;
    const attributes: DetailedAttributes = { technical: {}, mental: {}, physical: {}, goalkeeping: {} };

    // Fill categories
    for (const attr of ATTRIBUTE_CATEGORIES.technical) {
        attributes.technical[attr] = generateAttr1_20(targetMean20, weights[attr] || 0, isWonderkid);
    }
    for (const attr of ATTRIBUTE_CATEGORIES.mental) {
        attributes.mental[attr] = generateAttr1_20(targetMean20, weights[attr] || 0, isWonderkid);
    }
    for (const attr of ATTRIBUTE_CATEGORIES.physical) {
        attributes.physical[attr] = generateAttr1_20(targetMean20, weights[attr] || 0, isWonderkid);
        // Age adjustments for physicals
        if (age > 30) {
            attributes.physical[attr] = Math.max(1, attributes.physical[attr] - Math.floor((age - 30) / 2));
        } else if (age < 21) {
            // Youngsters might not have full physicals yet
            attributes.physical[attr] = Math.max(1, attributes.physical[attr] - rng.int(0, 2));
        }
    }
    
    if (macroPosition === 'GOL') {
        for (const attr of ATTRIBUTE_CATEGORIES.goalkeeping) {
            attributes.goalkeeping[attr] = generateAttr1_20(targetMean20, weights[attr] || 0, isWonderkid);
        }
    } else {
        // Outfield players have poor goalkeeping stats (1-4)
        for (const attr of ATTRIBUTE_CATEGORIES.goalkeeping) {
            attributes.goalkeeping[attr] = rng.int(1, 4);
        }
    }

    return attributes;
}

/**
 * Calculates effective OVR (0-100) from 1-20 attributes for a given macro position
 */
export function calculateOvrFromAttributes(attributes: DetailedAttributes, macroPosition: string): number {
    const weights = POSITION_WEIGHTS[macroPosition] || POSITION_WEIGHTS.MEI;
    let totalWeight = 0;
    let weightedSum = 0;

    const allAttrs = {
        ...attributes.technical,
        ...attributes.mental,
        ...attributes.physical,
        ...attributes.goalkeeping
    };

    for (const [attr, val] of Object.entries(allAttrs)) {
        const w = weights[attr] || 0;
        if (w > 0) {
            weightedSum += val * w;
            totalWeight += w;
        }
    }

    if (totalWeight === 0) return 50;

    // The weighted sum is on a 1-20 scale. Convert back to 0-100.
    const avg20 = weightedSum / totalWeight;
    return Math.max(1, Math.min(99, Math.round(avg20 * 5)));
}

/**
 * Derives legacy 0-100 attributes (attacking, technical, tactical, defending, creativity)
 * from the new 46-attribute schema (1-20 scale).
 * If the player already has legacy attributes, returns them as-is.
 * @param {Object} player 
 * @returns {Object} { attacking, technical, tactical, defending, creativity }
 */
export interface LegacyPentagonStats {
    attacking: number;
    technical: number;
    tactical: number;
    defending: number;
    creativity: number;
}

export function getLegacyPentagonStats(player: Player): LegacyPentagonStats {
    if (!player.attributes || !player.attributes.technical) {
        return {
            attacking: (player.attacking as number) || 50,
            technical: (player.technical as number) || 50,
            tactical: (player.tactical as number) || 50,
            defending: (player.defending as number) || 50,
            creativity: (player.creativity as number) || 50
        };
    }

    const t = player.attributes.technical;
    const m = player.attributes.mental;

    // Average relevant stats (1-20) then scale to 0-100 by multiplying by 5
    const avg = (arr: number[]) => arr.length ? arr.reduce((a: number, b: number) => a + b, 0) / arr.length : 0;

    return {
        attacking: Math.round(avg([t.finishing, t.longShots, m.offTheBall]) * 5),
        technical: Math.round(avg([t.technique, t.dribbling, t.firstTouch]) * 5),
        tactical: Math.round(avg([m.anticipation, m.positioning, m.decisions, m.teamwork]) * 5),
        defending: Math.round(avg([t.marking, t.tackling, m.concentration]) * 5),
        creativity: Math.round(avg([m.vision, m.flair, t.passing]) * 5)
    };
}
