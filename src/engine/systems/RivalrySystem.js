// SPEC-017: Rivals & Derby System
// 4 tipos rivalidade. Intensidade boost, red card chance, rivalry points.

export const RIVALRY_TYPES = {
    'Clássico': { intensity: 1.4, emotion: 1.5, redCard: 1.6, points: 10 },
    'Derby regional': { intensity: 1.3, emotion: 1.4, redCard: 1.5, points: 5 },
    'Histórico rival': { intensity: 1.2, emotion: 1.3, redCard: 1.4, points: 3 },
    'Novo rival': { intensity: 1.1, emotion: 1.2, redCard: 1.2, points: 1 },
};

let nextRivalryId = 1;

function pairKey(a, b) {
    return [a, b].sort((x, y) => x - y).join('-');
}

export class RivalrySystem {
    constructor() {
        this.rivalries = new Map(); // pairKey → rivalry
    }

    addRival(teamA, teamB, type, startWeek = 1) {
        if (teamA === teamB) return null;
        if (!RIVALRY_TYPES[type]) return null;
        const key = pairKey(teamA, teamB);
        if (this.rivalries.has(key)) return this.rivalries.get(key);

        const rivalry = {
            rivalryId: `rival_${nextRivalryId++}`,
            teamA: Math.min(teamA, teamB),
            teamB: Math.max(teamA, teamB),
            type,
            pointsA: 0,
            pointsB: 0,
            headToHeadA: 0,
            headToHeadB: 0,
            draws: 0,
            totalMatches: 0,
            startWeek,
            lastMatch: null,
        };
        this.rivalries.set(key, rivalry);
        return rivalry;
    }

    processMatch({ homeTeamId, awayTeamId, result, weekOfYear, scoreline }) {
        const key = pairKey(homeTeamId, awayTeamId);
        const rivalry = this.rivalries.get(key);
        if (!rivalry) return null;

        const points = RIVALRY_TYPES[rivalry.type].points;
        const isHomeA = rivalry.teamA === homeTeamId;

        if (result === 'win') {
            if (isHomeA) {
                rivalry.pointsA += points;
                rivalry.headToHeadA++;
            } else {
                rivalry.pointsB += points;
                rivalry.headToHeadB++;
            }
        } else if (result === 'loss') {
            if (isHomeA) {
                rivalry.pointsB += points;
                rivalry.headToHeadB++;
            } else {
                rivalry.pointsA += points;
                rivalry.headToHeadA++;
            }
        } else {
            rivalry.draws++;
        }

        rivalry.totalMatches++;
        rivalry.lastMatch = { week: weekOfYear, result, scoreline };
        return rivalry;
    }

    getMatchModifiers(homeTeamId, awayTeamId) {
        const key = pairKey(homeTeamId, awayTeamId);
        const rivalry = this.rivalries.get(key);
        if (!rivalry) return { intensity: 1.0, emotion: 1.0, redCard: 1.0 };
        return RIVALRY_TYPES[rivalry.type];
    }

    getRivalryHistory(teamA, teamB) {
        const key = pairKey(teamA, teamB);
        return this.rivalries.get(key) || null;
    }

    isRival(teamA, teamB) {
        return this.rivalries.has(pairKey(teamA, teamB));
    }
}
