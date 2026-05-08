// SPEC-029: Achievements harness
import { describe, test, expect, beforeEach } from 'vitest';
import { AchievementsSystem, ACHIEVEMENTS, MILESTONES } from '../../src/engine/systems/AchievementsSystem.js';

describe('SPEC-029: Achievements System', () => {
    let ach;
    beforeEach(() => {
        ach = new AchievementsSystem();
    });

    test('25+ achievements defined', () => {
        expect(Object.keys(ACHIEVEMENTS).length).toBeGreaterThanOrEqual(25);
    });

    test('Milestones defined', () => {
        expect(Object.keys(MILESTONES).length).toBeGreaterThanOrEqual(7);
    });

    test('Each achievement has reward + rarity', () => {
        Object.values(ACHIEVEMENTS).forEach((a) => {
            expect(a.reward).toBeGreaterThanOrEqual(0);
            expect(a.rarity).toBeDefined();
        });
    });

    test('Unlock returns achievement', () => {
        const r = ach.unlockAchievement(1, 'Champion', 38);
        expect(r.unlocked).toBe(true);
        expect(r.reward).toBe(100);
    });

    test('No duplicate unlock', () => {
        ach.unlockAchievement(1, 'Champion');
        const r = ach.unlockAchievement(1, 'Champion');
        expect(r.alreadyUnlocked).toBe(true);
    });

    test('Points accumulate', () => {
        ach.unlockAchievement(1, 'Champion'); // 100
        ach.unlockAchievement(1, 'Cup_winner'); // 50
        expect(ach.getPoints(1)).toBe(150);
    });

    test('Progress tracked 0-100', () => {
        ach.setProgress(1, '100_goals', 50);
        expect(ach.getProgress(1, '100_goals')).toBe(50);
    });

    test('Progress capped 100', () => {
        ach.setProgress(1, '100_goals', 150);
        expect(ach.getProgress(1, '100_goals')).toBe(100);
    });

    test('Auto unlock via checkAchievements', () => {
        const r = ach.checkAchievements({ entityId: 1, event: 'champion', details: { week: 38 } });
        expect(r.length).toBe(1);
        expect(r[0].id).toBe('Champion');
    });

    test('Get achievements list', () => {
        ach.unlockAchievement(1, 'Champion');
        const list = ach.getAchievements(1);
        expect(list.length).toBe(1);
    });
});
