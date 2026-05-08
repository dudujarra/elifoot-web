// SPEC-015: Market & Transfer harness
import { describe, test, expect, beforeEach } from 'vitest';
import { MarketSystem, isWindowOpen, TRANSFER_WINDOWS } from '../../src/engine/systems/MarketSystem.js';

describe('SPEC-015: Market & Transfer System', () => {
    let market;
    beforeEach(() => {
        market = new MarketSystem();
    });

    test('Summer window W1-8', () => {
        expect(isWindowOpen(1)).toBe(true);
        expect(isWindowOpen(8)).toBe(true);
        expect(isWindowOpen(9)).toBe(false);
    });

    test('Winter window W36-39', () => {
        expect(isWindowOpen(36)).toBe(true);
        expect(isWindowOpen(39)).toBe(true);
        expect(isWindowOpen(40)).toBe(false);
    });

    test('Outside window: listing rejected', () => {
        const result = market.listPlayer({ playerId: 1, askingPrice: 1000000, weekOfYear: 20, sellingTeamId: 1 });
        expect(result.listed).toBe(false);
    });

    test('In window: listing accepted', () => {
        const result = market.listPlayer({ playerId: 1, askingPrice: 1000000, weekOfYear: 5, sellingTeamId: 1 });
        expect(result.listed).toBe(true);
    });

    test('Pre-acordo permitido fora janela', () => {
        market.listPlayer({ playerId: 1, askingPrice: 1000000, weekOfYear: 5, sellingTeamId: 1 });
        const offer = market.makeOffer({ playerId: 1, offeringTeamId: 2, bidAmount: 800000, weekOfYear: 20 });
        expect(offer.pending).toBe(true);
    });

    test('Bid < 50% rejected', () => {
        market.listPlayer({ playerId: 1, askingPrice: 1000000, weekOfYear: 5, sellingTeamId: 1 });
        const offer = market.makeOffer({ playerId: 1, offeringTeamId: 2, bidAmount: 400000, weekOfYear: 5 });
        expect(offer.rejected).toBe(true);
    });

    test('Counter-offer não sobe preço', () => {
        market.listPlayer({ playerId: 1, askingPrice: 1000000, weekOfYear: 5, sellingTeamId: 1 });
        market.makeOffer({ playerId: 1, offeringTeamId: 2, bidAmount: 800000, weekOfYear: 5 });
        const counter = market.negotiateCounterOffer(1, 1500000);
        expect(counter.price).toBeLessThanOrEqual(800000);
    });

    test('Accept transfers player', () => {
        market.listPlayer({ playerId: 1, askingPrice: 1000000, weekOfYear: 5, sellingTeamId: 1 });
        market.makeOffer({ playerId: 1, offeringTeamId: 2, bidAmount: 800000, weekOfYear: 5 });
        const tx = market.acceptOffer({ playerId: 1, offeringTeamId: 2, offerPrice: 800000, weekOfYear: 5 });
        expect(tx.playerTransferred).toBe(true);
    });
});
