// SPEC-030: Customization & Preferences harness
import { describe, test, expect, beforeEach } from 'vitest';
import { PreferencesSystem, THEMES, LANGUAGES, DEFAULT_PREFS } from '../../src/engine/systems/PreferencesSystem.js';

describe('SPEC-030: Preferences System', () => {
    let prefs;
    beforeEach(() => {
        prefs = new PreferencesSystem();
        prefs.reset(1);
    });

    test('16 themes defined', () => {
        expect(THEMES.length).toBe(16);
    });

    test('4 languages', () => {
        expect(LANGUAGES.length).toBe(4);
    });

    test('Default theme is Azul', () => {
        expect(DEFAULT_PREFS.theme).toBe('Azul');
    });

    test('Set valid theme', () => {
        const ok = prefs.setPreference(1, 'theme', 'Dark');
        expect(ok).toBe(true);
        expect(prefs.getPreference(1, 'theme')).toBe('Dark');
    });

    test('Invalid theme rejected', () => {
        const ok = prefs.setPreference(1, 'theme', 'Invalid');
        expect(ok).toBe(false);
    });

    test('Save formation', () => {
        const f = prefs.saveFormation(1, { name: 'Defensive', formation: '5-3-2', tactic: 'Defensivo' });
        expect(f).toBeTruthy();
        expect(f.formation).toBe('5-3-2');
    });

    test('Max 10 formations', () => {
        let saved = 0;
        for (let i = 0; i < 12; i++) {
            const f = prefs.saveFormation(1, { name: `F${i}`, formation: '4-4-2', tactic: 'normal' });
            if (f) saved++;
        }
        expect(saved).toBe(10);
    });

    test('Load formation', () => {
        const f = prefs.saveFormation(1, { name: 'Att', formation: '4-3-3', tactic: 'attack' });
        const loaded = prefs.loadFormation(1, f.id);
        expect(loaded.formation).toBe('4-3-3');
    });

    test('Shortcut conflict rejected', () => {
        prefs.setShortcut(1, 'Ctrl+S', 'Save');
        const ok = prefs.setShortcut(1, 'Ctrl+L', 'Save'); // same command, different key
        expect(ok).toBe(false);
    });

    test('Persistence after reset', () => {
        prefs.setPreference(1, 'theme', 'Dark');
        const before = prefs.getPreference(1, 'theme');
        prefs.reset(1);
        const after = prefs.getPreference(1, 'theme');
        expect(after).toBe('Azul');
        expect(before).toBe('Dark');
    });
});
