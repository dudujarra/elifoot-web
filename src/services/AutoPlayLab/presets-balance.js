import { aggregateStat } from './DiffEngine.js';

export const balanceWinRatePreset = {
    id: 'balance_winrate',
    label: 'Balance Win-Rate',
    description: 'Distribuição de wins/draws/losses em N saves (compare com baseline)',
    category: 'balance',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 1000 },
    analyze: (results) => ({
        wins: aggregateStat(results, 'wins'),
        draws: aggregateStat(results, 'draws'),
        losses: aggregateStat(results, 'losses'),
        finalPosition: aggregateStat(results, 'finalPosition'),
        avgGoalsFor: aggregateStat(results, 'goalsFor'),
        avgGoalsAgainst: aggregateStat(results, 'goalsAgainst'),
    }),
};

// ─── F2: Crash Farm ────────────────────────────────────────────────────

export const winStreakFreqPreset = {
    id: 'win_streak_freq',
    label: 'Win Streak Frequency',
    description: 'Hipótese H1 SPEC-180: % saves hit ≥5W (strong) e ≥7W (phenom).',
    category: 'balance',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 4000 },
    analyze: (results) => {
        const maxStreaks = results.map(r => {
            const history = r.streakHistory || [];
            return Math.max(...history.map(h => h.currentWinStreak || 0), 0);
        });
        const withMild = maxStreaks.filter(s => s >= 3).length;
        const withStrong = maxStreaks.filter(s => s >= 5).length;
        const withPhenom = maxStreaks.filter(s => s >= 7).length;
        return {
            totalSaves: results.length,
            mildRate: Number(((withMild / results.length) * 100).toFixed(2)),
            strongRate: Number(((withStrong / results.length) * 100).toFixed(2)),
            phenomRate: Number(((withPhenom / results.length) * 100).toFixed(2)),
            maxOverall: Math.max(...maxStreaks, 0),
        };
    },
};

// ─── F3: Economy Curve ─────────────────────────────────────────────────

export const economyCurvePreset = {
    id: 'economy_curve',
    label: 'Economy Curve',
    description: 'Balance final após N saves. Inflação ou inanição?',
    category: 'balance',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 5000 },
    analyze: (results) => ({
        balance: aggregateStat(results, 'balance'),
        bankruptCount: results.filter(r => (r.snapshot?.balance || 0) <= 0).length,
        verdict: results.filter(r => (r.snapshot?.balance || 0) <= 0).length > 0
            ? `${results.filter(r => (r.snapshot?.balance || 0) <= 0).length} saves bancarrota`
            : 'Sem bancarrotas',
    }),
};

// ─── F3: Tournament Validator ──────────────────────────────────────────

export const squadHealthPreset = {
    id: 'squad_health',
    label: 'Squad Health',
    description: 'Lesões médias por save. InjurySystem balanceado?',
    category: 'balance',
    defaultConfig: { saves: 30, weeks: 38, seedStart: 11000 },
    analyze: (results) => ({
        avgInjured: aggregateStat(results, 'injuredCount'),
        avgSquadSize: aggregateStat(results, 'squadSize'),
        avgOvr: aggregateStat(results, 'avgOvr'),
    }),
};

// ─── F3: Board Tension Curve ───────────────────────────────────────────

export const boardTensionCurvePreset = {
    id: 'board_tension_curve',
    label: 'Board Tension Curve',
    description: 'Distribuição final de tensão de diretoria.',
    category: 'balance',
    defaultConfig: { saves: 30, weeks: 38, seedStart: 12000 },
    analyze: (results) => ({
        tension: aggregateStat(results, 'boardTension'),
        firedCount: results.filter(r => (r.snapshot?.boardTension || 50) <= 10).length,
    }),
};

// ─── F4: Seed Search ───────────────────────────────────────────────────

export const cardDrawDistPreset = {
    id: 'card_draw_dist',
    label: 'Card Draw Distribution',
    description: 'Distribuição real de tiers (comum/raro/lendário). Detecta RNG vies.',
    category: 'balance',
    defaultConfig: { saves: 50, weeks: 38, seedStart: 260000 },
    analyze: (results) => ({
        totalSaves: results.length,
        verdict: 'Requer instrumentation drawCard tier counts.',
    }),
};

export const tacticCounterMatrixPreset = {
    id: 'tactic_counter_matrix',
    label: 'Tactic Counter Matrix',
    description: 'Posse vs Pressing → real win-rate? Constroi matrix counter.',
    category: 'balance',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 270000 },
    analyze: (results) => ({
        avgWins: aggregateStat(results, 'wins'),
        verdict: 'Matrix completa requer per-match tactic logging.',
    }),
};

export const formModifierPreset = {
    id: 'form_modifier',
    label: 'Form Modifier',
    description: 'Player com form "good" rende +X%? Valida getFormModifier.',
    category: 'balance',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 280000 },
    analyze: (results) => ({
        avgGoalsFor: aggregateStat(results, 'goalsFor'),
        avgGoalsAgainst: aggregateStat(results, 'goalsAgainst'),
        verdict: 'Correlate form trend × goals via deep capture.',
    }),
};
