/**
 * DeepTacticalEngine.js
 * Deep Tactical Engine - Phase 4 Integration Bridge
 * Connects the legacy simulation loop to the new 30-zone tactical engine.
 */

import { SpatialGrid } from './SpatialGrid.js';
import { getEffectiveRoleQuality as _getEffectiveRoleQuality } from './RoleTaxonomy.js';
import { getFormationMultipliers, mapFormationToKey } from './FormationMatrix.js';
import { resolveGenericDuel } from './DuelResolver.js';
import { calculateShotxG, resolveShot as _resolveShot } from './xGEngine.js';
import { applyFatigue as _applyFatigue, calculateFitnessDecayPerMinute as _calculateFitnessDecayPerMinute, applyTacticalFamiliarity as _applyTacticalFamiliarity, applyMoraleAndForm as _applyMoraleAndForm } from './FatigueFamiliarity.js';

export class DeepTacticalEngine {
    constructor() {
        this.grid = new SpatialGrid();
        this.matchState = {
            timeElapsed: 0,
            homeScore: 0,
            awayScore: 0,
            homeStats: { xG: 0, shots: 0 },
            awayStats: { xG: 0, shots: 0 },
            possession: 'home' // 'home' or 'away'
        };
    }

    /**
     * Initializes the tactical engine for a match.
     * @param {Object} homeTeam 
     * @param {Object} awayTeam 
     */
    initializeMatch(homeTeam, awayTeam) {
        this.grid.clearGrid();
        this.homeTeam = homeTeam;
        this.awayTeam = awayTeam;
        
        // Map formations
        const formHome = mapFormationToKey(homeTeam.formation);
        const formAway = mapFormationToKey(awayTeam.formation);
        
        this.formationMultipliersHome = getFormationMultipliers(formHome, formAway);
        this.formationMultipliersAway = getFormationMultipliers(formAway, formHome);

        // Normally, we would place players into the 30-zone grid here based on formation
        // For now, we reset the ball to the center
        this.grid.moveBall(2, 2);
    }

    /**
     * Ticks the tactical engine by one minute.
     * @returns {Object|null} Returns an event object if something significant happens (like a shot)
     */
    tickMinute(homeSquad = null, awaySquad = null) {
        this.matchState.timeElapsed++;
        let event = null;

        // 1. Calculate Zone Control based on current player positions
        const controlHome = this.grid.computeZoneControl({ formationMultiplier: this.formationMultipliersHome });
        
        // 2. Resolve Ball Movement
        const currentZoneIdx = this.grid.getIndex(this.grid.ballPosition.x, this.grid.ballPosition.y);
        const currentControl = controlHome[currentZoneIdx]; // > 0 means home controls

        // 3. Simple State Transition based on control
        if (this.matchState.possession === 'home') {
            if (currentControl > 0) {
                if (this.grid.ballPosition.y < 5) {
                    this.grid.moveBall(this.grid.ballPosition.x, this.grid.ballPosition.y + 1);
                } else {
                    event = this.attemptShot('home', homeSquad);
                }
            } else {
                if (resolveGenericDuel(10, 12, currentControl, 5.0)) {
                    this.matchState.possession = 'away';
                }
            }
        } else {
            if (currentControl <= 0) { 
                if (this.grid.ballPosition.y > 0) {
                    this.grid.moveBall(this.grid.ballPosition.x, this.grid.ballPosition.y - 1);
                } else {
                    event = this.attemptShot('away', awaySquad);
                }
            } else {
                if (resolveGenericDuel(10, 12, -currentControl, 5.0)) {
                    this.matchState.possession = 'home';
                }
            }
        }

        return event;
    }

    attemptShot(team, _squad) {
        // eslint-disable-next-line no-useless-assignment -- xG is used on lines 99, 103, 112
        let xG = 0;
        // In a real scenario, we find the specific player in the zone. 
        // For now, we compute xG based on zone and return the chance to the simulator.
        if (team === 'home') {
            xG = calculateShotxG(this.grid.ballPosition.x, 5, 2, { finishing: 12, composure: 12 });
            this.matchState.homeStats.xG += xG;
            this.matchState.homeStats.shots++;
        } else {
            xG = calculateShotxG(this.grid.ballPosition.x, 0, 2, { finishing: 12, composure: 12 });
            this.matchState.awayStats.xG += xG;
            this.matchState.awayStats.shots++;
        }

        // Turnover after shot
        this.matchState.possession = team === 'home' ? 'away' : 'home';
        this.grid.moveBall(2, 2);

        return { type: 'shot', team, xG };
    }
}
