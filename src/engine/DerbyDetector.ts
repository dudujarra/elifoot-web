/**
 * DerbyDetector — SPEC-C5.2
 *
 * Detecta se próxima partida é derby/rivalidade emergente baseado em
 * engine.rivalryHistory (SPEC-080).
 *
 * Pure helpers. Headless.
 */

export type RivalryLevel = 'starting' | 'growing' | 'classic' | 'consolidated' | 'none';

export interface RivalInfo {
    oppTeamId: number;
    matchCount: number;
    level: RivalryLevel;
}

export interface DerbyCheck {
    isDerby: boolean;
    level: RivalryLevel;
    matchCount: number;
}

export interface NextDerby {
    week: number;
    oppTeamId: number;
    level: RivalryLevel;
    matchCount: number;
}

interface Engine {
    rivalryHistory?: Record<string, unknown[]>;
    manager?: { teamId?: number };
    currentWeek?: number;
    tournaments?: Array<{
        fixtures?: Record<string | number, Array<{ home: number; away: number }>>;
    }>;
}

const DERBY_THRESHOLD_MATCHES = 3;

/**
 * Lista todos os teamIds com quem o player tem rivalidade ativa.
 */
export function getActiveRivals(engine: Engine): RivalInfo[] {
    if (!engine || !engine.rivalryHistory) return [];
    const myId = engine.manager?.teamId;
    if (!myId) return [];

    const rivals: RivalInfo[] = [];
    Object.keys(engine.rivalryHistory).forEach(key => {
        const [aIdStr, bIdStr] = key.split('_');
        const aId = parseInt(aIdStr, 10);
        const bId = parseInt(bIdStr, 10);
        if (aId !== myId && bId !== myId) return;
        const oppId = aId === myId ? bId : aId;
        const matches = engine.rivalryHistory![key] || [];
        if (matches.length === 0) return;
        rivals.push({
            oppTeamId: oppId,
            matchCount: matches.length,
            level: matches.length >= 10 ? 'consolidated'
                : matches.length >= 6 ? 'classic'
                : matches.length >= DERBY_THRESHOLD_MATCHES ? 'growing'
                : 'starting',
        });
    });
    return rivals.sort((a, b) => b.matchCount - a.matchCount);
}

/**
 * Verifica se um teamId específico está em rivalidade ativa.
 */
export function isOpponentRival(engine: Engine, oppTeamId: number): DerbyCheck {
    const rivals = getActiveRivals(engine);
    const found = rivals.find(r => r.oppTeamId === oppTeamId);
    if (!found) return { isDerby: false, level: 'none', matchCount: 0 };
    return { isDerby: found.matchCount >= DERBY_THRESHOLD_MATCHES, level: found.level, matchCount: found.matchCount };
}

/**
 * Tenta achar o próximo derby do calendário (próximas N semanas).
 */
export function findNextDerby(engine: Engine, lookAheadWeeks: number = 6): NextDerby | null {
    if (!engine || !Array.isArray(engine.tournaments)) return null;
    const myId = engine.manager?.teamId;
    if (!myId) return null;
    const startWeek = engine.currentWeek || 1;

    for (let w = startWeek; w < startWeek + lookAheadWeeks; w++) {
        for (const t of engine.tournaments) {
            const fixtures = t.fixtures?.[w] || t.fixtures?.[String(w)];
            if (!Array.isArray(fixtures)) continue;
            for (const m of fixtures) {
                const oppId = m.home === myId ? m.away : (m.away === myId ? m.home : null);
                if (oppId === null) continue;
                const check = isOpponentRival(engine, oppId);
                if (check.isDerby) {
                    return {
                        week: w,
                        oppTeamId: oppId,
                        level: check.level,
                        matchCount: check.matchCount,
                    };
                }
            }
        }
    }
    return null;
}

export { DERBY_THRESHOLD_MATCHES };
