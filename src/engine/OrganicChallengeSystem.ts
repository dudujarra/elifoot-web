/**
 * OrganicChallengeSystem — SPEC-074: Desafios e Missões Espontâneos
 *
 * Desafios opcionais que aparecem durante o jogo baseados no contexto.
 * Nunca obrigatórios. Surgem organicamente (salvamento, gigante caído, etc.).
 *
 * Stateless: recebe estado, retorna desafio disponível.
 */

export interface ChallengeTypeConfig {
    minRep: number;
    reputationBoost: number;
    reputationLoss: number;
    narrativeTitle: string;
}

const CHALLENGE_TYPES: Record<string, ChallengeTypeConfig> = {
    crisis_save:    { minRep: 0,  reputationBoost: 20, reputationLoss: 5,  narrativeTitle: 'O Médico dos Clubes' },
    giant_revival:  { minRep: 40, reputationBoost: 30, reputationLoss: 10, narrativeTitle: 'O Ressurgimento' },
    cup_mission:    { minRep: 20, reputationBoost: 15, reputationLoss: 3,  narrativeTitle: 'O Copeiro' },
    total_rebuild:  { minRep: 30, reputationBoost: 25, reputationLoss: 8,  narrativeTitle: 'O Arquiteto' },
    style_duel:     { minRep: 0,  reputationBoost: 10, reputationLoss: 2,  narrativeTitle: 'O Estrategista' },
};

export interface ClubData {
    id: number;
    name: string;
    division: number;
    historicDivision?: number;
}

export interface EvaluateChallengeOptions {
    _managerId?: number;
    currentClubId?: number;
    season?: number;
    week?: number;
    managerReputation?: number;
    _managerAvailable?: boolean;
    clubsInRelegationZone?: ClubData[];
    historicClubsInLowerDivisions?: ClubData[];
    upcomingRivalWeek?: number;
}

export interface ChallengeData {
    challengeId: string;
    type: string;
    targetClubId: number;
    targetClubName: string;
    description: string;
    reward: { reputationBoost: number; narrativeTitle: string };
    penalty: { reputationLoss: number };
    deadline: number;
    optional: boolean;
}

export interface EvaluateChallengeResult {
    challengeAvailable: boolean;
    challenge?: ChallengeData;
}

export function evaluate({ _managerId = 0, currentClubId = 0, season = 1, week = 1, managerReputation = 10, _managerAvailable = true, clubsInRelegationZone = [], historicClubsInLowerDivisions = [], upcomingRivalWeek = -1 }: EvaluateChallengeOptions = {}): EvaluateChallengeResult {
    // Challenges only from season 2 onward (player needs to establish themselves)
    if (season < 2) return { challengeAvailable: false };

    // Try each challenge type in priority order
    const crisis = clubsInRelegationZone.find(c => c.id !== currentClubId);
    if (crisis && managerReputation >= CHALLENGE_TYPES.crisis_save.minRep) {
        return buildChallenge('crisis_save', crisis, `O ${crisis.name} está no Z4 — eles precisam de você agora.`, week);
    }

    const giant = historicClubsInLowerDivisions.find(c => c.id !== currentClubId && c.historicDivision === 1 && c.division >= 2);
    if (giant && managerReputation >= CHALLENGE_TYPES.giant_revival.minRep) {
        return buildChallenge('giant_revival', giant, `O ${giant.name} quer voltar à elite. Você aceita o desafio?`, week);
    }

    if (upcomingRivalWeek > 0 && upcomingRivalWeek <= week + 2) {
        const dummy = { id: -1, name: 'Rival Tático' };
        return buildChallenge('style_duel', dummy, `Clássico com stakes extras: prove sua superioridade tática.`, week);
    }

    // §14.2: Total Rebuild — when manager has high rep and a struggling team exists
    const struggling = clubsInRelegationZone.find(c => c.id !== currentClubId && c.division >= 2);
    if (struggling && managerReputation >= CHALLENGE_TYPES.total_rebuild.minRep && season >= 3) {
        return buildChallenge('total_rebuild', struggling, `O ${struggling.name} precisa de uma reconstrução total. Será que você tem o que é preciso?`, week);
    }

    // §14.2: Cup Mission — triggered mid-season when cup competition is active
    if (week >= 10 && week <= 30 && managerReputation >= CHALLENGE_TYPES.cup_mission.minRep) {
        const cupTarget = { id: currentClubId, name: 'Seu clube' };
        if (season >= 2 && week % 15 === 0) {
            return buildChallenge('cup_mission', cupTarget, `A diretoria exige: "Precisamos de um título de Copa este ano!"`, week);
        }
    }

    return { challengeAvailable: false };
}

export function accept(challenge: ChallengeData): { accepted: boolean; challengeId: string } {
    return { accepted: true, challengeId: challenge.challengeId };
}

export interface CompleteChallengeOptions {
    challengeType: string;
    success: boolean;
    _currentReputation?: number;
}

export interface CompleteChallengeResult {
    reputationDelta: number;
    narrativeTitle: string | null;
    outcome: 'success' | 'failure';
}

export function complete({ challengeType, success, _currentReputation = 10 }: CompleteChallengeOptions): CompleteChallengeResult {
    const cfg = CHALLENGE_TYPES[challengeType] || CHALLENGE_TYPES.style_duel;
    if (success) {
        return {
            reputationDelta: +cfg.reputationBoost,
            narrativeTitle: cfg.narrativeTitle,
            outcome: 'success',
        };
    }
    return {
        reputationDelta: -cfg.reputationLoss,
        narrativeTitle: null,
        outcome: 'failure',
    };
}

// ─── helpers ────────────────────────────────────────────────

function buildChallenge(type: string, club: { id: number; name: string }, description: string, week: number): EvaluateChallengeResult {
    const cfg = CHALLENGE_TYPES[type];
    return {
        challengeAvailable: true,
        challenge: {
            challengeId: `ch-${type}-${club.id}-${week}`,
            type,
            targetClubId: club.id,
            targetClubName: club.name,
            description,
            reward: { reputationBoost: cfg.reputationBoost, narrativeTitle: cfg.narrativeTitle },
            penalty: { reputationLoss: cfg.reputationLoss },
            deadline: week + 4,
            optional: true,
        },
    };
}
