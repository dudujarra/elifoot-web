/**
 * RookieHandicap — SPEC-A5
 *
 * Aplica handicap suave nas 3 primeiras partidas da 1ª temporada.
 * Reduz attrs do oponente para aumentar retention do novato.
 *
 * Pure function. Determinístico. Headless.
 */

const HANDICAP_CURVE: readonly number[] = [0.90, 0.93, 0.97] as const; // matches 1, 2, 3
const HANDICAP_NEUTRAL = 1.0 as const;

interface RookieHandicapOpts {
    readonly seasonNumber?: number;
    readonly matchesPlayedSeason?: number;
}

/**
 * Calcula multiplicador rookie handicap.
 */
export function getRookieHandicap({ seasonNumber = 1, matchesPlayedSeason = 0 }: RookieHandicapOpts = {}): number {
    // Só aplica em temporada 1
    if (seasonNumber !== 1) return HANDICAP_NEUTRAL;

    // Só nas 3 primeiras partidas
    if (matchesPlayedSeason >= HANDICAP_CURVE.length) return HANDICAP_NEUTRAL;

    return HANDICAP_CURVE[matchesPlayedSeason];
}

interface EngineForHandicap {
    readonly seasonNumber?: number;
    readonly managerStats?: {
        readonly wins?: number;
        readonly draws?: number;
        readonly losses?: number;
    };
}

/**
 * Conveniência: extrai contadores do engine e retorna multiplicador.
 */
export function getRookieHandicapFromEngine(engine: EngineForHandicap | null | undefined): number {
    if (!engine) return HANDICAP_NEUTRAL;
    const stats = engine.managerStats || {};
    const played = (stats.wins || 0) + (stats.draws || 0) + (stats.losses || 0);
    return getRookieHandicap({
        seasonNumber: engine.seasonNumber || 1,
        matchesPlayedSeason: played,
    });
}

export { HANDICAP_CURVE, HANDICAP_NEUTRAL };
