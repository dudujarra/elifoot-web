/**
 * SPEC-A4: MatchAnalyst harness
 */

import { describe, it, expect } from 'vitest';
import { analyzeMatch } from '../../src/engine/MatchAnalyst.js';

const winInput = {
    result: { home: 'A', away: 'B', homeGoals: 2, awayGoals: 0, isHomeTeam: true },
    tacticUsed: 'Defensivo',
    formationUsed: '4-4-2',
    opponentStyle: 'Ofensivo',
    recentForm: ['W', 'W', 'D'],
    subsUsed: 1,
};

const lossInput = {
    result: { home: 'A', away: 'B', homeGoals: 0, awayGoals: 3, isHomeTeam: true },
    tacticUsed: 'Posse',
    formationUsed: '4-3-3',
    opponentStyle: 'Contra-Ataque',
    recentForm: ['L', 'L'],
    subsUsed: 0,
};

const drawInput = {
    result: { home: 'A', away: 'B', homeGoals: 1, awayGoals: 1, isHomeTeam: true },
    tacticUsed: 'Normal',
    formationUsed: '4-3-3',
    opponentStyle: 'Normal',
    recentForm: [],
    subsUsed: 1,
};

describe('SPEC-A4: MatchAnalyst', () => {

    describe('rule 1: outcome-aware analysis', () => {
        it('win yields elogioso best', () => {
            const r = analyzeMatch(winInput);
            expect(r.best.title).toMatch(/CERTEIRA|GESTÃO|CONVICÇÃO/);
        });

        it('loss yields critical dubious when tactic was weak', () => {
            const r = analyzeMatch(lossInput);
            // Posse vs Contra-Ataque = weak → tactic dubious
            expect(r.dubious.type).toBe('tactic');
            expect(r.dubious.title).toMatch(/QUESTIONÁVEL/);
        });

        it('draw yields neutral tom', () => {
            const r = analyzeMatch(drawInput);
            expect(r.best.title).toBe('EQUILÍBRIO');
        });
    });

    describe('rule 2: tactic rationale', () => {
        it('best inclui menção ao adversário em vitória tática', () => {
            const r = analyzeMatch(winInput);
            // Best when Defensivo wins vs Ofensivo → tactic-type with mention
            expect(r.best.body).toMatch(/Ofensivo/i);
        });

        it('dubious sem subs em derrota aponta banco', () => {
            const r = analyzeMatch({ ...lossInput, tacticUsed: 'Defensivo', opponentStyle: 'Posse' });
            // Tactic Defensivo not weak vs Posse → fallback dubious is subs
            // Actually Defensivo strongVs Posse no... checking matchup
            // Defensivo strongVs ['Ofensivo', 'Pressing'], weakVs ['Posse', 'Contra-Ataque']
            // → tactic weak (Posse). So dubious.type === 'tactic'.
            // Test alternative case: tactic neutral
            const r2 = analyzeMatch({ ...lossInput, tacticUsed: 'Normal', opponentStyle: 'Normal', subsUsed: 0 });
            expect(r2.dubious.type).toBe('subs');
            expect(r2.dubious.title).toMatch(/BANCO/);
        });
    });

    describe('rule 3: determinism', () => {
        it('same input → same output', () => {
            const a = analyzeMatch(winInput);
            const b = analyzeMatch(winInput);
            expect(a.best.title).toBe(b.best.title);
            expect(a.dubious.title).toBe(b.dubious.title);
            expect(a.luck.title).toBe(b.luck.title);
        });
    });

    describe('rule 4: no emoji + valid types', () => {
        it('all 3 cards have no emoji', () => {
            const r = analyzeMatch(winInput);
            // eslint-disable-next-line no-misleading-character-class
            const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
            const texts = [r.best.title, r.best.body, r.dubious.title, r.dubious.body, r.luck.title, r.luck.body];
            texts.forEach(t => expect(emojiRegex.test(t)).toBe(false));
        });

        it('luck.type sempre é good/bad/neutral', () => {
            const r = analyzeMatch(winInput);
            expect(['good', 'bad', 'neutral']).toContain(r.luck.type);
        });
    });

    describe('luck heuristics', () => {
        it('blowout win → good luck title TUDO DEU CERTO', () => {
            const r = analyzeMatch({ ...winInput, result: { ...winInput.result, homeGoals: 4, awayGoals: 0 } });
            expect(r.luck.type).toBe('good');
            expect(r.luck.title).toMatch(/TUDO DEU CERTO/);
        });

        it('blowout loss → bad luck', () => {
            const r = analyzeMatch({ ...lossInput, result: { ...lossInput.result, homeGoals: 0, awayGoals: 5 } });
            expect(r.luck.type).toBe('bad');
        });

        it('1-goal margin win → na raça', () => {
            const r = analyzeMatch({ ...winInput, result: { ...winInput.result, homeGoals: 1, awayGoals: 0 } });
            expect(r.luck.title).toMatch(/NA RAÇA/);
        });
    });

    describe('robustness', () => {
        it('handles empty input', () => {
            const r = analyzeMatch({});
            expect(r.best).toBeTruthy();
            expect(r.dubious).toBeTruthy();
            expect(r.luck).toBeTruthy();
        });
    });

});
