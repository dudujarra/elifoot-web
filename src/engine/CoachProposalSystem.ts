import { rng as systemRng } from './rng.js';
/**
 * CoachProposalSystem — SPEC-073: Propostas Orgânicas de Clubes
 *
 * Gera propostas de outros clubes para contratar o técnico.
 * Baseado em reputação + forma recente + objetivo cumprido.
 *
 * Stateless: recebe contexto, retorna proposta + efeitos de decisão.
 */

const TIER_ORDER = { small: 0, mid: 1, big: 2 };

export type ClubTier = 'big' | 'mid' | 'small';
export type FormResult = 'W' | 'D' | 'L';
export type ProposalDecision = 'accept' | 'wait_contract_end' | 'refuse';

export interface ClubCandidate {
    id: number;
    name: string;
    tier: ClubTier;
}

export interface EvaluateOptions {
    managerId?: number;
    currentClubId?: number;
    currentClubTier?: ClubTier;
    currentContractWeeksLeft?: number;
    managerReputation?: number;
    recentForm?: FormResult[];
    currentObjectiveMet?: boolean;
    week?: number;
    season?: number;
    availableClubs?: ClubCandidate[];
}

export interface Proposal {
    proposalId: string;
    fromClubId: number;
    fromClubName: string;
    fromClubTier: ClubTier;
    contractObjective: string;
    reputationBoost: number;
    exitFee: number;
    deadline: number;
    reason: string;
}

export interface EvaluateResult {
    proposalAvailable: boolean;
    proposal?: Proposal;
    decisionRequired: boolean;
}

export function evaluate({
    managerId = 0,
    currentClubId = 0,
    currentClubTier = 'mid',
    currentContractWeeksLeft = 20,
    managerReputation = 10,
    recentForm = [],
    currentObjectiveMet = false,
    week = 1,
    season = 1,
    availableClubs = []
}: EvaluateOptions = {}): EvaluateResult {
    // Proposals only appear after week 5 and mid-season or near end
    if (week < 5) return { proposalAvailable: false, decisionRequired: false };

    const recentWins = recentForm.slice(0, 4).filter(r => r === 'W').length;

    // Conditions
    const formBonus = recentWins >= 3;
    const highRep = managerReputation >= 70 && currentObjectiveMet;
    const midRep = managerReputation >= 50 && formBonus;

    if (!formBonus && !highRep && !midRep) {
        return { proposalAvailable: false, decisionRequired: false };
    }

    // Determine what tier club would offer
    let targetTier;
    if (highRep) {
        targetTier = 'big';
    } else if (midRep) {
        targetTier = TIER_ORDER[currentClubTier] >= 1 ? 'big' : 'mid';
    } else {
        targetTier = currentClubTier;
    }

    // Filter available clubs (tier ≥ current, not current club)
    const candidates = availableClubs.filter(c => c.id !== currentClubId && TIER_ORDER[c.tier] >= TIER_ORDER[currentClubTier]);
    const fromClub = candidates.length > 0
        ? candidates[Math.floor(systemRng() * candidates.length)]
        : { id: -1, name: 'Clube Rival', tier: targetTier };

    const reputationBoost = targetTier === 'big' ? 12 : targetTier === 'mid' ? 7 : 4;
    const exitFee = currentContractWeeksLeft > 10 ? 500_000 : 0;

    const proposal: Proposal = {
        proposalId: `prop-${managerId}-${week}-${season}`,
        fromClubId: fromClub.id,
        fromClubName: fromClub.name,
        fromClubTier: (fromClub.tier as ClubTier) || targetTier,
        contractObjective: targetTier === 'big' ? 'title' : targetTier === 'mid' ? 'top_4' : 'avoid_relegation',
        reputationBoost,
        exitFee,
        deadline: week + 3,
        reason: highRep ? 'Impressionados com sua campanha e reputação.' : 'Sua forma recente chamou atenção.',
    };

    return { proposalAvailable: true, proposal, decisionRequired: false };
}

export interface DecideOptions {
    decision: ProposalDecision;
    exitFee?: number;
    reputationBoost?: number;
    currentContractWeeksLeft?: number;
}

export interface DecideResult {
    reputationDelta: number;
    moralImpact: number;
    exitFeeCharged: number;
    consequence: string;
}

export function decide({ decision, exitFee = 0, reputationBoost = 8, currentContractWeeksLeft = 20 }: DecideOptions): DecideResult {
    if (decision === 'accept') {
        const exitFeeCharged = currentContractWeeksLeft > 10 ? exitFee : 0;
        return {
            reputationDelta: reputationBoost,
            moralImpact: -10, // squad unhappy with mid-season departure
            exitFeeCharged,
            consequence: 'club_change',
        };
    }

    if (decision === 'wait_contract_end') {
        return {
            reputationDelta: +3, // honoring contract = rep boost
            moralImpact: 0,
            exitFeeCharged: 0,
            consequence: 'wait',
        };
    }

    // refuse
    return {
        reputationDelta: 0,
        moralImpact: 0,
        exitFeeCharged: 0,
        consequence: 'rival_hires_alternative',
    };
}
