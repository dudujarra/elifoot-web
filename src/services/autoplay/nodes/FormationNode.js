import { rng as systemRng } from '../../../engine/rng.js';

const FORMATION_POOL = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];

export class FormationNode {
    execute(parent, engine, _teamId, _stateKey, _ctx) {
        if (parent.stats.weeksPlayed % 19 === 0 && engine.setFormation) {
            const form = FORMATION_POOL[Math.floor(systemRng() * FORMATION_POOL.length)];
            engine.setFormation(form);
            parent._logDecision('FORMATION', { form }, 0);
        }
    }
}
