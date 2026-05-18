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

export class ViewVisitsNode {
    execute(parent, engine, teamId, stateKey, ctx) {
        if (parent.stats.weeksPlayed % 4 !== 0) return;
        const view = VIEW_ROTATION[(parent.stats.weeksPlayed / 4) % VIEW_ROTATION.length];
        try {
            if (parent.telemetry?.history) {
                if (!parent.telemetry.history.viewVisits) parent.telemetry.history.viewVisits = {};
                parent.telemetry.history.viewVisits[view] = (parent.telemetry.history.viewVisits[view] || 0) + 1;
            }
            parent._logDecision('VISIT_VIEW', { view }, 0);
        } catch (err) { EngineLogger.capture(err, 'ViewVisitsNode.execute', { week: parent.stats.weeksPlayed }); }
    }
}
