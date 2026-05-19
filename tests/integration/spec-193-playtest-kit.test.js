// SPEC-193: Playtest 5 BR preparation kit
// AKITA-427: docs/playtest/ artifacts for B3.2 execution
import { describe, test, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '../..');
const playDir = path.join(projectRoot, 'docs/playtest');

const REQUIRED = [
    'RECRUITMENT.md',
    'ROTEIRO.md',
    'BUG-REPORT-FORM.md',
    'RESULTS-TEMPLATE.md',
    'PLAYTEST-CHECKLIST.md',
];

describe('SPEC-193: Playtest 5 BR prep kit', () => {
    test.each(REQUIRED)('docs/playtest/%s exists + > 500 bytes', (file) => {
        const fpath = path.join(playDir, file);
        expect(fs.existsSync(fpath), `missing: ${file}`).toBe(true);
        expect(fs.statSync(fpath).size).toBeGreaterThan(500);
    });

    test('RECRUITMENT has tweets + discord + 5 perfis A-E', () => {
        const src = fs.readFileSync(path.join(playDir, 'RECRUITMENT.md'), 'utf-8');
        expect(src).toMatch(/Twitter|Tweet/i);
        expect(src).toMatch(/Discord|Reddit|WhatsApp/i);
        for (const perfil of ['Perfil A', 'Perfil B', 'Perfil C', 'Perfil D', 'Perfil E']) {
            expect(src, `missing: ${perfil}`).toMatch(new RegExp(perfil));
        }
    });

    test('ROTEIRO has 7+ blocks with timings', () => {
        const src = fs.readFileSync(path.join(playDir, 'ROTEIRO.md'), 'utf-8');
        for (const block of ['Pré-sessão', 'Bloco 1', 'Bloco 2', 'Bloco 3', 'Bloco 4', 'Bloco 5', 'Bloco 6', 'Bloco 7']) {
            expect(src, `missing: ${block}`).toMatch(new RegExp(block));
        }
        expect(src).toMatch(/00:00/);
        expect(src).toMatch(/02:00/);
        expect(src).toMatch(/consent/i);
    });

    test('BUG-REPORT-FORM has all key fields', () => {
        const src = fs.readFileSync(path.join(playDir, 'BUG-REPORT-FORM.md'), 'utf-8');
        for (const field of ['Severidade', 'Reprodu', 'Esperado', 'Observado', 'Browser', 'OS', 'Console', 'Screenshot']) {
            expect(src, `missing field: ${field}`).toMatch(new RegExp(field, 'i'));
        }
        expect(src).toMatch(/\bP0\b/);
        expect(src).toMatch(/\bP1\b/);
        expect(src).toMatch(/\bP2\b/);
        expect(src).toMatch(/NPS/);
    });

    test('RESULTS-TEMPLATE has session + aggregate + triage + GO/NO-GO', () => {
        const src = fs.readFileSync(path.join(playDir, 'RESULTS-TEMPLATE.md'), 'utf-8');
        expect(src).toMatch(/Sumário/i);
        expect(src).toMatch(/Sess(ão|ões)/i);
        expect(src).toMatch(/Bugs agregados/i);
        expect(src).toMatch(/Triagem/i);
        expect(src).toMatch(/GO\s*\/?\s*NO-?GO/i);
        expect(src).toMatch(/NPS/);
    });

    test('PLAYTEST-CHECKLIST has all 10 plan items (6.1-6.10)', () => {
        const src = fs.readFileSync(path.join(playDir, 'PLAYTEST-CHECKLIST.md'), 'utf-8');
        for (const item of ['6.1', '6.2', '6.3', '6.4', '6.5', '6.6', '6.7', '6.8', '6.9', '6.10']) {
            expect(src, `missing item: ${item}`).toMatch(new RegExp(item.replace('.', '\\.')));
        }
        expect(src).toMatch(/Gate B3\.2/i);
    });

    test('no http:// (only https), with localhost exception', () => {
        for (const file of REQUIRED) {
            const src = fs.readFileSync(path.join(playDir, file), 'utf-8');
            const httpMatches = src.match(/http:\/\/(?!localhost)[^\s)]*/g) || [];
            expect(httpMatches, `${file} has insecure http://: ${httpMatches.join(', ')}`).toEqual([]);
        }
    });

    test('live URL referenced in RECRUITMENT + ROTEIRO + CHECKLIST', () => {
        const liveUrl = /https:\/\/dudujarra\.github\.io\/olefut/;
        for (const file of ['RECRUITMENT.md', 'ROTEIRO.md', 'PLAYTEST-CHECKLIST.md']) {
            const src = fs.readFileSync(path.join(playDir, file), 'utf-8');
            expect(src, `missing live URL in ${file}`).toMatch(liveUrl);
        }
    });

    test('RECRUITMENT references SPEC-193 update note', () => {
        const src = fs.readFileSync(path.join(playDir, 'RECRUITMENT.md'), 'utf-8');
        expect(src).toMatch(/SPEC-193/);
    });
});
