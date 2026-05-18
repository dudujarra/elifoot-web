import { EngineLogger } from '../../../engine/EngineLogger.js';

const VIEW_ROTATION = [
    'dashboard', 'squad', 'market', 'standings', 'pressView',
    'matchView', 'rivalries', 'chronicle', 'achievements', 'monitor',
    'tutorial', 'saveSlots', 'styleguide', 'cosmeticShop', 'start', 'autoplay'
];

export class ViewVisitsNode {
    execute(parent, _engine, _teamId, _stateKey, _ctx) {
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
