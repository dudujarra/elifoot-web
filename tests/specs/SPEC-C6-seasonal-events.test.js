/**
 * SPEC-C6: SeasonalBREvents harness
 */

import { describe, it, expect } from 'vitest';
import {
    SeasonalBREvents,
    getSeasonalEvent,
    getSeasonalTriggerWeeks,
    getSeasonalEventCount,
} from '../../src/engine/SeasonalBREvents.js';

describe('SPEC-C6: SeasonalBREvents', () => {

    describe('rule 1: trigger weeks', () => {
        it('week 1 → preseason event', () => {
            const e = getSeasonalEvent(1);
            expect(e?.id).toBe('season_jan_preseason');
        });

        it('week 13 → Copa America', () => {
            const e = getSeasonalEvent(13);
            expect(e?.id).toBe('season_jun_copa_america');
        });

        it('week 26 → youth visit', () => {
            const e = getSeasonalEvent(26);
            expect(e?.id).toBe('season_oct_youth_visit');
        });

        it('week 38 → year review', () => {
            const e = getSeasonalEvent(38);
            expect(e?.id).toBe('season_dec_year_review');
        });

        it('week 7 → null (no event)', () => {
            expect(getSeasonalEvent(7)).toBe(null);
        });

        it('week 0 → null', () => {
            expect(getSeasonalEvent(0)).toBe(null);
        });

        it('non-numeric input → null', () => {
            expect(getSeasonalEvent('week 1')).toBe(null);
            expect(getSeasonalEvent(null)).toBe(null);
            expect(getSeasonalEvent(undefined)).toBe(null);
        });
    });

    describe('rule 2: catalog integrity', () => {
        it('has at least 4 events', () => {
            expect(SeasonalBREvents.length).toBeGreaterThanOrEqual(4);
        });

        it('every event has 2-3 options', () => {
            SeasonalBREvents.forEach(e => {
                expect(e.options.length).toBeGreaterThanOrEqual(2);
                expect(e.options.length).toBeLessThanOrEqual(3);
            });
        });

        it('effects bounded ±10', () => {
            SeasonalBREvents.forEach(e => {
                e.options.forEach(o => {
                    if (typeof o.effect.moralDelta === 'number') {
                        expect(Math.abs(o.effect.moralDelta)).toBeLessThanOrEqual(10);
                    }
                    if (typeof o.effect.energyDelta === 'number') {
                        expect(Math.abs(o.effect.energyDelta)).toBeLessThanOrEqual(10);
                    }
                });
            });
        });

        it('every event has id, week, title, text, options', () => {
            SeasonalBREvents.forEach(e => {
                expect(typeof e.id).toBe('string');
                expect(typeof e.week).toBe('number');
                expect(typeof e.title).toBe('string');
                expect(typeof e.text).toBe('string');
                expect(Array.isArray(e.options)).toBe(true);
            });
        });

        it('IDs únicos', () => {
            const ids = SeasonalBREvents.map(e => e.id);
            expect(new Set(ids).size).toBe(ids.length);
        });

        it('weeks únicos', () => {
            const weeks = SeasonalBREvents.map(e => e.week);
            expect(new Set(weeks).size).toBe(weeks.length);
        });
    });

    describe('rule 3: PT-BR + sem emoji', () => {
        it('zero emoji', () => {
            const text = SeasonalBREvents
                .map(e => e.title + e.text + e.options.map(o => o.label + o.resultText).join(' '))
                .join(' ');
            // eslint-disable-next-line no-misleading-character-class
            const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
            expect(emojiRegex.test(text)).toBe(false);
        });

        it('contém termos BR-flavor (Copa, Brasileirão, vestiário, diretoria, base, churrasco)', () => {
            const allText = SeasonalBREvents.map(e => e.text + ' ' + e.options.map(o => o.resultText).join(' ')).join(' ').toLowerCase();
            const brTerms = ['copa', 'brasileirão', 'vestiário', 'diretoria', 'base', 'churrasco', 'picanha', 'imprensa'];
            const hits = brTerms.filter(t => allText.includes(t));
            expect(hits.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('rule 4: determinism', () => {
        it('same week → same event', () => {
            expect(getSeasonalEvent(13)?.id).toBe(getSeasonalEvent(13)?.id);
        });
    });

    describe('helpers', () => {
        it('getSeasonalTriggerWeeks returns array of weeks', () => {
            const weeks = getSeasonalTriggerWeeks();
            expect(weeks).toContain(1);
            expect(weeks).toContain(13);
            expect(weeks).toContain(26);
            expect(weeks).toContain(38);
        });

        it('getSeasonalEventCount returns count', () => {
            expect(getSeasonalEventCount()).toBeGreaterThanOrEqual(4);
        });
    });

});
