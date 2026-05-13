/**
 * SPEC-B6.2: enrichCardWithAtmosphere — wire BrazilianAtmosphere em MatchEventsDeck
 */

import { describe, it, expect } from 'vitest';
import { enrichCardWithAtmosphere } from '../../src/engine/MatchEventsDeck.js';

const sampleCard = {
    id: 'ata_c1',
    text: 'Você recebe na entrada da área.',
    tier: 'common',
    options: [],
};

describe('SPEC-B6.2: enrichCardWithAtmosphere', () => {

    it('prepends atmosphere string for known eventType', () => {
        const r = enrichCardWithAtmosphere(sampleCard, 'goal', 0);
        expect(r.text).not.toBe(sampleCard.text);
        expect(r.text.length).toBeGreaterThan(sampleCard.text.length);
        expect(r.text.endsWith(sampleCard.text)).toBe(true);
    });

    it('determinism: same seed → same enriched text', () => {
        const a = enrichCardWithAtmosphere(sampleCard, 'goal', 42);
        const b = enrichCardWithAtmosphere(sampleCard, 'goal', 42);
        expect(a.text).toBe(b.text);
    });

    it('different seeds → potentially different enrichment', () => {
        const enrichedTexts = new Set();
        for (let s = 0; s < 10; s++) {
            enrichedTexts.add(enrichCardWithAtmosphere(sampleCard, 'goal', s).text);
        }
        expect(enrichedTexts.size).toBeGreaterThan(1);
    });

    it('unknown eventType → returns original card', () => {
        const r = enrichCardWithAtmosphere(sampleCard, 'nonexistent', 0);
        expect(r.text).toBe(sampleCard.text);
    });

    it('null card → null', () => {
        expect(enrichCardWithAtmosphere(null, 'goal', 0)).toBe(null);
    });

    it('marks _atmosphereApplied for enriched cards', () => {
        const r = enrichCardWithAtmosphere(sampleCard, 'card', 0);
        expect(r._atmosphereApplied).toBe('card');
    });

    it('does not mutate original card', () => {
        const original = { ...sampleCard };
        enrichCardWithAtmosphere(sampleCard, 'goal', 0);
        expect(sampleCard).toEqual(original);
    });

    it('preserves card.id, tier, options', () => {
        const r = enrichCardWithAtmosphere(sampleCard, 'goal', 0);
        expect(r.id).toBe(sampleCard.id);
        expect(r.tier).toBe(sampleCard.tier);
        expect(r.options).toBe(sampleCard.options);
    });

});
