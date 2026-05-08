// SPEC-012: Scouting System harness
import { describe, test, expect } from 'vitest';
import { SCOUT_REGIONS, scoutRegion } from '../../src/engine/StadiumSystem.js';
import { Data } from '../../src/engine/data.js';

describe('SPEC-012: Scouting System', () => {
    test('5 regions defined', () => {
        expect(SCOUT_REGIONS.length).toBe(5);
    });

    test('Brasil is free', () => {
        const brazil = SCOUT_REGIONS.find((r) => r.id === 'brazil');
        expect(brazil.cost).toBe(0);
    });

    test('Europa Tier 1 (most expensive)', () => {
        const europa = SCOUT_REGIONS.find((r) => r.id === 'europe');
        expect(europa.tier).toBe(1);
        expect(europa.cost).toBeGreaterThan(0);
    });

    test('Without scout: 2 players', () => {
        const result = scoutRegion('brazil', false, Data);
        expect(result.players.length).toBe(2);
    });

    test('With scout: 5 players', () => {
        const result = scoutRegion('brazil', true, Data);
        expect(result.players.length).toBe(5);
    });

    test('Without scout: OVR hidden', () => {
        const result = scoutRegion('brazil', false, Data);
        for (const p of result.players) {
            expect(p.ovr).toBe('??');
        }
    });

    test('With scout: OVR visible', () => {
        const result = scoutRegion('brazil', true, Data);
        for (const p of result.players) {
            expect(typeof p.ovr).toBe('number');
        }
    });

    test('Invalid region returns no players', () => {
        const result = scoutRegion('invalid', false, Data);
        expect(result.success).toBe(false);
        expect(result.players.length).toBe(0);
    });
});
