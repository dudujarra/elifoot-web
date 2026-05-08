// SPEC-011: Staff System harness
import { describe, test, expect } from 'vitest';
import { STAFF_ROLES, StaffManager } from '../../src/engine/StadiumSystem.js';

describe('SPEC-011: Staff System', () => {
    test('5 staff roles defined', () => {
        expect(STAFF_ROLES.length).toBe(5);
    });

    test('Each role has cost + effect', () => {
        STAFF_ROLES.forEach((role) => {
            expect(role.cost).toBeGreaterThan(0);
            expect(role.effect).toBeDefined();
            expect(role.npc).toBeDefined();
        });
    });

    test('StaffManager hire works', () => {
        const sm = new StaffManager();
        const r = sm.hire('physio');
        expect(r.success).toBe(true);
        expect(sm.has('physio')).toBe(true);
    });

    test('Cant hire same role twice', () => {
        const sm = new StaffManager();
        sm.hire('scout');
        const r = sm.hire('scout');
        expect(r.success).toBe(false);
    });

    test('Fire works', () => {
        const sm = new StaffManager();
        sm.hire('finance');
        const r = sm.fire('finance');
        expect(r.success).toBe(true);
        expect(sm.has('finance')).toBe(false);
    });

    test('Weekly cost sums hires', () => {
        const sm = new StaffManager();
        sm.hire('physio'); // 50K
        sm.hire('scout'); // 40K
        expect(sm.getWeeklyCost()).toBe(90000);
    });

    test('Effects compounded by hires', () => {
        const sm = new StaffManager();
        sm.hire('physio');
        sm.hire('scout');
        const e = sm.getEffects();
        expect(e.physio).toBeDefined();
        expect(e.scout).toBeDefined();
    });

    test('Invalid role rejected', () => {
        const sm = new StaffManager();
        const r = sm.hire('invalid_role');
        expect(r.success).toBe(false);
    });
});
