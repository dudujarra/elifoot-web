import { rng as systemRng } from './rng.js';
/**
 * HeritageTraitSystem — SPEC-079: Traits Herdáveis de Lendas
 *
 * Regens herdam traits do Hall de Lendas do clube onde emergem.
 * Continuidade narrativa: DNA de ídolos ressurge em jovens talentos.
 *
 * Stateless: recebe hall, retorna traits gerados.
 */

type TraitKey = 'garra' | 'talento_natural' | 'lealdade' | 'frieza';
type SlotKey = 'idoloEterno' | 'goleirao' | 'criaDaBase' | 'carrasco' | 'lendaTragica' | 'traidor';

const INHERITABLE_TRAITS: readonly TraitKey[] = ['garra', 'talento_natural', 'lealdade', 'frieza'];
const TRAIT_FLOOR = 0;
const TRAIT_CAP   = 100;

interface HallSlot {
    playerName?: string;
    [key: string]: unknown;
}

interface Hall {
    slots?: Partial<Record<SlotKey, HallSlot>>;
}

interface InheritOpts {
    clubId?: number;
    hall?: Hall;
    baseChance?: number;
    seed?: number | null;
}

interface InheritResult {
    traits: Record<TraitKey, number>;
    inheritedFrom: SlotKey[];
    inheritanceNarrative: string;
}

const slotTraitMap: Record<SlotKey, TraitKey | null> = {
    idoloEterno:  'garra',
    goleirao:     'talento_natural',
    criaDaBase:   'lealdade',
    carrasco:     'frieza',
    lendaTragica: 'garra',   // tragic legend → determination
    traidor:      null,       // traitors don't pass traits
};

/**
 * Gera traits herdáveis para um regen baseado no Hall de Lendas.
 */
export function inherit({
    clubId: _clubId,
    hall,
    baseChance = 0.6,
    seed = null,
}: InheritOpts = {}): InheritResult {
    const rand = seed !== null ? seededRandom(seed) : systemRng;
    const slots = hall?.slots || {};
    const filledSlots = Object.keys(slots) as SlotKey[];

    const traits: Record<TraitKey, number> = {
        garra: 30,
        talento_natural: 30,
        lealdade: 30,
        frieza: 30,
    };
    const inheritedFrom: SlotKey[] = [];

    for (const slot of filledSlots) {
        const traitKey = slotTraitMap[slot];
        if (!traitKey) continue;
        if (rand() < baseChance) {
            // Inherit: bump trait by 20-40 points
            const bonus = Math.floor(rand() * 20) + 20;
            traits[traitKey] = clamp(traits[traitKey] + bonus);
            inheritedFrom.push(slot);
        }
    }

    const topSlot = inheritedFrom[0];
    const legend = topSlot ? slots[topSlot]?.playerName : null;
    const inheritanceNarrative = legend
        ? `Tem o espírito de ${legend} — a torcida sente desde o primeiro treino.`
        : 'Chega sem história, mas com potencial para criar a sua.';

    return { traits, inheritedFrom, inheritanceNarrative };
}

// ─── helpers ────────────────────────────────────────────────

function clamp(v: number): number {
    return Math.max(TRAIT_FLOOR, Math.min(TRAIT_CAP, v));
}

function seededRandom(seed: number): () => number {
    let s = seed;
    return function(): number {
        s = (s * 1664525 + 1013904223) & 0xffffffff;
        return (s >>> 0) / 0xffffffff;
    };
}
