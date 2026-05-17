/**
 * SPEC-C2.3: UnifiedModeBridge
 *
 * Bridges Manager and Player modes when a star player is in the squad.
 * Stateless: operates on engine state, returns results.
 */

// Engine is loosely typed since it's not yet migrated to TS
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EngineRef = any;

export interface ProPlayerStub {
    readonly _isStub: true;
    readonly skills: {
        readonly technique: number;
        readonly pace: number;
    };
    readonly relationships: {
        readonly boss: number;
        readonly fans: number;
        readonly teammates: number;
    };
    readonly careerGoals: number;
    readonly seasonGoals: number;
    [key: string]: unknown;
}

export interface UnifiedViewResult {
    readonly isUnified: boolean;
    readonly star: ProPlayerStub | null;
    readonly manager: unknown;
    readonly effectivePerspective: 'manager' | 'player';
}

export interface RelationshipEffect {
    readonly boss?: number;
    readonly fans?: number;
    readonly teammates?: number;
    readonly stress?: number;
}

export interface EffectChange {
    readonly before: number;
    readonly after: number;
}

export interface ApplyEffectResult {
    readonly applied: boolean;
    readonly changes?: Record<string, EffectChange>;
}

export function isUnifiedMode(engine: EngineRef): boolean {
    if (!engine || !engine.starPlayerId) return false;
    if (engine.mode === 'player') return false;

    const team = engine.getTeam(engine.manager.teamId);
    if (!team || !team.squad) return false;

    return team.squad.some((p: { id: unknown }) => p.id === engine.starPlayerId);
}

export function buildProPlayerStub(squadPlayer: Record<string, unknown> | null): ProPlayerStub | null {
    if (!squadPlayer) return null;

    return {
        ...squadPlayer,
        _isStub: true,
        skills: {
            technique: (squadPlayer.technical as number) || 50,
            pace: (squadPlayer.attacking as number) || 50,
        },
        relationships: {
            boss: (squadPlayer.bossRel as number) || 50,
            fans: (squadPlayer.fansRel as number) || 50,
            teammates: (squadPlayer.teammatesRel as number) || 50,
        },
        careerGoals: (squadPlayer.careerGoals as number) || 0,
        seasonGoals: (squadPlayer.seasonGoals as number) || 0,
    };
}

export function getUnifiedView(engine: EngineRef): UnifiedViewResult {
    if (!engine) {
        return { isUnified: false, manager: null, star: null, effectivePerspective: 'manager' };
    }

    const unified: boolean = isUnifiedMode(engine);
    let star: ProPlayerStub | null = null;

    if (unified) {
        const team = engine.getTeam(engine.manager.teamId);
        const rawStar = team.squad.find((p: { id: unknown }) => p.id === engine.starPlayerId);
        star = buildProPlayerStub(rawStar);
    }

    return {
        isUnified: unified,
        star,
        manager: engine.manager || null,
        effectivePerspective: 'manager',
    };
}

function clamp(val: number): number {
    return Math.max(0, Math.min(100, val));
}

export function applyPlayerCardEffectToStar(engine: EngineRef, effect: RelationshipEffect | null): ApplyEffectResult {
    if (!effect) return { applied: false };
    if (!isUnifiedMode(engine)) return { applied: false };

    const team = engine.getTeam(engine.manager.teamId);
    const player = team.squad.find((p: { id: unknown }) => p.id === engine.starPlayerId);

    const changes: Record<string, EffectChange> = {};

    if (effect.boss !== undefined) {
        const before: number = player.bossRel || 50;
        player.bossRel = clamp(before + effect.boss);
        changes.boss = { before, after: player.bossRel };
    }

    if (effect.fans !== undefined) {
        const before: number = player.fansRel || 50;
        player.fansRel = clamp(before + effect.fans);
        changes.fans = { before, after: player.fansRel };
    }

    if (effect.teammates !== undefined) {
        const before: number = player.teammatesRel || 50;
        player.teammatesRel = clamp(before + effect.teammates);
        changes.teammates = { before, after: player.teammatesRel };
    }

    if (effect.stress !== undefined) {
        const before: number = player.stress || 0;
        player.stress = clamp(before + effect.stress);
        changes.stress = { before, after: player.stress };
    }

    return { applied: true, changes };
}
