import { TRAINING_TYPES } from '../../../engine/ManagerSystems.js';

const TRAINING_ROTATION = (TRAINING_TYPES || []).map(t => t.id).filter(Boolean);

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
