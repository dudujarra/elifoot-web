import { rng as systemRng } from './rng.js';
import { TRAIT } from './EmojiConstants.js';
import { Player } from "./types.js";

/**
 * PlayerTraits.js — Habilidades especiais, Career Stats, Mentoring, Morale Events
 * 
 * Traits: perks individuais que modificam performance em situações específicas
 * Career Stats: tracking de gols/assists/appearances por temporada
 * Mentoring: veteranos ensinam jovens
 * Morale Events: eventos narrativos randômicos entre partidas
 */

// ============================================================
// POSITION_TRAITS — Especializações por Posição (SPEC-144)
// São o que cria "estrelas" no jogo. Exclusivos por posição.
// ============================================================
export interface PositionTraitDef {
    id: string;
    name: string;
    description: string;
    positions: string[];
    rarity: number;
    goalConversionBonus?: number;
    penaltySaveBonus?: number;
    penaltyConversionBonus?: number;
    defenseSectorBonus?: number;
    setPieceConvBonus?: number;
}

export const POSITION_TRAITS: PositionTraitDef[] = [
    {
        id: 'poacher',
        name: '🎯 Artilheiro',
        description: '+25% conversão de gols',
        positions: ['ATA'],
        rarity: 0.12,
        goalConversionBonus: 1.25,
    },
    {
        id: 'penalty_stopper',
        name: '🧤 Pegador de Pênalti',
        description: '+35% save em pênalti',
        positions: ['GOL'],
        rarity: 0.10,
        penaltySaveBonus: 1.35,
    },
    {
        id: 'penalty_king',
        name: '⚽ Cobrador Nato',
        description: '+40% conversão em pênalti',
        positions: ['ATA', 'MEI'],
        rarity: 0.10,
        penaltyConversionBonus: 1.40,
    },
    {
        id: 'rockwall',
        name: '🧱 Muralha',
        description: '+15% setor defensivo do time',
        positions: ['DEF', 'GOL'],
        rarity: 0.08,
        defenseSectorBonus: 0.15,
    },
    {
        id: 'set_piece_target',
        name: '🎯 Alvo de Bola Parada',
        description: '+20% gol em escanteio/falta',
        positions: ['ATA', 'DEF'],
        rarity: 0.09,
        setPieceConvBonus: 1.20,
    },
];

// IDs de todos os position traits (para validação de stacking)
const _POSITION_TRAIT_IDS: Set<string> = new Set(POSITION_TRAITS.map((t: PositionTraitDef) => t.id));

// ============================================================
// TRAITS — Habilidades Genéricas (qualquer posição)
// ============================================================
export interface GenericTraitDef {
    id: string;
    name: string;
    description: string;
    rarity: number;
    matchEffect?: (minute: number) => number;
    setpieceBonus?: number;
    postMatchEffect?: string;
    injuryMod?: number;
    cardMod?: number;
    tacticBonus?: Record<string, number>;
    energySaveMod?: number;
    growthMod?: number;
    derbyMod?: number;
    coldPenalty?: number;
    moralFloor?: number;
}

export const TRAITS: GenericTraitDef[] = [
    { id: "clutch", name: "🎯 Decisivo", description: "Rende mais nos últimos 15 min", matchEffect: (minute: number) => minute >= 75 ? 1.25 : 1.0, rarity: 0.08 },
    { id: "freekick", name: "🎯 Cobrador", description: "+20% em bola parada", matchEffect: () => 1.0, setpieceBonus: 1.2, rarity: 0.10 },
    { id: "leader", name: "👔 Líder Nato", description: "+3 moral do time após vitória", postMatchEffect: 'leaderBoost', rarity: 0.06 },
    { id: "glass", name: "🔮 Cristal", description: "2x chance de lesão", injuryMod: 2.0, rarity: 0.08 },
    { id: "ironman", name: "🦾 Cavalo de Aço", description: "50% menos lesão", injuryMod: 0.5, rarity: 0.07 },
    { id: "hothead", name: "🔴 Esquentado", description: "3x chance de cartão", cardMod: 3.0, rarity: 0.09 },
    { id: "speedster", name: "💨 Velocista", description: "+15% em contra-ataque", tacticBonus: { counter: 1.15 }, rarity: 0.10 },
    { id: "playmaker", name: "🎩 Armador", description: "+20% em posse de bola", tacticBonus: { possession: 1.2 }, rarity: 0.08 },
    { id: "targetman", name: "🗼 Pivô", description: "+15% em jogo aéreo/ofensivo", tacticBonus: { offensive: 1.15 }, rarity: 0.09 },
    { id: "workhorse", name: "🐎 Trabalhador", description: "-30% desgaste de energia", energySaveMod: 0.7, rarity: 0.10 },
    { id: "wonderkid", name: "⭐ Joia", description: "+50% crescimento de atributos", growthMod: 1.5, rarity: 0.05 },
    { id: "veteran", name: "🎖️ Veterano", description: "Estabiliza moral do time", postMatchEffect: 'veteranCalm', rarity: 0.07 },
    { id: "bigmatch", name: "🏟️ Jogador de Clássico", description: "+15% em derbies", derbyMod: 1.15, rarity: 0.06 },
    { id: "flop", name: "📉 Inconsistente", description: "-10% quando cold streak", coldPenalty: 0.9, rarity: 0.10 },
    { id: "mentalist", name: "🧠 Mentalidade", description: "Nunca perde moral abaixo de 40", moralFloor: 40, rarity: 0.07 },
];

