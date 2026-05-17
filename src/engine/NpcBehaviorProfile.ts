/**
 * SPEC-137: NPC Behavior Profiles — 4 levels de dificuldade.
 *
 * PLAYER MODE ONLY (today) — see SPEC-179
 * Decision A (Promote parcial). Currently consumed by NpcTacticAdvisor for AI
 * tactic pivots; named NPCs aparecem nos decks de Player Career.
 * Future plan: surface NPC names + behavior labels in Manager Mode dialogs
 * (TransferOffer rival manager, PressConference). High ROI — names already exist.
 *
 * Perfis extraídos diretamente de dados de deep soak (5 runs, 104-216 temporadas):
 *   Level 1 (Noob)     — run-1 (1778458660022): defensiva, crashes, DREAD alto
 *   Level 2 (Amador)   — run-2 (1778459078831): ofensiva rígida, instável
 *   Level 3 (Veterano) — run-4 (1778460065428): counter-lock, robusto, monótono
 *   Level 4 (Expert)   — run-5 (1778460495249): ofensiva adaptativa, squad proativo
 */

type NpcLevel = 1 | 2 | 3 | 4;

interface NpcProfile {
    readonly name: string;
    readonly tacticPreference: string;
    readonly tacticFlexibility: number;
    readonly squadReplenishThreshold: number;
    readonly dreadThreshold: number;
    readonly marketActivity: number;
    readonly decisionErrorRate: number;
}

export const NPC_PROFILES: Record<NpcLevel, NpcProfile> = {
    1: {
        name: 'Noob',
        tacticPreference: 'defensive',
        tacticFlexibility: 0.10,
        squadReplenishThreshold: 8,
        dreadThreshold: 5,
        marketActivity: 0.10,
        decisionErrorRate: 0.15,
    },
    2: {
        name: 'Amador',
        tacticPreference: 'offensive',
        tacticFlexibility: 0.15,
        squadReplenishThreshold: 10,
        dreadThreshold: 4,
        marketActivity: 0.20,
        decisionErrorRate: 0.10,
    },
    3: {
        name: 'Veterano',
        tacticPreference: 'counter',
        tacticFlexibility: 0.08,
        squadReplenishThreshold: 12,
        dreadThreshold: 7,
        marketActivity: 0.30,
        decisionErrorRate: 0.05,
    },
    4: {
        name: 'Expert',
        tacticPreference: 'offensive',
        tacticFlexibility: 0.35,
        squadReplenishThreshold: 15,
        dreadThreshold: Infinity,
        marketActivity: 0.50,
        decisionErrorRate: 0.02,
    },
} as const;

/**
 * Retorna profile de NPC para o level dado.
 */
export function getNpcProfile(level: NpcLevel): NpcProfile {
    return NPC_PROFILES[level] ?? NPC_PROFILES[2];
}
