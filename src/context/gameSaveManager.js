/**
 * gameSaveManager.js — AKITA-416
 *
 * Extracted from GameContext.jsx: all save/load/serialize/restore logic.
 * Pure functions — zero React, zero DOM. Testable in isolation.
 */

import { Tournament } from '../engine/tournaments/Tournament';
import { League } from '../engine/tournaments/League';
import { KnockoutCup } from '../engine/tournaments/KnockoutCup';
import { ContinentalCup } from '../engine/tournaments/ContinentalCup';
import { ProPlayer } from '../engine/PlayerCareer';
import { ManagerLegacy } from '../engine/SeasonSystem';
import { SAVE_KEY, SAVE_VERSION } from '../engine/constants.js';

// ─── CRC32 checksum ───────────────────────────────────────────
function crc32(str) {
    let crc = -1;
    for (let i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ _crc32Table[(crc ^ str.charCodeAt(i)) & 0xff];
    }
    return (crc ^ -1) >>> 0;
}
const _crc32Table = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let c = i;
        for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        table[i] = c;
    }
    return table;
})();

// ─── Tournament class restoration ────────────────────────────
const TOURNAMENT_CLASSES = { Tournament, League, KnockoutCup, ContinentalCup };

function tournamentClassFromShape(t) {
    if (!t || typeof t !== 'object') return Tournament;
    if (t.__class && TOURNAMENT_CLASSES[t.__class]) return TOURNAMENT_CLASSES[t.__class];
    if (typeof t.level === 'number') return League;
    if (Array.isArray(t.groupWeeks)) return ContinentalCup;
    if (Array.isArray(t.roundWeeks)) return KnockoutCup;
    return Tournament;
}

// ─── Engine serialization ────────────────────────────────────
// Campos engine que são instâncias de classes — skip em save (recriam em constructor).
const ENGINE_CLASS_FIELDS = [
    'staff', 'board', 'legacy',
    'llmNarrative',
    '_matchSimulator', '_mythService', '_relationshipService', '_narrativeService', '_careerService',
    '_inheritanceService', '_weekProcessor', '_seasonProcessor', '_aiDirector',
    '_npcWeekProcessor', '_transferService', '_scoutingService', '_loanService',
    '_facilityService', '_formationService', '_pressService', '_sectorService',
    '_gameInitializer'
];

export function serializeEngine(engine) {
    const safe = {};
    for (const key of Object.keys(engine)) {
        if (ENGINE_CLASS_FIELDS.includes(key)) continue;
        try {
            const v = engine[key];
            if (typeof v === 'function') continue;
            if (v instanceof Map || v instanceof Set) continue;
            JSON.stringify(v);
            safe[key] = v;
        } catch { /* skip non-serializable */ }
    }
    // BUG-096: Strip brain objects + volatile NPC AI state from teams.
    if (Array.isArray(safe.teams)) {
        safe.teams = safe.teams.map(t => {
            if (!t) return t;
            const { _brain, _lastTacticDecision, _aiDirectorState, ...clean } = t;
            return clean;
        });
    }
    // Save staff state separately (just hired array)
    if (engine.staff && Array.isArray(engine.staff.hired)) {
        safe._staffHired = engine.staff.hired;
    }
    // BUG-075: save legacy separately
    if (engine.legacy) {
        safe._legacy = {
            managerName: engine.legacy.managerName,
            reputation: engine.legacy.reputation,
            seasons: engine.legacy.seasons,
            titles: engine.legacy.titles,
            totalWins: engine.legacy.totalWins,
            totalMatches: engine.legacy.totalMatches,
        };
    }
    // BUG-021: tag tournaments com class name pra prototype restore
    if (Array.isArray(engine.tournaments)) {
        safe.tournaments = engine.tournaments.map(t => ({
            ...t,
            __class: t?.constructor?.name || 'Tournament'
        }));
    }
    return safe;
}

export function restoreEngine(engine, snapshot) {
    if (!snapshot) return;
    for (const [key, val] of Object.entries(snapshot)) {
        if (key === '_staffHired') continue;
        if (ENGINE_CLASS_FIELDS.includes(key)) continue;
        try {
            engine[key] = val;
        } catch { /* skip */ }
    }
    // BUG-021 fix: re-attach tournament prototypes
    if (Array.isArray(engine.tournaments)) {
        engine.tournaments = engine.tournaments.map(rawT => {
            if (!rawT) return rawT;
            const ClassConstructor = tournamentClassFromShape(rawT);
            const restored = Object.create(ClassConstructor.prototype);
            for (const [k, v] of Object.entries(rawT)) {
                if (k === '__class') continue;
                restored[k] = v;
            }
            return restored;
        });
    }
    // Restore staff hired list (preserva StaffManager class)
    if (snapshot._staffHired && engine.staff) {
        engine.staff.hired = [...snapshot._staffHired];
    }
    // BUG-075 fix: restore ManagerLegacy instance
    if (snapshot._legacy) {
        const ld = snapshot._legacy;
        const ml = new ManagerLegacy(ld.managerName || '');
        ml.reputation = ld.reputation ?? 30;
        ml.seasons = ld.seasons ?? [];
        ml.titles = ld.titles ?? [];
        ml.totalWins = ld.totalWins ?? 0;
        ml.totalMatches = ld.totalMatches ?? 0;
        engine.legacy = ml;
    }
    // BUG-024 fix: rehydrate ProPlayer prototype after JSON restore.
    if (engine.proPlayer && typeof engine.proPlayer.hasFlag !== 'function') {
        try {
            Object.setPrototypeOf(engine.proPlayer, ProPlayer.prototype);
            if (!engine.proPlayer.flags) engine.proPlayer.flags = {};
        } catch { /* ignore */ }
    }
}

// ─── localStorage persistence ────────────────────────────────
export function saveToStorage(engine, gameState) {
    try {
        const engineData = serializeEngine(engine);
        const engineJson = JSON.stringify(engineData);
        const checksum = crc32(engineJson);
        const payload = {
            version: SAVE_VERSION,
            timestamp: Date.now(),
            checksum,
            gameState,
            engine: engineData,
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('[Save] Failed to persist state:', e);
    }
}

export function loadFromStorage() {
    try {
        const raw = localStorage.getItem(SAVE_KEY);
        if (!raw) return null;
        const payload = JSON.parse(raw);
        if (payload.version !== SAVE_VERSION) {
            console.info(`[Save] Version mismatch (saved v${payload.version}, current v${SAVE_VERSION}). Save invalidated.`);
            return null;
        }
        if (payload.checksum !== undefined && payload.engine) {
            const expected = crc32(JSON.stringify(payload.engine));
            if (payload.checksum !== expected) {
                console.warn(`[Save] Integrity check failed (expected ${expected}, got ${payload.checksum}). Save corrupted.`);
                return null;
            }
        }
        return payload;
    } catch (e) {
        console.warn('[Save] Failed to load state:', e);
        return null;
    }
}

export function clearStorage() {
    try {
        localStorage.removeItem(SAVE_KEY);
    } catch { /* ignore */ }
}
