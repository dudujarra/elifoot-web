/**
 * SpatialGrid.js
 * Deep Tactical Engine - Part of Phase 1
 * Represents the 5x6 (30 zones) pitch matrix for positional play.
 */

export class SpatialGrid {
    constructor() {
        // 5 lanes (x) by 6 horizontal rows (y)
        // x: 0 = Left Wing, 1 = Left Half-space, 2 = Center, 3 = Right Half-space, 4 = Right Wing
        // y: 0 = Team A Goal line, 5 = Team B Goal line
        this.width = 5;
        this.height = 6;
        
        this.zones = new Array(this.width * this.height).fill(null).map(() => ({
            teamA: [], // Players from Team A in this zone
            teamB: []  // Players from Team B in this zone
        }));

        this.ballPosition = { x: 2, y: 2 }; // Starts in the middle
    }

    /**
     * Converts (x, y) coordinate to 1D index.
     */
    getIndex(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        return y * this.width + x;
    }

    /**
     * Adds a player to a specific zone.
     * @param {Object} player - The player object (must have .id, .role, .effectiveQuality)
     * @param {string} team - 'A' or 'B'
     * @param {number} x - Lane (0 to 4)
     * @param {number} y - Row (0 to 5)
     */
    addPlayerToZone(player, team, x, y) {
        const idx = this.getIndex(x, y);
        if (idx === -1) return;
        
        if (team === 'A') {
            this.zones[idx].teamA.push(player);
        } else {
            this.zones[idx].teamB.push(player);
        }
    }

    /**
     * Clears all players from the grid.
     */
    clearGrid() {
        this.zones.forEach(zone => {
            zone.teamA = [];
            zone.teamB = [];
        });
    }

    /**
     * Moves the ball to a new zone.
     */
    moveBall(x, y) {
        this.ballPosition = {
            x: Math.max(0, Math.min(this.width - 1, x)),
            y: Math.max(0, Math.min(this.height - 1, y))
        };
    }

    /**
     * Calculates the Zone Control for every cell on the pitch.
     * Computes the "Five Superiorities" simplified: Numerical + Qualitative.
     * @param {Object} matchContext - Includes formation multipliers if applicable.
     * @returns {Array} 30-element array of control scores (-1.0 to 1.0, where >0 favors Team A).
     */
    computeZoneControl(matchContext = {}) {
        return this.zones.map((zone, idx) => {
            const countA = zone.teamA.length;
            const countB = zone.teamB.length;

            // 1. Numerical Superiority
            let deltaN = countA - countB;

            // 2. Qualitative Superiority
            let qualA = zone.teamA.reduce((sum, p) => sum + (p.effectiveQuality || 10), 0);
            let qualB = zone.teamB.reduce((sum, p) => sum + (p.effectiveQuality || 10), 0);
            let deltaQ = (countA > 0 ? qualA / countA : 0) - (countB > 0 ? qualB / countB : 0);

            // Combine (Simplified for now: deltaN is heavily weighted)
            // If deltaN is 0, quality decides. If deltaN > 0, it dominates.
            let rawControl = (deltaN * 2.0) + (deltaQ * 0.15);

            // Apply formation multiplier if provided
            if (matchContext.formationMultiplier && matchContext.formationMultiplier[idx]) {
                rawControl *= matchContext.formationMultiplier[idx];
            }

            // Map to a logistic-like output between -1 (B total control) and 1 (A total control)
            return Math.max(-1, Math.min(1, rawControl / 5.0));
        });
    }
}
