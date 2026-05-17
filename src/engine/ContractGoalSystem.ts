/**
 * ContractGoalSystem — SPEC-071: Contratos com Metas Explícitas
 *
 * Cada season tem um objetivo explícito. Cumprir → bônus de reputação.
 * Falhar → demissão (com buffer de proteção contratual).
 *
 * Stateless: recebe contexto, retorna contrato ou resolução.
 */

import { rng as systemRng } from './rng.js';

export type ObjectiveType = 'avoid_relegation' | 'top_half' | 'top_4' | 'title' | 'promotion';
export type ClubTier = 'big' | 'mid' | 'small';
export type ContractType = 'new_hire' | 'renewal';
export type Consequence = 'bigger_club_interested' | 'renewal_offered' | 'nothing' | 'fired';
export type Outcome = 'fulfilled' | 'failed';

const OBJECTIVES: Record<ObjectiveType, string> = {
    avoid_relegation: 'Não ser rebaixado',
    top_half: 'Terminar na metade de cima',
    top_4: 'Terminar no top 4',
    title: 'Ser campeão',
    promotion: 'Subir de divisão',
};

export interface Contract {
    contractId: string;
    managerId: number;
    clubId: number;
    objective: ObjectiveType;
    objectiveDescription: string;
    minWeeks: number;
    bonusReputation: number;
    penaltyReputation: number;
    expiresAfterSeasons: number;
}

export interface GenerateOpts {
    managerId?: number;
    clubId?: number;
    clubTier?: ClubTier;
    managerReputation?: number;
    contractType?: ContractType;
    clubInCrisis?: boolean;
    clubDivision?: number;
}

export interface ResolveOpts {
    contractId: string;
    objectiveMet: boolean;
    weeksManaged?: number;
    minWeeks?: number;
    managerReputation?: number;
    bonusReputation?: number;
    penaltyReputation?: number;
}

export interface ContractResolution {
    contractId: string;
    outcome: Outcome;
    reputationDelta: number;
    consequence: Consequence;
}

/**
 * Gera contrato para novo técnico ou renovação.
 */
export function generate({
    managerId = 0,
    clubId = 0,
    clubTier = 'mid',
    managerReputation = 10,
    contractType = 'new_hire',
    clubInCrisis = false,
    clubDivision = 1,
}: GenerateOpts = {}): Contract {
    const objective = pickObjective({ clubTier, managerReputation, clubInCrisis, clubDivision });
    const objectiveDescription = OBJECTIVES[objective] || objective;
    const minWeeks = 10;

    const bonusReputation = clamp(5 + Math.round(difficultyOf(objective) * 10), 5, 15);
    const penaltyReputation = clamp(5 + Math.round(difficultyOf(objective) * 15), 5, 20);
    const expiresAfterSeasons = contractType === 'renewal' ? 2 : 1;

    return {
        contractId: `c-${managerId}-${clubId}-${Math.floor(systemRng() * 0xFFFFFF).toString(16)}`,
        managerId,
        clubId,
        objective,
        objectiveDescription,
        minWeeks,
        bonusReputation,
        penaltyReputation,
        expiresAfterSeasons,
    };
}

/**
 * Resolve contrato ao fim da season.
 */
export function resolve({
    contractId,
    objectiveMet,
    weeksManaged = 38,
    minWeeks = 10,
    managerReputation = 10,
    bonusReputation = 8,
    penaltyReputation = 10,
}: ResolveOpts): ContractResolution {
    const inBuffer = weeksManaged < minWeeks;

    if (objectiveMet) {
        const biggerClubChance = managerReputation >= 70 ? 0.35 : 0.10;
        const consequence: Consequence = systemRng() < biggerClubChance ? 'bigger_club_interested' : 'renewal_offered';
        return { contractId, outcome: 'fulfilled', reputationDelta: +bonusReputation, consequence };
    }

    if (inBuffer) {
        return { contractId, outcome: 'failed', reputationDelta: 0, consequence: 'nothing' };
    }

    return { contractId, outcome: 'failed', reputationDelta: -penaltyReputation, consequence: 'fired' };
}

// ─── helpers ────────────────────────────────────────────────

function pickObjective({ clubTier, managerReputation, clubInCrisis, clubDivision }: {
    clubTier: ClubTier;
    managerReputation: number;
    clubInCrisis: boolean;
    clubDivision: number;
}): ObjectiveType {
    if (clubInCrisis) return 'avoid_relegation';
    if (clubTier === 'small') {
        if (managerReputation < 40) return 'avoid_relegation';
        if (clubDivision > 1) return 'promotion';
        return 'top_half';
    }
    if (clubTier === 'mid') {
        if (clubInCrisis || managerReputation < 30) return 'avoid_relegation';
        return 'top_4';
    }
    if (managerReputation >= 60) return 'title';
    return 'top_4';
}

function difficultyOf(objective: ObjectiveType): number {
    const map: Record<ObjectiveType, number> = {
        avoid_relegation: 0.2,
        top_half: 0.4,
        top_4: 0.6,
        promotion: 0.7,
        title: 1.0,
    };
    return map[objective] ?? 0.5;
}

function clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
}
