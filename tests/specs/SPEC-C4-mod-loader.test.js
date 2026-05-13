/**
 * SPEC-C4: ModLoader harness
 */

import { describe, it, expect } from 'vitest';
import { load, mergeWithDeck, EFFECT_WHITELIST, MAX_NUMERIC } from '../../src/engine/ModLoader.js';

const validJson = JSON.stringify({
    deck: 'mid_match_manager',
    cards: [
        {
            id: 'mod_custom_1',
            text: 'Vai trocar 3 jogadores?',
            options: [
                { label: 'Sim', effect: { moralDelta: 5 }, resultText: 'Banco honra.' },
                { label: 'Não', effect: {}, resultText: 'Mantém time.' },
            ],
        },
    ],
});

describe('SPEC-C4: ModLoader', () => {

    describe('basic load', () => {
        it('valid JSON returns 1 card no errors', () => {
            const r = load(validJson);
            expect(r.valid.length).toBe(1);
            expect(r.errors.length).toBe(0);
        });

        it('extracts deck name', () => {
            const r = load(validJson);
            expect(r.deck).toBe('mid_match_manager');
        });

        it('object input also accepted', () => {
            const r = load({ cards: [{ id: 'mod_x', text: 'Ola', options: [
                { label: 'A', effect: {}, resultText: 'r' },
                { label: 'B', effect: {}, resultText: 'r' },
            ] }] });
            expect(r.valid.length).toBe(1);
        });

        it('invalid JSON returns error', () => {
            const r = load('{not json');
            expect(r.valid.length).toBe(0);
            expect(r.errors[0].field).toBe('json');
        });

        it('missing cards field → error', () => {
            const r = load(JSON.stringify({}));
            expect(r.errors[0].field).toBe('cards');
        });
    });

    describe('rule 1: validation', () => {
        it('missing id → reject', () => {
            const r = load({ cards: [{ text: 'a', options: [{}, {}] }] });
            expect(r.valid.length).toBe(0);
            expect(r.errors.some(e => e.field === 'id')).toBe(true);
        });

        it('missing text → reject', () => {
            const r = load({ cards: [{ id: 'x', options: [{}, {}] }] });
            expect(r.valid.length).toBe(0);
        });

        it('1 option only → reject (precisa 2+)', () => {
            const r = load({ cards: [{ id: 'x', text: 't', options: [{ label: 'a', effect: {}, resultText: 'r' }] }] });
            expect(r.valid.length).toBe(0);
        });

        it('6 options → reject (max 5)', () => {
            const opts = Array(6).fill({ label: 'a', effect: {}, resultText: 'r' });
            const r = load({ cards: [{ id: 'x', text: 't', options: opts }] });
            expect(r.valid.length).toBe(0);
        });
    });

    describe('rule 2: sanitization', () => {
        it('strips HTML tags from text', () => {
            const r = load({ cards: [{
                id: 'mod_san',
                text: 'Olá <b>mundo</b>',
                options: [
                    { label: 'A', effect: {}, resultText: 'r1' },
                    { label: 'B', effect: {}, resultText: 'r2' },
                ],
            }]});
            expect(r.valid[0].text).toBe('Olá mundo');
        });

        it('rejects script tag', () => {
            const r = load({ cards: [{
                id: 'evil',
                text: '<script>alert(1)</script>',
                options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ],
            }]});
            expect(r.valid.length).toBe(0);
        });

        it('strips non-whitelist effect fields', () => {
            const r = load({ cards: [{
                id: 'mod_eff',
                text: 't',
                options: [
                    { label: 'A', effect: { moralDelta: 3, hackVar: 999 }, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ],
            }]});
            expect(r.valid[0].options[0].effect).toEqual({ moralDelta: 3 });
            expect(r.valid[0].options[0].effect.hackVar).toBeUndefined();
        });

        it('clamps numeric effects to MAX_NUMERIC', () => {
            const r = load({ cards: [{
                id: 'mod_huge',
                text: 't',
                options: [
                    { label: 'A', effect: { moralDelta: 999 }, resultText: 'r' },
                    { label: 'B', effect: { moralDelta: -999 }, resultText: 'r' },
                ],
            }]});
            expect(r.valid[0].options[0].effect.moralDelta).toBe(MAX_NUMERIC);
            expect(r.valid[0].options[1].effect.moralDelta).toBe(-MAX_NUMERIC);
        });
    });

    describe('rule 3: mod_ prefix', () => {
        it('preserves existing mod_ prefix', () => {
            const r = load({ cards: [{
                id: 'mod_already',
                text: 't',
                options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ],
            }]});
            expect(r.valid[0].id).toBe('mod_already');
        });

        it('auto-injects mod_ if missing', () => {
            const r = load({ cards: [{
                id: 'minha_carta',
                text: 't',
                options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ],
            }]});
            expect(r.valid[0].id).toBe('mod_minha_carta');
        });
    });

    describe('rule 4: tier optional', () => {
        it('default tier is common', () => {
            const r = load({ cards: [{
                id: 'mod_t',
                text: 't',
                options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ],
            }]});
            expect(r.valid[0].tier).toBe('common');
        });

        it('valid tier rare accepted', () => {
            const r = load({ cards: [{
                id: 'mod_t',
                text: 't',
                tier: 'rare',
                options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ],
            }]});
            expect(r.valid[0].tier).toBe('rare');
        });

        it('invalid tier falls back to common', () => {
            const r = load({ cards: [{
                id: 'mod_t',
                text: 't',
                tier: 'mythic_god_tier',
                options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ],
            }]});
            expect(r.valid[0].tier).toBe('common');
        });
    });

    describe('duplicate IDs', () => {
        it('rejects duplicate IDs no mesmo batch', () => {
            const r = load({ cards: [
                { id: 'mod_dup', text: 't', options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ] },
                { id: 'mod_dup', text: 't2', options: [
                    { label: 'A', effect: {}, resultText: 'r' },
                    { label: 'B', effect: {}, resultText: 'r' },
                ] },
            ] });
            expect(r.valid.length).toBe(1);
            expect(r.errors.some(e => e.message.includes('duplicado'))).toBe(true);
        });
    });

    describe('mergeWithDeck', () => {
        it('merges mod cards into builtin', () => {
            const builtin = [{ id: 'a' }, { id: 'b' }];
            const mod = [{ id: 'mod_c' }];
            expect(mergeWithDeck(builtin, mod)).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'mod_c' }]);
        });

        it('empty mod returns builtin unchanged', () => {
            const builtin = [{ id: 'a' }];
            expect(mergeWithDeck(builtin, [])).toBe(builtin);
        });

        it('non-array builtin returns empty', () => {
            expect(mergeWithDeck(null, [])).toEqual([]);
        });
    });

    describe('constants', () => {
        it('EFFECT_WHITELIST contains expected fields', () => {
            expect(EFFECT_WHITELIST.has('moralDelta')).toBe(true);
            expect(EFFECT_WHITELIST.has('tacticShift')).toBe(true);
            expect(EFFECT_WHITELIST.has('randomEval')).toBe(false);
        });
    });

});
