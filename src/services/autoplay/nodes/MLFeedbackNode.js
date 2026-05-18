import { encodeState } from '../../learning/AdaptiveBrain.js';
import { computeTransferReward } from '../../learning/SmartMarketEngine.js';
import { EngineLogger } from '../../../engine/EngineLogger.js';

export class MLFeedbackNode {
    execute(parent, engine, teamId, stateKey, ctx) {
        try { parent.brain.emotions.setContext(ctx); } catch (err) { EngineLogger.capture(err, 'AutoPlayDecisions.setEmotionContext'); }
        parent._observeOutcome(ctx);

        if (parent.stats.weeksPlayed % 8 === 0 && parent._pendingTransferRewards?.length > 0) {
            const team = engine.getTeam(teamId);
            const standings = team ? (engine.getStandings(team.zone, team.division) || []) : [];
            const currentPos = team ? (standings.findIndex(s => s.teamId === team.id) + 1) || standings.length : 10;

            const matured = parent._pendingTransferRewards.filter(t => (engine.currentWeek || 0) - t.weekDone >= 6);
            for (const tx of matured) {
                const reward = computeTransferReward({
                    action: tx.type,
                    positionBefore: tx.positionBefore,
                    positionAfter: currentPos,
                    balanceBefore: tx.balanceBefore,
                    balanceAfter: team?.balance || 0,
                    playerBecameStarter: tx.type === 'BUY' && (tx.playerOvr || 0) >= 65,
                    playerWasStarter: tx.playerWasStarter || false,
                    offerRatio: tx.offerRatio || 1.0,
                    emotionalLossMod: parent.brain?.emotions?.getModifiers?.()?.lossMod || 1.0
                });
                if (tx.stateKey && tx.action) {
                    parent.brain.observe(tx.stateKey, tx.action, reward, encodeState(ctx), ['MKT_BUY_YES', 'MKT_BUY_NO', 'MKT_SELL_YES', 'MKT_SELL_NO']);
                    parent._logDecision('ML_TRANSFER_REWARD', {
                        type: tx.type, reward: reward.toFixed(1),
                        posChange: tx.positionBefore - currentPos, stateKey: tx.stateKey
                    }, 0);
                }
            }
            parent._pendingTransferRewards = parent._pendingTransferRewards.filter(t => (engine.currentWeek || 0) - t.weekDone < 6);
        }
    }
}
