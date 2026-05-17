/**
 * RivalryUpgradeSystem — SPEC-080: Rivalidades com Peso Narrativo Real
 *
 * Expande SPEC-017 (derby básico): criticalCount real + 6 arcos nomeados.
 * Stateless: recebe histórico de confrontos, retorna estado de rivalidade.
 */

export interface NamedArc {
    readonly id: string;
    readonly threshold: number;
    readonly name: string;
    readonly description: string;
}

const NAMED_ARCS: readonly NamedArc[] = [
    { id: 'classico_eterno', threshold: 10, name: 'Clássico Eterno', description: '10+ confrontos registrados' },
    { id: 'batalha_das_geracoes', threshold: 20, name: 'Batalha das Gerações', description: '20+ confrontos com múltiplas eras' },
    { id: 'revanche', threshold: 5, name: 'Revanche', description: '3+ vitórias consecutivas de um lado' },
    { id: 'equilíbrio_perfeito', threshold: 0, name: 'Equilíbrio Perfeito', description: 'Winrate entre 45-55% para ambos' },
    { id: 'dominio_absoluto', threshold: 0, name: 'Domínio Absoluto', description: 'Um lado com 70%+ winrate' },
    { id: 'confronto_titulo', threshold: 0, name: 'Confronto de Título', description: 'Ambos disputaram título no mesmo ano' },
] as const;

export interface MatchRecord {
    readonly clubAScore: number;
    readonly clubBScore: number;
    readonly week?: number;
    readonly season?: number;
    readonly isDecisive?: boolean;
}

export interface H2HStats {
    readonly total: number;
    readonly aWins: number;
    readonly bWins: number;
    readonly draws: number;
    readonly aWinRate: number;
    readonly bWinRate: number;
    readonly criticalCount: number;
}

export interface RivalryResult {
    readonly rivalryScore: number;
    readonly criticalCount: number;
    readonly activeArc: NamedArc | undefined;
    readonly h2h: H2HStats;
    readonly namedRivalry: boolean;
}

export interface EvaluateOpts {
    readonly clubAId?: number;
    readonly clubBId?: number;
    readonly history?: readonly MatchRecord[];
    readonly bothInTitleRace?: boolean;
}

/**
 * Avalia estado atual de uma rivalidade entre dois clubes.
 */
export function evaluate({
    clubAId: _clubAId,
    clubBId: _clubBId,
    history = [],
    bothInTitleRace = false,
}: EvaluateOpts = {}): RivalryResult {
    const total: number = history.length;
    const aWins: number = history.filter(m => m.clubAScore > m.clubBScore).length;
    const bWins: number = history.filter(m => m.clubBScore > m.clubAScore).length;
    const draws: number = total - aWins - bWins;
    const criticalCount: number = history.filter(m => m.isDecisive).length;

    const aWinRate: number = total > 0 ? aWins / total : 0;
    const bWinRate: number = total > 0 ? bWins / total : 0;

    const rivalryScore: number = Math.min(100, Math.round(total * 4 + criticalCount * 10));
    const h2h: H2HStats = { total, aWins, bWins, draws, aWinRate, bWinRate, criticalCount };

    const activeArc: NamedArc | undefined = pickArc({ total, aWinRate, bWinRate, criticalCount, bothInTitleRace, history });
    const namedRivalry: boolean = rivalryScore >= 40;

    return { rivalryScore, criticalCount, activeArc, h2h, namedRivalry };
}

/**
 * Registra confronto crítico (decisivo para título/classificação).
 */
export function markCritical(match: MatchRecord): MatchRecord & { isDecisive: true } {
    return { ...match, isDecisive: true };
}

// ─── helpers ────────────────────────────────────────────────

interface PickArcOpts {
    readonly total: number;
    readonly aWinRate: number;
    readonly bWinRate: number;
    readonly criticalCount: number;
    readonly bothInTitleRace: boolean;
    readonly history: readonly MatchRecord[];
}

function pickArc({ total, aWinRate, bWinRate, criticalCount: _criticalCount, bothInTitleRace, history }: PickArcOpts): NamedArc | undefined {
    if (bothInTitleRace) return NAMED_ARCS.find(a => a.id === 'confronto_titulo');
    if (total >= 20) return NAMED_ARCS.find(a => a.id === 'batalha_das_geracoes');
    if (total >= 10) return NAMED_ARCS.find(a => a.id === 'classico_eterno');
    if (aWinRate >= 0.7 || bWinRate >= 0.7) return NAMED_ARCS.find(a => a.id === 'dominio_absoluto');
    if (Math.abs(aWinRate - bWinRate) < 0.1 && total >= 5) return NAMED_ARCS.find(a => a.id === 'equilíbrio_perfeito');
    if (history.length >= 3) {
        const last3 = history.slice(-3);
        const allAWins: boolean = last3.every(m => m.clubAScore > m.clubBScore);
        const allBWins: boolean = last3.every(m => m.clubBScore > m.clubAScore);
        if (allAWins || allBWins) return NAMED_ARCS.find(a => a.id === 'revanche');
    }
    return undefined;
}
