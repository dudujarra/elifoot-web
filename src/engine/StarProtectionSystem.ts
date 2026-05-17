/**
 * StarProtectionSystem — SPEC-075: Craque Protegido pelo Técnico
 *
 * Técnico declara proteção a 1 jogador. Board tentando vender → tensão spike.
 * narrativeState calculado a partir de performance real do protegido.
 *
 * Stateful: armazena proteção ativa por managerId.
 */

export interface PerformanceStats {
    games: number;
    goals: number;
    assists: number;
    avgRating: number;
}

export type NarrativeState = 'neutral' | 'hero' | 'villain';

export interface ProtectionState {
    protectedPlayerId: number;
    protectedPlayerName: string;
    active: boolean;
    declaredPublicly: boolean;
    performanceSince: PerformanceStats;
    narrativeState: NarrativeState;
}

const _protected = new Map<number, ProtectionState>(); // managerId → protectionState

export interface ProtectOptions {
    managerId: number;
    playerId: number;
    playerName?: string;
    _playerOvr?: number;
    publicDeclaration?: boolean;
    injuryWeeksLeft?: number;
}

export interface ProtectResult {
    protection: ProtectionState;
    pressEvent?: {
        type: string;
        description: string;
        sentiment: string;
    };
}

export function protect({ managerId, playerId, playerName = 'Jogador', _playerOvr = 70, publicDeclaration = false, injuryWeeksLeft = 0 }: ProtectOptions): ProtectResult {
    if (_protected.has(managerId)) throw new Error('AlreadyProtecting');
    if (injuryWeeksLeft > 8) throw new Error('PlayerUnavailableLongTerm');

    const state = {
        protectedPlayerId: playerId,
        protectedPlayerName: playerName,
        active: true,
        declaredPublicly: publicDeclaration,
        performanceSince: { games: 0, goals: 0, assists: 0, avgRating: 7.0 },
        narrativeState: 'neutral',
    };
    _protected.set(managerId, state);

    const result: ProtectResult = { protection: state };
    if (publicDeclaration) {
        result.pressEvent = {
            type: 'manager_protects_player',
            description: `Técnico declara apoio público a ${playerName}. A cidade inteira vai acompanhar.`,
            sentiment: 'neutral',
        };
    }
    return result;
}

export function getProtected(managerId: number): ProtectionState | null {
    return _protected.get(managerId) || null;
}

export interface RevokeResult {
    narrativeEvent: {
        type: string;
        description?: string;
        sentiment?: string;
    };
}

export function revoke({ managerId }: { managerId: number }): RevokeResult {
    const current = _protected.get(managerId);
    if (!current) return { narrativeEvent: { type: 'nothing' } };
    _protected.delete(managerId);
    return {
        narrativeEvent: {
            type: 'manager_revoked_protection',
            description: `Técnico encerrou a proteção pública a ${current.protectedPlayerName}.`,
            sentiment: 'neutral',
        },
    };
}

export interface BoardSellAttemptOptions {
    managerId: number;
    playerId: number;
}

export interface BoardSellAttemptResult {
    type: string;
    tensionDelta: number;
    publicReaction: string;
    managerChoice: string;
}

export function onBoardSellAttempt({ managerId, playerId }: BoardSellAttemptOptions): BoardSellAttemptResult | null {
    const current = _protected.get(managerId);
    if (!current || current.protectedPlayerId !== playerId) return null;
    return {
        type: 'board_threatened_protected',
        tensionDelta: -30,
        publicReaction: 'Torcida apoia técnico. Diretoria sob pressão.',
        managerChoice: 'defend',
    };
}

export function computeState({ performanceSince }: { performanceSince: PerformanceStats }): { narrativeState: NarrativeState } {
    const { games = 0, avgRating = 7.0 } = performanceSince;
    let narrativeState: NarrativeState = 'neutral';
    if (games >= 5) {
        if (avgRating >= 7.5) narrativeState = 'hero';
        else if (avgRating < 6.0) narrativeState = 'villain';
    }
    return { narrativeState };
}

export interface NarrativeEventResult {
    type: string;
    sentiment: string;
    text: string;
}

export function generateNarrativeEvents({ narrativeState, playerName = 'Jogador' }: { narrativeState: NarrativeState; playerName?: string }): NarrativeEventResult[] {
    if (narrativeState === 'hero') {
        return [{ type: 'press_headline', sentiment: 'positive', text: `${playerName} confirma genialidade do técnico.` }];
    }
    if (narrativeState === 'villain') {
        return [{ type: 'press_headline', sentiment: 'negative', text: `Mídia questiona escolha do técnico por ${playerName}.` }];
    }
    return [];
}

export interface UpdatePerformanceOptions {
    managerId: number;
    goals?: number;
    assists?: number;
    rating?: number;
}

export function updatePerformance({ managerId, goals = 0, assists = 0, rating = 7.0 }: UpdatePerformanceOptions): void {
    const current = _protected.get(managerId);
    if (!current) return;
    const p = current.performanceSince;
    p.games++;
    p.goals += goals;
    p.assists += assists;
    p.avgRating = (p.avgRating * (p.games - 1) + rating) / p.games;
    current.narrativeState = computeState({ performanceSince: p }).narrativeState;
}

export function resetAll(): void {
    _protected.clear();
}
