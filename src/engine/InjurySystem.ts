import { rng as systemRng } from './rng.ts';
import { INJURY_TYPE } from './EmojiConstants.ts';
import { INJURY, ENERGY, AGE } from './GameConstants.ts';

/**
 * InjurySystem.ts — Lesões e recuperação
 * Inspirado em FM (severity tiers) + OléFUT (simplicidade)
 */

// ── Types ──────────────────────────────────────────────────────

interface InjuryTypeDefinition {
    readonly id: string;
    readonly name: string;
    readonly minWeeks: number;
    readonly maxWeeks: number;
    readonly emoji: string;
}

export interface Injury {
    type: string;
    name: string;
    emoji: string;
    weeksLeft: number;
    totalWeeks: number;
}

export interface Player {
    name: string;
    age: number;
    energy: number;
    injury: Injury | null;
    isTitular: boolean;
    injuryProneness?: number;
}

export interface InjuryReport {
    player: string;
    type: string;
    name: string;
    emoji: string;
    weeksLeft: number;
    totalWeeks: number;
}

type InjuryContext = 'match' | 'training_double' | 'training';
type TrainingType = 'double' | string;

// ── Data ───────────────────────────────────────────────────────

const INJURY_TYPES: readonly InjuryTypeDefinition[] = [
    { id: "muscle", name: "Lesão muscular", minWeeks: 1, maxWeeks: 3, emoji: INJURY_TYPE.MUSCLE },
    { id: "ankle", name: "Torção no tornozelo", minWeeks: 2, maxWeeks: 4, emoji: INJURY_TYPE.ANKLE },
    { id: "knee", name: "Lesão no joelho", minWeeks: 3, maxWeeks: 8, emoji: INJURY_TYPE.KNEE },
    { id: "hamstring", name: "Estiramento na coxa", minWeeks: 1, maxWeeks: 3, emoji: INJURY_TYPE.HAMSTRING },
    { id: "fracture", name: "Fratura", minWeeks: 6, maxWeeks: 15, emoji: INJURY_TYPE.FRACTURE },
    { id: "concussion", name: "Concussão", minWeeks: 1, maxWeeks: 2, emoji: INJURY_TYPE.CONCUSSION },
] as const;

// ── Functions ──────────────────────────────────────────────────

/**
 * Rola chance de lesão para um jogador.
 */
export function rollInjury(player: Player, context: InjuryContext = 'match'): Injury | null {
    // Base chance por contexto
    let chance: number;
    if (context === 'match') chance = INJURY.BASE_MATCH_CHANCE;
    else if (context === 'training_double') chance = INJURY.BASE_TRAINING_DOUBLE;
    else chance = INJURY.BASE_TRAINING;

    // Modificadores
    if (player.energy < ENERGY.EXHAUSTED) chance *= INJURY.EXHAUSTION_MULTIPLIER;
    if (player.energy < ENERGY.CRITICAL) chance *= INJURY.CRITICAL_MULTIPLIER;
    if (player.age > AGE.VETERAN_START) chance *= INJURY.VETERAN_MULTIPLIER;
    if (player.age < 20) chance *= INJURY.YOUTH_MULTIPLIER;

    // injuryProneness: 5-15 scale. 10 = neutro, 15 = frágil (+50%), 5 = resistente (-30%)
    if (player.injuryProneness != null) {
        const pronenessMod = 1.0 + (player.injuryProneness - 10) * 0.1;
        chance *= Math.max(0.5, Math.min(1.8, pronenessMod));
    }

    if (systemRng() > chance) return null;

    // Severidade: energia baixa = lesão mais grave
    const severityPool = player.energy < 30
        ? INJURY_TYPES // todas possíveis
        : INJURY_TYPES.filter(t => t.maxWeeks <= 4); // só leves

    const type = severityPool[Math.floor(systemRng() * severityPool.length)];
    const weeks = type.minWeeks + Math.floor(systemRng() * (type.maxWeeks - type.minWeeks + 1));

    return {
        type: type.id,
        name: type.name,
        emoji: type.emoji,
        weeksLeft: weeks,
        totalWeeks: weeks,
    };
}

/**
 * Avança recuperação de lesão.
 * @returns true se curou
 */
export function healInjury(player: Player): boolean {
    if (!player.injury) return false;
    player.injury.weeksLeft--;
    if (player.injury.weeksLeft <= 0) {
        player.injury = null;
        player.energy = 60; // volta com energia parcial
        return true;
    }
    return false;
}

/**
 * Aplica lesões ao plantel após partida.
 */
export function processMatchInjuries(squad: Player[]): InjuryReport[] {
    const injuries: InjuryReport[] = [];
    squad.filter(p => p.isTitular && !p.injury).forEach(player => {
        const injury = rollInjury(player, 'match');
        if (injury) {
            player.injury = injury;
            player.isTitular = false; // sai do time titular
            injuries.push({ player: player.name, ...injury });
        }
    });
    return injuries;
}

/**
 * Aplica lesões ao plantel no treino.
 */
export function processTrainingInjuries(squad: Player[], trainingType: TrainingType): InjuryReport[] {
    const context: InjuryContext = trainingType === 'double' ? 'training_double' : 'training';
    const injuries: InjuryReport[] = [];
    squad.filter(p => !p.injury).forEach(player => {
        const injury = rollInjury(player, context);
        if (injury) {
            player.injury = injury;
            player.isTitular = false;
            injuries.push({ player: player.name, ...injury });
        }
    });
    return injuries;
}
