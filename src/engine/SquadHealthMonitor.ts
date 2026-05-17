/**
 * SquadHealthMonitor — SPEC-132: Squad Emergency Market
 *
 * Detecta squad com jogadores insuficientes e aciona resposta.
 * Stateless: recebe dados, retorna ação a tomar.
 */

const MIN_SQUAD = 11;
const CRISIS_SQUAD = 8;

export interface MarketPlayer {
    readonly id: number | string;
    readonly name: string;
    readonly ovr: number;
    readonly value?: number;
}

export interface BoughtPlayer {
    readonly playerId: number | string;
    readonly name: string;
    readonly ovr: number;
    readonly cost: number;
}

export interface SquadHealthResult {
    readonly triggered: boolean;
    readonly action: 'none' | 'alert_player' | 'auto_buy';
    readonly alertMessage?: string;
    readonly forceMarketOpen?: boolean;
    readonly playersBought?: readonly BoughtPlayer[];
    readonly budgetSpent?: number;
}

export interface CheckSquadHealthOpts {
    readonly teamId: number;
    readonly squadSize: number;
    readonly budget: number;
    readonly isPlayerManager: boolean;
    readonly week: number;
    readonly squadAvgOvr?: number;
    readonly marketPlayers?: readonly MarketPlayer[];
    readonly _cooldowns?: Record<number, number>;
}

/**
 * Verifica saúde do squad e retorna ação necessária.
 */
export function checkSquadHealth({
    teamId,
    squadSize,
    budget,
    isPlayerManager,
    week,
    squadAvgOvr = 65,
    marketPlayers = [],
    _cooldowns = {},
}: CheckSquadHealthOpts): SquadHealthResult {
    // Cooldown: não disparar mais de 1x por semana por time
    if (_cooldowns[teamId] === week) {
        return { triggered: false, action: 'none' };
    }

    if (squadSize >= MIN_SQUAD) {
        return { triggered: false, action: 'none' };
    }

    // Para player-manager: sempre alerta (nunca compra automático)
    if (isPlayerManager) {
        const shortage: number = MIN_SQUAD - squadSize;
        return {
            triggered: true,
            action: 'alert_player',
            alertMessage: squadSize <= CRISIS_SQUAD
                ? `⚠️ CRISE! Apenas ${squadSize} jogadores disponíveis. Você precisa de ${shortage} reforços urgentes!`
                : `📋 Elenco curto: ${squadSize} jogadores. Considere contratar ${shortage} reforços.`,
            forceMarketOpen: squadSize <= CRISIS_SQUAD,
        };
    }

    // Para NPCs: compra automática se há budget
    if (budget <= 0) {
        return { triggered: true, action: 'auto_buy', playersBought: [], budgetSpent: 0 };
    }

    const needed: number = MIN_SQUAD - squadSize;
    const bought = buyEmergencyPlayers(needed, squadAvgOvr, budget, marketPlayers);

    return {
        triggered: true,
        action: 'auto_buy',
        playersBought: bought.players,
        budgetSpent: bought.totalCost,
    };
}

// ─── helpers ────────────────────────────────────────────────

function buyEmergencyPlayers(
    needed: number,
    squadAvgOvr: number,
    budget: number,
    marketPlayers: readonly MarketPlayer[],
): { players: BoughtPlayer[]; totalCost: number } {
    const maxOvr: number = squadAvgOvr + 5;
    const affordable = [...marketPlayers]
        .filter(p => p.ovr <= maxOvr && (p.value || 0) <= budget * 0.5)
        .sort((a, b) => b.ovr - a.ovr);

    const players: BoughtPlayer[] = [];
    let totalCost = 0;

    for (let i = 0; i < needed && i < affordable.length; i++) {
        const p = affordable[i];
        const cost: number = p.value || 100000;
        if (totalCost + cost > budget * 0.5) continue;
        players.push({ playerId: p.id, name: p.name, ovr: p.ovr, cost });
        totalCost += cost;
    }

    return { players, totalCost };
}
