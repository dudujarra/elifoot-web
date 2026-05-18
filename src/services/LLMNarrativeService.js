import { EngineLogger } from '../engine/EngineLogger.js';
import { 
    buildPostMatchTemplate, 
    buildManagerAdviceTemplate, 
    buildBoardReactionTemplate,
    fnv1aHash,
    POST_MATCH_TEMPLATES,
    MANAGER_ADVICE_TEMPLATES,
    BOARD_REACTION_TEMPLATES
} from './narrative/NarrativeTemplates.js';
import {
    buildPostMatchPrompt,
    buildManagerAdvicePrompt,
    buildBoardReactionPrompt
} from './narrative/PromptBuilders.js';

/**
 * LLMNarrativeService — SPEC-167
 *
 * Camada pública de narrativa baseada em LLM com fallback determinístico
 * por templates. Três casos de uso:
 *
 *   1. postMatchAnalysis(matchData) — narrativa pós-jogo
 *   2. managerAdvice(matchCtx)       — conselho pré-jogo do auxiliar
 *   3. boardReaction(event)          — comunicado in-character da diretoria
 */

const DEFAULT_TIMEOUT_MS = 3000;
const CACHE_MAX = 100;
const LLM_TOGGLE_STORAGE_KEY = 'olefut_llm_enabled';

function readPersistedToggle() {
    try {
        if (typeof localStorage === 'undefined') return false;
        return localStorage.getItem(LLM_TOGGLE_STORAGE_KEY) === '1';
    } catch (err) {
        EngineLogger.capture(err, 'LLMNarrativeService.readPersistedToggle');
        return false;
    }
}

function writePersistedToggle(enabled) {
    try {
        if (typeof localStorage === 'undefined') return;
        if (enabled) localStorage.setItem(LLM_TOGGLE_STORAGE_KEY, '1');
        else localStorage.removeItem(LLM_TOGGLE_STORAGE_KEY);
    } catch (err) {
        EngineLogger.capture(err, 'LLMNarrativeService.writePersistedToggle');
    }
}

function raceWithTimeout(promise, ms) {
    return new Promise((resolve) => {
        const t = setTimeout(() => resolve({ __timeout__: true }), ms);
        Promise.resolve(promise).then(
            (val) => { clearTimeout(t); resolve({ value: val }); },
            (err) => { clearTimeout(t); resolve({ error: err }); }
        );
    });
}

export class LLMNarrativeService {
    constructor(opts = {}) {
        this._bridge = opts.bridge || null;
        this._timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : DEFAULT_TIMEOUT_MS;
        this._skipPersistence = !!opts.skipPersistence;
        
        if (typeof opts.enableLLM === 'boolean') {
            this._enableLLM = opts.enableLLM;
        } else if (!this._skipPersistence) {
            this._enableLLM = readPersistedToggle();
        } else {
            this._enableLLM = false;
        }
        
        this._cache = new Map();
        this._lastMeta = null;
        this._bridgeBootstrap = null;
    }

    getLastMeta() {
        return this._lastMeta;
    }

    isLLMEnabled() {
        return !!this._enableLLM;
    }

    async enableLLM(opts = {}) {
        this._enableLLM = true;
        if (!this._skipPersistence) writePersistedToggle(true);

        if (this._bridge && this._isBridgeReady()) {
            return { ok: true, status: 'ready' };
        }
        if (this._bridgeBootstrap) {
            return this._bridgeBootstrap;
        }

        const loader = opts.bridgeLoader || (() => import('./AutoPlayLLMBridge.js'));
        this._bridgeBootstrap = (async () => {
            try {
                const mod = await loader();
                const BridgeCtor = mod.AutoPlayLLMBridge || mod.default;
                if (typeof BridgeCtor !== 'function') throw new Error('AutoPlayLLMBridge export not found');
                
                const bridge = new BridgeCtor();
                bridge.setMode('webllm');
                this._bridge = bridge;
                await bridge.init();
                return { ok: true, status: bridge.status().loadStatus };
            } catch (err) {
                EngineLogger.capture(err, 'LLMNarrativeService.generate');
                this._bridgeBootstrap = null;
                return { ok: false, error: err && err.message ? err.message : String(err) };
            }
        })();
        return this._bridgeBootstrap;
    }

    disableLLM() {
        this._enableLLM = false;
        if (!this._skipPersistence) writePersistedToggle(false);
    }

