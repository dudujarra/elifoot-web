/**
 * SPEC-C4.2: Validates that the sample mod JSON parses correctly via ModLoader.
 */

import { describe, it, expect } from 'vitest';
import { load } from '../../src/engine/ModLoader.js';
import fs from 'node:fs';
import path from 'node:path';

const SAMPLE_PATH = path.resolve(__dirname, '../../public/mods/cards/sample-pack-br/midmatch-extras.json');

describe('SPEC-C4.2: Sample BR Mod Pack validation', () => {

    it('sample file exists', () => {
        expect(fs.existsSync(SAMPLE_PATH)).toBe(true);
    });

    it('parses without errors', () => {
        const text = fs.readFileSync(SAMPLE_PATH, 'utf-8');
        const result = load(text);
        expect(result.errors.length).toBe(0);
    });

    it('produces 3 valid cards', () => {
        const text = fs.readFileSync(SAMPLE_PATH, 'utf-8');
        const { valid } = load(text);
        expect(valid.length).toBe(3);
    });

    it('all card IDs prefixed mod_', () => {
        const text = fs.readFileSync(SAMPLE_PATH, 'utf-8');
        const { valid } = load(text);
        valid.forEach(c => {
            expect(c.id.startsWith('mod_')).toBe(true);
        });
    });

    it('contains BR-flavored content', () => {
        const text = fs.readFileSync(SAMPLE_PATH, 'utf-8');
        const { valid } = load(text);
        const allText = valid.map(c => c.text + c.options.map(o => o.resultText).join(' ')).join(' ').toLowerCase();
        const brTerms = ['maracanã', 'salvador', 'carnaval', 'capitão', 'arquibancada', 'vestiário'];
        const hits = brTerms.filter(t => allText.includes(t));
        expect(hits.length).toBeGreaterThanOrEqual(3);
    });

    it('declares deck = mid_match_manager', () => {
        const text = fs.readFileSync(SAMPLE_PATH, 'utf-8');
        const result = load(text);
        expect(result.deck).toBe('mid_match_manager');
    });

    it('every option has effect within whitelist', () => {
        const text = fs.readFileSync(SAMPLE_PATH, 'utf-8');
        const { valid } = load(text);
        valid.forEach(c => {
            c.options.forEach(o => {
                const keys = Object.keys(o.effect);
                keys.forEach(k => {
                    expect(['moralDelta', 'energyDelta', 'tacticShift']).toContain(k);
                });
            });
        });
    });

});
