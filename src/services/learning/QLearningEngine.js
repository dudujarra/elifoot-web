import { rng as systemRng } from '../../engine/rng.js';
import { checkIsTilted } from './Archetypes.js';

export const ALPHA = 0.1;       // learning rate
export const GAMMA = 0.9;       // discount factor
export const BASE_EPSILON = 0.15;    // base exploration rate
export const MAX_BUCKETS = 800; // bound table size

export const LAMBDA = 0.7;          // trace decay rate
export const TRACE_MIN = 0.01;      // prune traces below this threshold
export const MAX_TRACE_ENTRIES = 300; // bound trace table size
export const MAX_REPLAY_BUFFER = 200; // experience replay buffer size
export const REPLAY_REWARD_THRESHOLD = 3; // only replay impactful experiences
export const REWARD_CLIP = 30; // soft-clip reward magnitude (tanh scaling)
export const Q_VALUE_BOUND = 50; // hard cap on Q-value magnitude

export class QLearningEngine {
    constructor() {
        this.qTable = {};
        this.visitCount = {};
        this.traces = {};
        this.totalUpdates = 0;
        this.replayBuffer = [];
    }

    restore(parsed) {
        if (parsed.qTable) this.qTable = parsed.qTable;
        if (parsed.visitCount) this.visitCount = parsed.visitCount;
        if (typeof parsed.totalUpdates === 'number') this.totalUpdates = parsed.totalUpdates;
        if (Array.isArray(parsed.replayBuffer)) this.replayBuffer = parsed.replayBuffer;
        // Note: we intentionally don't restore traces between sessions
    }

    serialize() {
        return {
            qTable: this.qTable,
            visitCount: this.visitCount,
            totalUpdates: this.totalUpdates,
            replayBuffer: this.replayBuffer
        };
    }

    reset() {
        this.qTable = {};
        this.visitCount = {};
        this.traces = {};
        this.totalUpdates = 0;
        this.replayBuffer = [];
    }

    getQ(stateKey, actionKey) {
        return this.qTable[stateKey]?.[actionKey] ?? 0;
    }

    pickAction(stateKey, availableActions, goals, goalRelevance, personality, emo, lossStreak, aiDirectorMod = 1.0) {
        if (!Array.isArray(availableActions) || availableActions.length === 0) return null;

        // Emotional tactic override
        if (emo.tacticOverride) {
            const forced = availableActions.find(a => a.includes(emo.tacticOverride));
            if (forced) return forced;
        }

        const visits = this.visitCount[stateKey] || 0;
        const decayedEpsilon = BASE_EPSILON / (1 + visits * 0.1);
        const effectiveEpsilon = Math.min(0.95, Math.max(0.02, decayedEpsilon * emo.epsilonMod * (2.0 - aiDirectorMod)));

        // TILT MECHANIC
        if (checkIsTilted(personality, lossStreak)) {
            if (systemRng() < 0.5) {
                return availableActions[Math.floor(systemRng() * availableActions.length)];
            }
        }

        // Cold start or exploration
        if (visits < 3 || systemRng() < effectiveEpsilon) {
            return availableActions[Math.floor(systemRng() * availableActions.length)];
        }

        let bestAction = availableActions[0];
        let bestScore = -Infinity;
        for (const action of availableActions) {
            const q = this.getQ(stateKey, action);
            const goalBoost = goals.reduce((sum, g) => sum + g.weight * goalRelevance.getRelevance(action, g.goal), 0);
            
            let personalityBoost = 0;
            if (personality) {
                if (action.startsWith('FORM_')) {
                    const formStr = action.replace('FORM_', '');
                    if (personality.preferredFormations?.includes(formStr)) {
                        personalityBoost += 0.8;
                    }
                } else if (action.startsWith('TACTIC_')) {
                    const tacStr = action.replace('TACTIC_', '');
                    if (personality.tacticalBias === tacStr) {
                        personalityBoost += 0.8;
                    }
                }
            }

            const score = q + goalBoost + personalityBoost;
            if (score > bestScore) {
                bestScore = score;
                bestAction = action;
            }
        }
        return bestAction;
    }

