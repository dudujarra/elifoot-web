// SPEC-017: Rivalry & Derby harness
import { describe, test, expect, beforeEach } from 'vitest';
import { RivalrySystem, RIVALRY_TYPES } from '../../src/engine/systems/RivalrySystem.js';

describe('SPEC-017: Rivalry & Derby System', () => {
    let rivals;
    beforeEach(() => {
        rivals = new RivalrySystem();
    });

    test('4 rivalry types', () => {
        expect(Object.keys(RIVALRY_TYPES).length).toBe(4);
    });

    test('Add rival creates symmetric rivalry', () => {
        rivals.addRival(1, 2, 'Clássico');
        const ab = rivals.getRivalryHistory(1, 2);
        const ba = rivals.getRivalryHistory(2, 1);
        expect(ab).toBe(ba);
    });

    test('Cant rival self', () => {
        const r = rivals.addRival(1, 1, 'Clássico');
        expect(r).toBeNull();
    });

    test('Process match accumulates points', () => {
        rivals.addRival(1, 2, 'Clássico');
        rivals.processMatch({ homeTeamId: 1, awayTeamId: 2, result: 'win', weekOfYear: 5 });
        const history = rivals.getRivalryHistory(1, 2);
        expect(history.headToHeadA).toBe(1);
        expect(history.pointsA).toBe(10);
    });

    test('Match modifiers returned', () => {
        rivals.addRival(1, 2, 'Clássico');
        const mods = rivals.getMatchModifiers(1, 2);
        expect(mods.intensity).toBe(1.4);
        expect(mods.redCard).toBe(1.6);
    });

    test('Non-rivals: default mods', () => {
        const mods = rivals.getMatchModifiers(1, 2);
        expect(mods.intensity).toBe(1.0);
    });

    test('Draw counted', () => {
        rivals.addRival(1, 2, 'Histórico rival');
        rivals.processMatch({ homeTeamId: 1, awayTeamId: 2, result: 'draw', weekOfYear: 5 });
        const history = rivals.getRivalryHistory(1, 2);
        expect(history.draws).toBe(1);
    });

    test('isRival check', () => {
        rivals.addRival(1, 2, 'Novo rival');
        expect(rivals.isRival(1, 2)).toBe(true);
        expect(rivals.isRival(2, 1)).toBe(true);
        expect(rivals.isRival(3, 4)).toBe(false);
    });

    test('Loss away gives opponent points', () => {
        rivals.addRival(1, 2, 'Derby regional');
        rivals.processMatch({ homeTeamId: 1, awayTeamId: 2, result: 'loss', weekOfYear: 5 });
        const history = rivals.getRivalryHistory(1, 2);
        expect(history.headToHeadB).toBe(1);
    });
});
