import { getFormModifier } from '../engine/systems/FormSystem.js';
import { getTraitMatchModifier, getGoalConversionBonus, getSetPieceBonus } from '../engine/PlayerTraits.js';
import { rng as systemRng } from '../engine/rng.js';
import { EngineLogger } from '../engine/EngineLogger.js';
import { emitGameEvent, GameEvents } from '../audio/EventBus.js';
import { spatialEngine } from '../engine/SpatialEngine.js';
import { shouldTriggerMidMatch, getMidMatchCardDerbyAware } from '../engine/MidMatchManagerDeck.js';
import { calculateSaveChance } from './MatchGoalkeeperSystem.js';
import { applyMatchInjury } from './MatchInjurySystem.js';

// ============================================================
// TUNING CONSTANTS — Named for clarity and centralized balancing
// ============================================================
const MATCH_MINUTES = 90;
const MAX_COMBINED_GOALS = 8;
const FILLER_INTERVAL = 12;
const TACTICAL_XG_BASELINE = 0.3;
const POISSON_FALLBACK_SCALE = 0.4;
const MID_MATCH_CARD_PROB = 0.40;
const BASE_CARD_CHANCE = 0.015;
const AGGRESSIVE_CARD_CHANCE = 0.035;
const FAIRPLAY_CARD_CHANCE = 0.003;
const DEFENDER_CARD_MULT = 1.3;
const SURPRISE_EVENT_PROB = 0.005;
const VAR_PENALTY_CONV = 0.70;
const PITY_BONUS_PER_MISS = 0.10;
const PITY_BONUS_CAP = 0.50;
const BIG_MATCH_NEUTRAL = 15;
const BIG_MATCH_MOD_PER_POINT = 0.03;
const BIG_MATCH_WEEK_THRESHOLD = 34;
const PERF_GOAL = 3;
const PERF_ASSIST = 2;
const PERF_YELLOW = -1;
const PERF_OWN_GOAL = -3;
const PERF_RED_CARD = -4;
const PERF_INJURY = -2;
const AGGRESSIVE_STYLES = ['Caneleiro', 'Gladiador', 'Sanguíneo', 'Provocador', 'Raçudo', 'Catimbeiro', 'Cai-Cai'];
const FAIRPLAY_STYLES = ['Fairplay', 'Elegante', 'Maestro Frio', 'Discreto'];
const SURPRISE_OWN_GOAL_THRESH = 0.30;
const SURPRISE_VAR_THRESH = 0.55;
const SURPRISE_INJURY_THRESH = 0.80;

const pickRandom = (arr) => arr.length > 0 ? arr[Math.floor(systemRng() * arr.length)] : null;

