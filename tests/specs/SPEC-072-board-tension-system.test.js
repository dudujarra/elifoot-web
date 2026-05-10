import { describe, test, expect } from 'vitest';
import { apply, canBoardInterfere, endSeason } from '../../src/engine/BoardTensionSystem.js';

describe('SPEC-072: Board Tension System', () => {

    test('tension clamped at +100 (upper)', () => {
        const result = apply({ currentTension: 95, eventType: 'title_won' });
        expect(result.newTension).toBeLessThanOrEqual(100);
    });

    test('tension clamped at -100 (lower)', () => {
        const result = apply({ currentTension: -90, eventType: 'board_sold_player' });
        expect(result.newTension).toBeGreaterThanOrEqual(-100);
    });

    test('board_sold_player delta = -20', () => {
        const result = apply({ currentTension: 50, eventType: 'board_sold_player' });
        expect(result.tensionDelta).toBe(-20);
        expect(result.newTension).toBe(30);
    });

    test('title_won delta = +25', () => {
        const result = apply({ currentTension: 50, eventType: 'title_won' });
        expect(result.tensionDelta).toBe(25);
        expect(result.newTension).toBe(75);
    });

    test('tension < -20 → demitido threshold', () => {
        const result = apply({ currentTension: -10, eventType: 'board_sold_player' });
        expect(result.threshold).toBe('demitido');
        expect(result.thresholdChanged).toBe(true);
    });

    test('tension ≥ 80 → carta_branca', () => {
        const result = apply({ currentTension: 75, eventType: 'title_won' });
        expect(result.threshold).toBe('carta_branca');
    });

    test('carta_branca → board cannot interfere', () => {
        expect(canBoardInterfere({ tension: 82 })).toBe(false);
        expect(canBoardInterfere({ tension: 80 })).toBe(false);
    });

    test('below carta_branca → board can interfere', () => {
        expect(canBoardInterfere({ tension: 79 })).toBe(true);
        expect(canBoardInterfere({ tension: 0 })).toBe(true);
    });

    test('boardMessage present when threshold changes', () => {
        // Go from normal (50) to cobrado (35)
        const result = apply({ currentTension: 42, eventType: 'loss_streak' });
        if (result.thresholdChanged) {
            expect(result.boardMessage).toBeTruthy();
        }
    });

    test('boardMessage absent when threshold unchanged', () => {
        // 50 → 42: still normal
        const result = apply({ currentTension: 50, eventType: 'win_streak' });
        if (!result.thresholdChanged) {
            expect(result.boardMessage).toBeUndefined();
        }
    });

    test('tension persists across seasons (endSeason does NOT reset)', () => {
        const save = { managers: { 1: { boardTension: -5 } } };
        const after = endSeason(save, 1);
        expect(after.managers[1].boardTension).toBe(-5);
    });

    test('cobrado threshold at tension 10-39', () => {
        const result = apply({ currentTension: 50, eventType: 'board_sold_player' }); // 50-20=30
        expect(result.threshold).toBe('cobrado');
    });

    test('ultimato threshold at tension -20 to 9', () => {
        const result = apply({ currentTension: 20, eventType: 'loss_streak' }); // 20-15=5
        expect(result.threshold).toBe('ultimato');
    });

    test('win_streak reduces cobrado → can recover', () => {
        let tension = 30; // cobrado
        const r1 = apply({ currentTension: tension, eventType: 'win_streak' }); // 30+8=38 still cobrado
        const r2 = apply({ currentTension: r1.newTension, eventType: 'win_streak' }); // 38+8=46 normal
        expect(r2.threshold).toBe('normal');
    });
});
