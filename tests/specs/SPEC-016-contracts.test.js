// SPEC-016: Contracts & Salary harness
import { describe, test, expect, beforeEach } from 'vitest';
import { ContractSystem, CONTRACT_TYPES } from '../../src/engine/systems/ContractSystem.js';

describe('SPEC-016: Contracts & Salary System', () => {
    let cs;
    beforeEach(() => {
        cs = new ContractSystem();
    });

    test('5 contract types defined', () => {
        expect(Object.keys(CONTRACT_TYPES).length).toBe(5);
    });

    test('Junior salary 30K-100K', () => {
        const c = cs.offerContract({ playerId: 1, salary: 50000, duration: 2, type: 'Junior' });
        expect(c.accepted).toBe(true);
        const tooLow = cs.offerContract({ playerId: 2, salary: 10000, duration: 2, type: 'Junior' });
        expect(tooLow).toBeNull();
    });

    test('Duration > 5 rejected', () => {
        const c = cs.offerContract({ playerId: 1, salary: 50000, duration: 6, type: 'Junior' });
        expect(c).toBeNull();
    });

    test('Pay weekly salary debits', () => {
        cs.offerContract({ playerId: 1, salary: 50000, duration: 2, type: 'Junior' });
        const r = cs.payWeeklySalary({ teamId: 1, weekOfYear: 1, players: [1] });
        expect(r.totalCost).toBe(50000);
        expect(r.paid).toBe(true);
    });

    test('Late payment causes penalty', () => {
        cs.offerContract({ playerId: 1, salary: 50000, duration: 2, type: 'Junior' });
        cs.payWeeklySalary({ teamId: 1, weekOfYear: 1, players: [1] });
        const r = cs.payWeeklySalary({ teamId: 1, weekOfYear: 4, players: [1] });
        expect(r.latePenalty).toBeGreaterThan(0);
    });

    test('Goal bonus paid 1× per goal', () => {
        cs.offerContract({ playerId: 1, salary: 50000, duration: 2, type: 'Junior', bonuses: { perGoal: 5000 } });
        const b1 = cs.payGoalBonus(1, 1);
        const b1Again = cs.payGoalBonus(1, 1);
        expect(b1).toBe(5000);
        expect(b1Again).toBe(0);
    });

    test('Champion bonus paid 1×', () => {
        cs.offerContract({ playerId: 1, salary: 100000, duration: 3, type: 'Senior', bonuses: { championBonus: 50000 } });
        expect(cs.payChampionBonus(1)).toBe(50000);
        expect(cs.payChampionBonus(1)).toBe(0);
    });

    test('Renewal blocked while contract active', () => {
        cs.offerContract({ playerId: 1, salary: 50000, duration: 2, type: 'Junior' });
        const renewal = cs.renewContract(1, { salary: 60000, duration: 3, type: 'Senior' });
        expect(renewal).toBeNull();
    });

    test('After finish, renewal works', () => {
        cs.offerContract({ playerId: 1, salary: 50000, duration: 2, type: 'Junior' });
        cs.finishContract(1);
        const renewal = cs.renewContract(1, { salary: 100000, duration: 3, type: 'Senior' });
        expect(renewal).not.toBeNull();
    });
});
