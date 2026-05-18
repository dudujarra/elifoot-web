/**
 * LegendsCrossSavePool — SPEC-181 implementação
 *
 * Pool de lendas persistente cross-save via localStorage. Lendas
 * aposentadas em save A reaparecem como NPCs (coach/scout/commentator)
 * em saves novos.
 *
 * Pure module. Headless (localStorage é I/O isolado, OK em engine).
 */

const STORAGE_KEY = 'olefut_legends_pool';
import { EngineLogger } from './EngineLogger.js';
const SCHEMA_VERSION = 1;
const MAX_POOL_SIZE = 200;

export interface RoleThreshold {
    attr: string;
    min: number;
}

const ROLE_THRESHOLDS: Record<string, RoleThreshold> = {
    coach: { attr: 'leadership', min: 70 },
    scout: { attr: 'technique', min: 75 },
    commentator: { attr: 'charisma', min: 65 },
};

export interface LegendStats {
    apps?: number;
    goals?: number;
    [key: string]: any;
}

export interface LegendEntry {
    id: string;
    name: string;
    sourceSaveId: string;
    retiredYear: number;
    slot: string;
    slotLabel: string;
    stats: LegendStats;
    eligibleRoles: string[];
    addedAt: number;
}

export interface PoolData {
    version: number;
    pool: LegendEntry[];
}

/**
 * Carrega pool do localStorage com fallback graceful.
 */
export function loadPool(): PoolData {
    if (typeof localStorage === 'undefined') return { version: SCHEMA_VERSION, pool: [] };
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { version: SCHEMA_VERSION, pool: [] };
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return { version: SCHEMA_VERSION, pool: [] };
        if (parsed.version !== SCHEMA_VERSION) {
            // schema mismatch → reset
            return { version: SCHEMA_VERSION, pool: [] };
        }
        if (!Array.isArray(parsed.pool)) return { version: SCHEMA_VERSION, pool: [] };
        return parsed;
    } catch (err) {
        EngineLogger.capture(err as Error, 'LegendsCrossSavePool.loadPool');
        return { version: SCHEMA_VERSION, pool: [] };
    }
}

/**
 * Persiste pool no localStorage. Fail-safe.
 */
function savePool(pool: LegendEntry[]): boolean {
    if (typeof localStorage === 'undefined') return false;
    try {
        const trimmed = pool.slice(0, MAX_POOL_SIZE);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, pool: trimmed }));
        return true;
    } catch (err) {
        EngineLogger.capture(err as Error, 'LegendsCrossSavePool.savePool');
        return false;
    }
}

/**
 * Calcula roles eligíveis baseado em final attrs.
 */
export function computeEligibleRoles(finalAttrs: Record<string, number> = {}): string[] {
    const roles: string[] = [];
    for (const [role, spec] of Object.entries(ROLE_THRESHOLDS)) {
        const val = finalAttrs[spec.attr];
        if (typeof val === 'number' && val >= spec.min) {
            roles.push(role);
        }
    }
    return roles;
}

export interface RetiredOptions {
    playerId?: string | number;
    saveId?: string;
    retiredYear?: number;
    hallEntry?: {
        slot?: string;
        slotLabel?: string;
        playerName?: string;
        stats?: LegendStats;
    };
    finalAttrs?: Record<string, number>;
}

export interface MarkRetiredResult {
    added: boolean;
    evicted: number;
    totalSize: number;
}

/**
 * Registra jogador aposentado no pool cross-save.
 */
export function markRetired({ playerId, saveId, retiredYear, hallEntry, finalAttrs }: RetiredOptions = {}): MarkRetiredResult {
    if (!playerId || !saveId || !hallEntry) {
        return { added: false, evicted: 0, totalSize: loadPool().pool.length };
    }

    const eligibleRoles = computeEligibleRoles(finalAttrs);
    if (eligibleRoles.length === 0) {
        return { added: false, evicted: 0, totalSize: loadPool().pool.length };
    }

    const data = loadPool();
    const legendId = `lgd-${saveId}-${playerId}-${retiredYear}`;

    // Skip if already in pool (same save + player)
    if (data.pool.some((l: LegendEntry) => l.id === legendId)) {
        return { added: false, evicted: 0, totalSize: data.pool.length };
    }

    const legend = {
        id: legendId,
        name: hallEntry.playerName || 'Unknown',
        sourceSaveId: saveId,
        retiredYear: retiredYear || 0,
        slot: hallEntry.slot || 'idoloEterno',
        slotLabel: hallEntry.slotLabel || '',
        stats: hallEntry.stats || {},
        eligibleRoles,
        addedAt: Date.now(),
    };

    let newPool = [...data.pool, legend];
    let evicted = 0;

    // FIFO eviction se > MAX_POOL_SIZE
    if (newPool.length > MAX_POOL_SIZE) {
        newPool.sort((a: LegendEntry, b: LegendEntry) => a.addedAt - b.addedAt);
        evicted = newPool.length - MAX_POOL_SIZE;
        newPool = newPool.slice(evicted);
    }

    savePool(newPool);
    return { added: true, evicted, totalSize: newPool.length };
}

