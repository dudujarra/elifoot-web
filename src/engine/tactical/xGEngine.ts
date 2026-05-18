/**
 * xGEngine.js
 * Deep Tactical Engine - Part of Phase 3
 * Computes Expected Goals (xG) based on field zone and player attributes.
 */

import { rng } from '../rng.js';

function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
}

/**
 * Calculates Expected Goals (xG) for a shot from a specific zone on the 5x6 grid.
 * @param {number} x - Lane (0 to 4), where 2 is center.
 * @param {number} y - Row (0 to 5), where 5 is the opponent's goal line.
 * @param {number} defendersAhead - Number of defenders between the shooter and the goal.
 * @param {Object} shooter - The player taking the shot.
 * @returns {number} xG value between 0 and 1.
 */
export function calculateShotxG(x: number, y: number, defendersAhead: number, shooter: any) {
    // Distance from goal: y=5 is closest.
    // Let's assume each zone is roughly 18 meters long and 13 meters wide.
    const distance_y = (5 - y) * 18 + 9; // distance to goal line in meters
    const distance_x = Math.abs(2 - x) * 13; // horizontal distance from center in meters
    
    const distance_m = Math.sqrt(distance_x * distance_x + distance_y * distance_y);

    // Angle to goal (assuming goal is 7.32m wide at x=2, y=5)
    // Simplified angle calculation in degrees
    const angle_rad = Math.atan2(7.32, distance_m);
    const angle_deg = angle_rad * (180 / Math.PI);

    const finishingZ = ((shooter.finishing || 10) - 10) / 3.0;
    const composureZ = ((shooter.composure || 10) - 10) / 3.0;

    // xG = σ(-3.2 + 0.10 * angle - 0.07 * distance - 0.40 * D_cover + 0.20 * Fin_z + 0.15 * Comp_z)
    const logit = -3.2 + (0.10 * angle_deg) - (0.07 * distance_m) - (0.40 * defendersAhead) + (0.20 * finishingZ) + (0.15 * composureZ);
    
    return sigmoid(logit);
}

/**
 * Resolves a shot attempt based on xG and Goalkeeper quality.
 * @param {number} xG - Expected goals of the shot
 * @param {Object} goalkeeper - The defending goalkeeper
 * @returns {boolean} True if goal, false if saved/missed.
 */
export function resolveShot(xG: number, goalkeeper: any) {
    // Goalkeeper modifier: better GKs reduce the effective xG
    const gkReflexes = (goalkeeper.reflexes || 10);
    const gkPositioning = (goalkeeper.positioning || 10);
    const gkQuality = (gkReflexes * 0.6) + (gkPositioning * 0.4);

    // If GK is exactly average (10), mod is 1.0. 
    // If GK is 20, mod is ~0.5 (halves the xG).
    const gkModifier = 1.0 - ((gkQuality - 10) * 0.05);
    const effectivexG = Math.max(0.01, Math.min(0.99, xG * gkModifier));

    return rng() < effectivexG;
}

/**
 * A highly simplified Expected Threat (xT) grid for moving the ball.
 * Approximates the value of moving the ball from (startX, startY) to (endX, endY).
 */
const BASE_XT_GRID = [
    [0.01, 0.01, 0.01, 0.01, 0.01], // Row 0 (Deep Defense)
    [0.02, 0.02, 0.02, 0.02, 0.02], // Row 1
    [0.03, 0.04, 0.04, 0.04, 0.03], // Row 2
    [0.05, 0.06, 0.07, 0.06, 0.05], // Row 3
    [0.08, 0.11, 0.13, 0.11, 0.08], // Row 4
    [0.12, 0.18, 0.25, 0.18, 0.12]  // Row 5 (Penalty Area)
];

export function getExpectedThreat(x: number, y: number) {
    if (x < 0 || x > 4 || y < 0 || y > 5) return 0;
    return BASE_XT_GRID[y][x];
}

export function evaluatePassValue(startX: number, startY: number, endX: number, endY: number) {
    return getExpectedThreat(endX, endY) - getExpectedThreat(startX, startY);
}
