import { FORMATION_COUNTERS } from '../engine/tactical/TacticCounters.js';
import { getDifficulty } from '../engine/systems/DifficultyModes.js';
import { getDefenseSectorBonus } from '../engine/PlayerTraits.js';

// ============================================================
// TUNING CONSTANTS — Named for clarity and centralized balancing
// ============================================================
const BASE_XG_HOME = 1.45;
const BASE_XG_AWAY = 1.15;
const AVG_SECTOR = 60;
const CONVERSION_RATE = 0.30;
const MATCH_MINUTES = 90;

export class MatchStatsEngine {
    /**
     * Calculates the Dixon-Coles expected goals and converts to chances per minute.
     */
    static calculateChancesPerMinute({
        homeTeam, awayTeam, homeSectors, awaySectors, 
        homeMoralFactor, awayMoralFactor, 
        homeCounterMod, awayCounterMod, 
        homeClimateMod, awayClimateMod,
        spatialData, opponentBoost,
        isManagerHome, isManagerAway
    }) {
        const homeAttackStr = homeSectors.attack / AVG_SECTOR;
        const awayDefenseStr = awaySectors.defense / AVG_SECTOR;

        const awayAttackStr = awaySectors.attack / AVG_SECTOR;
        const homeDefenseStr = homeSectors.defense / AVG_SECTOR;

        const homeRockwallMod = getDefenseSectorBonus(homeTeam.squad);
        const awayRockwallMod = getDefenseSectorBonus(awayTeam.squad);

        let lambda = BASE_XG_HOME * homeAttackStr * (awayDefenseStr * awayRockwallMod) * homeMoralFactor * homeCounterMod * homeClimateMod * spatialData.homeXgMod;
        let mu = BASE_XG_AWAY * awayAttackStr * (homeDefenseStr * homeRockwallMod) * awayMoralFactor * awayCounterMod * awayClimateMod * spatialData.awayXgMod;

        const homeFormation = homeTeam?.formation || '4-3-3';
        const awayFormation = awayTeam?.formation || '4-3-3';
        const formAmp = getDifficulty().modifiers.formationCounterAmplifier || 1.0;
        const rawHomeFormMod = FORMATION_COUNTERS[homeFormation]?.[awayFormation] || 1.0;
        const rawAwayFormMod = FORMATION_COUNTERS[awayFormation]?.[homeFormation] || 1.0;
        
        const homeFormationMod = 1.0 + (rawHomeFormMod - 1.0) * formAmp;
        const awayFormationMod = 1.0 + (rawAwayFormMod - 1.0) * formAmp;

        lambda *= homeFormationMod;
        mu *= awayFormationMod;

        if (isManagerHome) {
            mu *= opponentBoost;
        } else if (isManagerAway) {
            lambda *= opponentBoost;
        }

        if (isNaN(lambda) || !isFinite(lambda)) lambda = BASE_XG_HOME;
        if (isNaN(mu) || !isFinite(mu)) mu = BASE_XG_AWAY;
        lambda = Math.max(0.1, Math.min(lambda, 5.0));
        mu = Math.max(0.1, Math.min(mu, 5.0));

        const expectedHomeChances = lambda / CONVERSION_RATE;
        const expectedAwayChances = mu / CONVERSION_RATE;

        return {
            homeChancePerMin: expectedHomeChances / MATCH_MINUTES,
            awayChancePerMin: expectedAwayChances / MATCH_MINUTES
        };
    }
}