/**
 * SPEC-144: Assign traits respeitando posição.
 * Máx 1 trait de especialização (posição-específico) + 1 genérico.
 */
export function rollTraits(player: Player): void {
    if (player.traits && player.traits.length > 0) return; // already has
    player.traits = [];
    const maxTraits = player.age! < 22 ? 1 : 2;

    // 1. Tentar 1 trait de especialização (posição-específico)
    const eligible = POSITION_TRAITS.filter((t: PositionTraitDef) => t.positions.includes(player.position));
    const shuffledPos = [...eligible].sort(() => systemRng() - 0.5);
    for (const trait of shuffledPos) {
        if (player.traits.length >= 1) break;
        if (systemRng() < trait.rarity) {
            player.traits.push(trait.id);
            break;
        }
    }

    // 2. Traits genéricos até maxTraits
    const shuffled = [...TRAITS].sort(() => systemRng() - 0.5);
    for (const trait of shuffled) {
        if (player.traits.length >= maxTraits) break;
        if (systemRng() < trait.rarity) {
            player.traits.push(trait.id);
        }
    }
}

export function getPlayerTraits(player: Player): (PositionTraitDef | GenericTraitDef)[] {
    if (!player.traits) return [];
    const all = [...TRAITS, ...POSITION_TRAITS];
    return player.traits.map((id: string) => all.find((t: PositionTraitDef | GenericTraitDef) => t.id === id)).filter(Boolean) as (PositionTraitDef | GenericTraitDef)[];
}

export function hasTrait(player: Player, traitId: string): boolean {
    return !!(player.traits && player.traits.includes(traitId));
}

// ============================================================
// SPEC-144: Helpers de bonus para MatchSimulator
// ============================================================

/** ATA com poacher → +25% conversão de gol */
export function getGoalConversionBonus(player: Player): number {
    return player?.traits?.includes('poacher') ? 1.25 : 1.0;
}

/** GOL com penalty_stopper → +35% save em pênalti */
export function getPenaltySaveBonus(player: Player): number {
    return player?.traits?.includes('penalty_stopper') ? 1.35 : 1.0;
}

/** ATA/MEI com penalty_king → +40% conversão em pênalti */
export function getPenaltyConversionBonus(player: Player): number {
    return player?.traits?.includes('penalty_king') ? 1.40 : 1.0;
}

/**
 * Time com DEF/GOL rockwall → +15% por jogador com trait no setor defensivo.
 * @param {Array} squad - squad completo do time
 */
export function getDefenseSectorBonus(squad: any[]): number {
    if (!squad?.length) return 1.0;
    const defenders = squad.filter((p: Player) => p.isTitular && (p.position === 'DEF' || p.position === 'GOL'));
    const rockwalls = defenders.filter((p: Player) => p.traits?.includes('rockwall')).length;
    return 1.0 + (rockwalls * 0.15);
}

/** ATA/DEF com set_piece_target → +20% conversão em bola parada */
export function getSetPieceBonus(player: Player): number {
    return player?.traits?.includes('set_piece_target') ? 1.20 : 1.0;
}

/** Retorna display name do trait de especialização do jogador (para UI) */
export function getSpecializationDisplay(player: Player): {id: string, name: string, description: string} | null {
    if (!player?.traits) return null;
    const spec = POSITION_TRAITS.find((t: PositionTraitDef) => player.traits!.includes(t.id));
    return spec ? { id: spec.id, name: spec.name, description: spec.description } : null;
}

/**
 * Get combined match modifier from traits for a given context
 */
export function getTraitMatchModifier(player: Player, minute: number, tactic: string, isDerby: boolean): number {
    if (!player.traits) return 1.0;
    let mod = 1.0;
    for (const traitId of player.traits) {
        const trait = TRAITS.find((t: GenericTraitDef) => t.id === traitId);
        if (!trait) continue;
        if (trait.matchEffect) mod *= trait.matchEffect(minute);
        if (trait.tacticBonus && trait.tacticBonus[tactic]) mod *= trait.tacticBonus[tactic];
        if (isDerby && trait.derbyMod) mod *= trait.derbyMod;
        if (player.form?.trend === 'cold' && trait.coldPenalty) mod *= trait.coldPenalty;
    }
    return mod;
}

// Re-exports para manter a retrocompatibilidade com dependências atuais
export * from './CareerStatsSystem.js';
export * from './SeasonAwardsSystem.js';
export * from './MoraleEventSystem.js';
export * from './MentoringSystem.js';
export * from './TransferNegotiationSystem.js';