export class MatchEventEngine {
    /**
     * Executes the main minute-by-minute match loop.
     */
    static simulateMinuteLoop(ctx) {
        let {
            startMin, endMin, engine, matchCtx,
            homeTeam, awayTeam, homeSectors, awaySectors,
            homeAttackers, awayAttackers, homeDefenders, awayDefenders,
            homeScorerPoolSetPiece, awayScorerPoolSetPiece,
            homeGoals, awayGoals, events,
            homeShots, awayShots, homeSaves, awaySaves,
            rawEvents, performanceMap,
            isManagerMatch, isManagerHome,
            homeChancePerMin, awayChancePerMin, isCup,
            tacticalEngine
        } = ctx;

        let homeMissStreak = 0;
        let awayMissStreak = 0;
        const midMatchTriggered = new Set();
        const isDerby = engine.matchCondition && engine.matchCondition.id === 'derby';
        const cond = engine.matchCondition || { ataModifier: 1, defModifier: 1, energyModifier: 1 };
        const seasonWeek = ((engine.currentWeek - 1) % 38) + 1;
        const isBigMatch = isDerby || isCup || seasonWeek >= BIG_MATCH_WEEK_THRESHOLD;

        for (let minute = startMin; minute <= endMin; minute++) {
            if (homeGoals + awayGoals >= MAX_COMBINED_GOALS) break;

            if (minute === 1) {
                try { emitGameEvent(GameEvents.MATCH_STARTED, { homeTeam: homeTeam.name, awayTeam: awayTeam.name }); } catch (err) { EngineLogger.capture(err, 'MatchSimulator.emitStart'); }
            }

            let isHomeChance = false;
            let isAwayChance = false;
            let tacticalBaseXG = TACTICAL_XG_BASELINE;

            const tacticalEvent = tacticalEngine.tickMinute(homeTeam.squad, awayTeam.squad);
            if (tacticalEvent && tacticalEvent.type === 'shot') {
                if (tacticalEvent.team === 'home') {
                    isHomeChance = true;
                    tacticalBaseXG = tacticalEvent.xG;
                } else {
                    isAwayChance = true;
                    tacticalBaseXG = tacticalEvent.xG;
                }
            } else {
                isHomeChance = systemRng() < (homeChancePerMin * POISSON_FALLBACK_SCALE);
                isAwayChance = !isHomeChance && systemRng() < (awayChancePerMin * POISSON_FALLBACK_SCALE);
            }

            if (minute % FILLER_INTERVAL === 0 && !isHomeChance && !isAwayChance) {
                const isHomeAttackingFiller = systemRng() > 0.5;
                const attTeamFiller = isHomeAttackingFiller ? homeTeam : awayTeam;
                const defTeamFiller = isHomeAttackingFiller ? awayTeam : homeTeam;
                if (isManagerMatch) {
                    rawEvents.push({
                        minute,
                        type: 'filler',
                        isHomeAttacking: isHomeAttackingFiller,
                        attTeam: attTeamFiller.name,
                        defTeam: defTeamFiller.name
                    });
                }
            }

            if (isManagerMatch && shouldTriggerMidMatch(minute, midMatchTriggered)) {
                if (systemRng() < MID_MATCH_CARD_PROB) {
                    const cardSeed = (engine.currentWeek || 0) * MATCH_MINUTES + minute;
                    const card = getMidMatchCardDerbyAware(minute, matchCtx.isDerby || false, cardSeed);
                    if (card) {
                        midMatchTriggered.add(minute);
                        rawEvents.push({
                            minute,
                            type: 'mid_match_card',
                            cardId: card.id,
                            text: card.text,
                            options: card.options,
                        });
                    }
                }
            }

            if (isHomeChance || isAwayChance) {
                const isHomeAttacking = isHomeChance;
                const atkSectors = isHomeAttacking ? homeSectors : awaySectors;
                const defSectors = isHomeAttacking ? awaySectors : homeSectors;
                const attTeam = isHomeAttacking ? homeTeam : awayTeam;
                const defTeam = isHomeAttacking ? awayTeam : homeTeam;
                const attackers = isHomeAttacking ? homeAttackers : awayAttackers;

                if (isHomeAttacking) homeShots++; else awayShots++;

                const isSetPieceMinute = (minute % 30 === 0 && minute > 0);
                const scorerPool = isSetPieceMinute
                    ? (isHomeAttacking ? homeScorerPoolSetPiece : awayScorerPoolSetPiece)
                    : attackers;
                const scorer = pickRandom(scorerPool);

                const formMod = scorer ? getFormModifier(scorer.form?.trend) : 1.0;
                const traitMod = scorer ? getTraitMatchModifier(scorer, minute, isManagerHome ? matchCtx.homeTactic : matchCtx.awayTactic, false) : 1.0;
                const poacherMod = getGoalConversionBonus(scorer);
                const setPieceMod = (isSetPieceMinute && scorer) ? getSetPieceBonus(scorer) : 1.0;

                const scorerTransientFatigue = spatialEngine.getTransientFatigueModifier(scorer, minute);
                const scorerCognitiveMod = spatialEngine.getCognitiveModifier(scorer, minute, isDerby);

                const pityBonus = isHomeAttacking
                    ? Math.min(PITY_BONUS_CAP, homeMissStreak * PITY_BONUS_PER_MISS)
                    : Math.min(PITY_BONUS_CAP, awayMissStreak * PITY_BONUS_PER_MISS);
                
                let bigMatchMod = 1.0;
                if (isBigMatch && scorer?.bigMatch != null) {
                    bigMatchMod = 1.0 + (scorer.bigMatch - BIG_MATCH_NEUTRAL) * BIG_MATCH_MOD_PER_POINT;
                }

                const finalScorerMod = formMod * traitMod * poacherMod * setPieceMod * scorerTransientFatigue * scorerCognitiveMod * bigMatchMod;
                const tacticalMod = (tacticalBaseXG / TACTICAL_XG_BASELINE);
                const shotPower = atkSectors.attack * cond.ataModifier * systemRng() * finalScorerMod * (1 + pityBonus) * tacticalMod;
                
                const { saveChance } = calculateSaveChance(defTeam, defSectors, minute, systemRng, spatialEngine, isDerby);

                const scorerName = scorer ? scorer.name : attTeam.name;
                const isGoal = shotPower > saveChance;
                let assistPlayer = null;

                if (isGoal) {
                    if (isHomeAttacking) {
                        homeGoals++;
                        events.home.push({ minute, type: 'goal', scorer: scorer?.name });
                    } else {
                        awayGoals++;
                        events.away.push({ minute, type: 'goal', scorer: scorer?.name });
                    }

                    const possibleAssists = [];
                    for (let i = 0; i < attackers.length; i++) {
                        if (attackers[i] !== scorer) possibleAssists.push(attackers[i]);
                    }
                    assistPlayer = pickRandom(possibleAssists);

                    events.scorers.push({ minute, name: scorerName, team: attTeam.name, assist: assistPlayer?.name });
                }

                if (isManagerMatch) {
                    const isSetPieceScorer = (scorer?.position === 'DEF' && scorer?.traits?.includes('set_piece_target'));
                    rawEvents.push({
                        minute,
                        type: 'chance',
                        isGoal,
                        isHomeAttacking,
                        attTeam: attTeam.name,
                        defTeam: defTeam.name,
                        scorerName,
                        scorerPosition: scorer?.position,
                        scorerOvr: scorer?.ovr || 50,
                        assistName: assistPlayer?.name,
                        isSetPiece: isSetPieceScorer,
                        homeGoals,
                        awayGoals
                    });
                }

                if (isGoal) {
                    try {
                        emitGameEvent(GameEvents.GOAL_SCORED, {
                            minute, scorer: scorerName, team: attTeam.name,
                            byPlayer: isManagerHome === isHomeAttacking,
                            moment: minute > 75 ? 'late' : minute < 15 ? 'early' : 'normal'
                        });
                    } catch (err) { EngineLogger.capture(err, 'MatchSimulator.emitGoal'); }

                    if (scorer) {
                        performanceMap[scorer.id] = (performanceMap[scorer.id] || 0) + PERF_GOAL;
                        scorer._matchGoals = (scorer._matchGoals || 0) + 1;
                    }
                    if (isHomeAttacking) homeMissStreak = 0; else awayMissStreak = 0;
                    if (assistPlayer) {
                        performanceMap[assistPlayer.id] = (performanceMap[assistPlayer.id] || 0) + PERF_ASSIST;
                    }
                } else {
                    if (isHomeAttacking) { awaySaves++; homeMissStreak++; } else { homeSaves++; awayMissStreak++; }
                }
            }

            const foulTeam = systemRng() > 0.5 ? homeTeam : awayTeam;
            const foulCandidates = (foulTeam.squad || []).filter(p => p.isTitular && !p.injury);
            const offender = pickRandom(foulCandidates);
            
            if (offender) {
                let cardChance = BASE_CARD_CHANCE;
                const pStyle = offender.playstyle || '';
                
                if (AGGRESSIVE_STYLES.includes(pStyle)) {
                    cardChance = AGGRESSIVE_CARD_CHANCE;
                } else if (FAIRPLAY_STYLES.includes(pStyle)) {
                    cardChance = FAIRPLAY_CARD_CHANCE;
                }

                if (offender.position === 'DEF') cardChance *= DEFENDER_CARD_MULT;

                if (systemRng() < cardChance) {
                    events.cards.push({ minute, player: offender.name, team: foulTeam.name, type: 'yellow' });
                    if (isManagerMatch) rawEvents.push({ minute, type: 'card', player: offender.name, team: foulTeam.name, pStyle });
                    performanceMap[offender.id] = (performanceMap[offender.id] || 0) + PERF_YELLOW;
                }
            }

            if (systemRng() < SURPRISE_EVENT_PROB && homeGoals + awayGoals < MAX_COMBINED_GOALS) {
                const eventRoll = systemRng();

                if (eventRoll < SURPRISE_OWN_GOAL_THRESH) {
                    const unluckyTeam = systemRng() > 0.5 ? homeTeam : awayTeam;
                    const unluckyDef = pickRandom(unluckyTeam === homeTeam ? homeDefenders : awayDefenders);
                    const name = unluckyDef?.name || unluckyTeam.name;
                    if (unluckyTeam === homeTeam) { awayGoals++; } else { homeGoals++; }
                    if (isManagerMatch) rawEvents.push({ minute, type: 'own_goal', unluckyDefName: name, unluckyTeamName: unluckyTeam.name, homeGoals, awayGoals });
                    if (unluckyDef) performanceMap[unluckyDef.id] = (performanceMap[unluckyDef.id] || 0) + PERF_OWN_GOAL;

                } else if (eventRoll < SURPRISE_VAR_THRESH) {
                    const side = systemRng() > 0.5 ? 'home' : 'away';
                    const varDecisions = ['gol anulado por impedimento', 'pênalti marcado após revisão', 'cartão vermelho direto após revisão'];
                    const decision = varDecisions[Math.floor(systemRng() * varDecisions.length)];
                    const affectedTeam = side === 'home' ? homeTeam : awayTeam;
                    let isVarGoal = false;
                    if (decision.includes('pênalti') && systemRng() < VAR_PENALTY_CONV) {
                        isVarGoal = true;
                        if (side === 'home') { homeGoals++; } else { awayGoals++; }
                    }
                    if (isManagerMatch) rawEvents.push({ minute, type: 'var', decision, affectedTeamName: affectedTeam.name, isGoal: isVarGoal, homeGoals, awayGoals });

                } else if (eventRoll < SURPRISE_INJURY_THRESH) {
                    const injTeam = systemRng() > 0.5 ? homeTeam : awayTeam;
                    applyMatchInjury(injTeam, systemRng, minute, isManagerMatch, rawEvents, performanceMap, PERF_INJURY);

                } else {
                    const redTeam = systemRng() > 0.5 ? homeTeam : awayTeam;
                    const redCandidates = (redTeam.squad || []).filter(p => p.isTitular && !p.injury);
                    let expelled = pickRandom(redCandidates);
                    
                    for (let i=0; i<2; i++) {
                        if (expelled && FAIRPLAY_STYLES.includes(expelled.playstyle)) {
                            expelled = pickRandom(redCandidates);
                        } else {
                            break;
                        }
                    }

                    if (expelled) {
                        events.cards.push({ minute, player: expelled.name, team: redTeam.name, type: 'red' });
                        if (isManagerMatch) rawEvents.push({ minute, type: 'red_card', expelledName: expelled.name, pStyle: expelled.playstyle, redTeamName: redTeam.name });
                        performanceMap[expelled.id] = (performanceMap[expelled.id] || 0) + PERF_RED_CARD;
                    }
                }
            }
        }

        return {
            homeGoals, awayGoals,
            homeShots, awayShots, homeSaves, awaySaves
        };
    }
}
