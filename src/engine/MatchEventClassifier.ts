/**
 * MatchEventClassifier — SPEC-B1
 *
 * Classifica eventos da partida em tiers visuais para hierarquia de render.
 * Pure function. Headless.
 */

type EventTier = 'highlight' | 'tactical' | 'minor';

interface MatchEvent {
    readonly type: string;
    readonly [key: string]: unknown;
}

interface TierGroups {
    readonly highlight: MatchEvent[];
    readonly tactical: MatchEvent[];
    readonly minor: MatchEvent[];
}

const TIER_MAP: Record<string, EventTier> = {
    // Highlights — pause/modal candidates, full-screen visual treatment
    goal: 'highlight',
    red: 'highlight',
    'red-card': 'highlight',

    // Tactical — importantes para gestão, surface mas sem cinematic
    substitution: 'tactical',
    sub: 'tactical',
    injury: 'tactical',
    'tactic-change': 'tactical',

    // Minor — narrativa de fluxo, pass-through rápido
    yellow: 'minor',
    'yellow-card': 'minor',
    chance: 'minor',
    corner: 'minor',
    'free-kick': 'minor',
    foul: 'minor',
    narration: 'minor',
    save: 'minor',
    miss: 'minor',
} as const;

const VALID_TIERS: readonly EventTier[] = ['highlight', 'tactical', 'minor'] as const;

/**
 * Classifica um event type. Retorna 'minor' para tipo desconhecido (default safe).
 */
export function getEventTier(eventType: string | null | undefined): EventTier {
    if (!eventType || typeof eventType !== 'string') return 'minor';
    return TIER_MAP[eventType] || 'minor';
}

/**
 * Para arrays de eventos: retorna apenas highlights.
 */
export function filterHighlights(events: MatchEvent[] | null | undefined): MatchEvent[] {
    if (!Array.isArray(events)) return [];
    return events.filter(e => getEventTier(e?.type) === 'highlight');
}

/**
 * Para arrays de eventos: agrupa por tier.
 */
export function groupByTier(events: MatchEvent[] | null | undefined): TierGroups {
    const groups: { highlight: MatchEvent[]; tactical: MatchEvent[]; minor: MatchEvent[] } = { highlight: [], tactical: [], minor: [] };
    if (!Array.isArray(events)) return groups;
    events.forEach(e => {
        const tier = getEventTier(e?.type);
        groups[tier].push(e);
    });
    return groups;
}

export { VALID_TIERS, TIER_MAP };
