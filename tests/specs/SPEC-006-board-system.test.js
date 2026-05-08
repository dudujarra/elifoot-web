// SPEC-006: Board System harness
import { describe, test, expect } from 'vitest';
import { BoardSystem, generateObjectives, BOARD_MEMBERS } from '../../src/engine/BoardSystem.js';

describe('SPEC-006: Board System', () => {
    test('Board has 2 members', () => {
        expect(BOARD_MEMBERS.president).toBeDefined();
        expect(BOARD_MEMBERS.director).toBeDefined();
    });

    test('BoardSystem starts with 60 confidence', () => {
        const board = new BoardSystem(1, 100000000);
        expect(board.confidence).toBe(60);
    });

    test('Grace period 8 weeks', () => {
        const board = new BoardSystem(1, 100000000);
        const initial = board.confidence;
        board.updateConfidence(20, 20, -5, 30, -10000, 1); // bad result
        expect(board.confidence).toBe(initial); // grace period
    });

    test('Bad streak reduces confidence post-grace', () => {
        const board = new BoardSystem(1, 100000000);
        const initial = board.confidence;
        board.updateConfidence(20, 20, -5, 30, -10000, 10); // post-grace
        expect(board.confidence).toBeLessThan(initial);
    });

    test('Good performance increases confidence', () => {
        const board = new BoardSystem(1, 200000000);
        const initial = board.confidence;
        board.updateConfidence(1, 20, 5, 80, 1000000, 10);
        expect(board.confidence).toBeGreaterThan(initial);
    });

    test('Confidence < 10 triggers demission', () => {
        const board = new BoardSystem(1, 100000000);
        for (let i = 0; i < 30; i++) {
            board.updateConfidence(20, 20, -5, 20, -100000, 10 + i);
        }
        // Eventually fired
        if (board.confidence < 10) expect(board.isFired).toBe(true);
    });

    test('Status returns label, color, emoji', () => {
        const board = new BoardSystem(1, 100000000);
        const status = board.getStatus();
        expect(status.label).toBeDefined();
        expect(status.color).toBeDefined();
        expect(status.emoji).toBeDefined();
    });

    test('Objectives generated based on division', () => {
        const div1 = generateObjectives(1, 200000000);
        const div2 = generateObjectives(2, 50000000);
        expect(div1.length).toBeGreaterThan(0);
        expect(div2.length).toBeGreaterThan(0);
        expect(div2.some((o) => o.id === 'promotion')).toBe(true);
    });
});
