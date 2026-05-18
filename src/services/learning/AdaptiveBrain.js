import { EngineLogger } from '../../engine/EngineLogger.js';
import { generatePersonality, generateRandomPersonality } from './Archetypes.js';
import { EmotionalEngine } from './EmotionalEngine.js';
import { LearnedGoalRelevance } from './LearnedGoalRelevance.js';
import { encodeState } from './StateEncoding.js';
import { detectGoals, actionRelevance } from './GoalDetection.js';
import { computeReward } from './RewardShaping.js';

import { EpisodicMemory } from './EpisodicMemory.js';
import { YoyoDetector } from './YoyoDetector.js';
import { QLearningEngine, REPLAY_REWARD_THRESHOLD, LAMBDA } from './QLearningEngine.js';

export { encodeState, detectGoals, actionRelevance, computeReward };

const STORAGE_KEY = 'olefut_autoplay_brain';

export class AdaptiveBrain {
    /**
     * @param {string|null} personalityId
     * @param {{ skipAutoRestore?: boolean }} [opts]
     */
    constructor(personalityId = null, opts = {}) {
        this._skipAutoRestore = !!opts.skipAutoRestore;
        this.lastSavedAt = 0;

        this.qEngine = new QLearningEngine();
        this.memoryEngine = new EpisodicMemory(30);
        this.yoyoDetector = new YoyoDetector();

        this.personality = personalityId
            ? generatePersonality(personalityId)
            : generateRandomPersonality();

        this.emotions = new EmotionalEngine(this.personality);
        this.goalRelevance = new LearnedGoalRelevance();

        this._restore();
    }

    // ─── GETTERS FOR EXTERNAL/ANALYTICS COMPATIBILITY ────────

    get qTable() { return this.qEngine.qTable; }
    get visitCount() { return this.qEngine.visitCount; }
    get traces() { return this.qEngine.traces; }
    get totalUpdates() { return this.qEngine.totalUpdates; }
    get replayBuffer() { return this.qEngine.replayBuffer; }
    get memory() { return this.memoryEngine.memory; }
    get memoryMax() { return this.memoryEngine.memoryMax; }
    get divisionHistory() { return this.yoyoDetector.history; }
    get _yoyoCount() { return this.yoyoDetector.count; }

    // ─── EMOTIONAL INTERFACE (Fase 2) ────────────────────────

    processMatchResult(result, streak, isRelegationRisk = false) {
        const event = result === 'W' ? 'WIN' : result === 'D' ? 'DRAW' : 'LOSS';
        return this.emotions.processEvent(event, streak, isRelegationRisk);
    }

    processSeasonEvent(event, streak = 0) {
        return this.emotions.processEvent(event, streak);
    }

    get emotionalState() {
        return this.emotions.state;
    }

    // ─── MEMORY ──────────────────────────────────────────────

    remember(entry) {
        this.memoryEngine.remember(entry);
    }

    recallContext(limit = 10) {
        return this.memoryEngine.recallContext(limit);
    }

    // ─── YO-YO DETECTOR ──────────────────────────────────────

    recordSeasonDivision(division, season) {
        return this.yoyoDetector.recordSeasonDivision(division, season);
    }

    // ─── PERSISTENCE ─────────────────────────────────────────

    _restore() {
        try {
            if (typeof localStorage === 'undefined') return;
            if (this._skipAutoRestore) return;
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            
            this.qEngine.restore(parsed);
            if (Array.isArray(parsed.memory)) this.memoryEngine.restore(parsed.memory);
            if (parsed.personality) this.personality = parsed.personality;
            if (parsed.emotions) this.emotions.restore(parsed.emotions);
            this.yoyoDetector.restore(parsed.divisionHistory, parsed.yoyoCount);
        } catch (err) { EngineLogger.capture(err, 'AdaptiveBrain._restore'); }
    }

    save() {
        try {
            if (typeof localStorage === 'undefined') return;
            const qState = this.qEngine.serialize();
            const payload = {
                qTable: qState.qTable,
                visitCount: qState.visitCount,
                totalUpdates: qState.totalUpdates,
                replayBuffer: qState.replayBuffer,
                memory: this.memoryEngine.serialize(),
                personality: this.personality,
                emotions: this.emotions.serialize(),
                divisionHistory: this.yoyoDetector.history,
                yoyoCount: this.yoyoDetector.count,
                savedAt: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            this.lastSavedAt = Date.now();
        } catch (err) { EngineLogger.capture(err, 'AdaptiveBrain.save'); }
    }

    reset() {
        this.qEngine.reset();
        this.memoryEngine.reset();
        this.yoyoDetector.reset();
        this._lastGoals = null;
        this.emotions.forceState('CALM');
        this.goalRelevance.reset();
        try {
            if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
        } catch (err) { EngineLogger.capture(err, 'AdaptiveBrain.reset'); }
    }

    // ─── Q-LEARNING CORE ─────────────────────────────────────

    getQ(stateKey, actionKey) {
        return this.qEngine.getQ(stateKey, actionKey);
    }

    pickAction(stateKey, availableActions, ctx = {}) {
        const goals = detectGoals(ctx, this.personality);
        this._lastGoals = goals;
        const emo = this.emotions.getModifiers();
        const lossStreak = ctx.lossStreak || 0;
        
        return this.qEngine.pickAction(
            stateKey, availableActions, goals, 
            this.goalRelevance, this.personality, emo, 
            lossStreak, this._aiDirectorMod
        );
    }

    observe(stateKey, actionKey, reward, nextStateKey, nextActions = []) {
        this.qEngine.observe(stateKey, actionKey, reward, nextStateKey, nextActions);

        // Save throttled (every 50 updates)
        if (this.qEngine.totalUpdates % 50 === 0) this.save();

        if (this.goalRelevance && this._lastGoals) {
            for (const g of this._lastGoals) {
                this.goalRelevance.update(g.goal, actionKey, reward);
            }
        }
    }

    clearTraces() {
        this.qEngine.clearTraces();
    }

    replayExperiences() {
        const replayed = this.qEngine.replayExperiences();
        if (replayed > 0) this.save();
        return replayed;
    }

    // ─── ANALYTICS ───────────────────────────────────────────

    topActions(limit = 10) {
        const tally = {};
        for (const stateKey of Object.keys(this.qEngine.qTable)) {
            for (const actionKey of Object.keys(this.qEngine.qTable[stateKey])) {
                tally[actionKey] = (tally[actionKey] || 0) + this.qEngine.qTable[stateKey][actionKey];
            }
        }
        return Object.entries(tally)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([action, totalQ]) => ({ action, totalQ }));
    }

    summary() {
        let traceEntries = 0;
        for (const s of Object.keys(this.qEngine.traces)) {
            traceEntries += Object.keys(this.qEngine.traces[s]).length;
        }
        return {
            states: Object.keys(this.qEngine.qTable).length,
            totalUpdates: this.qEngine.totalUpdates,
            activeTraces: traceEntries,
            replayBuffer: this.qEngine.replayBuffer.length,
            replayImpactful: this.qEngine.replayBuffer.filter(e => Math.abs(e.r) > REPLAY_REWARD_THRESHOLD).length,
            lambda: LAMBDA,
            yoyoCount: this.yoyoDetector.count,
            divisionHistory: this.yoyoDetector.history,
            topActions: this.topActions(5),
            personality: {
                id: this.personality?.id,
                label: this.personality?.label,
                ocean: this.personality?.ocean,
                traits: this.personality?.traits
            },
            emotional: this.emotions.summary()
        };
    }
}

