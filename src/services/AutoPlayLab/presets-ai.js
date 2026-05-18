import { aggregateStat, histogram } from './DiffEngine.js';

export const npcAiTuningPreset = {
    id: 'npc_ai_tuning',
    label: 'NPC AI Tuning',
    description: 'Mede impacto das decisões NPC observando posição final do manager humano.',
    category: 'ai',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 2000 },
    analyze: (results) => ({
        managerFinalPos: aggregateStat(results, 'finalPosition'),
        managerWins: aggregateStat(results, 'wins'),
        // Histogram pra ver distribuição (calibração NPC)
        positionHistogram: histogram(results, 'finalPosition'),
    }),
};

// ─── F2: Chronicle Diversity ───────────────────────────────────────────

export const npcPersonalityBiasPreset = {
    id: 'npc_personality_bias',
    label: 'NPC Personality Bias',
    description: 'Mede quanto cada perfil NPC (Maverick/Virtuoso/Heartbeat) impacta o manager.',
    category: 'ai',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 120000 },
    analyze: (results) => ({
        managerFinalPos: aggregateStat(results, 'finalPosition'),
        managerWins: aggregateStat(results, 'wins'),
        verdict: 'Perfis NPC variam por seed via systemRng. Comparar entre seeds.',
    }),
};

export const npcTacticStatePreset = {
    id: 'npc_tactic_state',
    label: 'NPC Tactic State',
    description: 'Valida que NPCs adaptam tática após derrota (npcTacticState).',
    category: 'ai',
    defaultConfig: { saves: 30, weeks: 38, seedStart: 130000 },
    analyze: (results) => ({
        avgWins: aggregateStat(results, 'wins'),
        verdict: 'Engine path NpcTacticAdvisor.recordNpcResult deve ser hit.',
    }),
};

export const marlTrainingDataPreset = {
    id: 'marl_training_data',
    label: 'MARL Training Data',
    description: 'Gera sessões pra fine-tune adaptive brain. Dataset format.',
    category: 'ai',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 140000 },
    analyze: (results) => ({
        totalSaves: results.length,
        totalWeeks: results.reduce((s, r) => s + (r.weeksCompleted || 0), 0),
        verdict: 'Export JSON com snapshots+streakHistory pra ML pipeline.',
    }),
};

export const npcContractLogicPreset = {
    id: 'npc_contract_logic',
    label: 'NPC Contract Logic',
    description: 'Valida que NPCs renovam contratos + aposentam corretamente.',
    category: 'ai',
    defaultConfig: { saves: 20, weeks: 76, seedStart: 150000 },
    analyze: (results) => ({
        squadSize: aggregateStat(results, 'squadSize'),
        avgOvr: aggregateStat(results, 'avgOvr'),
        verdict: 'squadSize estavel + avgOvr renovando = lifecycle saudavel.',
    }),
};

export const aiDirectorValidationPreset = {
    id: 'ai_director_validation',
    label: 'AI Director Validation',
    description: 'AI Director ajusta tensão narrativa? Trace board tension curve.',
    category: 'ai',
    defaultConfig: { saves: 30, weeks: 38, seedStart: 160000 },
    analyze: (results) => ({
        boardTension: aggregateStat(results, 'boardTension'),
        verdict: 'Stddev alto = director ativo. Baixo = comportamento flat.',
    }),
};
