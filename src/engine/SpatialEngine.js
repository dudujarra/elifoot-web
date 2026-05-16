/**
 * SpatialEngine.js
 * 
 * Deep Tactical Engine - Spatial Simulation Module.
 * Based on Ecological Dynamics and the 30-zone pitch grid.
 * 
 * CORE METRICS:
 * - Centroid: The mean position of the team on the field.
 * - Stretch Index: The spatial dispersion (compactness) of the team.
 * - PPDA: Passes allowed Per Defensive Action (pressing intensity).
 * - Counterpressing: Reaction time to ball loss in seconds.
 */

export class SpatialEngine {
    constructor() {
        this.ZONES = 30; // 5 lanes x 6 horizontal strips
        this.PITCH_LENGTH = 105; // meters
        this.PITCH_WIDTH = 68; // meters
    }

    /**
     * Extracts aggregate physical/mental/technical stats relevant to spatial control
     */
    extractTeamSpatialProfile(teamSquad) {
        if (!teamSquad || teamSquad.length === 0) return null;
        
        const titulars = teamSquad.filter(p => p.isTitular);
        if (titulars.length === 0) return null;

        const sumAttr = (category, attr) => titulars.reduce((sum, p) => sum + (p.attributes?.[category]?.[attr] || 10), 0) / titulars.length;

        return {
            stamina: sumAttr('physical', 'stamina'),
            positioning: sumAttr('mental', 'positioning'),
            workRate: sumAttr('mental', 'workRate'),
            aggression: sumAttr('mental', 'aggression'),
            anticipation: sumAttr('mental', 'anticipation'),
            acceleration: sumAttr('physical', 'acceleration'),
            vision: sumAttr('mental', 'vision'),
            composure: sumAttr('mental', 'composure'),
            tackling: sumAttr('technical', 'tackling'),
            passing: sumAttr('technical', 'passing')
        };
    }

    /**
     * Calculate Team Centroid (0.0 to 1.0)
     * 0.0 = Deep in own box (Bus parked)
     * 1.0 = High press on opponent box
     */
    calculateCentroid(tacticId, profile) {
        if (!profile) return 0.5;

        // Base centroid derived from tactic
        let base = 0.5;
        if (tacticId === 'ataque') base = 0.7;
        else if (tacticId === 'retranca') base = 0.3;
        else if (tacticId === 'posse') base = 0.6;
        else if (tacticId === 'counter') base = 0.4;

        // Modifiers: Teams with high work rate and anticipation can push the centroid slightly higher when attacking
        const pushModifier = ((profile.workRate + profile.anticipation) / 40) * 0.1; 
        
        return Math.max(0.1, Math.min(0.9, base + (tacticId === 'ataque' || tacticId === 'posse' ? pushModifier : -pushModifier)));
    }

    /**
     * Calculate Stretch Index (meters). 
     * Ideal compactness is < 25m. High stretch (>40m) leaves huge gaps.
     */
    calculateStretchIndex(tacticId, profile) {
        if (!profile) return 35; // default average

        // A highly positional and stamina-heavy team stays compact
        // Max positioning + stamina (20+20 = 40). 
        const compactnessScore = (profile.positioning * 1.5) + profile.stamina;
        // The higher the score, the lower the stretch index
        let stretch = 45 - (compactnessScore / 2); // 45 - 20 = 25m (very compact)

        if (tacticId === 'ataque') stretch += 5; // Attacking stretches the team inherently
        if (tacticId === 'retranca') stretch -= 5; // Parking the bus compresses the team

        return Math.max(15, Math.min(50, stretch));
    }

    /**
     * Calculate PPDA (Passes Allowed Per Defensive Action)
     * Lower is more aggressive pressing. Bielsa/Klopp teams ~ 8.0. Low blocks ~ 18.0.
     */
    calculatePPDA(tacticId, profile) {
        if (!profile) return 15;

        let basePPDA = 15;
        if (tacticId === 'ataque' || tacticId === 'posse') basePPDA = 10;
        if (tacticId === 'retranca') basePPDA = 20;

        // Pressing relies heavily on WorkRate, Aggression, and Tackling
        const pressingScore = (profile.workRate + profile.aggression + profile.tackling) / 3; // Max 20
        // If pressingScore is 20, subtract 5 PPDA. If 10, subtract 0.
        const pressingReduction = (pressingScore - 10) / 2;

        return Math.max(6.0, Math.min(25.0, basePPDA - pressingReduction));
    }

    /**
     * Calculate Gegenpressing reaction time (seconds)
     * How quickly the team swarms after losing the ball.
     */
    calculateCounterpressingTime(profile) {
        if (!profile) return 10.0;

        // Reaction based on Anticipation and Acceleration
        const reactionScore = (profile.anticipation * 1.5) + profile.acceleration; // Max 50
        // Best teams react in ~4 seconds. Average in 8-10.
        return Math.max(3.0, 12.0 - (reactionScore / 6));
    }

