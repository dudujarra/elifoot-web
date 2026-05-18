import { saveAllBrains } from '../learning/BrainPersistence.js';
import { EngineLogger } from '../../engine/EngineLogger.js';
import { rng as systemRng } from '../../engine/rng.js';

function processMemoryCapping(engine) {
    engine.transferOffers = [];
    engine._ambitionTransferRequests = [];
    if (engine.seasonHistory && engine.seasonHistory.length > 50) {
      engine.seasonHistory = engine.seasonHistory.slice(-50);
    }
    if (engine.chronicles && engine.chronicles.length > 50) {
      engine.chronicles = engine.chronicles.slice(-50);
    }
    if (engine.manager?.careerHistory && engine.manager.careerHistory.length > 50) {
      engine.manager.careerHistory = engine.manager.careerHistory.slice(-50);
    }
    if (engine.legacy?.titles && engine.legacy.titles.length > 200) {
      engine.legacy.titles = engine.legacy.titles.slice(-200);
    }
    if (engine.events && engine.events.length > 200) engine.events = engine.events.slice(-200);
    if (engine.decisions && engine.decisions.length > 200) engine.decisions = engine.decisions.slice(-200);
    if (engine.arcs && engine.arcs.length > 50) {
      const openArcs = engine.arcs.filter(a => a.status === 'open');
      const closedArcs = engine.arcs.filter(a => a.status !== 'open').slice(-50);
      engine.arcs = [...openArcs, ...closedArcs];
    }
    if (engine.rivalryHistory) {
      for (const key in engine.rivalryHistory) {
        const history = engine.rivalryHistory[key];
        if (history && history.length > 0) {
          const lastMatch = history[history.length - 1];
          if (engine.seasonNumber - (lastMatch.season || 0) > 2) {
            delete engine.rivalryHistory[key];
          } else if (history.length > 20) {
            engine.rivalryHistory[key] = history.slice(-20);
          }
        } else {
          delete engine.rivalryHistory[key];
        }
      }
    }
    engine.viewUnlockState.seasonsCompleted = engine.seasonNumber - 1;
    if (engine.managerStats) {
      const persistent = {
        tacticStreak: engine.managerStats.tacticStreak || 0,
        lastTactic: engine.managerStats.lastTactic || null,
        transferProfit: engine.managerStats.transferProfit || 0,
        giantKills: engine.managerStats.giantKills || 0,
        crisisSaves: engine.managerStats.crisisSaves || 0,
        longestUnbeaten: engine.managerStats.longestUnbeaten || 0,
        consecutiveTitles: engine.managerStats.consecutiveTitles || 0
      };
      engine.managerStats = {
        wins: 0, draws: 0, losses: 0, streak: 0, lossStreak: 0,
        rollingForm: [], goalsFor: 0, goalsAgainst: 0, cleanSheets: 0,
        ...persistent
      };
    }
}

function processEmergencyReplenish(engine) {
    try {
      engine.teams.forEach(team => {
        if (team.squad.length < 16 && team.id !== engine.manager?.teamId) {
          engine.weekEvents.push(`🚨 Plantel do ${team.name} caiu para ${team.squad.length} jogadores. Reposição de emergência ativada.`);
          while (team.squad.length < 16) {
            const pos = ['GOL', 'DEF', 'MEI', 'ATA'][Math.floor(systemRng() * 4)];
            const ovr = Math.floor(team.division === 1 ? 50 : 35);
            team.squad.push({
              id: `emerg-${team.id}-s${engine.seasonNumber}-${Math.floor(systemRng() * 0xFFFFFF).toString(16)}`,
              name: `Base ${Math.floor(systemRng() * 100)}`,
              age: 16 + Math.floor(systemRng() * 3),
              position: pos,
              ovr,
              potential: Math.floor(60 + systemRng() * 20),
              salary: Math.floor(team.division === 1 ? 8000 : 2000),
              contract: { weeksLeft: 76, salary: Math.floor(team.division === 1 ? 8000 : 2000) },
              isTitular: false, energy: 100, moral: 50, seasonGoals: 0, seasonApps: 0,
              career: { totalGoals: 0, totalApps: 0, seasons: [] },
              form: { last5: [6, 6, 6, 6, 6] },
              attributes: {
                technical: { crossing: 5, dribbling: 5, finishing: 5, firstTouch: 5, freeKick: 5, heading: 5, longShots: 5, longThrows: 5, marking: 5, passing: 5, penaltyTaking: 5, tackling: 5, technique: 5 },
                mental: { aggression: 5, anticipation: 5, bravery: 5, composure: 5, concentration: 5, decisions: 5, determination: 5, flair: 5, leadership: 5, offTheBall: 5, positioning: 5, teamwork: 5, vision: 5, workRate: 5 },
                physical: { acceleration: 5, agility: 5, balance: 5, jumpingReach: 5, naturalFitness: 10, pace: 5, stamina: 10, strength: 5 },
                goalkeeping: { aerialReach: pos === 'GOL' ? 10 : 1, commandOfArea: pos === 'GOL' ? 10 : 1, communication: 1, eccentricity: 1, handling: pos === 'GOL' ? 10 : 1, kicking: 1, oneOnOnes: pos === 'GOL' ? 10 : 1, reflexes: pos === 'GOL' ? 10 : 1, rushingOut: 1, punching: 1, throwing: 1 }
              },
              traits: []
            });
          }
        }
      });
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.emergencyReplenish', { season: engine.seasonNumber });
    }
}

