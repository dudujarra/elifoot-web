// SPEC-008: Stress & Mental Health System harness
import { describe, test, expect } from 'vitest';
import { ProPlayer, PERSONALITIES, NPCS } from '../../src/engine/PlayerCareer.js';

describe('SPEC-008: Stress & Mental Health', () => {
    test('ProPlayer instantiates', () => {
        const player = new ProPlayer(1, 'Test', 'ATA');
        expect(player.name).toBe('Test');
        expect(player.position).toBe('ATA');
    });

    test('ProPlayer starts at age 17', () => {
        const player = new ProPlayer(1, 'Test', 'ATA');
        expect(player.age).toBe(17);
    });

    test('Default personality is maverick', () => {
        const player = new ProPlayer(1, 'Test', 'ATA');
        expect(player.personality).toBe('maverick');
    });

    test('3 personalities defined', () => {
        expect(PERSONALITIES.maverick).toBeDefined();
        expect(PERSONALITIES.virtuoso).toBeDefined();
        expect(PERSONALITIES.heartbeat).toBeDefined();
    });

    test('Maverick has 2x fans multiplier', () => {
        expect(PERSONALITIES.maverick.fansMultiplier).toBe(2.0);
    });

    test('Virtuoso has +50% train XP', () => {
        expect(PERSONALITIES.virtuoso.trainXPMultiplier).toBe(1.5);
    });

    test('Heartbeat has fans cap', () => {
        expect(PERSONALITIES.heartbeat.fansCap).toBe(3);
    });

    test('NPCs defined with unlock criteria', () => {
        expect(NPCS.length).toBeGreaterThan(0);
        const coach = NPCS.find((n) => n.id === 'coach');
        expect(coach).toBeDefined();
        expect(coach.role).toBe('Técnico');
    });
});
