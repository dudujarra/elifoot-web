// SPEC-007: Personality & Traits System harness
import { describe, test, expect } from 'vitest';
import { TRAITS, rollTraits, hasTrait, getTraitMatchModifier, getPlayerTraits } from '../../src/engine/PlayerTraits.js';

function makePlayer({ age = 25 } = {}) {
    return { id: 1, name: 'P1', age, traits: null, form: { trend: 'neutral' } };
}

describe('SPEC-007: Personality & Traits System', () => {
    test('15 traits defined', () => {
        expect(TRAITS.length).toBeGreaterThanOrEqual(15);
    });

    test('Each trait has id, name, rarity', () => {
        TRAITS.forEach((trait) => {
            expect(trait.id).toBeDefined();
            expect(trait.name).toBeDefined();
            expect(typeof trait.rarity).toBe('number');
            expect(trait.rarity).toBeGreaterThan(0);
            expect(trait.rarity).toBeLessThan(1);
        });
    });

    test('rollTraits assigns 0-2 traits', () => {
        const player = makePlayer({ age: 25 });
        rollTraits(player);
        expect(Array.isArray(player.traits)).toBe(true);
        expect(player.traits.length).toBeLessThanOrEqual(2);
    });

    test('Young player limited to 1 trait', () => {
        const player = makePlayer({ age: 19 });
        rollTraits(player);
        expect(player.traits.length).toBeLessThanOrEqual(1);
    });

    test('hasTrait checks correctly', () => {
        const player = makePlayer();
        player.traits = ['clutch', 'leader'];
        expect(hasTrait(player, 'clutch')).toBe(true);
        expect(hasTrait(player, 'glass')).toBe(false);
    });

    test('getPlayerTraits returns trait objects', () => {
        const player = makePlayer();
        player.traits = ['clutch'];
        const traits = getPlayerTraits(player);
        expect(traits.length).toBe(1);
        expect(traits[0].id).toBe('clutch');
    });

    test('getTraitMatchModifier returns 1.0 default', () => {
        const player = makePlayer();
        const mod = getTraitMatchModifier(player, 30, 'normal', false);
        expect(mod).toBe(1.0);
    });

    test('Clutch trait boosts performance late', () => {
        const player = makePlayer();
        player.traits = ['clutch'];
        const earlyMod = getTraitMatchModifier(player, 30, 'normal', false);
        const lateMod = getTraitMatchModifier(player, 80, 'normal', false);
        expect(lateMod).toBeGreaterThan(earlyMod);
    });
});
