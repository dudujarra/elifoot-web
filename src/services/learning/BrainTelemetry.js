export class BrainTelemetry {
    static topActions(qTable, limit = 10) {
        const tally = {};
        for (const stateKey of Object.keys(qTable)) {
            for (const actionKey of Object.keys(qTable[stateKey])) {
                tally[actionKey] = (tally[actionKey] || 0) + qTable[stateKey][actionKey];
            }
        }
        return Object.entries(tally)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([action, totalQ]) => ({ action, totalQ }));
    }

    static getSummary(brain) {
        // Count active trace entries
        let traceEntries = 0;
        for (const s of Object.keys(brain.traces || {})) {
            traceEntries += Object.keys(brain.traces[s]).length;
        }
        return {
            states: Object.keys(brain.qTable || {}).length,
            totalUpdates: brain.totalUpdates,
            activeTraces: traceEntries,
            replayBuffer: brain.replayBuffer?.length || 0,
            replayImpactful: (brain.replayBuffer || []).filter(e => Math.abs(e.r) > 3).length, // 3 is REPLAY_REWARD_THRESHOLD
            yoyoCount: brain._yoyoCount,
            divisionHistory: brain.divisionHistory,
            topActions: this.topActions(brain.qTable || {}, 5),
            personality: {
                id: brain.personality?.id,
                label: brain.personality?.label,
                ocean: brain.personality?.ocean,
                traits: brain.personality?.traits
            },
            emotional: brain.emotions?.summary()
        };
    }

    static recordSeasonDivision(brain, division, season) {
        brain.divisionHistory.push({ div: division, season });
        // Keep last 10 seasons
        if (brain.divisionHistory.length > 10) {
            brain.divisionHistory = brain.divisionHistory.slice(-10);
        }

        // Detect yo-yo: division changed direction 3+ times in last 6 seasons
        const recent = brain.divisionHistory.slice(-6);
        let directionChanges = 0;
        for (let i = 2; i < recent.length; i++) {
            const prev = recent[i-1].div - recent[i-2].div;
            const curr = recent[i].div - recent[i-1].div;
            if (prev !== 0 && curr !== 0 && Math.sign(prev) !== Math.sign(curr)) {
                directionChanges++;
            }
        }

        const isYoyo = directionChanges >= 2;
        if (isYoyo) brain._yoyoCount++;

        // Apply escalating penalty: each yo-yo cycle gets punished harder
        // This teaches the agent that stability > oscillation
        const penalty = isYoyo ? -15 * Math.min(5, brain._yoyoCount) : 0;

        return { isYoyo, yoyoCount: brain._yoyoCount, penalty };
    }
}
