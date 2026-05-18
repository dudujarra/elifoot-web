import { rng as systemRng } from './rng.js';
/**
 * Positions.js — SPEC-080
 *
 * 18 posições granulares OléFUT (BR Portuguese primary, FIFA EN alias).
 * Cobre todo futebol moderno: 1 GK + 7 DEF + 7 MID + 3 ATA.
 *
 * Códigos PRIMÁRIOS = BR Portuguese (3 chars consistente).
 * Aliases EN mantidos pra compat SofaScore mapping.
 */

export interface PositionDef {
    code: string;
    codeEn: string;
    name: string;
    nameEn: string;
    macro: string;
    family: string;
    side: 'C' | 'R' | 'L';
    line: number;
}

export const POSITIONS: Record<string, PositionDef> = {
    // === GOLEIRO (1) ===
    GOL: {
        code: 'GOL',
        codeEn: 'GK',
        name: 'Goleiro',
        nameEn: 'Goalkeeper',
        macro: 'GOL',
        family: 'GOL',
        side: 'C',
        line: 0
    },

    // === DEFENSORES (7) ===
    ZAG: {
        code: 'ZAG',
        codeEn: 'CB',
        name: 'Zagueiro Central',
        nameEn: 'Center Back',
        macro: 'DEF',
        family: 'ZAG',
        side: 'C',
        line: 1
    },
    ZAD: {
        code: 'ZAD',
        codeEn: 'CBR',
        name: 'Zagueiro Direito',
        nameEn: 'Right Center Back',
        macro: 'DEF',
        family: 'ZAG',
        side: 'R',
        line: 1
    },
    ZAE: {
        code: 'ZAE',
        codeEn: 'CBL',
        name: 'Zagueiro Esquerdo',
        nameEn: 'Left Center Back',
        macro: 'DEF',
        family: 'ZAG',
        side: 'L',
        line: 1
    },
    LAD: {
        code: 'LAD',
        codeEn: 'RB',
        name: 'Lateral Direito',
        nameEn: 'Right Back',
        macro: 'DEF',
        family: 'LAT',
        side: 'R',
        line: 1
    },
    LAE: {
        code: 'LAE',
        codeEn: 'LB',
        name: 'Lateral Esquerdo',
        nameEn: 'Left Back',
        macro: 'DEF',
        family: 'LAT',
        side: 'L',
        line: 1
    },
    ALD: {
        code: 'ALD',
        codeEn: 'RWB',
        name: 'Ala Direito',
        nameEn: 'Right Wing-Back',
        macro: 'DEF',
        family: 'ALA',
        side: 'R',
        line: 2
    },
    ALE: {
        code: 'ALE',
        codeEn: 'LWB',
        name: 'Ala Esquerdo',
        nameEn: 'Left Wing-Back',
        macro: 'DEF',
        family: 'ALA',
        side: 'L',
        line: 2
    },

    // === MEIO-CAMPO (7) ===
    VOL: {
        code: 'VOL',
        codeEn: 'DM',
        name: 'Volante',
        nameEn: 'Defensive Midfielder',
        macro: 'MEI',
        family: 'VOL',
        side: 'C',
        line: 2
    },
    MEC: {
        code: 'MEC',
        codeEn: 'CM',
        name: 'Meia Centro',
        nameEn: 'Central Midfielder',
        macro: 'MEI',
        family: 'MEI',
        side: 'C',
        line: 3
    },
    MCD: {
        code: 'MCD',
        codeEn: 'CMR',
        name: 'Meia Centro Direita',
        nameEn: 'Right Central Midfielder',
        macro: 'MEI',
        family: 'MEI',
        side: 'R',
        line: 3
    },
    MCE: {
        code: 'MCE',
        codeEn: 'CML',
        name: 'Meia Centro Esquerda',
        nameEn: 'Left Central Midfielder',
        macro: 'MEI',
        family: 'MEI',
        side: 'L',
        line: 3
    },
    MEA: {
        code: 'MEA',
        codeEn: 'AM',
        name: 'Meia Atacante',
        nameEn: 'Attacking Midfielder',
        macro: 'MEI',
        family: 'MEA',
        side: 'C',
        line: 4
    },
    MPD: {
        code: 'MPD',
        codeEn: 'RM',
        name: 'Meia Pela Direita',
        nameEn: 'Right Midfielder',
        macro: 'MEI',
        family: 'MPL',
        side: 'R',
        line: 4
    },
    MPE: {
        code: 'MPE',
        codeEn: 'LM',
        name: 'Meia Pela Esquerda',
        nameEn: 'Left Midfielder',
        macro: 'MEI',
        family: 'MPL',
        side: 'L',
        line: 4
    },

    // === ATAQUE (3) ===
    POD: {
        code: 'POD',
        codeEn: 'RW',
        name: 'Ponta Direita',
        nameEn: 'Right Winger',
        macro: 'ATA',
        family: 'PON',
        side: 'R',
        line: 5
    },
    POE: {
        code: 'POE',
        codeEn: 'LW',
        name: 'Ponta Esquerda',
        nameEn: 'Left Winger',
        macro: 'ATA',
        family: 'PON',
        side: 'L',
        line: 5
    },
    CTA: {
        code: 'CTA',
        codeEn: 'CF',
        name: 'Centroavante',
        nameEn: 'Center Forward',
        macro: 'ATA',
        family: 'ATA',
        side: 'C',
        line: 6
    }
};

