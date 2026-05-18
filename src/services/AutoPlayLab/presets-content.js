import { aggregateStat } from './DiffEngine.js';

export const chronicleDiversityPreset = {
    id: 'chronicle_diversity',
    label: 'Chronicle Diversity',
    description: 'Distribuição de moods das Chronicles geradas. Triunfo/Tragédia balanceado?',
    category: 'content',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 3000 },
    analyze: (results) => ({
        chroniclesGenerated: aggregateStat(results, 'chroniclesCount'),
        avgFinalPos: aggregateStat(results, 'finalPosition'),
        verdict: 'Captura chroniclesCount em snapshots. Detalhe per-mood requer deep capture.',
    }),
};

// ─── F3: Determinism Proof ─────────────────────────────────────────────

export const derbyTriggerRatePreset = {
    id: 'derby_trigger_rate',
    label: 'Derby Trigger Rate',
    description: '% saves geram rivalidade emergente (>=3 confrontos com algum oponente).',
    category: 'content',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 9000 },
    analyze: (results) => {
        const withDerby = results.filter(r => (r.snapshot?.rivalryCount || 0) > 0);
        return {
            totalSaves: results.length,
            derbyCount: withDerby.length,
            derbyRate: Number(((withDerby.length / results.length) * 100).toFixed(2)),
            avgRivalriesPerSave: aggregateStat(results, 'rivalryCount'),
        };
    },
};

// ─── F3: Title Win Rate ────────────────────────────────────────────────

export const titleWinRatePreset = {
    id: 'title_win_rate',
    label: 'Title Win Rate',
    description: '% saves conquistam título da divisão.',
    category: 'content',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 10000 },
    analyze: (results) => {
        const titles = results.filter(r => (r.snapshot?.finalPosition || 99) === 1).length;
        return {
            totalSaves: results.length,
            titlesWon: titles,
            titleRate: Number(((titles / results.length) * 100).toFixed(2)),
        };
    },
};

// ─── F3: Squad Health Profile ──────────────────────────────────────────

export const starAdoptionPreset = {
    id: 'star_adoption',
    label: 'Star Adoption Impact',
    description: 'Saves com starPlayerId vs sem. Diff em wins.',
    category: 'content',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 50000 },
    analyze: (results) => {
        const withStar = results.filter(r => r.snapshot?.starPlayerId);
        const noStar = results.filter(r => !r.snapshot?.starPlayerId);
        return {
            withStar: { count: withStar.length, avgWins: aggregateStat(withStar, 'wins').avg },
            noStar: { count: noStar.length, avgWins: aggregateStat(noStar, 'wins').avg },
            verdict: 'Diff revela se star player tem impacto sistêmico',
        };
    },
};

// ─── F4: Save Size Profile ─────────────────────────────────────────────

export const seasonalEventCoveragePreset = {
    id: 'seasonal_event_coverage',
    label: 'Seasonal Event Coverage',
    description: 'Player vê todos 4 eventos sazonais BR (week 1/13/26/38)?',
    category: 'content',
    defaultConfig: { saves: 20, weeks: 38, seedStart: 170000 },
    analyze: (results) => ({
        completedFullSeason: results.filter(r => r.weeksCompleted >= 38).length,
        verdict: 'Saves >= 38 weeks viram todos 4 eventos.',
    }),
};

export const brFlavorCoverageDetailedPreset = {
    id: 'br_flavor_coverage_detailed',
    label: 'BR Flavor Coverage (Detalhado)',
    description: 'Estima exposure de atmosphere strings + club voices por save.',
    category: 'content',
    defaultConfig: { saves: 20, weeks: 38, seedStart: 180000 },
    analyze: (results) => {
        const avgEvents = aggregateStat(results, 'weekEventsCount');
        return {
            avgEvents,
            estimatedAtmoExposure: avgEvents.avg * 0.5,
            verdict: 'Cada save ~50 strings BR. Saturação se > 200.',
        };
    },
};

export const modCardDistributionPreset = {
    id: 'mod_card_distribution',
    label: 'Mod Card Distribution',
    description: 'Cards mod aparecem em paridade com builtin?',
    category: 'content',
    defaultConfig: { saves: 30, weeks: 38, seedStart: 190000 },
    analyze: (results) => ({
        completedSaves: results.filter(r => !r.crash).length,
        verdict: 'Requer instrumentation MidMatchManagerDeck.getMidMatchCard tracking _modSource.',
    }),
};