    getLLMStatus() {
        let bridgeStatus = null;
        if (this._bridge && typeof this._bridge.status === 'function') {
            try { bridgeStatus = this._bridge.status(); } catch (err) { EngineLogger.capture(err, 'LLMNarrativeService.getLLMStatus'); bridgeStatus = null; }
        }
        return {
            enabled: !!this._enableLLM,
            bridgeReady: this._isBridgeReady(),
            bridgeStatus,
        };
    }

    postMatchAnalysisSync(matchData) {
        return buildPostMatchTemplate(matchData);
    }

    managerAdviceSync(matchCtx) {
        return buildManagerAdviceTemplate(matchCtx);
    }

    boardReactionSync(event) {
        return buildBoardReactionTemplate(event);
    }

    async postMatchAnalysis(matchData) {
        const key = `post|${matchData?.homeTeam || ''}|${matchData?.awayTeam || ''}|${matchData?.homeGoals ?? 0}|${matchData?.awayGoals ?? 0}|${matchData?.managerSide || ''}`;
        return this._runWithCache(
            key,
            () => buildPostMatchTemplate(matchData),
            () => buildPostMatchPrompt(matchData)
        );
    }

    async managerAdvice(matchCtx) {
        const key = `adv|${matchCtx?.ownTeam?.name || ''}|${matchCtx?.opponent?.name || ''}|${matchCtx?.ownTeam?.avgOvr ?? 0}|${matchCtx?.opponent?.avgOvr ?? 0}|${matchCtx?.ownTeam?.formation || ''}`;
        return this._runWithCache(
            key,
            () => buildManagerAdviceTemplate(matchCtx),
            () => buildManagerAdvicePrompt(matchCtx)
        );
    }

    async boardReaction(event) {
        const key = `brd|${event?.type || 'default'}|${event?.position ?? ''}|${event?.scoreDiff ?? ''}`;
        return this._runWithCache(
            key,
            () => buildBoardReactionTemplate(event),
            () => buildBoardReactionPrompt(event)
        );
    }

    async _runWithCache(cacheKey, buildFallback, buildPrompt) {
        if (this._cache.has(cacheKey)) {
            const hit = this._cache.get(cacheKey);
            this._cache.delete(cacheKey);
            this._cache.set(cacheKey, hit);
            this._lastMeta = { source: hit.source, cached: true };
            return hit.text;
        }

        let fallbackText;
        try { fallbackText = buildFallback(); } catch (err) { EngineLogger.capture(err, 'LLMNarrativeService.buildFallback'); fallbackText = 'A equipe segue trabalhando. Em breve mais novidades.'; }
        if (!fallbackText || fallbackText.length < 20) fallbackText = 'A equipe segue trabalhando. Em breve mais novidades sobre a situação.';

        let text = fallbackText;
        let source = 'template';
        
        if (this._enableLLM && this._bridge && this._isBridgeReady()) {
            try {
                const prompt = buildPrompt();
                const raceResult = await raceWithTimeout(this._bridge.decide(prompt), this._timeoutMs);
                if (raceResult.value && raceResult.value.text && raceResult.value.text.trim().length >= 20) {
                    const candidate = String(raceResult.value.text).trim();
                    text = candidate.length > 400 ? candidate.slice(0, 397) + '...' : candidate;
                    source = raceResult.value.source === 'webllm' ? 'webllm' : 'template';
                }
            } catch (err) { EngineLogger.capture(err, 'LLMNarrativeService.bridgeDecide'); }
        }

        this._cache.set(cacheKey, { text, source });
        if (this._cache.size > CACHE_MAX) {
            const firstKey = this._cache.keys().next().value;
            this._cache.delete(firstKey);
        }
        
        this._lastMeta = { source, cached: false };
        return text;
    }

    _isBridgeReady() {
        if (!this._bridge || typeof this._bridge.status !== 'function') return false;
        try {
            const s = this._bridge.status();
            return s && s.mode === 'webllm' && s.loadStatus === 'ready';
        } catch (err) { EngineLogger.capture(err, 'LLMNarrativeService.isBridgeReady'); return false; }
    }
}

let _defaultInstance = null;
export function getDefaultLLMNarrativeService() {
    if (!_defaultInstance) _defaultInstance = new LLMNarrativeService();
    return _defaultInstance;
}

export const __internals = {
    fnv1aHash,
    raceWithTimeout,
    buildPostMatchTemplate,
    buildManagerAdviceTemplate,
    buildBoardReactionTemplate,
    POST_MATCH_TEMPLATES,
    MANAGER_ADVICE_TEMPLATES,
    BOARD_REACTION_TEMPLATES,
    LLM_TOGGLE_STORAGE_KEY,
};
