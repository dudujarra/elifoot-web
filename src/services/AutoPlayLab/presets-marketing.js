
export const statsBragPreset = {
    id: 'stats_brag',
    label: 'Stats Brag',
    description: 'Estatísticas marketing-friendly em N saves.',
    category: 'marketing',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 99000 },
    analyze: (results) => {
        const totalGoals = results.reduce((s, r) => s + (r.snapshot?.goalsFor || 0), 0);
        const totalTitles = results.filter(r => (r.snapshot?.finalPosition || 99) === 1).length;
        return {
            totalSaves: results.length,
            totalGoalsScored: totalGoals,
            totalTitlesWon: totalTitles,
            avgGoalsPerSave: Number((totalGoals / results.length).toFixed(2)),
            verdict: `"Em ${results.length} saves: ${totalGoals} gols. ${totalTitles} títulos."`,
        };
    },
};

// ─── F4: Crash Pattern Mining ──────────────────────────────────────────

export const gameplayClipsPreset = {
    id: 'gameplay_clips',
    label: 'Gameplay Clips',
    description: 'Saves com lances cinematograficos (hat-trick, virada, derby).',
    category: 'marketing',
    defaultConfig: { saves: 200, weeks: 38, seedStart: 310000 },
    analyze: (results) => {
        const candidates = results.filter(r => {
            const s = r.snapshot;
            if (!s) return false;
            const wlRatio = s.wins / Math.max(1, s.losses);
            return wlRatio >= 3 || s.rivalryCount >= 4;
        });
        return {
            totalSaves: results.length,
            cinematicSeeds: candidates.slice(0, 10).map(r => r.seed),
        };
    },
};

export const chronicleShowcasePreset = {
    id: 'chronicle_showcase',
    label: 'Chronicle Showcase',
    description: 'Top 10 Chronicles epicos pra blog post / Reddit thread.',
    category: 'marketing',
    defaultConfig: { saves: 100, weeks: 38, seedStart: 320000 },
    analyze: (results) => {
        const titles = results.filter(r => (r.snapshot?.finalPosition || 99) === 1);
        const tragedies = results.filter(r => (r.snapshot?.finalPosition || 0) >= 19);
        return {
            triumphSeeds: titles.slice(0, 5).map(r => ({ seed: r.seed, wins: r.snapshot.wins })),
            tragedySeeds: tragedies.slice(0, 5).map(r => ({ seed: r.seed, losses: r.snapshot.losses })),
        };
    },
};

// ─── Registry ──────────────────────────────────────────────────────────
