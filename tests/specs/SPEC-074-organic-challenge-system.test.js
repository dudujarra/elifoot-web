import { describe, test, expect } from 'vitest';
import { evaluate, accept, complete } from '../../src/engine/OrganicChallengeSystem.js';

const base = {
    managerId: 1, currentClubId: 10,
    season: 2, week: 10, managerReputation: 50,
    managerAvailable: true,
};

describe('SPEC-074: Organic Challenge System', () => {

    test('no challenge in season 1', () => {
        const r = evaluate({ ...base, season: 1 });
        expect(r.challengeAvailable).toBe(false);
    });

    test('crisis_save appears when relegation zone club exists', () => {
        const r = evaluate({
            ...base,
            clubsInRelegationZone: [{ id: 99, name: 'Bahia', division: 1 }],
        });
        expect(r.challengeAvailable).toBe(true);
        expect(r.challenge.type).toBe('crisis_save');
    });

    test('crisis_save not for current club', () => {
        const r = evaluate({
            ...base,
            currentClubId: 99,
            clubsInRelegationZone: [{ id: 99, name: 'Bahia', division: 1 }],
        });
        expect(r.challengeAvailable).toBe(false);
    });

    test('giant_revival appears for historic club in lower division', () => {
        const r = evaluate({
            ...base,
            managerReputation: 45,
            historicClubsInLowerDivisions: [{ id: 55, name: 'Cruzeiro', division: 2, historicDivision: 1 }],
        });
        expect(r.challengeAvailable).toBe(true);
        expect(r.challenge.type).toBe('giant_revival');
    });

    test('style_duel appears when rival match is imminent', () => {
        const r = evaluate({ ...base, upcomingRivalWeek: 11 }); // 1 week away
        expect(r.challengeAvailable).toBe(true);
        expect(r.challenge.type).toBe('style_duel');
    });

    test('challenge has all required fields', () => {
        const r = evaluate({
            ...base,
            clubsInRelegationZone: [{ id: 99, name: 'Bahia', division: 1 }],
        });
        const c = r.challenge;
        expect(c.challengeId).toBeTruthy();
        expect(c.description).toBeTruthy();
        expect(c.reward.reputationBoost).toBeGreaterThan(0);
        expect(c.penalty.reputationLoss).toBeGreaterThan(0);
        expect(c.optional).toBe(true);
    });

    test('challenge always optional', () => {
        const r = evaluate({
            ...base,
            clubsInRelegationZone: [{ id: 99, name: 'Bahia', division: 1 }],
        });
        expect(r.challenge.optional).toBe(true);
    });

    test('accept returns challengeId', () => {
        const r = evaluate({
            ...base,
            clubsInRelegationZone: [{ id: 99, name: 'Bahia', division: 1 }],
        });
        const a = accept(r.challenge);
        expect(a.accepted).toBe(true);
        expect(a.challengeId).toBe(r.challenge.challengeId);
    });

    test('complete success gives rep boost and narrativeTitle', () => {
        const result = complete({ challengeType: 'crisis_save', success: true });
        expect(result.reputationDelta).toBeGreaterThan(0);
        expect(result.narrativeTitle).toBeTruthy();
        expect(result.outcome).toBe('success');
    });

    test('complete failure gives rep loss', () => {
        const result = complete({ challengeType: 'crisis_save', success: false });
        expect(result.reputationDelta).toBeLessThan(0);
        expect(result.outcome).toBe('failure');
    });

    test('giant_revival requires rep ≥ 40', () => {
        const r = evaluate({
            ...base,
            managerReputation: 30, // below 40 required for giant_revival
            historicClubsInLowerDivisions: [{ id: 55, name: 'Cruzeiro', division: 2, historicDivision: 1 }],
        });
        // giant_revival shouldn't appear for low rep — might fall through to nothing
        if (r.challengeAvailable) {
            expect(r.challenge.type).not.toBe('giant_revival');
        }
    });
});
