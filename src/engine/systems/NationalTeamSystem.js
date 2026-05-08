// SPEC-018: National Team System
// Convocação seleções, amistosos, qualificadores, copa intl. Stress + lesão risk.

export const NATIONAL_MATCH_TYPES = {
    Amistoso: { duration: 1, injuryMul: 1.1, prestigeWin: 1, monetaryPrize: 0 },
    Qualificador: { duration: 1, injuryMul: 1.15, prestigeWin: 2, monetaryPrize: 0 },
    Copa: { duration: 4, injuryMul: 1.2, prestigeWin: 5, monetaryPrize: 1000000 },
};

export const MAX_SQUAD_SIZE = 23;

export class NationalTeamSystem {
    constructor() {
        this.squads = new Map(); // countryId → array of playerId
        this.callups = new Map(); // playerId → callup
        this.qualifierPoints = new Map(); // countryId → points
    }

    callupPlayer({ playerId, playerCountry, countryId, matchType, dateWeek }) {
        if (playerCountry !== countryId) return null;
        if (!NATIONAL_MATCH_TYPES[matchType]) return null;

        let squad = this.squads.get(countryId) || [];
        if (squad.length >= MAX_SQUAD_SIZE && !squad.includes(playerId)) {
            return null;
        }
        if (!squad.includes(playerId)) {
            squad.push(playerId);
            this.squads.set(countryId, squad);
        }

        const callup = {
            playerId,
            countryId,
            matchType,
            dateWeek,
            status: 'called_up',
            stressDelta: 10,
        };
        this.callups.set(playerId, callup);
        return callup;
    }

    processNationalMatch({ countryId, result, weekOfYear, injuredPlayers = [], matchType = 'Amistoso' }) {
        const config = NATIONAL_MATCH_TYPES[matchType];

        // Qualifier afeta standings intl
        if (matchType === 'Qualificador') {
            const pts = this.qualifierPoints.get(countryId) || 0;
            if (result === 'win') this.qualifierPoints.set(countryId, pts + 3);
            else if (result === 'draw') this.qualifierPoints.set(countryId, pts + 1);
        }

        const injuries = injuredPlayers.map((pid) => ({
            playerId: pid,
            extraWeeks: 2, // +2 extra recovery
            type: 'national_duty',
        }));

        return {
            countryId,
            matchType,
            result,
            weekOfYear,
            injuries,
            prestigeImpact: result === 'win' ? config.prestigeWin : 0,
            monetaryPrize: result === 'win' ? config.monetaryPrize : 0,
        };
    }

    designateCaptain(countryId, players) {
        const squad = this.squads.get(countryId) || [];
        const inSquad = players.filter((p) => squad.includes(p.id));
        if (inSquad.length === 0) return null;
        const captain = inSquad.reduce((best, p) => (p.ovr > (best?.ovr ?? 0) ? p : best), null);
        return captain;
    }

    getSquad(countryId) {
        return this.squads.get(countryId) || [];
    }

    getQualifierPoints(countryId) {
        return this.qualifierPoints.get(countryId) || 0;
    }

    isOnDuty(playerId) {
        const c = this.callups.get(playerId);
        return c?.status === 'called_up';
    }

    releasePlayer(playerId) {
        const c = this.callups.get(playerId);
        if (c) c.status = 'released';
    }
}