    observe(stateKey, actionKey, reward, nextStateKey, nextActions) {
        if (!this.qTable[stateKey]) this.qTable[stateKey] = {};
        const oldQ = this.qTable[stateKey][actionKey] || 0;

        const clippedReward = REWARD_CLIP * Math.tanh(reward / REWARD_CLIP);

        let maxNextQ = 0;
        if (nextStateKey && nextActions && nextActions.length > 0) {
            maxNextQ = Math.max(...nextActions.map(a => this.getQ(nextStateKey, a)));
        }

        const delta = clippedReward + GAMMA * maxNextQ - oldQ;

        if (!this.traces[stateKey]) this.traces[stateKey] = {};
        this.traces[stateKey][actionKey] = 1.0;

        const traceStates = Object.keys(this.traces);
        for (let i = traceStates.length - 1; i >= 0; i--) {
            const ts = traceStates[i];
            const actions = this.traces[ts];
            const actionKeys = Object.keys(actions);
            for (let j = actionKeys.length - 1; j >= 0; j--) {
                const ta = actionKeys[j];
                const trace = actions[ta];

                const effectiveAlpha = Math.max(0.01, ALPHA / (1 + this.totalUpdates * 0.0001));
                if (!this.qTable[ts]) this.qTable[ts] = {};
                const newQ = (this.qTable[ts][ta] || 0) + effectiveAlpha * delta * trace;
                this.qTable[ts][ta] = Math.max(-Q_VALUE_BOUND, Math.min(Q_VALUE_BOUND, newQ));

                const decayed = trace * GAMMA * LAMBDA;
                if (decayed < TRACE_MIN) {
                    delete actions[ta];
                } else {
                    actions[ta] = decayed;
                }
            }
            if (Object.keys(actions).length === 0) {
                delete this.traces[ts];
            }
        }

        this._pruneTraces();

        this.visitCount[stateKey] = (this.visitCount[stateKey] || 0) + 1;
        this.totalUpdates++;

        if (Object.keys(this.qTable).length > MAX_BUCKETS) {
            let minKey = null;
            let minVisits = Infinity;
            for (const k in this.visitCount) {
                if (k === stateKey) continue;
                if (this.visitCount[k] < minVisits) {
                    minVisits = this.visitCount[k];
                    minKey = k;
                }
            }
            if (minKey) {
                delete this.qTable[minKey];
                delete this.visitCount[minKey];
                delete this.traces[minKey];
            }
        }

        if (this.totalUpdates % 200 === 0) {
            for (const k in this.visitCount) {
                if (!this.qTable[k]) delete this.visitCount[k];
            }
        }

        this.replayBuffer.push({ s: stateKey, a: actionKey, r: reward, s2: nextStateKey, na: nextActions });
        if (this.replayBuffer.length > MAX_REPLAY_BUFFER) {
            this.replayBuffer.shift();
        }
    }

    clearTraces() {
        this.traces = {};
    }

    replayExperiences() {
        const impactful = this.replayBuffer.filter(e => Math.abs(e.r) > REPLAY_REWARD_THRESHOLD);
        if (impactful.length === 0) return 0;

        let replayed = 0;
        for (const exp of impactful) {
            if (!exp.s || !exp.a) continue;

            const clippedR = REWARD_CLIP * Math.tanh(exp.r / REWARD_CLIP);
            const replayReward = clippedR * 0.5;
            if (!this.qTable[exp.s]) this.qTable[exp.s] = {};
            const oldQ = this.qTable[exp.s][exp.a] || 0;

            let maxNextQ = 0;
            if (exp.s2 && Array.isArray(exp.na) && exp.na.length > 0) {
                maxNextQ = Math.max(...exp.na.map(a => this.getQ(exp.s2, a)));
            }

            const delta = replayReward + GAMMA * maxNextQ - oldQ;
            const effectiveAlpha = Math.max(0.01, ALPHA / (1 + this.totalUpdates * 0.0001));

            const newQ = oldQ + effectiveAlpha * delta;
            this.qTable[exp.s][exp.a] = Math.max(-Q_VALUE_BOUND, Math.min(Q_VALUE_BOUND, newQ));
            replayed++;
        }

        return replayed;
    }

    _pruneTraces() {
        let count = 0;
        for (const s of Object.keys(this.traces)) {
            count += Object.keys(this.traces[s]).length;
        }
        if (count <= MAX_TRACE_ENTRIES) return;

        const entries = [];
        for (const s of Object.keys(this.traces)) {
            for (const a of Object.keys(this.traces[s])) {
                entries.push({ s, a, v: this.traces[s][a] });
            }
        }
        entries.sort((a, b) => a.v - b.v);

        const toRemove = Math.floor(entries.length / 2);
        for (let i = 0; i < toRemove; i++) {
            const { s, a } = entries[i];
            if (this.traces[s]) {
                delete this.traces[s][a];
                if (Object.keys(this.traces[s]).length === 0) delete this.traces[s];
            }
        }
    }
}