    /**
     * Derive Spatial xG Multipliers for a Match
     * Returns how the spatial dynamics buff/nerf the traditional sector-based xG.
     */
    calculateSpatialMatchModifiers(homeTactic, homeSquad, awayTactic, awaySquad) {
        const homeProfile = this.extractTeamSpatialProfile(homeSquad);
        const awayProfile = this.extractTeamSpatialProfile(awaySquad);

        if (!homeProfile || !awayProfile) {
            return { homeXgMod: 1.0, awayXgMod: 1.0, logs: [] };
        }

        const homeStretch = this.calculateStretchIndex(homeTactic, homeProfile);
        const awayStretch = this.calculateStretchIndex(awayTactic, awayProfile);

        const homePPDA = this.calculatePPDA(homeTactic, homeProfile);
        const awayPPDA = this.calculatePPDA(awayTactic, awayProfile);

        let homeXgMod = 1.0;
        let awayXgMod = 1.0;
        const logs = [];

        // Stretch Index interaction: High stretch vs Compact
        // If Away team is very stretched (>35m) and Home is compact (<25m), Home exploits gaps.
        if (awayStretch > 35 && homeProfile.passing > 14 && homeProfile.vision > 14) {
            homeXgMod += 0.15;
            logs.push("Visitantes cederam muito espaço entrelinhas (Stretch Index alto). O time da casa explora as brechas com passes precisos.");
        }
        if (homeStretch > 35 && awayProfile.passing > 14 && awayProfile.vision > 14) {
            awayXgMod += 0.15;
            logs.push("Mandantes muito espaçados em campo (Stretch Index). Visitantes encontram avenidas para atacar.");
        }

        // PPDA interaction: High press vs Composure
        // If Home presses intensely (PPDA < 9) and Away lacks composure/passing, Away makes mistakes leading to Home xG.
        if (homePPDA < 9.0) {
            if (awayProfile.composure < 13 || awayProfile.passing < 13) {
                homeXgMod += 0.20;
                logs.push("Pressão alta avassaladora (Baixo PPDA) do time da casa forçou muitos erros na saída de bola visitante.");
            } else {
                // Away team is composed, they break the press
                awayXgMod += 0.10;
                logs.push("Time visitante mostrou frieza (Alta Composure) e quebrou a linha de pressão alta do mandante, criando chances claras.");
            }
        }

        if (awayPPDA < 9.0) {
            if (homeProfile.composure < 13 || homeProfile.passing < 13) {
                awayXgMod += 0.20;
                logs.push("Marcação asfixiante (Baixo PPDA) dos visitantes causou pânico na defesa mandante.");
            } else {
                homeXgMod += 0.10;
                logs.push("Mandantes trocaram passes curtos e envolveram a marcação alta (Baixo PPDA) do adversário.");
            }
        }

        return { 
            homeXgMod, 
            awayXgMod, 
            spatialData: { homeStretch, awayStretch, homePPDA, awayPPDA },
            logs 
        };
    }

    /**
     * Calculate Transient Fatigue (Bradley 2009)
     * High Intensity Running (HIR) drops in the last 15 minutes.
     * Wingers (ATA/MEI) suffer a sharper drop if Stamina is low.
     */
    getTransientFatigueModifier(player, minute) {
        if (!player || !player.attributes) return 1.0;
        
        // Fatigue only really hits hard after 75 mins
        if (minute < 75) return 1.0;

        const stamina = player.attributes.physical?.stamina || 10;
        const naturalFitness = player.attributes.physical?.naturalFitness || 10;

        // Base fatigue: 1.0 at 75 mins, down to 0.7 at 90 mins for an average player
        // Stamina mitigates this. If stamina = 20, no drop.
        const staminaMitigation = (stamina + naturalFitness) / 40; // Max 1.0
        
        let fatigueDrop = ((minute - 75) / 15) * 0.3 * (1 - staminaMitigation);

        // Position specific
        if (player.position === 'ATA' || player.position === 'MEI') {
            fatigueDrop *= 1.2; // Wingers run more HIR
        } else if (player.position === 'DEF') {
            fatigueDrop *= 0.8;
        } else if (player.position === 'GOL') {
            fatigueDrop = 0; // GKs don't get HIR fatigue
        }

        return Math.max(0.4, 1.0 - fatigueDrop);
    }

    /**
     * Calculate Cognitive "Quiet Eye" Modifier
     * High pressure moments (e.g. late game chances) need Composure and Decisions.
     */
    getCognitiveModifier(player, minute, isDerby) {
        if (!player || !player.attributes) return 1.0;

        // Pressure increases late in the game or in derbies
        const isHighPressure = minute > 80 || isDerby;
        if (!isHighPressure) return 1.0;

        const composure = player.attributes.mental?.composure || 10;
        const decisions = player.attributes.mental?.decisions || 10;

        // Score 0 to 40. > 30 is clutch. < 15 is choke.
        const cognitiveScore = composure + decisions;

        if (cognitiveScore >= 30) return 1.15; // Clutch player
        if (cognitiveScore <= 15) return 0.85; // Chokes under pressure

        return 1.0;
    }
}

export const spatialEngine = new SpatialEngine();
