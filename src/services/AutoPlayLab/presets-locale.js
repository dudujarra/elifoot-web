import { aggregateStat } from './DiffEngine.js';

export const brCoveragePreset = {
    id: 'br_coverage',
    label: 'BR Content Coverage',
    description: 'Confirma que features BR (ClubVoice, atmosphere) integradas.',
    category: 'locale',
    defaultConfig: { saves: 20, weeks: 38, seedStart: 70000 },
    analyze: (results) => ({
        completedSaves: results.filter(r => !r.crash).length,
        avgWeekEvents: aggregateStat(results, 'weekEventsCount'),
        verdict: 'Validação real requer text scan dos weekEvents. Helper futuro.',
    }),
};

// ─── F4: Perf Bench ────────────────────────────────────────────────────

export const numberFormatPreset = {
    id: 'number_format',
    label: 'Number Format',
    description: 'R$ formatado correto? Datas pt-BR?',
    category: 'locale',
    defaultConfig: { saves: 10, weeks: 38, seedStart: 290000 },
    analyze: (results) => ({
        completedSaves: results.filter(r => !r.crash).length,
        verdict: 'Locale validation requer UI render snapshot.',
    }),
};

export const regionalFairnessPreset = {
    id: 'regional_fairness',
    label: 'Regional Fairness',
    description: 'Clubes Norte aparecem com frequencia similar a SE?',
    category: 'locale',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 300000 },
    analyze: (results) => ({
        totalSaves: results.length,
        verdict: 'Requer text scan dos weekEvents per região.',
    }),
};
