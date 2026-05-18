import { MatchStatsEngine } from "./MatchStatsEngine.js";
import { MatchEventEngine } from "./MatchEventEngine.js";

/**
 * MatchSimulator — Extracted from engine.playMatch (AKITA-RFCT-004)
 *
 * Status: ACTIVE (PR-0.4 — Extract Class refactor)
 *
 * Responsabilidade: simular 90 minutos de partida + cards + MOTM + energy drain.
 *
 * Invariante RFCT-004:
 * - Mesma assinatura comportamental que engine.playMatch antes do refactor
 * - Mesma ordem de chamadas RNG (systemRng)
 * - Golden master snapshot deve ser idêntico
 *
 * Não muta engine além do que playMatch original mutava:
 * - team.squad[].energy (drain pós-match)
 * - team.squad[].moral (leader trait win bonus)
 * - team.squad[].career stats (recordMatchStats)
 * - engine.teamTalkModifiers (reset)
 */

import { MatchNarrator } from './MatchNarrator.js';
import { getAtmosphere } from '../engine/BrazilianAtmosphere.js';
import { getClubVoice } from '../engine/ClubVoiceSystem.js';

import { rng as systemRng } from '../engine/rng.js';
import { processMatchCards } from '../engine/DisciplineSystem.js';
import { spatialEngine } from '../engine/SpatialEngine.js';
import { DeepTacticalEngine } from '../engine/tactical/DeepTacticalEngine.js';
import { MatchEffectsPipeline } from '../engine/systems/MatchEffectsPipeline.js';
import { resolveMOTM, applyEnergyDrain, recordCareerStats, applyLeaderBoost, settleBicho, feedNpcResults, emitMatchEnd } from './MatchPostMatch.js';
import { resolvePenalties } from './MatchGoalkeeperSystem.js';

// ============================================================
// TUNING CONSTANTS — Named for clarity and centralized balancing
// ============================================================
/** @constant {number} Dixon-Coles base expected goals for home team */
/** @constant {number} Dixon-Coles base expected goals for away team */
/** @constant {number} Baseline sector strength for normalization */
/** @constant {number} Assumed average conversion rate (shots → goals) */
/** @constant {number} Minutes in a standard match */
/** @constant {number} Maximum combined goals per match (realism cap) */
/** @constant {number} Filler narration interval in minutes */
/** @constant {number} Fallback tactical xG baseline (30%) */
/** @constant {number} Poisson fallback scale when tactical engine stalls */
/** @constant {number} Mid-match card trigger probability per eligible minute */
/** @constant {number} Base card/foul chance per minute */
/** @constant {number} Elevated card chance for aggressive playstyles */
/** @constant {number} Reduced card chance for fair-play playstyles */
/** @constant {number} Defender card multiplier (tactical fouls) */
/** @constant {number} Surprise event probability per minute (~0.5%) */
/** @constant {number} VAR penalty conversion rate */
/** @constant {number} Base moral factor offset */
/** @constant {number} Moral factor divisor (max moral=100 → factor=1.2) */
/** @constant {number} PRD pity bonus per consecutive miss */
/** @constant {number} PRD pity bonus cap */
/** @constant {number} Big match attribute baseline (neutral) */
/** @constant {number} Big match conversion modifier per point */
/** @constant {number} Season week threshold for "big match" consideration */
/** @constant {number} Performance score for a goal */
/** @constant {number} Performance score for an assist */
/** @constant {number} Performance penalty for a yellow card */
/** @constant {number} Performance penalty for an own goal */
/** @constant {number} Performance penalty for a red card */
/** @constant {number} Performance penalty for mid-match injury */
/** @constant {string[]} Aggressive playstyles (elevated card risk) */
/** @constant {string[]} Fair-play playstyles (reduced card risk) */
/** @constant {number} Surprise event: own goal probability threshold */
/** @constant {number} Surprise event: VAR probability threshold */
/** @constant {number} Surprise event: injury probability threshold */


const MATCH_MINUTES = 90;
const MORAL_FACTOR_OFFSET = 0.8;
const MORAL_FACTOR_DIV = 250;

export class MatchSimulator {
    constructor() {
        this._tacticalEngine = new DeepTacticalEngine();
    }
    /**
     * Simula partida completa.
     *
     * @param {Engine} engine — referência para state global
     * @param {number} homeId — id team casa
     * @param {number} awayId — id team visitante
     * @param {boolean} isCup — se true, decide pênaltis em empate
     * @returns {{homeGoals, awayGoals, events}}
     */
    simulate(engine, homeId, awayId, isCup = false) {
        return this.simulateInterval(engine, homeId, awayId, 1, MATCH_MINUTES, null, isCup);
    }

