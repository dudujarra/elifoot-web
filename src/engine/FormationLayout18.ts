/**
 * FormationLayout18 — SPEC-080
 *
 * Mapping 11 slots × formação → códigos BR 18-pos.
 * Complementa FormationLayout.js (role macro), adiciona role18 per slot.
 */

export type PositionCode18 =
    | 'GOL'
    | 'LAE' | 'ZAE' | 'ZAG' | 'ZAD' | 'LAD'
    | 'ALE' | 'ALD'
    | 'VOL' | 'MCE' | 'MCD' | 'MEC' | 'MEA' | 'MPE' | 'MPD'
    | 'POE' | 'POD' | 'CTA';

export type FormationId =
    | '4-3-3' | '4-4-2' | '4-2-4' | '3-5-2' | '5-3-2'
    | '4-2-3-1' | '4-1-4-1' | '3-4-3' | '5-4-1';

const FORMATION_LAYOUTS_18: Readonly<Record<FormationId, readonly PositionCode18[]>> = {
    '4-3-3': [
        'GOL',
        'LAE', 'ZAE', 'ZAD', 'LAD',
        'VOL', 'MEC', 'MEA',
        'POE', 'CTA', 'POD',
    ],
    '4-4-2': [
        'GOL',
        'LAE', 'ZAE', 'ZAD', 'LAD',
        'MPE', 'MCE', 'MCD', 'MPD',
        'CTA', 'CTA',
    ],
    '4-2-4': [
        'GOL',
        'LAE', 'ZAE', 'ZAD', 'LAD',
        'VOL', 'VOL',
        'POE', 'CTA', 'CTA', 'POD',
    ],
    '3-5-2': [
        'GOL',
        'ZAE', 'ZAG', 'ZAD',
        'ALE', 'VOL', 'MEA', 'MCD', 'ALD',
        'CTA', 'CTA',
    ],
    '5-3-2': [
        'GOL',
        'LAE', 'ZAE', 'ZAG', 'ZAD', 'LAD',
        'VOL', 'MEC', 'MEA',
        'CTA', 'CTA',
    ],
    '4-2-3-1': [
        'GOL',
        'LAE', 'ZAE', 'ZAD', 'LAD',
        'VOL', 'VOL',
        'POE', 'MEA', 'POD',
        'CTA',
    ],
    '4-1-4-1': [
        'GOL',
        'LAE', 'ZAE', 'ZAD', 'LAD',
        'VOL',
        'MPE', 'MCE', 'MCD', 'MPD',
        'CTA',
    ],
    '3-4-3': [
        'GOL',
        'ZAE', 'ZAG', 'ZAD',
        'ALE', 'MCE', 'MCD', 'ALD',
        'POE', 'CTA', 'POD',
    ],
    '5-4-1': [
        'GOL',
        'LAE', 'ZAE', 'ZAG', 'ZAD', 'LAD',
        'MPE', 'MCE', 'MCD', 'MPD',
        'CTA',
    ],
};

export interface SlotPosition {
    readonly slot: number;
    readonly code: PositionCode18;
}

/**
 * Get 18-position code for a slot in a formation.
 */
export function getSlot18Position(formationId: string, slotIdx: number): PositionCode18 {
    const layout = FORMATION_LAYOUTS_18[formationId as FormationId] || FORMATION_LAYOUTS_18['4-3-3'];
    return layout[slotIdx] || 'MEC';
}

/**
 * Get all 18-pos slots for a formation as array of {slot, code}.
 */
export function getFormationSlots18(formationId: string): SlotPosition[] {
    const layout = FORMATION_LAYOUTS_18[formationId as FormationId] || FORMATION_LAYOUTS_18['4-3-3'];
    return layout.map((code, slot) => ({ slot, code }));
}

export const FORMATION_18_KEYS: readonly string[] = Object.keys(FORMATION_LAYOUTS_18);
