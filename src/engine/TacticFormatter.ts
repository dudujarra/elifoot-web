/**
 * SPEC-B5: TacticFormatter
 */

interface TacticModifier {
    readonly ata: number;
    readonly def: number;
}

type TacticKey = 'offensive' | 'defensive' | 'normal' | 'pressing' | 'counter' | 'possession';

interface TacticModifierParts {
    readonly ataValue: number;
    readonly defValue: number;
    readonly ata: string;
    readonly def: string;
}

const TACTIC_MODIFIERS: Record<TacticKey, TacticModifier> = {
    offensive: { ata: 1.30, def: 0.70 },
    defensive: { ata: 0.70, def: 1.30 },
    normal: { ata: 1.00, def: 1.00 },
    pressing: { ata: 1.15, def: 0.85 },
    counter: { ata: 1.20, def: 1.10 },
    possession: { ata: 1.05, def: 1.05 }
} as const;

export function getTacticModifierParts(tacticKey: string): TacticModifierParts {
    const mods = TACTIC_MODIFIERS[tacticKey as TacticKey];
    if (!mods) {
        return { ata: '', def: '', ataValue: 1.0, defValue: 1.0 };
    }
    return {
        ataValue: mods.ata,
        defValue: mods.def,
        ata: `×${mods.ata.toFixed(2)}`,
        def: `×${mods.def.toFixed(2)}`
    };
}

export function formatTacticModifiers(tacticKey: string): string {
    const mods = TACTIC_MODIFIERS[tacticKey as TacticKey];
    if (!mods) return '';
    return `ATA ×${mods.ata.toFixed(2)} / DEF ×${mods.def.toFixed(2)}`;
}
