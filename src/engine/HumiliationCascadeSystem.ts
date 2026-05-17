/**
 * HumiliationCascadeSystem — SPEC-076: Vexame com Consequências Narrativas
 *
 * Dispara cascata de eventos ao sofrer goleada.
 * Transforma VEXAME de anomalia passiva em momento de decisão narrativo.
 *
 * Stateless: recebe contexto da partida, retorna cascata.
 */

type EventType = 'morale_collapse' | 'press_hostility' | 'board_meeting' | 'fan_protest' | 'player_request_transfer' | 'manager_ultimatum';

interface CascadeEvent {
    readonly type: EventType;
    readonly severity: number;
    readonly description: string;
    readonly tensionDelta?: number;
}

interface SurvivalNarrative {
    readonly active: boolean;
    readonly milestoneDescription: string;
}

interface HumiliationResult {
    readonly humiliationLevel: number;
    readonly cascadeEvents: CascadeEvent[];
    readonly survivalNarrative: SurvivalNarrative;
}

interface EvaluateOpts {
    readonly teamId?: number;
    readonly managerId?: number;
    readonly scoreDiff?: number;
    readonly homeOrAway?: 'home' | 'away';
    readonly week?: number;
    readonly season?: number;
    readonly managerTension?: number;
    readonly isPlayerManager?: boolean;
}

/**
 * Avalia humilhação e retorna cascata de eventos.
 */
export function evaluate({
    teamId: _teamId = 0,
    managerId: _managerId = 0,
    scoreDiff = 0,
    homeOrAway: _homeOrAway = 'home',
    week: _week = 1,
    season: _season = 1,
    managerTension: _managerTension = 50,
    isPlayerManager: _isPlayerManager = true
}: EvaluateOpts = {}): HumiliationResult {
    const level = computeLevel(scoreDiff);

    if (level === 0) {
        return { humiliationLevel: 0, cascadeEvents: [], survivalNarrative: { active: false, milestoneDescription: '' } };
    }

    const events: CascadeEvent[] = [];

    // Level 1+: morale_collapse + press_hostility
    events.push({ type: 'morale_collapse', severity: 0.4, description: 'Elenco devastado pelo resultado. Moral em colapso.' });
    events.push({ type: 'press_hostility', severity: 0.3, description: 'Imprensa exige explicações do técnico.' });

    // Level 2+: board_meeting + fan_protest
    if (level >= 2) {
        events.push({ type: 'board_meeting', severity: 0.6, description: 'Presidente convoca reunião de emergência.', tensionDelta: -15 });
        events.push({ type: 'fan_protest', severity: 0.6, description: 'Torcida protesta fora do estádio.' });
    }

    // Level 3+: player_request_transfer + manager_ultimatum
    if (level >= 3) {
        events.push({ type: 'player_request_transfer', severity: 0.8, description: 'Um jogador pede para sair. O vestiário está em frangalhos.' });
        events.push({ type: 'manager_ultimatum', severity: 1.0, description: 'Presidente dá ultimato ao técnico.', tensionDelta: -30 });
    }

    // Survival narrative: active if manager survives level 3
    const survivalNarrative: SurvivalNarrative = {
        active: level >= 3,
        milestoneDescription: level >= 3
            ? 'Técnico sobrevive ao escândalo — agora é provar que foi só uma vez.'
            : '',
    };

    return { humiliationLevel: level, cascadeEvents: events, survivalNarrative };
}

// ─── helpers ────────────────────────────────────────────────

function computeLevel(diff: number): number {
    if (diff >= 8) return 3;
    if (diff >= 6) return 2;
    if (diff >= 4) return 1;
    return 0;
}
