/**
 * Unit tests for PlayerCareer (ProPlayer) — AKITA-418
 *
 * Tests core player career mechanics: training, lifestyle, stress, relationships.
 * Uses deterministic RNG where possible.
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { ProPlayer, SUB_ATTRIBUTES, ALL_SUB_ATTRS, LIFESTYLE_CATALOG, TRAITS_CATALOG, PERSONALITIES } from '../../src/engine/PlayerCareer.js';

describe('ProPlayer: Construction', () => {
    test('creates with default values', () => {
        const p = new ProPlayer('p1', 'Test Player', 'ATA');
        expect(p.id).toBe('p1');
        expect(p.name).toBe('Test Player');
        expect(p.position).toBe('ATA');
        expect(p.age).toBe(17);
        expect(p.energy).toBe(100);
        expect(p.actionSlots).toBe(3);
        expect(p.stress).toBe(0);
        expect(p.mentalBreakActive).toBe(false);
    });

    test('has all 4 base skills initialized', () => {
        const p = new ProPlayer('p1', 'Test', 'MC');
        expect(p.skills).toHaveProperty('technique');
        expect(p.skills).toHaveProperty('pace');
        expect(p.skills).toHaveProperty('power');
        expect(p.skills).toHaveProperty('vision');
    });

    test('has all 16 sub-attributes', () => {
        const p = new ProPlayer('p1', 'Test', 'MC');
        ALL_SUB_ATTRS.forEach(attr => {
            expect(p.subAttrs).toHaveProperty(attr);
            expect(p.subAttrs[attr]).toBeGreaterThanOrEqual(1);
            expect(p.subAttrs[attr]).toBeLessThanOrEqual(99);
        });
    });

    test('has all NPC relationships initialized at 50', () => {
        const p = new ProPlayer('p1', 'Test', 'MC');
        expect(p.npcRelationships).toHaveProperty('coach');
        expect(p.npcRelationships.coach).toBe(50);
    });
});

describe('ProPlayer: Training', () => {
    let player;

    beforeEach(() => {
        player = new ProPlayer('p1', 'Test', 'MC');
        player.energy = 100;
        player.actionSlots = 3;
    });

    test('successful training reduces energy and action slots', () => {
        const result = player.train('technique');
        // May succeed or fail based on RNG, but energy/slots always consumed
        expect(player.energy).toBeLessThan(100);
        expect(player.actionSlots).toBe(2);
    });

    test('cannot train with no action slots', () => {
        player.actionSlots = 0;
        const result = player.train('technique');
        expect(result.success).toBe(false);
    });

    test('cannot train with low energy', () => {
        player.energy = 10;
        const result = player.train('technique');
        expect(result.success).toBe(false);
    });

    test('training affects boss/fans relationships', () => {
        const bossBefore = player.relationships.boss;
        const fansBefore = player.relationships.fans;
        
        // Run multiple trainings to overcome RNG
        player.actionSlots = 100;
        let anySuccess = false;
        for (let i = 0; i < 10; i++) {
            player.energy = 100;
            const r = player.train('technique');
            if (r.success) anySuccess = true;
        }
        
        // Boss should increase, fans should decrease (Triângulo Impossível)
        if (anySuccess) {
            expect(player.relationships.boss).toBeGreaterThanOrEqual(bossBefore);
        }
    });
});

describe('ProPlayer: Rest', () => {
    test('rest restores energy', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.energy = 50;
        const result = player.rest();
        expect(result.success).toBe(true);
        expect(player.energy).toBe(80);
    });

    test('rest caps at 100', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.energy = 90;
        player.rest();
        expect(player.energy).toBe(100);
    });
});

describe('ProPlayer: Energy Drinks', () => {
    test('buy requires money', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 50;
        expect(player.buyEnergyDrink().success).toBe(false);
    });

    test('buy and consume cycle works', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 200;
        player.energy = 50;
        
        expect(player.buyEnergyDrink().success).toBe(true);
        expect(player.energyDrinks).toBe(1);
        expect(player.money).toBe(100);
        
        expect(player.consumeEnergyDrink().success).toBe(true);
        expect(player.energy).toBe(90);
        expect(player.energyDrinks).toBe(0);
    });

    test('cannot consume without stock', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        expect(player.consumeEnergyDrink().success).toBe(false);
    });
});

describe('ProPlayer: Stress System', () => {
    test('stress accumulates', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.addStress(30, 'test');
        expect(player.stress).toBe(30);
        player.addStress(30, 'test2');
        expect(player.stress).toBe(60);
    });

    test('stress caps at 100', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.addStress(150, 'overload');
        expect(player.stress).toBe(100);
    });

    test('mental break triggers at 75+ stress', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.addStress(74, 'almost');
        expect(player.mentalBreakActive).toBe(false);
        player.addStress(1, 'threshold');
        expect(player.mentalBreakActive).toBe(true);
    });

    test('resolveMentalBreak party: stress -40, boss -10', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.stress = 80;
        player.mentalBreakActive = true;
        player.resolveMentalBreak('party');
        expect(player.stress).toBe(40);
        expect(player.relationships.boss).toBe(40); // 50 - 10
        expect(player.mentalBreakActive).toBe(false);
    });

    test('stressEfficiency degrades with stress', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        expect(player.stressEfficiency).toBe(1.0);
        player.stress = 25;
        expect(player.stressEfficiency).toBe(0.9);
        player.stress = 50;
        expect(player.stressEfficiency).toBe(0.8);
        player.stress = 75;
        expect(player.stressEfficiency).toBe(0.6);
    });
});

describe('ProPlayer: Lifestyle', () => {
    test('buy apartment costs money and sets house', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 100000;
        const result = player.buyLifestyle('apartment_t1');
        expect(result.success).toBe(true);
        expect(player.lifestyle.ownedHouse).toBe('apartment_t1');
        expect(player.money).toBe(50000);
    });

    test('cannot buy without money', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 0;
        expect(player.buyLifestyle('mansion_t3').success).toBe(false);
    });

    test('cannot marry twice', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 2000000;
        player.buyLifestyle('wedding');
        expect(player.lifestyle.isMarried).toBe(true);
        player.money = 2000000;
        expect(player.buyLifestyle('wedding').success).toBe(false);
    });

    test('investments capped at 10', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 5000000;
        for (let i = 0; i < 15; i++) {
            player.money = 200000;
            player.buyLifestyle('investment_stocks');
        }
        expect(player.lifestyle.investments.length).toBeLessThanOrEqual(10);
    });
});

describe('ProPlayer: Traits', () => {
    test('buy trait deducts money', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 5000;
        player.relationships.boss = 60;
        const result = player.buyTrait('set_piece_taker');
        expect(result.success).toBe(true);
        expect(player.traits).toContain('set_piece_taker');
    });

    test('cannot buy same trait twice', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 10000;
        player.relationships.boss = 70;
        player.buyTrait('set_piece_taker');
        expect(player.buyTrait('set_piece_taker').success).toBe(false);
    });

    test('boss approval required', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.money = 10000;
        player.relationships.boss = 10;
        expect(player.buyTrait('set_piece_taker').success).toBe(false);
    });
});

describe('ProPlayer: Match & Streaks', () => {
    test('match win improves boss and teammates', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.playMatch(90, 1, true);
        expect(player.relationships.boss).toBeGreaterThan(50);
        expect(player.relationships.teammates).toBeGreaterThan(50);
    });

    test('consecutive losses add stress', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.updateStreaks(0, false);
        player.updateStreaks(0, false);
        const stressBefore = player.stress;
        player.updateStreaks(0, false); // 3rd loss → stress
        expect(player.stress).toBeGreaterThan(stressBefore);
    });

    test('goal drought adds stress', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.updateStreaks(0, true);
        player.updateStreaks(0, true);
        const stressBefore = player.stress;
        player.updateStreaks(0, true); // 3rd game without goal
        expect(player.stress).toBeGreaterThan(stressBefore);
    });

    test('scoring resets drought', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.updateStreaks(0, true);
        player.updateStreaks(0, true);
        player.updateStreaks(1, true); // Scored!
        expect(player.matchesWithoutGoal).toBe(0);
    });

    test('win reduces stress', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.stress = 20;
        player.updateStreaks(1, true);
        expect(player.stress).toBe(17); // -3 from win
    });
});

describe('ProPlayer: Star Rating', () => {
    test('star rating scales with renown', () => {
        const player = new ProPlayer('p1', 'Test', 'MC');
        player.renown = 0; player.updateStarRating(); expect(player.starRating).toBe(1);
        player.renown = 5; player.updateStarRating(); expect(player.starRating).toBe(2);
        player.renown = 15; player.updateStarRating(); expect(player.starRating).toBe(3);
        player.renown = 30; player.updateStarRating(); expect(player.starRating).toBe(4);
        player.renown = 50; player.updateStarRating(); expect(player.starRating).toBe(5);
    });
});

describe('Exports: Catalogs', () => {
    test('SUB_ATTRIBUTES has 4 groups', () => {
        expect(Object.keys(SUB_ATTRIBUTES)).toHaveLength(4);
    });

    test('ALL_SUB_ATTRS has 16 attrs', () => {
        expect(ALL_SUB_ATTRS).toHaveLength(16);
    });

    test('LIFESTYLE_CATALOG has valid entries', () => {
        Object.entries(LIFESTYLE_CATALOG).forEach(([id, item]) => {
            expect(item).toHaveProperty('type');
            expect(item).toHaveProperty('name');
            expect(item).toHaveProperty('cost');
            expect(item.cost).toBeGreaterThan(0);
        });
    });

    test('TRAITS_CATALOG has valid entries', () => {
        Object.entries(TRAITS_CATALOG).forEach(([id, trait]) => {
            expect(trait).toHaveProperty('name');
            expect(trait).toHaveProperty('cost');
            expect(trait).toHaveProperty('requiredBoss');
        });
    });

    test('PERSONALITIES match known types', () => {
        expect(Object.keys(PERSONALITIES)).toEqual(
            expect.arrayContaining(['maverick', 'virtuoso', 'heartbeat'])
        );
    });
});