export const ALL_POSITION_CODES: string[] = Object.keys(POSITIONS);

// Position families (BR codes)
export const POSITION_FAMILIES: Record<string, string[]> = {
    GOL: ['GOL'],
    ZAG: ['ZAG', 'ZAD', 'ZAE'],
    LAT: ['LAD', 'LAE'],
    ALA: ['ALD', 'ALE'],
    VOL: ['VOL'],
    MEI: ['MEC', 'MCD', 'MCE'],
    MEA: ['MEA'],
    MPL: ['MPD', 'MPE'],
    PON: ['POD', 'POE'],
    ATA: ['CTA']
};

// Adjacent families (60% fit cross-family)
export const ADJACENT_FAMILIES: Record<string, string[]> = {
    GOL: ['ZAG'],
    ZAG: ['GOL', 'LAT', 'VOL'],
    LAT: ['ZAG', 'ALA', 'MPL'],
    ALA: ['LAT', 'MPL', 'PON'],
    VOL: ['ZAG', 'MEI'],
    MEI: ['VOL', 'MEA', 'MPL'],
    MEA: ['MEI', 'ATA', 'PON'],
    MPL: ['MEI', 'ALA', 'PON'],
    PON: ['MPL', 'ALA', 'MEA', 'ATA'],
    ATA: ['MEA', 'PON']
};

export interface PositionAttrWeights {
    ATA: number;
    TEC: number;
    TAC: number;
    DEF: number;
    CRI: number;
}

// Position-Attribute Relevance Matrix (0-3 per pentagon attribute)
// ATA=Attacking, TEC=Technical, TAC=Tactical, DEF=Defending, CRI=Creativity
export const POSITION_ATTR_WEIGHTS: Record<string, PositionAttrWeights> = {
    GOL: { ATA: 0, TEC: 1, TAC: 3, DEF: 3, CRI: 0 },
    ZAG: { ATA: 0, TEC: 1, TAC: 3, DEF: 3, CRI: 1 },
    ZAD: { ATA: 0, TEC: 1, TAC: 3, DEF: 3, CRI: 1 },
    ZAE: { ATA: 0, TEC: 1, TAC: 3, DEF: 3, CRI: 1 },
    LAD: { ATA: 1, TEC: 2, TAC: 3, DEF: 2, CRI: 2 },
    LAE: { ATA: 1, TEC: 2, TAC: 3, DEF: 2, CRI: 2 },
    ALD: { ATA: 2, TEC: 2, TAC: 2, DEF: 1, CRI: 2 },
    ALE: { ATA: 2, TEC: 2, TAC: 2, DEF: 1, CRI: 2 },
    VOL: { ATA: 0, TEC: 2, TAC: 3, DEF: 3, CRI: 2 },
    MEC: { ATA: 1, TEC: 3, TAC: 3, DEF: 2, CRI: 2 },
    MCD: { ATA: 1, TEC: 3, TAC: 3, DEF: 2, CRI: 2 },
    MCE: { ATA: 1, TEC: 3, TAC: 3, DEF: 2, CRI: 2 },
    MEA: { ATA: 3, TEC: 3, TAC: 3, DEF: 0, CRI: 3 },
    MPD: { ATA: 2, TEC: 2, TAC: 2, DEF: 2, CRI: 2 },
    MPE: { ATA: 2, TEC: 2, TAC: 2, DEF: 2, CRI: 2 },
    POD: { ATA: 3, TEC: 3, TAC: 2, DEF: 1, CRI: 2 },
    POE: { ATA: 3, TEC: 3, TAC: 2, DEF: 1, CRI: 2 },
    CTA: { ATA: 3, TEC: 2, TAC: 2, DEF: 0, CRI: 1 }
};

/**
 * Get family of a position.
 */
export function getFamily(positionCode: string): string | null {
    return POSITIONS[positionCode]?.family || null;
}

/**
 * Calculate fit (0.3 - 1.0) of a player playing position X.
 */
