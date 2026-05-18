/**
 * RoleTaxonomy.js
 * Deep Tactical Engine - Part of Phase 1
 * Defines specific football roles and their attribute weights.
 */

export const ROLE_WEIGHTS = {
    // === GOALKEEPERS ===
    'sweeper_keeper': {
        pace: 1.2, rushingOut: 1.5, anticipation: 1.4, kicking: 1.4, firstTouch: 1.3, passing: 1.2,
        reflexes: 1.0, oneOnOnes: 1.2, commandOfArea: 1.2
    },
    'shot_stopper': {
        reflexes: 1.5, oneOnOnes: 1.5, aerialReach: 1.4, concentration: 1.4, positioning: 1.3
    },

    // === DEFENDERS ===
    'ball_playing_cb': {
        passing: 1.5, technique: 1.4, firstTouch: 1.3, composure: 1.4, vision: 1.2,
        marking: 1.0, tackling: 1.0, positioning: 1.2
    },
    'stopper_cb': {
        heading: 1.5, strength: 1.5, tackling: 1.5, marking: 1.4, aggression: 1.4, jumpingReach: 1.4,
        bravery: 1.3, positioning: 1.2
    },
    'libero': {
        anticipation: 1.5, positioning: 1.5, passing: 1.4, vision: 1.3, composure: 1.4, tackling: 1.1
    },
    'inverted_fullback': {
        passing: 1.5, vision: 1.4, positioning: 1.3, technique: 1.3, stamina: 1.2,
        crossing: 0.5, pace: 0.9, marking: 1.0, teamwork: 1.3
    },
    'attacking_wingback': {
        pace: 1.5, acceleration: 1.5, stamina: 1.5, crossing: 1.4, dribbling: 1.3, workRate: 1.4,
        tackling: 0.8
    },

    // === MIDFIELDERS ===
    'anchor': {
        tackling: 1.5, positioning: 1.5, anticipation: 1.4, strength: 1.3, stamina: 1.3,
        aggression: 1.2, concentration: 1.4
    },
    'regista': {
        passing: 1.5, vision: 1.5, technique: 1.4, composure: 1.5, firstTouch: 1.3,
        anticipation: 1.3, tackling: 0.8
    },
    'box_to_box': {
        stamina: 1.5, workRate: 1.5, tackling: 1.3, offTheBall: 1.3, passing: 1.2,
        longShots: 1.2, determination: 1.4
    },
    'mezzala': {
        offTheBall: 1.4, vision: 1.4, passing: 1.3, dribbling: 1.3, finishing: 1.2,
        stamina: 1.3, workRate: 1.2
    },
    'classic_10': {
        vision: 1.5, passing: 1.5, technique: 1.5, firstTouch: 1.4, dribbling: 1.4,
        flair: 1.4, composure: 1.3
    },

    // === ATTACKERS ===
    'traditional_winger': {
        pace: 1.5, acceleration: 1.5, crossing: 1.5, dribbling: 1.5, technique: 1.2,
        agility: 1.3
    },
    'inverted_winger': {
        pace: 1.4, acceleration: 1.4, dribbling: 1.4, finishing: 1.4, longShots: 1.3,
        technique: 1.3, offTheBall: 1.3
    },
    'target_man': {
        strength: 1.5, heading: 1.5, jumpingReach: 1.5, bravery: 1.4, teamwork: 1.3,
        firstTouch: 1.3, composure: 1.2
    },
    'poacher': {
        positioning: 1.5, finishing: 1.5, anticipation: 1.5, offTheBall: 1.5,
        acceleration: 1.3, composure: 1.4
    },
    'false_9': {
        passing: 1.5, vision: 1.4, technique: 1.4, offTheBall: 1.4, teamwork: 1.4,
        firstTouch: 1.3, finishing: 1.2
    },
    'raumdeuter': {
        offTheBall: 1.5, anticipation: 1.5, positioning: 1.4, finishing: 1.3,
        decisions: 1.4, concentration: 1.3, workRate: 1.3
    },
    'complete_forward': {
        finishing: 1.4, offTheBall: 1.4, technique: 1.4, strength: 1.3, heading: 1.3,
        passing: 1.3, pace: 1.3, composure: 1.4
    }
};

/**
 * Calculates a player's effective quality score for a specific role based on their 1-20 attributes.
 * @param {Object} attributes - The player's attributes { technical: {...}, mental: {...}, physical: {...} }
 * @param {string} role - The role to evaluate (e.g., 'inverted_fullback')
 * @returns {number} The weighted effective score (roughly on a 1-20 scale)
 */
export function getEffectiveRoleQuality(attributes: unknown, role: unknown) {
    const weights = (ROLE_WEIGHTS as any)[role as string];
    if (!weights) return 10; // Fallback

    let weightedSum = 0;
    let totalWeight = 0;

    const allAttrs = {
        ...(attributes as any).technical,
        ...(attributes as any).mental,
        ...(attributes as any).physical,
        ...(attributes as any).goalkeeping
    };

    for (const [attr, weight] of Object.entries(weights)) {
        const val = allAttrs[attr] || 10; // Default to 10 if missing
        weightedSum += val * (weight as number);
        totalWeight += (weight as number);
    }

    if (totalWeight === 0) return 10;
    return weightedSum / totalWeight;
}
