import { TRAINING_TYPES } from '../../../engine/ManagerSystems.js';
import { encodeState } from '../../learning/AdaptiveBrain.js';
import { detectMonotonyHeuristic } from '../../learning/LLMBridge.js';
import { smartSellDecision, rankCandidates, computeTransferReward } from '../../learning/SmartMarketEngine.js';
import { rng as systemRng } from '../../../engine/rng.js';
import { evaluate as evaluateCoachProposal, decide as decideCoachProposal } from '../../../engine/CoachProposalSystem.js';
import { PressService } from '../../PressService.js';
import { EngineLogger } from '../../../engine/EngineLogger.js';

const TRAINING_ROTATION = (TRAINING_TYPES || []).map(t => t.id).filter(Boolean);
const FORMATION_POOL = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];
const VIEW_ROTATION = [
    'dashboard', 'squad', 'market', 'standings', 'pressView',
    'matchView', 'rivalries', 'chronicle', 'achievements', 'monitor',
    'tutorial', 'saveSlots', 'styleguide', 'cosmeticShop', 'start', 'autoplay'
];

export class SquadReplenishNode {
    execute(parent, engine, teamId, stateKey, ctx) {
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
