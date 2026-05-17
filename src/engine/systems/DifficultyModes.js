/**
 * DifficultyModes — SPEC-073 (Sprint L)
 *
 * 3 modes affecting economy, board patience, injury rate, training XP.
 * Persisted in localStorage 'olefut_difficulty'.
 */

import { EngineLogger } from '../EngineLogger.js';
import { DIFFICULTY } from '../EmojiConstants.js';
export const DIFFICULTY_MODES = {
    easy: {
        id: 'easy',
        name: 'Fácil',
        emoji: DIFFICULTY.EASY,
        description: 'Para quem quer relaxar. Dinheiro fácil, board paciente.',
        modifiers: {
            economyMult: 1.3,        // +30% receita
            transferCostMult: 0.7,   // -30% custo transferência
            wageBudgetMult: 1.5,     // +50% wage cap
            boardPatience: 1.5,      // 50% mais paciente
            injuryRateMult: 0.7,     // 30% menos lesões
            trainingXPMult: 1.3,     // +30% XP treino
            scoutAccuracyBonus: 10   // +10% accuracy scout
        }
    },
    normal: {
        id: 'normal',
        name: 'Normal',
        emoji: DIFFICULTY.NORMAL,
        description: 'Experiência balanceada. Default.',
        modifiers: {
            economyMult: 1.0,
            transferCostMult: 1.0,
            wageBudgetMult: 1.0,
            boardPatience: 1.0,
            injuryRateMult: 1.0,
            trainingXPMult: 1.0,
            scoutAccuracyBonus: 0
        }
    },
    hard: {
        id: 'hard',
        name: 'Difícil',
        emoji: DIFFICULTY.HARD,
        description: 'Veterano. Economia apertada, board exige resultados.',
        modifiers: {
            economyMult: 0.7,        // -30% receita
            transferCostMult: 1.3,   // +30% custo
            wageBudgetMult: 0.7,     // -30% wage cap
            boardPatience: 0.7,      // 30% menos paciente
            injuryRateMult: 1.3,     // +30% lesões
            trainingXPMult: 0.7,     // -30% XP
            scoutAccuracyBonus: -10  // -10% accuracy
        }
    },
    sinistro: {
        id: 'sinistro',
        name: 'Sinistro',
        emoji: DIFFICULTY.SINISTRO,
        description: 'Maestria tática obrigatória. Cada decisão conta — técnica vence.',
        modifiers: {
            // === ECONOMIA: apertada mas não impossível ===
            economyMult: 0.35,           // -65% receita (duro, mas investimento é viável)
            transferCostMult: 2.0,       // +100% custo transferência (garimpo é essencial)
            wageBudgetMult: 0.5,         // -50% wage cap (squad enxuto)
            maintenanceMult: 2.5,        // 2.5× custos de manutenção

            // === BOARD: exigente mas justo ===
            boardPatience: 0.4,          // 60% menos paciente (resultados ou rua)
            boardFireCooldown: 15,       // mínimo 15 semanas entre demissões

            // === TÁTICA: o coração do Sinistro v2 ===
            // Amplifica o impacto da matriz tática (counter system)
            // Escolher tática errada custa MUITO mais, acertar premia MUITO mais
            tacticCounterAmplifier: 1.8, // 1.0=normal, 1.8=quase dobra o efeito de counter
            // NPCs jogam com IA tática superior (adaptam melhor)
            npcTacticalIQ: 1.5,          // 1.0=normal, NPCs trocam tática 50% mais rápido
            // Formação errada pesa mais
            formationCounterAmplifier: 1.6,

            // === PHYSICAL: fadiga e lesão realistas ===
            injuryRateMult: 1.8,         // 80% mais lesões (não 3×, mas suficiente)
            fatigueSensitivity: 1.5,     // energia cai 50% mais rápido
            trainingXPMult: 0.5,         // -50% XP treino (desenvolvimento lento, não impossível)

            // === SCOUTING: impreciso mas não cego ===
            scoutAccuracyBonus: -20,     // -20% accuracy (garimpar exige olho clínico)

            // === SEM matchStrengthPenalty ===
            // Técnica vence: OVR do squad é respeitado integralmente.
            // A dificuldade vem de decisões, não de debuff flat.
            matchStrengthPenalty: 1.0,   // SEM penalty — squad quality matters

            // === DDA/STREAK: moderado ===
            winStreakMult: 0.5,          // 50% do win streak bonus
            ddaLossMult: 0.6            // 60% da ajuda em loss streak
        }
    }
};

const STORAGE_KEY = 'olefut_difficulty';
let _memoryFallback = null; // in-memory fallback for headless/Node/test envs

export function getDifficulty() {
    try {
        const id = localStorage.getItem(STORAGE_KEY);
        if (id && DIFFICULTY_MODES[id]) return DIFFICULTY_MODES[id];
    } catch (err) { EngineLogger.capture(err, 'DifficultyModes.getDifficulty'); }
    // Fallback: in-memory state (set by setDifficulty in headless mode)
    if (_memoryFallback && DIFFICULTY_MODES[_memoryFallback]) {
        return DIFFICULTY_MODES[_memoryFallback];
    }
    return DIFFICULTY_MODES.normal;
}

export function setDifficulty(modeId) {
    if (!DIFFICULTY_MODES[modeId]) return false;
    _memoryFallback = modeId; // always set in-memory
    try { localStorage.setItem(STORAGE_KEY, modeId); } catch (err) { EngineLogger.capture(err, 'DifficultyModes.setDifficulty'); }
    return true;
}

function _applyDifficultyToValue(rawValue, modifierKey) {
    const diff = getDifficulty();
    const mult = diff.modifiers[modifierKey] ?? 1.0;
    return Math.round(rawValue * mult);
}

// SPEC-147: DDA calibrated boost curve (data: deep soak max win streak 18, max loss 11)
export function calcOpponentBoost(streak) {
    if (streak <= 0) {
        const severity = Math.min(11, Math.abs(streak));
        return 1.0 - (severity / 11) * 0.18; // min 0.82 em streak -11
    }
    const severity = Math.min(18, streak);
    return 1.0 + (severity / 18) * 0.35; // max 1.35 em streak +18
}
