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
