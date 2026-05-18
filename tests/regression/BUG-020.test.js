// Regression test for BUG-020
// App não persistia state (refresh = volta tela inicial, perde carreira)
// Fix: GameContext usa localStorage auto-save em mudança gameState
// Issue: https://github.com/dudujarra/olefut/issues/18
// AKITA-416: save logic extracted to gameSaveManager.js — tests updated.
import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const ctxFile = path.join(projectRoot, 'src/context/GameContext.jsx');
const saveFile = path.join(projectRoot, 'src/context/gameSaveManager.js');

describe('BUG-020 regression: localStorage auto-save', () => {
    test('GameContext exists', () => {
        expect(fs.existsSync(ctxFile)).toBe(true);
    });

    test('gameSaveManager exists (extracted from GameContext)', () => {
        expect(fs.existsSync(saveFile)).toBe(true);
    });

    test('Uses localStorage', () => {
        const content = fs.readFileSync(saveFile, 'utf-8');
        expect(content).toMatch(/localStorage/);
    });

    test('SAVE_KEY constant is used', () => {
        const content = fs.readFileSync(saveFile, 'utf-8');
        expect(content).toMatch(/SAVE_KEY/);
    });

    test('saveToStorage function exists', () => {
        const content = fs.readFileSync(saveFile, 'utf-8');
        expect(content).toMatch(/function saveToStorage/);
    });

    test('loadFromStorage function exists', () => {
        const content = fs.readFileSync(saveFile, 'utf-8');
        expect(content).toMatch(/function loadFromStorage/);
    });

    test('useEffect auto-save on gameState change', () => {
        const content = fs.readFileSync(ctxFile, 'utf-8');
        expect(content).toMatch(/useEffect/);
        expect(content).toMatch(/saveToStorage\(engineRef/);
    });

    test('Class fields not serialized (avoid breaking instances)', () => {
        const content = fs.readFileSync(saveFile, 'utf-8');
        expect(content).toMatch(/ENGINE_CLASS_FIELDS/);
        expect(content).toMatch(/staff/);
    });

    test('resetGame clears storage', () => {
        const content = fs.readFileSync(ctxFile, 'utf-8');
        expect(content).toMatch(/resetGame/);
        expect(content).toMatch(/clearStorage/);
    });

    test('GameContext imports save functions from gameSaveManager', () => {
        const content = fs.readFileSync(ctxFile, 'utf-8');
        expect(content).toMatch(/from '\.\/gameSaveManager/);
        expect(content).toMatch(/saveToStorage/);
        expect(content).toMatch(/loadFromStorage/);
        expect(content).toMatch(/clearStorage/);
        expect(content).toMatch(/restoreEngine/);
    });
});
