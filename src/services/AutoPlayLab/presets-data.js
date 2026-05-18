import { extractCrashes, groupCrashesByStack } from './DiffEngine.js';

export const telemetryFarmPreset = {
    id: 'telemetry_farm',
    label: 'Telemetry Farm',
    description: 'Roda saves pra popular eventos telemetria (validar dashboards).',
    category: 'data',
    defaultConfig: { saves: 200, weeks: 38, seedStart: 110000 },
    analyze: (results) => ({
        totalSaves: results.length,
        verdict: 'Eventos telemetria emitidos durante execução. Check Telemetry.aggregate() pós-run.',
    }),
};

// ═══════════════════════════════════════════════════════════════════════
// BATCH 2 — 20 PRESETS RESTANTES (cobertura completa das 45 utilidades)
// ═══════════════════════════════════════════════════════════════════════

export const chronicleDatasetGenPreset = {
    id: 'chronicle_dataset_gen',
    label: 'Chronicle Dataset Gen',
    description: 'Gera N chronicles pra fine-tune LLM local. Export JSON.',
    category: 'data',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 200000 },
    analyze: (results) => ({
        totalChronicles: results.reduce((s, r) => s + (r.snapshot?.chroniclesCount || 0), 0),
        verdict: 'Export JSON dump → feed Ollama qwen3:14b LoRA training.',
    }),
};

export const llmCachePrewarmPreset = {
    id: 'llm_cache_prewarm',
    label: 'LLM Cache Pre-Warm',
    description: 'Roda saves background pra popular LLMNarrative cache.',
    category: 'data',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 210000 },
    analyze: (results) => ({
        totalRuns: results.length,
        verdict: 'LLMNarrativeService.cache populado durante runs.',
    }),
};

export const embeddingTrainingPreset = {
    id: 'embedding_training',
    label: 'Embedding Training',
    description: 'Match summaries → dataset pra embeddings + similarity search.',
    category: 'data',
    defaultConfig: { saves: 200, weeks: 38, seedStart: 220000 },
    analyze: (results) => ({
        totalSaves: results.length,
        verdict: 'Export raw snapshots + chronicles → vector DB pipeline.',
    }),
};

export const bugPatternMiningPreset = {
    id: 'bug_pattern_mining',
    label: 'Bug Pattern Mining',
    description: 'Agrupa crashes por stack signature pra priorizar fixes.',
    category: 'data',
    defaultConfig: { saves: 300, weeks: 38, seedStart: 230000 },
    analyze: (results) => {
        const crashes = extractCrashes(results);
        const groups = groupCrashesByStack(crashes);
        return {
            totalCrashes: crashes.length,
            uniquePatterns: groups.length,
            top3: groups.slice(0, 3),
        };
    },
};
