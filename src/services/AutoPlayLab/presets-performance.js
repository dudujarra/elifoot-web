import { aggregateStat } from './DiffEngine.js';

export const saveSizeProfilePreset = {
    id: 'save_size_profile',
    label: 'Save Size Profile',
    description: 'Aprox crescimento save state após N temporadas.',
    category: 'performance',
    defaultConfig: { saves: 10, weeks: 38, seedStart: 60000 },
    analyze: (results) => ({
        avgChronicles: aggregateStat(results, 'chroniclesCount'),
        avgRivalries: aggregateStat(results, 'rivalryCount'),
        avgWeekEvents: aggregateStat(results, 'weekEventsCount'),
        verdict: 'Captura aproximação. Save size real requer serialization profiler.',
    }),
};

// ─── F4: BR Coverage Validator ─────────────────────────────────────────

export const perfBenchPreset = {
    id: 'perf_bench',
    label: 'Performance Benchmark',
    description: 'Tempo total / weeks completed → ms por advanceWeek.',
    category: 'performance',
    defaultConfig: { saves: 20, weeks: 38, seedStart: 80000 },
    analyze: (results) => {
        const totalWeeks = results.reduce((s, r) => s + (r.weeksCompleted || 0), 0);
        return {
            totalSaves: results.length,
            totalWeeks,
            avgWeeksPerSave: Number((totalWeeks / results.length).toFixed(2)),
            verdict: 'Mede em tempo wall-clock via JS timing externo.',
        };
    },
};

// ─── F4: Title Routes ──────────────────────────────────────────────────
