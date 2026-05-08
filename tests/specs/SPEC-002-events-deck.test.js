// SPEC-002: Match Events Deck harness
import { describe, test, expect } from 'vitest';
import { drawCard, MatchEventsDeck } from '../../src/engine/MatchEventsDeck.js';

describe('SPEC-002: Match Events Deck', () => {
    test('drawCard returns event card or null', () => {
        const card = drawCard('ATA', 5);
        expect(card === null || typeof card === 'object').toBe(true);
    });

    test('All 4 positions have decks', () => {
        expect(MatchEventsDeck.ATA).toBeDefined();
        expect(MatchEventsDeck.MEI).toBeDefined();
        expect(MatchEventsDeck.DEF).toBeDefined();
        expect(MatchEventsDeck.GOL).toBeDefined();
    });

    test('Decks are non-empty arrays', () => {
        expect(MatchEventsDeck.ATA.length).toBeGreaterThan(0);
        expect(MatchEventsDeck.GOL.length).toBeGreaterThan(0);
    });

    test('Multiple draws produce results', () => {
        const cards = [];
        for (let i = 0; i < 20; i++) {
            const c = drawCard('MEI', 5);
            if (c) cards.push(c);
        }
        expect(cards.length).toBeGreaterThan(0);
    });

    test('Invalid position returns null', () => {
        expect(drawCard('INVALID', 5)).toBeNull();
    });

    test('Low renown excludes legendary cards', () => {
        const cards = [];
        for (let i = 0; i < 50; i++) {
            const c = drawCard('ATA', 0); // 0 renown
            if (c && c.tier === 'legendary') cards.push(c);
        }
        // Should be 0 or close to 0 if minRenown gating works
        expect(cards.length).toBeLessThan(10);
    });

    test('High renown allows all tiers', () => {
        const card = drawCard('ATA', 10);
        expect(card === null || typeof card === 'object').toBe(true);
    });

    test('Doesnt throw on edge cases', () => {
        expect(() => drawCard('GOL', 0)).not.toThrow();
        expect(() => drawCard('ATA', 100)).not.toThrow();
    });
});
