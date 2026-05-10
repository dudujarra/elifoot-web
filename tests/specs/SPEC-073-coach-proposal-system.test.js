import { describe, test, expect } from 'vitest';
import { evaluate, decide } from '../../src/engine/CoachProposalSystem.js';

const base = {
    managerId: 1, currentClubId: 10, currentClubTier: 'mid',
    currentContractWeeksLeft: 20, week: 10, season: 2,
    availableClubs: [{ id: 99, name: 'Flamengo', tier: 'big' }],
};

describe('SPEC-073: Coach Proposals System', () => {

    test('no proposal before week 5', () => {
        const r = evaluate({ ...base, week: 3, managerReputation: 80, currentObjectiveMet: true });
        expect(r.proposalAvailable).toBe(false);
    });

    test('no proposal with low rep and no form', () => {
        const r = evaluate({ ...base, managerReputation: 20, recentForm: ['L','L','L','L'], currentObjectiveMet: false });
        expect(r.proposalAvailable).toBe(false);
    });

    test('proposal appears with rep≥70 + objective met', () => {
        const r = evaluate({ ...base, managerReputation: 75, currentObjectiveMet: true, recentForm: ['W','W','W','W'] });
        expect(r.proposalAvailable).toBe(true);
        expect(r.proposal).toBeDefined();
    });

    test('proposal appears with rep≥50 + 3+ recent wins', () => {
        const r = evaluate({ ...base, managerReputation: 55, recentForm: ['W','W','W','L'], currentObjectiveMet: false });
        expect(r.proposalAvailable).toBe(true);
    });

    test('proposal has required fields', () => {
        const r = evaluate({ ...base, managerReputation: 75, currentObjectiveMet: true, recentForm: ['W','W','W','W'] });
        const p = r.proposal;
        expect(p.proposalId).toBeTruthy();
        expect(p.fromClubName).toBeTruthy();
        expect(p.reputationBoost).toBeGreaterThan(0);
        expect(p.deadline).toBeGreaterThan(base.week);
        expect(p.reason).toBeTruthy();
    });

    test('reputationBoost > 0 for any proposal', () => {
        const r = evaluate({ ...base, managerReputation: 55, recentForm: ['W','W','W','L'] });
        expect(r.proposal.reputationBoost).toBeGreaterThan(0);
    });

    test('accept mid-season charges exit fee', () => {
        const d = decide({ decision: 'accept', exitFee: 500_000, currentContractWeeksLeft: 20 });
        expect(d.exitFeeCharged).toBe(500_000);
        expect(d.consequence).toBe('club_change');
        expect(d.reputationDelta).toBeGreaterThan(0);
    });

    test('accept near contract end no exit fee', () => {
        const d = decide({ decision: 'accept', exitFee: 500_000, currentContractWeeksLeft: 5 });
        expect(d.exitFeeCharged).toBe(0);
    });

    test('wait_contract_end gives small rep boost', () => {
        const d = decide({ decision: 'wait_contract_end' });
        expect(d.reputationDelta).toBeGreaterThanOrEqual(0);
        expect(d.consequence).toBe('wait');
    });

    test('refuse triggers rival_hires_alternative', () => {
        const d = decide({ decision: 'refuse' });
        expect(d.consequence).toBe('rival_hires_alternative');
        expect(d.reputationDelta).toBe(0);
    });
});
