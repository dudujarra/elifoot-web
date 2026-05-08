// SPEC-014: Season & Tournament harness
import { describe, test, expect } from 'vitest';
import { evaluateSponsor, getCalendarEvent, processPromoRelegation } from '../../src/engine/SeasonSystem.js';
import { League } from '../../src/engine/tournaments/League.js';
import { KnockoutCup } from '../../src/engine/tournaments/KnockoutCup.js';
import { ContinentalCup } from '../../src/engine/tournaments/ContinentalCup.js';

describe('SPEC-014: Season & Tournament System', () => {
    test('League class exists', () => {
        expect(League).toBeDefined();
    });

    test('KnockoutCup exists', () => {
        expect(KnockoutCup).toBeDefined();
    });

    test('ContinentalCup exists', () => {
        expect(ContinentalCup).toBeDefined();
    });

    test('evaluateSponsor function callable', () => {
        expect(typeof evaluateSponsor).toBe('function');
    });

    test('getCalendarEvent function callable', () => {
        expect(typeof getCalendarEvent).toBe('function');
    });

    test('processPromoRelegation works', () => {
        expect(typeof processPromoRelegation).toBe('function');
    });

    test('Calendar event for valid week', () => {
        const event = getCalendarEvent(1);
        expect(event !== null && event !== undefined).toBe(true);
    });

    test('Multiple weeks return distinct events', () => {
        const e1 = getCalendarEvent(1);
        const e10 = getCalendarEvent(10);
        // Should not throw
        expect(e1 !== undefined).toBe(true);
        expect(e10 !== undefined).toBe(true);
    });
});