export interface RecruitableLegend {
    legendId: string;
    name: string;
    role: string;
    bio: string;
    baseSalary: number;
    attrs: Record<string, number>;
}

export interface RecruitableOptions {
    role?: string;
    count?: number;
    excludeSaveId?: string | null;
}

/**
 * Retorna lendas recrutáveis pra um role específico, excluindo save atual.
 */
export function recruitableLegends({ role = 'coach', count = 3, excludeSaveId = null }: RecruitableOptions = {}): RecruitableLegend[] {
    const data = loadPool();
    const candidates = data.pool
        .filter((l: LegendEntry) => l.eligibleRoles.includes(role))
        .filter((l: LegendEntry) => !excludeSaveId || l.sourceSaveId !== excludeSaveId);

    if (candidates.length === 0) return [];

    // Sort by addedAt desc (mais recente primeiro) + limit
    candidates.sort((a: LegendEntry, b: LegendEntry) => (b.addedAt || 0) - (a.addedAt || 0));

    return candidates.slice(0, count).map((l: LegendEntry) => ({
        legendId: l.id,
        name: l.name,
        role,
        bio: `Ex-${l.slotLabel || l.slot} (${l.stats?.apps || 0} jogos, ${l.stats?.goals || 0} gols), aposentou em ${l.retiredYear}`,
        baseSalary: calculateSalary(l, role),
        attrs: deriveRoleAttrs(l, role),
    }));
}

function calculateSalary(legend: LegendEntry, role: string): number {
    const base = role === 'coach' ? 500000 : role === 'scout' ? 250000 : 150000;
    const multiplier = 1 + ((legend.stats?.goals || 0) / 100);
    return Math.floor(base * multiplier);
}

function deriveRoleAttrs(legend: LegendEntry, role: string): Record<string, number> {
    const goals = legend.stats?.goals || 0;
    const apps = legend.stats?.apps || 0;
    if (role === 'coach') {
        return {
            tactical: Math.min(95, 50 + Math.floor(apps / 10)),
            manmgmt: Math.min(95, 50 + Math.floor(goals / 5)),
            youth: 60,
        };
    }
    if (role === 'scout') {
        return {
            judging: Math.min(95, 50 + Math.floor(apps / 8)),
            potential: 70,
        };
    }
    return {
        eloquence: Math.min(95, 50 + Math.floor(goals / 6)),
    };
}

/**
 * Reset pool (dev/test).
 */
export function resetPool(): void {
    if (typeof localStorage === 'undefined') return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) { EngineLogger.capture(err as Error, 'LegendsCrossSavePool.resetPool'); }
}

/**
 * Export raw pool (debug/inspect).
 */
export function getPool(): LegendEntry[] {
    return loadPool().pool;
}

/**
 * Export pool as JSON string (user backup).
 */
export function exportPool(): string {
    const data = loadPool();
    return JSON.stringify(data, null, 2);
}

/**
 * Import pool from JSON string (user restore). Returns success boolean.
 */
export function importPool(jsonText: string): boolean {
    try {
        const parsed = JSON.parse(jsonText);
        if (!parsed || !Array.isArray(parsed.pool)) return false;
        if (parsed.version !== SCHEMA_VERSION) return false;
        return savePool(parsed.pool);
    } catch (err) {
        EngineLogger.capture(err as Error, 'LegendsCrossSavePool.importPool');
        return false;
    }
}

export { STORAGE_KEY, SCHEMA_VERSION, MAX_POOL_SIZE, ROLE_THRESHOLDS };
