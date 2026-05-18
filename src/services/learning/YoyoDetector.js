export class YoyoDetector {
    constructor() {
        this.divisionHistory = [];
        this._yoyoCount = 0;
    }

    restore(parsedHistory, parsedCount) {
        if (Array.isArray(parsedHistory)) this.divisionHistory = parsedHistory;
        if (typeof parsedCount === 'number') this._yoyoCount = parsedCount;
    }

    serialize() {
        return {
            divisionHistory: this.divisionHistory,
            yoyoCount: this._yoyoCount
        };
    }

    reset() {
        this.divisionHistory = [];
        this._yoyoCount = 0;
    }

    get count() {
        return this._yoyoCount;
    }

    get history() {
        return this.divisionHistory;
    }

    /**
     * Record season-end division for yo-yo detection.
     * Call at season boundary (after promo/relegation resolves).
     *
     * @param {number} division — current division after promo/releg
     * @param {number} season — season number
     * @returns {{ isYoyo: boolean, yoyoCount: number, penalty: number }}
     */
    recordSeasonDivision(division, season) {
        this.divisionHistory.push({ div: division, season });
        // Keep last 10 seasons
        if (this.divisionHistory.length > 10) {
            this.divisionHistory = this.divisionHistory.slice(-10);
        }

        // Detect yo-yo: division changed direction 3+ times in last 6 seasons
        const recent = this.divisionHistory.slice(-6);
        let directionChanges = 0;
        for (let i = 2; i < recent.length; i++) {
            const prev = recent[i-1].div - recent[i-2].div;
            const curr = recent[i].div - recent[i-1].div;
            if (prev !== 0 && curr !== 0 && Math.sign(prev) !== Math.sign(curr)) {
                directionChanges++;
            }
        }

        const isYoyo = directionChanges >= 2;
        if (isYoyo) this._yoyoCount++;

        // Apply escalating penalty: each yo-yo cycle gets punished harder
        // This teaches the agent that stability > oscillation
        const penalty = isYoyo ? -15 * Math.min(5, this._yoyoCount) : 0;

        return { isYoyo, yoyoCount: this._yoyoCount, penalty };
    }
}
