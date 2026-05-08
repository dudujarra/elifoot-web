// SPEC-013: Sponsors System harness
import { describe, test, expect, beforeEach } from 'vitest';
import { SponsorsSystem, SPONSOR_TIERS } from '../../src/engine/systems/SponsorsSystem.js';

describe('SPEC-013: Sponsors System', () => {
    let sponsors;
    beforeEach(() => {
        sponsors = new SponsorsSystem();
    });

    test('5 tiers defined', () => {
        expect(Object.keys(SPONSOR_TIERS).length).toBe(5);
    });

    test('Tier 1 base R$50K', () => {
        expect(SPONSOR_TIERS[1].baseWeek).toBe(50000);
    });

    test('Tier 5 base R$1M', () => {
        expect(SPONSOR_TIERS[5].baseWeek).toBe(1000000);
    });

    test('Tier 5: max 1 contract', () => {
        const c1 = sponsors.signContract({ tier: 5, duration: 52, weekStart: 1 });
        const c2 = sponsors.signContract({ tier: 5, duration: 52, weekStart: 1 });
        expect(c1).not.toBeNull();
        expect(c2).toBeNull();
    });

    test('Duration > 52 rejected', () => {
        const c = sponsors.signContract({ tier: 1, duration: 53, weekStart: 1 });
        expect(c).toBeNull();
    });

    test('Weekly payout = base + bonuses', () => {
        sponsors.signContract({ tier: 2, duration: 52, weekStart: 1 });
        const payouts = sponsors.processWeekly({ wins: 2, champion: false, weekOfYear: 5 });
        expect(payouts[0].weeklyPayout).toBe(100000 + 2 * 10000);
    });

    test('Champion bonus added', () => {
        sponsors.signContract({ tier: 3, duration: 52, weekStart: 1 });
        const payouts = sponsors.processWeekly({ wins: 0, champion: true, weekOfYear: 10 });
        expect(payouts[0].weeklyPayout).toBe(200000 + 80000);
    });

    test('Sponsor expira após duration', () => {
        const c = sponsors.signContract({ tier: 1, duration: 5, weekStart: 1 });
        expect(sponsors.isActive(c.id, 4)).toBe(true);
        sponsors.processWeekly({ weekOfYear: 10 });
        expect(sponsors.isActive(c.id, 10)).toBe(false);
    });
});
