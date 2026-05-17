/**
 * HallOfLegendsSystem — SPEC-078: Canonização de Mitos do Clube
 *
 * 6 slots permanentes por clube que capturam figuras históricas do save.
 * Base para Traits Herdáveis (SPEC-079).
 *
 * Stateless: recebe dados históricos, retorna hall atualizado.
 */

export const SLOTS = [
    'idoloEterno', 'carrasco', 'goleirao', 'criaDaBase', 'traidor', 'lendaTragica',
] as const;

export type SlotKey = (typeof SLOTS)[number];

export interface SlotMeta {
    readonly label: string;
    readonly criteria: string;
}

const SLOT_META: Readonly<Record<SlotKey, SlotMeta>> = {
    idoloEterno:   { label: 'Ídolo Eterno',   criteria: 'Mais jogos + maior amor da torcida' },
    carrasco:      { label: 'Carrasco',        criteria: 'Mais gols contra este clube (rival)' },
    goleirao:      { label: 'Goleador',        criteria: 'Maior número de gols' },
    criaDaBase:    { label: 'Cria da Base',    criteria: 'Formado internamente com maior impacto' },
    traidor:       { label: 'Traidor',         criteria: 'Saiu para rival direto' },
    lendaTragica:  { label: 'Lenda Trágica',  criteria: 'Lesão longa ou carreira interrompida' },
};

export interface HallPlayer {
    readonly id: number | string;
    readonly name: string;
    readonly apps?: number;
    readonly goals?: number;
    readonly morale?: number;
    readonly fromBase?: boolean;
    readonly soldToRival?: boolean;
    readonly hadLongInjury?: boolean;
    readonly goalsVsThisClub?: number;
}

export interface CanonizedEntry {
    readonly playerId: number | string;
    readonly playerName: string;
    readonly slot: SlotKey;
    readonly slotLabel: string;
    readonly stats: {
        readonly apps: number;
        readonly goals: number;
        readonly goalsVsThisClub: number;
    };
}

export interface HallResult {
    readonly clubId: number;
    readonly slots: Partial<Record<SlotKey, CanonizedEntry>>;
    readonly filledCount: number;
}

export interface ComputeOpts {
    readonly clubId: number;
    readonly players?: readonly HallPlayer[];
    readonly rivalPlayers?: readonly HallPlayer[];
}

/**
 * Computa o Hall de Lendas para um clube.
 */
export function compute({ clubId, players = [], rivalPlayers = [] }: ComputeOpts): HallResult {
    const slots: Partial<Record<SlotKey, CanonizedEntry>> = {};

    // idoloEterno: most apps
    const byApps = [...players].sort((a, b) => (b.apps || 0) - (a.apps || 0));
    if (byApps[0]) slots.idoloEterno = canonize(byApps[0], 'idoloEterno');

    // goleirao: most goals
    const byGoals = [...players].sort((a, b) => (b.goals || 0) - (a.goals || 0));
    if (byGoals[0] && (byGoals[0].goals || 0) > 0) slots.goleirao = canonize(byGoals[0], 'goleirao');

    // carrasco: rival player with most goals vs this club
    const byCarrasco = [...rivalPlayers].sort((a, b) => (b.goalsVsThisClub || 0) - (a.goalsVsThisClub || 0));
    if (byCarrasco[0] && (byCarrasco[0].goalsVsThisClub || 0) > 0) slots.carrasco = canonize(byCarrasco[0], 'carrasco');

    // criaDaBase: from base + highest goals
    const baseKids = players.filter(p => p.fromBase).sort((a, b) => (b.goals || 0) - (a.goals || 0));
    if (baseKids[0]) slots.criaDaBase = canonize(baseKids[0], 'criaDaBase');

    // traidor: sold to rival
    const traitors = players.filter(p => p.soldToRival).sort((a, b) => (b.apps || 0) - (a.apps || 0));
    if (traitors[0]) slots.traidor = canonize(traitors[0], 'traidor');

    // lendaTragica: long injury or career cut short
    const tragics = players.filter(p => p.hadLongInjury).sort((a, b) => (b.apps || 0) - (a.apps || 0));
    if (tragics[0]) slots.lendaTragica = canonize(tragics[0], 'lendaTragica');

    const filledCount: number = Object.keys(slots).length;
    return { clubId, slots, filledCount };
}

/**
 * Verifica se um jogador está em algum slot do hall.
 */
export function isCanonized(hall: HallResult, playerId: number | string): boolean {
    return Object.values(hall.slots || {}).some(s => s.playerId === playerId);
}

// ─── helpers ────────────────────────────────────────────────

function canonize(player: HallPlayer, slot: SlotKey): CanonizedEntry {
    return {
        playerId: player.id,
        playerName: player.name,
        slot,
        slotLabel: SLOT_META[slot]?.label || slot,
        stats: {
            apps: player.apps || 0,
            goals: player.goals || 0,
            goalsVsThisClub: player.goalsVsThisClub || 0,
        },
    };
}
