import { aggregateStat } from './DiffEngine.js';

export const seedSearchPreset = {
    id: 'seed_search',
    label: 'Seed Search',
    description: 'Encontra seeds com critério específico (ex: rebaixou em ano 1).',
    category: 'discovery',
    defaultConfig: { saves: 200, weeks: 38, seedStart: 20000 },
    analyze: (results) => {
        const relegated = results.filter(r => (r.snapshot?.finalPosition || 0) >= 17);
        const titles = results.filter(r => (r.snapshot?.finalPosition || 99) === 1);
        return {
            totalSaves: results.length,
            relegatedSeeds: relegated.slice(0, 10).map(r => r.seed),
            titleSeeds: titles.slice(0, 10).map(r => r.seed),
        };
    },
};

// ─── F4: Edge Case Generator ───────────────────────────────────────────

export const edgeCaseGenPreset = {
    id: 'edge_case_gen',
    label: 'Edge Case Generator',
    description: 'Identifica saves com outcomes extremos (>30W, 30L, 5+ rivalrias).',
    category: 'discovery',
    defaultConfig: { saves: 200, weeks: 38, seedStart: 30000 },
    analyze: (results) => ({
        bigWinners: results.filter(r => (r.snapshot?.wins || 0) >= 30).map(r => ({ seed: r.seed, wins: r.snapshot.wins })),
        bigLosers: results.filter(r => (r.snapshot?.losses || 0) >= 30).map(r => ({ seed: r.seed, losses: r.snapshot.losses })),
        manyRivals: results.filter(r => (r.snapshot?.rivalryCount || 0) >= 5).map(r => ({ seed: r.seed, count: r.snapshot.rivalryCount })),
    }),
};

// ─── F4: Speedrun Discovery ────────────────────────────────────────────

export const speedrunDiscoveryPreset = {
    id: 'speedrun_discovery',
    label: 'Speedrun Discovery',
    description: 'Saves que ganham título em 1ª temporada — speedrun seeds.',
    category: 'discovery',
    defaultConfig: { saves: 500, weeks: 38, seedStart: 40000 },
    analyze: (results) => {
        const champs = results.filter(r => (r.snapshot?.finalPosition || 99) === 1);
        return {
            totalSaves: results.length,
            championRate: Number(((champs.length / results.length) * 100).toFixed(2)),
            topSeeds: champs.slice(0, 20).map(r => ({
                seed: r.seed,
                wins: r.snapshot.wins,
                goalsFor: r.snapshot.goalsFor,
            })),
        };
    },
};

// ─── F4: Star Adoption Impact ──────────────────────────────────────────

export const titleRoutesPreset = {
    id: 'title_routes',
    label: 'Title Routes',
    description: 'Padrões em saves campeões (wins, GF, GA).',
    category: 'discovery',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 90000 },
    analyze: (results) => {
        const champs = results.filter(r => (r.snapshot?.finalPosition || 99) === 1);
        return {
            totalSaves: results.length,
            championCount: champs.length,
            championAvgWins: aggregateStat(champs, 'wins'),
            championAvgGF: aggregateStat(champs, 'goalsFor'),
            championAvgGA: aggregateStat(champs, 'goalsAgainst'),
        };
    },
};

// ─── F4: Stats Brag ────────────────────────────────────────────────────

export const replaySharingPreset = {
    id: 'replay_sharing',
    label: 'Replay Sharing',
    description: 'Captura seeds notaveis (championship, vexame, derby drama).',
    category: 'discovery',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 240000 },
    analyze: (results) => ({
        memorableSeeds: results.filter(r => {
            const s = r.snapshot;
            if (!s) return false;
            return s.finalPosition === 1 || s.finalPosition >= 19 || s.rivalryCount >= 3;
        }).slice(0, 10).map(r => ({ seed: r.seed, pos: r.snapshot.finalPosition, rivals: r.snapshot.rivalryCount })),
    }),
};