function processLeagueReInit(engine) {
    const finalDiv1Standings = {};
    try {
      const zones = [...new Set(engine.teams.map(t => t.zone))];
      zones.forEach(z => {
        const st = engine.getStandings(z, 1);
        if (st.length > 0) finalDiv1Standings[z] = st.map(s => s.teamId);
      });
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.finalStandings', { season: engine.seasonNumber });
    }

    let copaBrWinnerId = null;
    try {
      const copa = engine.getTournament('COPA_BR');
      if (copa?.winner) copaBrWinnerId = copa.winner;
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.copaBrWinner', { season: engine.seasonNumber });
    }

    engine.tournaments.forEach(t => {
      try {
        if (typeof t.init === 'function') {
          let teamIds;
          if (t.id && /_\d+$/.test(t.id)) {
            const lastUnder = t.id.lastIndexOf('_');
            const zone = t.id.substring(0, lastUnder);
            const div = parseInt(t.id.substring(lastUnder + 1), 10);
            if (zone && !isNaN(div) && div >= 1 && div <= 4) {
              teamIds = engine.teams.filter(tm => tm.zone === zone && tm.division === div).map(tm => tm.id);
            }
          }
          const SKIP_IDS = ['LIBERTADORES', 'SULA', 'CHAMPIONS', 'EUROPA', 'WORLD_CUP', 'COPA_BR', 'COPA_ARG', 'COPA_URU', 'COPA_CHI', 'COPA_COL', 'FA_CUP', 'COPA_REY', 'COPPA_ITA', 'DFB_POKAL', 'COUPE_FRA'];
          if (SKIP_IDS.includes(t.id)) return;
          if (!teamIds || teamIds.length === 0) {
            teamIds = (t.standings || []).map(s => s.teamId).filter(Boolean);
          }
          if (teamIds.length > 0) t.init(teamIds);
        }
      } catch (err) {
        EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.leagueReInit', { tournamentId: t.id });
      }
    });

    try {
      const saZones = ['BRA', 'ARG', 'URU', 'CHI', 'COL'];
      const libTeams = [];
      const sulaTeams = [];
      saZones.forEach(z => {
        const st = finalDiv1Standings[z] || [];
        if (z === 'BRA') {
          const top4 = st.slice(0, 4);
          if (copaBrWinnerId && !top4.includes(copaBrWinnerId)) {
            const displaced = top4[3];
            top4[3] = copaBrWinnerId;
            sulaTeams.push(displaced);
          }
          libTeams.push(...top4);
          sulaTeams.push(...st.slice(4, 8));
        } else {
          libTeams.push(...st.slice(0, 4));
          sulaTeams.push(...st.slice(4, 6));
        }
      });
      const lib = engine.getTournament('LIBERTADORES');
      if (lib && libTeams.length >= 4) lib.init(libTeams);
      const sula = engine.getTournament('SULA');
      if (sula && sulaTeams.length >= 4) sula.init(sulaTeams);
      const euZones = ['ENG', 'ESP', 'ITA', 'GER', 'FRA'];
      const clTeams = [];
      const elTeams = [];
      euZones.forEach(z => {
        const st = finalDiv1Standings[z] || [];
        clTeams.push(...st.slice(0, 4));
        elTeams.push(...st.slice(4, 6));
      });
      const cl = engine.getTournament('CHAMPIONS');
      if (cl && clTeams.length >= 4) cl.init(clTeams);

      const el = engine.getTournament('EUROPA');
      if (el && elTeams.length >= 4) el.init(elTeams);
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.continentalReQualify', { season: engine.seasonNumber });
    }

    try {
      const CUP_ZONE_MAP = {
        'COPA_BR': 'BRA', 'COPA_ARG': 'ARG', 'COPA_URU': 'URU', 'COPA_CHI': 'CHI', 'COPA_COL': 'COL',
        'FA_CUP': 'ENG', 'COPA_REY': 'ESP', 'COPPA_ITA': 'ITA', 'DFB_POKAL': 'GER', 'COUPE_FRA': 'FRA'
      };
      for (const [cupId, zone] of Object.entries(CUP_ZONE_MAP)) {
        const cup = engine.getTournament(cupId);
        if (!cup) continue;
        const zoneTeams = engine.teams.filter(t => t.zone === zone).map(t => t.id);
        if (zoneTeams.length >= 4) cup.init(zoneTeams);
      }
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.nationalCups', { season: engine.seasonNumber });
    }

    try {
      const mundial = engine.getTournament('WORLD_CUP');
      if (mundial && typeof mundial.qualify === 'function') {
        mundial.qualify(engine);
      }
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.worldCup', { season: engine.seasonNumber });
    }
}

export function handleSeasonRollover(engine, processor) {
    try {
      processor.process(engine);
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.process', { season: engine.seasonNumber });
    }

    try {
      saveAllBrains(engine.teams);
    } catch (err) {
      EngineLogger.capture(err, 'SeasonProcessor.rolloverSeason.saveAllBrains');
    }
    engine.currentWeek = 0;
    engine.seasonNumber++;

    processMemoryCapping(engine);
    processEmergencyReplenish(engine);
    processLeagueReInit(engine);
}
