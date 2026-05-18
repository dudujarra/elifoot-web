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

export class EmergencyFinanceNode {
    execute(parent, engine, teamId, stateKey, ctx) {
        try {
            const team = engine.getTeam(teamId);
            if (!team) return;
            
            if ((team.balance || 0) < 0 && !engine.activeLoan) {
                const loanOpts = engine.getLoanOptions();
                if (loanOpts.available && loanOpts.options.length > 0) {
                    const mediumLoan = loanOpts.options[1] || loanOpts.options[0];
                    const result = engine.takeLoan(mediumLoan.amount);
                    if (result.success) {
                        parent._logDecision('TAKE_LOAN', { amount: mediumLoan.amount, weeklyPayment: mediumLoan.weeklyPayment, balance: team.balance }, 0);
                    }
                }
            }
            
            if ((team.balance || 0) < -5_000_000) {
                parent._emergencySell(team);
            }
        } catch (err) { EngineLogger.capture(err, 'EmergencyFinanceNode.execute', { week: parent.stats.weeksPlayed }); }
    }
}
