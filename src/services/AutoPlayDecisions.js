/**
 * AutoPlayDecisions — Strategic decision-making loop
 * RFCT-020 Phase 3: Extracted from AutoPlayService
 * RFCT-021 Phase 4: Refactored into modular Action Nodes
 *
 * Owns the per-tick strategic logic by executing a pipeline of independent
 * action nodes.
 */

import { encodeState } from './learning/AdaptiveBrain.js';
import { MLFeedbackNode } from './autoplay/nodes/MLFeedbackNode.js';
import { TrainingNode } from './autoplay/nodes/TrainingNode.js';
import { TacticNode } from './autoplay/nodes/TacticNode.js';
import { FormationNode } from './autoplay/nodes/FormationNode.js';
import { InfrastructureNode } from './autoplay/nodes/InfrastructureNode.js';
import { JobProposalNode } from './autoplay/nodes/JobProposalNode.js';
import { ViewVisitsNode } from './autoplay/nodes/ViewVisitsNode.js';
import { SquadReplenishNode } from './autoplay/nodes/SquadReplenishNode.js';
import { EmergencyFinanceNode } from './autoplay/nodes/EmergencyFinanceNode.js';
import { TransferMarketNode } from './autoplay/nodes/TransferMarketNode.js';

export class AutoPlayDecisions {
    /**
     * @param {AutoPlayController} parent
     */
    constructor(parent) {
        this.parent = parent;
        
        // Define the execution pipeline of Action Nodes
        this.pipeline = [
            new MLFeedbackNode(),
            new TrainingNode(),
            new TacticNode(),
            new FormationNode(),
            new InfrastructureNode(),
            new JobProposalNode(),
            new ViewVisitsNode(),
            new SquadReplenishNode(),
            new EmergencyFinanceNode(),
            new TransferMarketNode()
        ];
    }

    makeDecisions() {
        const parent = this.parent;
        const engine = parent.engine;
        const teamId = engine?.manager?.teamId;
        if (!teamId) return;

        // SPEC-115/116/117: Build state + observe last outcome
        const ctx = parent._buildStateCtx();
        const stateKey = encodeState(ctx);

        // Execute Strategy Nodes sequentially
        for (const node of this.pipeline) {
            node.execute(parent, engine, teamId, stateKey, ctx);
        }
    }
}
