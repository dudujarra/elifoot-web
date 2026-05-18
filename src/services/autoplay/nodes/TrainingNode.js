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

export class TrainingNode {
    execute(parent, engine, teamId, stateKey, ctx) {
        if (parent.stats.weeksPlayed % 3 !== 0) return;
        const startTrain = performance.now();
        const trainingActions = TRAINING_ROTATION.map(id => `TRAIN_${id}`);
        const pickedActionKey = parent.brain.pickAction(stateKey, trainingActions, ctx);
        const trainingId = pickedActionKey ? pickedActionKey.replace(/^TRAIN_/, '') : TRAINING_ROTATION[parent._trainingIdx % TRAINING_ROTATION.length];
        
        parent._trainingIdx++;
        
        if (engine.doTraining && trainingId) {
            const result = engine.doTraining(trainingId);
            parent._logDecision('TRAIN', { trainingId, picked: !!pickedActionKey }, performance.now() - startTrain);
            if (!result || result.success === false) {
                parent._logAnomaly('TRAIN_FAIL', result?.msg || 'doTraining failed', { trainingId });
            }
            parent._lastStateKey = stateKey;
            parent._lastAction = `TRAIN_${trainingId}`;
            parent._lastBalanceForReward = ctx.balance;
            parent._lastPositionForReward = ctx.position;
            parent._lastDivisionForReward = engine.getTeam(teamId)?.division ?? null;
        }
    }
}
