/**
 * Unit tests for MarketPricer — AKITA-418
 *
 * Tests pure pricing functions in isolation.
 * No engine, no React, no mocks.
 */
import { describe, test, expect } from 'vitest';
import { calcMarketValue, makeOffer } from '../../src/engine/MarketPricer.js';

describe('MarketPricer: calcMarketValue', () => {
    test('minimum value floor is 50k (pre age multiplier)', () => {
        // baseValue floors at 200k for low OVR, then age multiplier applies
        // Result: 200k * 0.4 (age 35) = 80k, but final floor is 50k
        const val = calcMarketValue({ playerOvr: 10, playerAge: 35 });
        expect(val).toBeGreaterThanOrEqual(50000);
        expect(val).toBeLessThan(200000);
    });

    test('OVR 60 player aged 25 has reasonable value', () => {
        const val = calcMarketValue({ playerOvr: 60, playerAge: 25 });
        expect(val).toBeGreaterThan(500_000);
        expect(val).toBeLessThan(5_000_000);
    });

    test('OVR 80 player is worth much more than OVR 60', () => {
        const val60 = calcMarketValue({ playerOvr: 60, playerAge: 25 });
        const val80 = calcMarketValue({ playerOvr: 80, playerAge: 25 });
        expect(val80).toBeGreaterThan(val60 * 5); // Exponential pricing
    });

    test('OVR 90+ is capped at 200M', () => {
        const val = calcMarketValue({ playerOvr: 99, playerAge: 25 });
        expect(val).toBeLessThanOrEqual(200_000_000);
    });

    test('young player (<23) gets age premium', () => {
        const young = calcMarketValue({ playerOvr: 70, playerAge: 20 });
        const prime = calcMarketValue({ playerOvr: 70, playerAge: 26 });
        expect(young).toBeGreaterThan(prime); // 1.4x vs 1.0x
    });

    test('old player (>32) gets age penalty', () => {
        const prime = calcMarketValue({ playerOvr: 70, playerAge: 26 });
        const old = calcMarketValue({ playerOvr: 70, playerAge: 34 });
        expect(old).toBeLessThan(prime * 0.5); // 0.4x multiplier
    });

    test('short contract reduces value', () => {
        const fullContract = calcMarketValue({ playerOvr: 70, playerAge: 25, playerContract: 52 });
        const shortContract = calcMarketValue({ playerOvr: 70, playerAge: 25, playerContract: 10 });
        expect(shortContract).toBeLessThan(fullContract);
        expect(shortContract).toBeCloseTo(fullContract * 0.5, -4);
    });

    test('high potential premium for young player', () => {
        const lowPot = calcMarketValue({ playerOvr: 65, playerAge: 20, playerPotential: 65 });
        const highPot = calcMarketValue({ playerOvr: 65, playerAge: 20, playerPotential: 85 });
        expect(highPot).toBeGreaterThan(lowPot * 1.5);
    });

    test('potential premium diminishes with age', () => {
        const youngGap = calcMarketValue({ playerOvr: 65, playerAge: 20, playerPotential: 85 }) /
                          calcMarketValue({ playerOvr: 65, playerAge: 20, playerPotential: 65 });
        const oldGap = calcMarketValue({ playerOvr: 65, playerAge: 30, playerPotential: 85 }) /
                        calcMarketValue({ playerOvr: 65, playerAge: 30, playerPotential: 65 });
        expect(youngGap).toBeGreaterThan(oldGap);
    });

    test('positive form increases value', () => {
        const neutral = calcMarketValue({ playerOvr: 70, playerAge: 25, playerForm: 0 });
        const hot = calcMarketValue({ playerOvr: 70, playerAge: 25, playerForm: 5 });
        expect(hot).toBeGreaterThan(neutral);
    });
});

describe('MarketPricer: makeOffer', () => {
    test('returns all required fields', () => {
        const result = makeOffer({ playerOvr: 70, playerAge: 25, seed: 42 });
        expect(result).toHaveProperty('offerPrice');
        expect(result).toHaveProperty('marketValue');
        expect(result).toHaveProperty('spread');
        expect(result).toHaveProperty('accepted');
        expect(result).toHaveProperty('counterOffer');
    });

    test('seed produces deterministic results', () => {
        const a = makeOffer({ playerOvr: 70, playerAge: 25, seed: 42 });
        const b = makeOffer({ playerOvr: 70, playerAge: 25, seed: 42 });
        expect(a.offerPrice).toBe(b.offerPrice);
        expect(a.spread).toBe(b.spread);
        expect(a.accepted).toBe(b.accepted);
    });

    test('different seeds produce different offers', () => {
        const a = makeOffer({ playerOvr: 70, playerAge: 25, seed: 42 });
        const b = makeOffer({ playerOvr: 70, playerAge: 25, seed: 999 });
        // May be same by coincidence, but spread should differ
        expect(a.spread).not.toBe(b.spread);
    });

    test('high need produces higher spreads (closer to market value)', () => {
        // Run with same seed to isolate need effect
        const high = makeOffer({ playerOvr: 70, playerAge: 25, need: 'high', seed: 100 });
        const low = makeOffer({ playerOvr: 70, playerAge: 25, need: 'low', seed: 100 });
        expect(high.spread).toBeGreaterThan(low.spread);
    });

    test('forced selling has lower acceptance threshold than reluctant', () => {
        // With low need (spread 0.50-0.70), forced threshold (0.60) should accept more
        // than reluctant threshold (1.05) — reluctant always rejects low-need offers
        const reluctant = makeOffer({ playerOvr: 70, playerAge: 25, need: 'low', sellingWillingness: 'reluctant', seed: 42 });
        expect(reluctant.accepted).toBe(false); // Low spread never meets 1.05 threshold
        
        // High need + forced should almost always accept
        const forced = makeOffer({ playerOvr: 70, playerAge: 25, need: 'high', sellingWillingness: 'forced', seed: 42 });
        expect(forced.accepted).toBe(true); // High spread (0.90-1.10) always meets 0.60 threshold
    });

    test('rejected offers include counter-offer', () => {
        // Use very low need to likely get rejected
        const result = makeOffer({ playerOvr: 70, playerAge: 25, need: 'low', sellingWillingness: 'reluctant', seed: 42 });
        if (!result.accepted) {
            expect(result.counterOffer).not.toBeNull();
            expect(result.counterOffer).toBeGreaterThan(result.offerPrice);
        }
    });

    test('offer price is always positive', () => {
        for (let ovr = 40; ovr <= 95; ovr += 5) {
            const result = makeOffer({ playerOvr: ovr, playerAge: 25, seed: ovr });
            expect(result.offerPrice).toBeGreaterThan(0);
        }
    });
});
