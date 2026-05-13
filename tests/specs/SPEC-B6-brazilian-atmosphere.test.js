/**
 * SPEC-B6: BrazilianAtmosphere harness
 */

import { describe, it, expect } from 'vitest';
import {
    getAtmosphere,
    getAtmosphereSet,
    ATMOSPHERE,
    ALL_EVENT_TYPES,
} from '../../src/engine/BrazilianAtmosphere.js';

describe('SPEC-B6: BrazilianAtmosphere', () => {

    describe('rule 1: catalog coverage', () => {
        it('has at least 30 total strings', () => {
            const total = ALL_EVENT_TYPES.reduce((sum, k) => sum + ATMOSPHERE[k].length, 0);
            expect(total).toBeGreaterThanOrEqual(30);
        });

        it('goal category has 8+', () => {
            expect(ATMOSPHERE.goal.length).toBeGreaterThanOrEqual(8);
        });

        it('card category has 5+', () => {
            expect(ATMOSPHERE.card.length).toBeGreaterThanOrEqual(5);
        });

        it('derby category has 5+', () => {
            expect(ATMOSPHERE.derby.length).toBeGreaterThanOrEqual(5);
        });

        it('miss category has 4+', () => {
            expect(ATMOSPHERE.miss.length).toBeGreaterThanOrEqual(4);
        });

        it('save category has 4+', () => {
            expect(ATMOSPHERE.save.length).toBeGreaterThanOrEqual(4);
        });
    });

    describe('rule 2: BR-authentic vocabulary', () => {
        it('contains BR cultural references (Maracanã/Vila/Pacaembu/Beira-Rio/Mineirão)', () => {
            const allText = ALL_EVENT_TYPES.flatMap(k => ATMOSPHERE[k]).join(' ');
            const cultRefs = ['Maracanã', 'Vila', 'Pacaembu', 'Beira-Rio', 'Mineirão'];
            const found = cultRefs.filter(r => allText.includes(r));
            expect(found.length).toBeGreaterThanOrEqual(3);
        });

        it('avoids common foreign terms', () => {
            const allText = ALL_EVENT_TYPES.flatMap(k => ATMOSPHERE[k]).join(' ').toLowerCase();
            const foreignTerms = ['performance', 'balance', 'overall', 'striker', 'midfielder'];
            foreignTerms.forEach(t => {
                expect(allText).not.toContain(t);
            });
        });
    });

    describe('rule 3: deterministic via seed', () => {
        it('same seed → same string', () => {
            const a = getAtmosphere('goal', 42);
            const b = getAtmosphere('goal', 42);
            expect(a.flavorString).toBe(b.flavorString);
        });

        it('different seed → potentially different string', () => {
            const results = new Set();
            for (let s = 0; s < 10; s++) {
                results.add(getAtmosphere('goal', s).flavorString);
            }
            expect(results.size).toBeGreaterThan(1);
        });

        it('returns category matching eventType', () => {
            expect(getAtmosphere('card', 0).category).toBe('card');
        });

        it('unknown eventType → empty flavorString', () => {
            const r = getAtmosphere('nonexistent', 0);
            expect(r.flavorString).toBe('');
            expect(r.category).toBe('unknown');
        });
    });

    describe('rule 4: no emoji + no profanity', () => {
        it('zero emoji codepoints in entire catalog', () => {
            const allText = ALL_EVENT_TYPES.flatMap(k => ATMOSPHERE[k]).join('');
            // eslint-disable-next-line no-misleading-character-class
            const emojiRegex = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u;
            expect(emojiRegex.test(allText)).toBe(false);
        });

        it('strings are non-empty', () => {
            ALL_EVENT_TYPES.forEach(k => {
                ATMOSPHERE[k].forEach(s => {
                    expect(typeof s).toBe('string');
                    expect(s.length).toBeGreaterThan(5);
                });
            });
        });
    });

    describe('getAtmosphereSet', () => {
        it('returns N distinct strings', () => {
            const set = getAtmosphereSet('goal', 3, 0);
            expect(set.length).toBe(3);
            const unique = new Set(set);
            expect(unique.size).toBe(3);
        });

        it('caps at list length', () => {
            const set = getAtmosphereSet('miss', 100, 0);
            expect(set.length).toBe(ATMOSPHERE.miss.length);
        });

        it('deterministic with seed', () => {
            const a = getAtmosphereSet('save', 3, 7);
            const b = getAtmosphereSet('save', 3, 7);
            expect(a).toEqual(b);
        });

        it('unknown eventType returns empty array', () => {
            expect(getAtmosphereSet('nope', 3, 0)).toEqual([]);
        });
    });

});
