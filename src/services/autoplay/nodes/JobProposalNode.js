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

export class JobProposalNode {
    execute(parent, engine, teamId, stateKey, ctx) {
        if (parent.stats.weeksPlayed % 6 !== 0 || (engine.currentWeek || 0) < 10) return;

        try {
            const team = engine.getTeam(teamId);
            if (!team) return;

            const TIER_VALUE = { small: 1, mid: 2, big: 3 };
            const currentClubTier = team.division === 1 ? 'big' : team.division === 2 ? 'mid' : 'small';
            const form = (engine.managerStats?.rollingForm || []).slice(0, 4);

            const availableClubs = (engine.teams || [])
                .filter(t => t.id !== team.id)
                .map(t => ({
                    id: t.id,
                    name: t.name,
                    tier: t.division === 1 ? 'big' : t.division === 2 ? 'mid' : 'small'
                }));

            const proposal = evaluateCoachProposal({
                managerId: engine.manager?.teamId || 0,
                currentClubId: team.id,
                currentClubTier,
                currentContractWeeksLeft: engine.managerContract?.minWeeks || 20,
                managerReputation: engine.manager?.reputation || 10,
                recentForm: form,
                currentObjectiveMet: engine.lastContractResolution?.outcome === 'fulfilled',
                week: engine.currentWeek || 1,
                season: engine.seasonNumber || 1,
                availableClubs
            });

            if (!proposal.proposalAvailable || !proposal.proposal) return;

            const p = proposal.proposal;
            const fromTierValue = TIER_VALUE[p.fromClubTier] || 1;
            const currentTierValue = TIER_VALUE[currentClubTier] || 1;

            const upgradeRatio = fromTierValue / Math.max(currentTierValue, 1);
            const brainActions = ['JOB_ACCEPT', 'JOB_WAIT', 'JOB_REFUSE'];
            const pickedAction = parent.brain.pickAction(stateKey, brainActions, ctx);

            let decision = 'refuse';
            if (pickedAction === 'JOB_ACCEPT' || upgradeRatio >= 1.3) {
                decision = 'accept';
            } else if (pickedAction === 'JOB_WAIT') {
                decision = 'wait_contract_end';
            }

            parent._logDecision('JOB_PROPOSAL', {
                from: p.fromClubName,
                fromTier: p.fromClubTier,
                currentTier: currentClubTier,
                decision,
                upgradeRatio: upgradeRatio.toFixed(2),
                source: pickedAction ? 'brain' : 'heuristic',
                reason: p.reason
            }, 0);

            if (decision === 'accept') {
                engine.pendingCoachProposal = p;
                const pressService = parent._pressService || new PressService();
                const transferResult = pressService.respondCoachProposal(engine, true);

                if (transferResult.success) {
                    parent._logSuccess('JOB_ACCEPTED', `${transferResult.msg}. Saiu do ${team.name}.`);
                    const reward = upgradeRatio >= 1.5 ? 5 : 2;
                    parent.brain.observe(stateKey, 'JOB_ACCEPT', reward, stateKey, brainActions);
                    parent.brain.remember({
                        week: engine.currentWeek, season: engine.seasonNumber,
                        action: 'JOB_ACCEPT', result: 'moved',
                        details: `${team.name} → ${p.fromClubName}`
                    });
                } else {
                    parent._logDecision('JOB_ACCEPT_FAILED', { msg: transferResult.msg }, 0);
                    parent.brain.observe(stateKey, 'JOB_ACCEPT', -1, stateKey, brainActions);
                }
            } else {
                const result = decideCoachProposal({
                    decision,
                    exitFee: p.exitFee,
                    reputationBoost: p.reputationBoost,
                    currentContractWeeksLeft: engine.managerContract?.minWeeks || 20
                });
                engine.manager.reputation = Math.max(0, Math.min(100, (engine.manager.reputation || 10) + result.reputationDelta));
            }
        } catch (err) {
            EngineLogger.capture(err, 'JobProposalNode.execute', { week: parent.stats.weeksPlayed });
        }
    }
}
