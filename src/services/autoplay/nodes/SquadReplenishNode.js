import { EngineLogger } from '../../../engine/EngineLogger.js';

export class SquadReplenishNode {
    execute(parent, engine, teamId, _stateKey, _ctx) {
        try {
            const team = engine.getTeam(teamId);
            if (team?.squad && typeof engine.triggerYouthIntake === 'function') {
                const squadSize = team.squad.length;
                let triggered = false;
                
                if (squadSize < 16) {
                    engine.triggerYouthIntake();
                    engine.triggerYouthIntake();
                    triggered = true;
                } else if (squadSize < 20 && parent.stats.weeksPlayed % 3 === 0) {
                    engine.triggerYouthIntake();
                    triggered = true;
                }
                
                if (triggered) {
                    parent._logDecision('SQUAD_REPLENISH', {
                        squadBefore: squadSize,
                        squadAfter: team.squad.length,
                        emergency: squadSize < 16
                    }, 0);
                }
            }
        } catch (err) { EngineLogger.capture(err, 'SquadReplenishNode.execute', { week: parent.stats.weeksPlayed }); }
    }
}
