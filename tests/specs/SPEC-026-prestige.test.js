// SPEC-026: Prestige & Reputation harness
import { describe, test, expect, beforeEach } from 'vitest';
import { PrestigeSystem, PRESTIGE_SOURCES, PRESTIGE_TIERS } from '../../src/engine/systems/PrestigeSystem.js';

describe('SPEC-026: Prestige & Reputation', () => {
    let prestige;
    beforeEach(() => {
        prestige = new PrestigeSystem();
    });

    test('6 tiers defined', () => {
        expect(PRESTIGE_TIERS.length).toBe(6);
    });

    test('Título +50', () => {
        prestige.addPrestige(1, 'Título Campeonato');
        expect(prestige.getPrestige(1)).toBe(50);
    });

    test('Taça intl +100', () => {
        prestige.addPrestige(1, 'Taça intl');
        expect(prestige.getPrestige(1)).toBe(100);
    });

    test('Tier calculation', () => {
        prestige.setPrestige(1, 200);
        expect(prestige.getTier(1)).toBe('Nacional');
        prestige.setPrestige(1, 600);
        expect(prestige.getTier(1)).toBe('Elite');
        prestige.setPrestige(1, 2000);
        expect(prestige.getTier(1)).toBe('Legendary');
    });

    test('Decay 5% per year', () => {
        prestige.setPrestige(1, 100);
        prestige.processYear();
        expect(prestige.getPrestige(1)).toBe(95);
    });

    test('Transfer modifier per tier', () => {
        prestige.setPrestige(1, 600);
        expect(prestige.getTransferModifier(1)).toBe(1.15);
    });

    test('Scouting modifier per tier', () => {
        prestige.setPrestige(1, 600);
        expect(prestige.getScoutingModifier(1)).toBe(1.2);
    });

    test('Ranking sorted desc', () => {
        prestige.setPrestige(1, 500);
        prestige.setPrestige(2, 800);
        prestige.setPrestige(3, 300);
        const ranking = prestige.getTeamRanking();
        expect(ranking[0].teamId).toBe(2);
        expect(ranking[1].teamId).toBe(1);
        expect(ranking[2].teamId).toBe(3);
    });

    test('History tracked', () => {
        prestige.addPrestige(1, 'Título Campeonato');
        const history = prestige.getPrestigeHistory(1);
        expect(history.length).toBe(1);
    });
});
