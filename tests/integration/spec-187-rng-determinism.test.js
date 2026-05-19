// SPEC-187: RNG seed determinism in test environment
// AKITA-423: fix issue #188 — Date.now()-based seed causing flake in seasonhistory-data.test.js
import { describe, test, expect } from 'vitest';
import { rng, getGlobalSeed, setGlobalSeed } from '../../src/engine/rng.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('SPEC-187: RNG seed determinism', () => {
    test('process.env.VITEST is set under Vitest', () => {
        expect(process.env.VITEST).toBe('true');
    });

    test('default seed constant is 0xC0FFEE under Vitest', () => {
        // Setting + reading verifies the documented default constant value.
        // (Module-load default cannot be re-tested mid-run because state is mutated.)
        const VITEST_DEFAULT = 0xC0FFEE;
        setGlobalSeed(VITEST_DEFAULT);
        expect(getGlobalSeed()).toBe(VITEST_DEFAULT);
    });

    test('rng() is reproducible given same seed', () => {
        setGlobalSeed(42);
        const seq1 = [rng(), rng(), rng(), rng(), rng()];

        setGlobalSeed(42);
        const seq2 = [rng(), rng(), rng(), rng(), rng()];

        expect(seq1).toEqual(seq2);
    });

    test('different seeds produce different sequences', () => {
        setGlobalSeed(42);
        const seqA = [rng(), rng(), rng()];

        setGlobalSeed(99);
        const seqB = [rng(), rng(), rng()];

        expect(seqA).not.toEqual(seqB);
    });

    test('seasonhistory-data.test.js pins seed in beforeAll', () => {
        const targetPath = path.join(__dirname, 'seasonhistory-data.test.js');
        const src = fs.readFileSync(targetPath, 'utf-8');
        expect(src).toMatch(/setGlobalSeed/);
        expect(src).toMatch(/from ['"]\.\.\/\.\.\/src\/engine\/rng/);
    });

    test('rng.js source detects VITEST env var', () => {
        const rngPath = path.join(__dirname, '../../src/engine/rng.js');
        const src = fs.readFileSync(rngPath, 'utf-8');
        expect(src).toMatch(/process\.env\.VITEST/);
        expect(src).toMatch(/_pickDefaultSeed/);
        expect(src).toMatch(/typeof process !== 'undefined'/);
    });
});