    /**
     * Simula um intervalo de tempo da partida.
     * Útil para recálculo tático em tempo real.
     * @param {boolean} skipPostMatch - If true, skip energy drain, career stats, discipline, etc.
     *   Used for first-half simulation in split-sim mode.
     */
    simulateInterval(engine, homeId, awayId, startMin, endMin, baseResult = null, isCup = false, skipPostMatch = false) {
        const homeTeam = engine.getTeam(homeId);
        const awayTeam = engine.getTeam(awayId);

        const homeSectors = engine.getTeamSectors(homeId);
        const awaySectors = engine.getTeamSectors(awayId);

        this._tacticalEngine.initializeMatch(homeTeam, awayTeam);

        // Tactic setup and modifiers extraction via MatchEffectsPipeline
        const tacticData = {
            homeTactic: homeId === engine.manager.teamId ? engine.currentTactic : (homeTeam?.npcTacticState?.currentTactic || 'normal'),
            awayTactic: awayId === engine.manager.teamId ? engine.currentTactic : (awayTeam?.npcTacticState?.currentTactic || 'normal')
        };
        const { homeSectors: finalHomeSectors, awaySectors: finalAwaySectors, context: matchCtx } = MatchEffectsPipeline.applyEffects(engine, homeId, awayId, tacticData);
        
        homeSectors.attack = finalHomeSectors.attack;
        homeSectors.defense = finalHomeSectors.defense;
        awaySectors.attack = finalAwaySectors.attack;
        awaySectors.defense = finalAwaySectors.defense;

        const { tactic, oppTactic: _oppTactic, homeTactic, awayTactic, homeCounterMod, awayCounterMod, opponentBoost, homeClimateMod, awayClimateMod, weatherDrainMod, weatherEventText, isManagerMatch, predictabilityText, sideEffects } = matchCtx;

        // Apply pipeline side effects (mutations live HERE, not in the pipeline)
        if (sideEffects && engine.managerStats) {
            if (sideEffects.newTacticStreak !== null) engine.managerStats.tacticStreak = sideEffects.newTacticStreak;
            if (sideEffects.newLastTactic !== null) engine.managerStats.lastTactic = sideEffects.newLastTactic;
        }

        const isManagerHome = homeId === engine.manager.teamId;
        const isManagerAway = awayId === engine.manager.teamId;
        let homeGoals = baseResult ? baseResult.homeGoals : 0;
        let awayGoals = baseResult ? baseResult.awayGoals : 0;
        const events = baseResult ? JSON.parse(JSON.stringify(baseResult.events)) : { home: [], away: [], textLog: [], scorers: [], cards: [], motm: null };
        let homeShots = baseResult?.stats?.homeShots || 0;
        let awayShots = baseResult?.stats?.awayShots || 0;
        let homeSaves = baseResult?.stats?.homeSaves || 0;
        let awaySaves = baseResult?.stats?.awaySaves || 0;

        const homeAttackers = (homeTeam.squad || []).filter(p => p.isTitular && (p.position === 'ATA' || p.position === 'MEI') && !p.injury);
        const awayAttackers = (awayTeam.squad || []).filter(p => p.isTitular && (p.position === 'ATA' || p.position === 'MEI') && !p.injury);
        const homeDefenders = (homeTeam.squad || []).filter(p => p.isTitular && p.position === 'DEF' && !p.injury);
        const awayDefenders = (awayTeam.squad || []).filter(p => p.isTitular && p.position === 'DEF' && !p.injury);
        const homeScorerPoolSetPiece = homeAttackers.concat(homeDefenders);
        const awayScorerPoolSetPiece = awayAttackers.concat(awayDefenders);
        
        const homeMoral = (homeTeam.squad || []).reduce((s, p) => s + (p.moral || 50), 0) / (homeTeam.squad?.length || 1);
        const awayMoral = (awayTeam.squad || []).reduce((s, p) => s + (p.moral || 50), 0) / (awayTeam.squad?.length || 1);
        const homeMoralFactor = MORAL_FACTOR_OFFSET + (homeMoral / MORAL_FACTOR_DIV);
        const awayMoralFactor = MORAL_FACTOR_OFFSET + (awayMoral / MORAL_FACTOR_DIV);

        const cond = engine.matchCondition || { ataModifier: 1, defModifier: 1, energyModifier: 1 };
        const rawEvents = baseResult && baseResult.events._rawEvents ? [...baseResult.events._rawEvents] : [];

        if (isManagerMatch && startMin === 1) {
            rawEvents.push({ minute: 0, type: 'weather', weatherText: weatherEventText });
            if (predictabilityText) {
                rawEvents.push({ minute: 0, type: 'tactical_analysis', text: predictabilityText });
            }
            if (engine.matchCondition && engine.matchCondition.id !== 'normal') {
                rawEvents.push({ minute: 0, type: 'condition', name: engine.matchCondition.name });
            }
            rawEvents.push({ minute: 0, type: 'tactic', name: tactic.name });
            
            const atmoSeed = (engine.currentWeek || 0) + (homeId || 0);
            const preMatch = getAtmosphere('pre_match', atmoSeed);
            if (preMatch.flavorString) {
                rawEvents.push({ minute: 0, type: 'pre_match', text: preMatch.flavorString });
            }
            const clubEntry = getClubVoice(homeTeam?.name, 'stadium_entry', atmoSeed);
            if (clubEntry) {
                rawEvents.push({ minute: 0, type: 'club_entry', text: clubEntry });
            }
        }

        // Performance tracker for MOTM
        const performanceMap = {};

        // ==========================================
        // DEEP TACTICAL: SPATIAL ENGINE MODIFIERS
        // ==========================================
        const spatialData = spatialEngine.calculateSpatialMatchModifiers(homeTactic, homeTeam.squad, awayTactic, awayTeam.squad);
        if (isManagerMatch && spatialData.logs.length > 0) {
            spatialData.logs.forEach(logText => {
                rawEvents.push({ minute: 0, type: 'tactical_analysis', text: `🧠 Análise Espacial: ${logText}` });
            });
        }

        const { homeChancePerMin, awayChancePerMin } = MatchStatsEngine.calculateChancesPerMinute({
            homeTeam, awayTeam, homeSectors, awaySectors,
            homeMoralFactor, awayMoralFactor,
            homeCounterMod, awayCounterMod,
            homeClimateMod, awayClimateMod,
            spatialData, opponentBoost,
            isManagerHome, isManagerAway
        });

        // ==========================================
        // MATCH EVENT LOOP DELEGATION
        // ==========================================
        const eventResults = MatchEventEngine.simulateMinuteLoop({
            startMin, endMin, engine, homeId, awayId, matchCtx,
            homeTeam, awayTeam, homeSectors, awaySectors,
            homeAttackers, awayAttackers, homeDefenders, awayDefenders,
            homeScorerPoolSetPiece, awayScorerPoolSetPiece,
            homeGoals, awayGoals, events,
            homeShots, awayShots, homeSaves, awaySaves,
            rawEvents, performanceMap,
            isManagerMatch, isManagerHome, isManagerAway,
            homeChancePerMin, awayChancePerMin, isCup,
            tacticalEngine: this._tacticalEngine
        });

        homeGoals = eventResults.homeGoals;
        awayGoals = eventResults.awayGoals;
        homeShots = eventResults.homeShots;
        awayShots = eventResults.awayShots;
        homeSaves = eventResults.homeSaves;
        awaySaves = eventResults.awaySaves;

        // Penalties
        if (isCup && homeGoals === awayGoals) {
            if (isManagerMatch) rawEvents.push({ minute: MATCH_MINUTES, type: 'penalties_tie' });

            const homeWins = resolvePenalties(homeTeam, awayTeam, homeAttackers, awayAttackers, systemRng, isManagerMatch, rawEvents);
            if (homeWins) {
                homeGoals++;
            } else {
                awayGoals++;
            }
        }

        // MOTM — Man of the Match (only at end of full match)
        if (!skipPostMatch) {
        events.motm = resolveMOTM(homeTeam, awayTeam, performanceMap, isManagerMatch, rawEvents);

        // Match stats
        events.stats = { homeShots, awayShots, homeSaves, awaySaves };

        } // end if (!skipPostMatch) — MOTM block

        // Energy drain + career + discipline + leader + bicho (only at end of full match)
        if (!skipPostMatch) {
        applyEnergyDrain(homeTeam, awayTeam, cond, weatherDrainMod);
        recordCareerStats(engine, events);

        // Elifoot Classic Feature: Discipline System (Suspensions for red/yellow cards)
        processMatchCards(events.cards, homeTeam);
        processMatchCards(events.cards, awayTeam);

        applyLeaderBoost(engine, homeId, awayId, homeGoals, awayGoals, isManagerMatch, rawEvents);
        settleBicho(engine, homeId, homeGoals, awayGoals, isManagerMatch, rawEvents);
        } // end if (!skipPostMatch) — energy, career, discipline, leader, bicho

        if (isManagerMatch) {
            events.textLog = MatchNarrator.translate(rawEvents, homeTeam, awayTeam, homeTactic, awayTactic);
            events._rawEvents = rawEvents; // SPEC-LIVE: preserve raw events for resimulation
        } else {
            events.textLog = []; // Stateless, zero GC pressure for Autoplay
        }

        // Match stats (always compute)
        if (!events.stats) events.stats = { homeShots, awayShots, homeSaves, awaySaves };

        // === POST-MATCH EFFECTS (only at end of full match) ===
        if (!skipPostMatch) {
            // Reset team talk modifiers after match
            engine.teamTalkModifiers = { ata: 1.0, def: 1.0 };

            // SPEC-131: NPC tactic state + MARL emotional engine
            feedNpcResults(engine, homeTeam, awayTeam, homeId, awayId, homeGoals, awayGoals);

            // §9: Emit match end for procedural audio
            emitMatchEnd(isManagerHome, isManagerAway, homeGoals, awayGoals);
        } // end if (!skipPostMatch)

        return { homeGoals, awayGoals, events, stats: { homeShots, awayShots, homeSaves, awaySaves } };
    }
}
