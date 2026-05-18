import { aggregateStat, extractCrashes, groupCrashesByStack } from './DiffEngine.js';

export const crashFarmPreset = {
    id: 'crash_farm',
    label: 'Crash Farm',
    description: 'Detecta crashes em N saves com seeds variados. Agrupa por stack signature.',
    category: 'quality',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 50000 },
    analyze: (results) => {
        const crashes = extractCrashes(results);
        return {
            totalSaves: results.length,
            crashCount: crashes.length,
            crashRate: results.length ? Number(((crashes.length / results.length) * 100).toFixed(2)) : 0,
            groups: groupCrashesByStack(crashes),
        };
    },
};

// ─── F2: Regression Check ──────────────────────────────────────────────

export const regressionCheckPreset = {
    id: 'regression_check',
    label: 'Regression Check',
    description: 'Compara métricas vs baseline AKITA-288 (20 saves). Detecta drift.',
    category: 'quality',
    defaultConfig: { saves: 20, weeks: 38, seedStart: 1000 },
    baseline: {
        // From AKITA-288
        avgWins: 15.65,
        avgDraws: 6.65,
        avgLosses: 15.70,
        avgFinalPosition: 10.75,
        variance: 32.69,
    },
    analyze: (results, preset) => {
        const wins = aggregateStat(results, 'wins');
        const losses = aggregateStat(results, 'losses');
        const finalPos = aggregateStat(results, 'finalPosition');
        const base = preset.baseline;
        const driftWins = ((wins.avg - base.avgWins) / base.avgWins) * 100;
        const driftLosses = ((losses.avg - base.avgLosses) / base.avgLosses) * 100;
        const driftPos = ((finalPos.avg - base.avgFinalPosition) / base.avgFinalPosition) * 100;
        return {
            wins: { current: wins.avg, baseline: base.avgWins, drift: Number(driftWins.toFixed(2)) },
            losses: { current: losses.avg, baseline: base.avgLosses, drift: Number(driftLosses.toFixed(2)) },
            finalPosition: { current: finalPos.avg, baseline: base.avgFinalPosition, drift: Number(driftPos.toFixed(2)) },
            verdict: Math.abs(driftWins) > 10 || Math.abs(driftLosses) > 10 || Math.abs(driftPos) > 10
                ? 'DRIFT DETECTED'
                : 'BASELINE OK',
        };
    },
};

// ─── F2: NPC AI Tuning ─────────────────────────────────────────────────

export const determinismProofPreset = {
    id: 'determinism_proof',
    label: 'Determinism Proof',
    description: 'Mesma seed × 5 runs. Outputs idênticos?',
    category: 'quality',
    defaultConfig: { saves: 5, weeks: 38, seedStart: 7777 },
    analyze: (results) => {
        const sigs = results.map(r => JSON.stringify({
            w: r.snapshot?.wins, l: r.snapshot?.losses, d: r.snapshot?.draws, pos: r.snapshot?.finalPosition,
        }));
        const unique = new Set(sigs);
        return {
            totalRuns: results.length,
            uniqueSignatures: unique.size,
            deterministic: unique.size === 1,
            verdict: unique.size === 1 ? 'DETERMINISTIC ✓' : `NON-DETERMINISTIC (${unique.size} variants)`,
        };
    },
};

// ─── F3: Win Streak Frequency ──────────────────────────────────────────

export const tournamentValidatorPreset = {
    id: 'tournament_validator',
    label: 'Tournament Validator',
    description: 'Valida formato campeonato — todos times jogam, calendário OK.',
    category: 'quality',
    defaultConfig: { saves: 10, weeks: 38, seedStart: 6000 },
    analyze: (results) => ({
        avgWins: aggregateStat(results, 'wins'),
        avgGames: results.length
            ? Number((results.reduce((s, r) => s + (r.snapshot?.wins || 0) + (r.snapshot?.draws || 0) + (r.snapshot?.losses || 0), 0) / results.length).toFixed(2))
            : 0,
        verdict: 'Total games per save deveria ≥ 38 (Brasileirão). Confirma calendário.',
    }),
};

// ─── F3: Memory Leak Detector ──────────────────────────────────────────

export const memoryLeakPreset = {
    id: 'memory_leak',
    label: 'Memory Leak Detector',
    description: 'Roda 100 saves seguidos, monitora performance.memory (se disponível).',
    category: 'quality',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 8000 },
    analyze: (results) => {
        // Memory tracking requires browser; em test env apenas count
        return {
            totalRuns: results.length,
            avgWeeksCompleted: aggregateStat(results, 'weeksCompleted'),
            verdict: 'Mem monitoring requer ambiente browser (performance.memory). Em vitest = N/A.',
        };
    },
};

// ─── F3: Derby Trigger Rate ────────────────────────────────────────────

export const crashPatternPreset = {
    id: 'crash_pattern_mining',
    label: 'Crash Pattern Mining',
    description: 'Random seeds wide. Agrupa crashes por padrão pra priorizar fixes.',
    category: 'quality',
    defaultConfig: { saves: 500, weeks: 38, seedStart: 100000 },
    analyze: (results) => {
        const crashes = extractCrashes(results);
        return {
            totalSaves: results.length,
            crashCount: crashes.length,
            crashRate: Number(((crashes.length / results.length) * 100).toFixed(2)),
            topPatterns: groupCrashesByStack(crashes).slice(0, 5),
        };
    },
};

// ─── F4: Telemetry Farm ────────────────────────────────────────────────

export const saveRoundtripPreset = {
    id: 'save_roundtrip',
    label: 'Save Roundtrip',
    description: 'Simula save → JSON → restore → continua. Detecta serialization bugs.',
    category: 'quality',
    defaultConfig: { saves: 10, weeks: 19, seedStart: 250000 },
    analyze: (results) => ({
        completedSaves: results.filter(r => !r.crash).length,
        verdict: 'Failure = serializer bug.',
    }),
};
