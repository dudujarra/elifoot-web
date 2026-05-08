// SPEC-009: Youth Academy harness
import { describe, test, expect } from 'vitest';
import { generateYouthIntake, getAcademyUpgradeCost, loanPlayerOut, processLoans, YOUTH_COORDINATOR } from '../../src/engine/YouthAcademy.js';

describe('SPEC-009: Youth Academy', () => {
    test('Youth coordinator defined', () => {
        expect(YOUTH_COORDINATOR).toBeDefined();
        expect(YOUTH_COORDINATOR.role).toContain('Base');
    });

    test('Generates 1+ youngsters', () => {
        const intake = generateYouthIntake(3, 60);
        expect(intake.length).toBeGreaterThanOrEqual(1);
    });

    test('Youngsters age 15-17', () => {
        for (let i = 0; i < 20; i++) {
            const intake = generateYouthIntake(3, 60);
            for (const y of intake) {
                expect(y.age).toBeGreaterThanOrEqual(15);
                expect(y.age).toBeLessThanOrEqual(17);
            }
        }
    });

    test('Youngsters marked isYouth', () => {
        const intake = generateYouthIntake(3, 60);
        for (const y of intake) {
            expect(y.isYouth).toBe(true);
        }
    });

    test('Have potential >= ovr', () => {
        const intake = generateYouthIntake(5, 80);
        for (const y of intake) {
            expect(y.potential).toBeGreaterThanOrEqual(y.ovr);
        }
    });

    test('Higher academy level → more youngsters', () => {
        const samples = 30;
        let lvl1Total = 0, lvl5Total = 0;
        for (let i = 0; i < samples; i++) {
            lvl1Total += generateYouthIntake(1, 60).length;
            lvl5Total += generateYouthIntake(5, 60).length;
        }
        expect(lvl5Total).toBeGreaterThan(lvl1Total);
    });

    test('Upgrade cost progressive', () => {
        const c1 = getAcademyUpgradeCost(1);
        const c2 = getAcademyUpgradeCost(2);
        const c3 = getAcademyUpgradeCost(3);
        expect(c2).toBeGreaterThan(c1);
        expect(c3).toBeGreaterThan(c2);
    });

    test('Loan blocks titulares', () => {
        const team = { squad: [{ id: 1, name: 'P', isTitular: true, injury: null }] };
        const result = loanPlayerOut(team, 1, 10);
        expect(result.success).toBe(false);
    });
});