export function calculatePositionFit(playerNaturalPos: string | undefined | null, requiredPos: string): number {
    if (!playerNaturalPos || !requiredPos) return 0.3;
    if (playerNaturalPos === requiredPos) return 1.0;

    const naturalFamily = getFamily(playerNaturalPos);
    const requiredFamily = getFamily(requiredPos);
    if (!naturalFamily || !requiredFamily) return 0.3;

    if (naturalFamily === requiredFamily) return 0.85;

    const adjacents = ADJACENT_FAMILIES[naturalFamily] || [];
    if (adjacents.includes(requiredFamily)) return 0.6;

    return 0.3;
}

import { calculateOvrFromAttributes } from './PlayerAttributes.js';
import { Player } from "./types.js";

/**
 * Calculate rating 0-100 for a player playing a specific position.
 */
export function calculateRatingForPosition(player: Player, positionCode: string): number {
    if (!player) return 0;
    const posInfo = POSITIONS[positionCode];
    if (!posInfo) return player.ovr || 50;

    if (player.attributes) {
        return calculateOvrFromAttributes(player.attributes, posInfo.macro);
    }
    
    return player.ovr || 50;
}

/**
 * Calculate effective rating considering position fit.
 */
export function calculateEffectiveRating(player: Player, requiredPos: string): number {
    const baseRating = calculateRatingForPosition(player, requiredPos);
    const fit = calculatePositionFit(player.naturalPosition, requiredPos);
    return Math.round(baseRating * fit);
}

/**
 * Get macro position (legacy compat: GOL/DEF/MEI/ATA).
 */
export function getMacroPosition(positionCode: string): string {
    return POSITIONS[positionCode]?.macro || 'MEI';
}

/**
 * Migrate legacy 4-position to granular 18 (BR codes).
 */
export function migrateLegacyPosition(legacyPos: string, attrs: unknown = {}): string {
    switch (legacyPos) {
        case 'GOL':
        case 'GK':
            return 'GOL';
        case 'DEF':
        case 'ZAG':
            if (((attrs as any).def ?? 50) >= 75) {
                return ['ZAG', 'ZAD', 'ZAE'][Math.floor(systemRng() * 3)];
            }
            return ['LAD', 'LAE'][Math.floor(systemRng() * 2)];
        case 'LAT':
            return systemRng() < 0.5 ? 'LAD' : 'LAE';
        case 'MEI':
        case 'VOL': {
            const r = systemRng();
            if (legacyPos === 'VOL' || ((attrs as any).def ?? 50) > ((attrs as any).atk ?? 50)) return 'VOL';
            if (r < 0.3) return 'MEC';
            if (r < 0.5) return 'MEA';
            if (r < 0.7) return 'MPD';
            return 'MPE';
        }
        case 'ATA': {
            const ra = systemRng();
            if (ra < 0.4) return 'CTA';
            if (ra < 0.7) return 'POD';
            return 'POE';
        }
        case 'PON':
            return systemRng() < 0.5 ? 'POD' : 'POE';
        default:
            return 'MEC';
    }
}

/**
 * EN→BR aliases (compat with old code using English codes).
 */
export const EN_TO_BR: Record<string, string> = {
    GK: 'GOL',
    CB: 'ZAG',
    CBR: 'ZAD',
    CBL: 'ZAE',
    RB: 'LAD',
    LB: 'LAE',
    RWB: 'ALD',
    LWB: 'ALE',
    DM: 'VOL',
    CM: 'MEC',
    CMR: 'MCD',
    CML: 'MCE',
    AM: 'MEA',
    RM: 'MPD',
    LM: 'MPE',
    RW: 'POD',
    LW: 'POE',
    CF: 'CTA'
};

export const BR_TO_EN: Record<string, string> = Object.fromEntries(Object.entries(EN_TO_BR).map(([en, br]: [string, string]) => [br, en]));

/**
 * SofaScore code → OléFUT BR position.
 */
export const SOFASCORE_TO_OléFUT: Record<string, string> = {
    'G': 'GOL',
    'GK': 'GOL',
    'D': 'ZAG',
    'DC': 'ZAG',
    'DCR': 'ZAD',
    'DCL': 'ZAE',
    'DR': 'LAD',
    'DL': 'LAE',
    'DMR': 'ALD',
    'DML': 'ALE',
    'WBR': 'ALD',
    'WBL': 'ALE',
    'M': 'MEC',
    'MC': 'MEC',
    'MCR': 'MCD',
    'MCL': 'MCE',
    'DMC': 'VOL',
    'DM': 'VOL',
    'MR': 'MPD',
    'ML': 'MPE',
    'AMC': 'MEA',
    'AM': 'MEA',
    'AMR': 'POD',
    'AML': 'POE',
    'F': 'CTA',
    'FW': 'CTA',
    'ST': 'CTA',
    'CF': 'CTA',
    'LW': 'POE',
    'RW': 'POD',
    'LWF': 'POE',
    'RWF': 'POD'
};

export function mapSofaScorePosition(sofaScoreCode: string): string {
    return SOFASCORE_TO_OléFUT[sofaScoreCode] || 'MEC';
}
