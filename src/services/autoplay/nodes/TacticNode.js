import { detectMonotonyHeuristic } from '../../learning/LLMBridge.js';
import { rng as systemRng } from '../../../engine/rng.js';
import { EngineLogger } from '../../../engine/EngineLogger.js';

export class TacticNode {
    execute(parent, engine, teamId, stateKey, ctx) {
        const tacticActions = ['TACTIC_normal', 'TACTIC_offensive', 'TACTIC_defensive', 'TACTIC_counter'];
        const pickedTacticKey = parent.brain.pickAction(stateKey, tacticActions, ctx);
        let nextTactic = 'normal';
        
        if (pickedTacticKey) {
            nextTactic = pickedTacticKey.replace(/^TACTIC_/, '');
        } else {
            const streak = engine.managerStats?.streak || 0;
            if (streak >= 3) nextTactic = 'offensive';
            else if (streak <= -2) nextTactic = 'defensive';
            else if (streak <= 0) nextTactic = 'counter';
        }

        if (engine.setTactic) {
            const tacticStreak = engine.managerStats?.streak || 0;
            if (parent._consecutiveSameTactic > 8 && tacticStreak < 5) {
                const allTactics = ['normal', 'offensive', 'defensive', 'pressing', 'counter', 'possession'];
                const others = allTactics.filter(t => t !== nextTactic);
                nextTactic = others[Math.floor(systemRng() * others.length)];
                parent._consecutiveSameTactic = 0;
            }
            
            engine.setTactic(nextTactic);
            
            if (parent._lastTactic !== nextTactic) {
                parent._logDecision('TACTIC_CHANGE', {
                    from: parent._lastTactic || 'none',
                    to: nextTactic,
                    source: pickedTacticKey ? 'brain' : 'heuristic'
                }, 0);
                parent._consecutiveSameTactic = 0;
            } else {
                parent._consecutiveSameTactic++;
            }
            parent._lastTactic = nextTactic;
        }
        
        this.checkMonotony(parent, engine, teamId, nextTactic);
    }

    checkMonotony(parent, engine, teamId, nextTactic) {
        if (parent.stats.weeksPlayed % 4 !== 0) return;
        try {
            const team = engine.getTeam(teamId);
            const standings = team ? engine.getStandings(team.zone, team.division) : [];
            const position = team ? (standings.findIndex(s => s.teamId === team.id) + 1) || standings.length : 10;
            const avgOVR = team?.squad?.length ? team.squad.reduce((s, p) => s + (p.ovr || 0), 0) / (team.squad.length || 1) : 60;
            const totalMatches = parent.stats.wins + parent.stats.draws + parent.stats.losses;
            const winRate = totalMatches > 0 ? parent.stats.wins / totalMatches : 0.33;

            if (!parent._positionHistory) parent._positionHistory = [];
            parent._positionHistory.push(position);
            if (parent._positionHistory.length > 12) parent._positionHistory.shift();
            const positionStreak = parent._positionHistory.filter(p => p === position).length;

            const monotony = detectMonotonyHeuristic({
                currentTactic: nextTactic,
                tacticStreak: parent._consecutiveSameTactic,
                position,
                positionStreak,
                streak: engine.managerStats?.streak || 0,
                avgOVR,
                balance: team?.balance || 0,
                squadSize: team?.squad?.length || 0,
                division: team?.division || 4,
                seasonNumber: engine.seasonNumber || 1,
                winRate
            });

            if (monotony.monotonous && monotony.topSuggestion) {
                const s = monotony.topSuggestion;
                if (s.action === 'CHANGE_TACTIC' && s.value && engine.setTactic) {
                    engine.setTactic(s.value);
                    parent._consecutiveSameTactic = 0;
                    parent._lastTactic = s.value;
                    parent._logDecision('TACTIC_OVERRIDE', { tactic: s.value, reason: s.reason }, 0);
                } else if (s.action === 'CHANGE_FORMATION' && engine.setFormation) {
                    const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '5-3-2', '4-2-3-1'];
                    const current = team?.formation || '4-3-3';
                    const alt = FORMATIONS.find(f => f !== current) || '4-4-2';
                    engine.setFormation(alt);
                    parent._logDecision('FORMATION', { form: alt, reason: s.reason }, 0);
                } else if (s.action === 'SCOUT' && engine.scoutLeague) {
                    parent._urgentScout = true;
                }
                
                monotony.signals.forEach(sig => {
                    if (sig.id === 'TACTIC_STUCK') parent._logAnomaly('TACTIC_STUCK', sig.msg, { tactic: nextTactic, streak: sig.streak ?? parent._consecutiveSameTactic });
                });
            }
        } catch (err) { EngineLogger.capture(err, 'AutoPlayDecisions.monotonyDetect', { week: parent.stats.weeksPlayed }); }
    }
}
