import { saveSizeProfilePreset, perfBenchPreset } from "./presets-performance.js";
import { brCoveragePreset, numberFormatPreset, regionalFairnessPreset } from "./presets-locale.js";
import { npcAiTuningPreset, npcPersonalityBiasPreset, npcTacticStatePreset, marlTrainingDataPreset, npcContractLogicPreset, aiDirectorValidationPreset } from "./presets-ai.js";
import { telemetryFarmPreset, chronicleDatasetGenPreset, llmCachePrewarmPreset, embeddingTrainingPreset, bugPatternMiningPreset } from "./presets-data.js";
import { balanceWinRatePreset, winStreakFreqPreset, economyCurvePreset, squadHealthPreset, boardTensionCurvePreset, cardDrawDistPreset, tacticCounterMatrixPreset, formModifierPreset } from "./presets-balance.js";
import { crashFarmPreset, regressionCheckPreset, determinismProofPreset, tournamentValidatorPreset, memoryLeakPreset, crashPatternPreset, saveRoundtripPreset } from "./presets-quality.js";
import { statsBragPreset, gameplayClipsPreset, chronicleShowcasePreset } from "./presets-marketing.js";
import { seedSearchPreset, edgeCaseGenPreset, speedrunDiscoveryPreset, titleRoutesPreset, replaySharingPreset } from "./presets-discovery.js";
import { chronicleDiversityPreset, derbyTriggerRatePreset, titleWinRatePreset, starAdoptionPreset, seasonalEventCoveragePreset, brFlavorCoverageDetailedPreset, modCardDistributionPreset } from "./presets-content.js";

export const PRESETS = {
    // F1
    balance_winrate: balanceWinRatePreset,
    // F2
    crash_farm: crashFarmPreset,
    regression_check: regressionCheckPreset,
    npc_ai_tuning: npcAiTuningPreset,
    chronicle_diversity: chronicleDiversityPreset,
    // F3
    determinism_proof: determinismProofPreset,
    win_streak_freq: winStreakFreqPreset,
    economy_curve: economyCurvePreset,
    tournament_validator: tournamentValidatorPreset,
    memory_leak: memoryLeakPreset,
    derby_trigger_rate: derbyTriggerRatePreset,
    title_win_rate: titleWinRatePreset,
    squad_health: squadHealthPreset,
    board_tension_curve: boardTensionCurvePreset,
    // F4
    seed_search: seedSearchPreset,
    edge_case_gen: edgeCaseGenPreset,
    speedrun_discovery: speedrunDiscoveryPreset,
    star_adoption: starAdoptionPreset,
    save_size_profile: saveSizeProfilePreset,
    br_coverage: brCoveragePreset,
    perf_bench: perfBenchPreset,
    title_routes: titleRoutesPreset,
    stats_brag: statsBragPreset,
    crash_pattern_mining: crashPatternPreset,
    telemetry_farm: telemetryFarmPreset,
    // BATCH 2 (20 presets restantes)
    npc_personality_bias: npcPersonalityBiasPreset,
    npc_tactic_state: npcTacticStatePreset,
    marl_training_data: marlTrainingDataPreset,
    npc_contract_logic: npcContractLogicPreset,
    ai_director_validation: aiDirectorValidationPreset,
    seasonal_event_coverage: seasonalEventCoveragePreset,
    br_flavor_coverage_detailed: brFlavorCoverageDetailedPreset,
    mod_card_distribution: modCardDistributionPreset,
    chronicle_dataset_gen: chronicleDatasetGenPreset,
    llm_cache_prewarm: llmCachePrewarmPreset,
    embedding_training: embeddingTrainingPreset,
    bug_pattern_mining: bugPatternMiningPreset,
    replay_sharing: replaySharingPreset,
    save_roundtrip: saveRoundtripPreset,
    card_draw_dist: cardDrawDistPreset,
    tactic_counter_matrix: tacticCounterMatrixPreset,
    form_modifier: formModifierPreset,
    number_format: numberFormatPreset,
    regional_fairness: regionalFairnessPreset,
    gameplay_clips: gameplayClipsPreset,
    chronicle_showcase: chronicleShowcasePreset,
};

export const PRESET_CATEGORIES = {
    quality: 'Quality / Integrity',
    balance: 'Balance / Fine-tune',
    ai: 'IA NPC Tuning',
    content: 'Content Coverage',
    data: 'Data / ML',
    discovery: 'Discovery',
    performance: 'Performance',
    locale: 'Locale / Cultural',
    marketing: 'Marketing / Showcase',
};
