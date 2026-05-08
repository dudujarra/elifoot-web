// SPEC-018: National Team harness
import { describe, test, expect, beforeEach } from 'vitest';
import { NationalTeamSystem, NATIONAL_MATCH_TYPES, MAX_SQUAD_SIZE } from '../../src/engine/systems/NationalTeamSystem.js';

describe('SPEC-018: National Team System', () => {
    let nat;
    beforeEach(() => {
        nat = new NationalTeamSystem();
    });

    test('3 match types defined', () => {
        expect(Object.keys(NATIONAL_MATCH_TYPES).length).toBe(3);
    });

    test('Max squad size 23', () => {
        expect(MAX_SQUAD_SIZE).toBe(23);
    });

    test('Callup player same country', () => {
        const r = nat.callupPlayer({ playerId: 1, playerCountry: 'BRA', countryId: 'BRA', matchType: 'Amistoso', dateWeek: 10 });
        expect(r.status).toBe('called_up');
        expect(r.stressDelta).toBe(10);
    });

    test('Callup other country rejected', () => {
        const r = nat.callupPlayer({ playerId: 1, playerCountry: 'BRA', countryId: 'ARG', matchType: 'Amistoso', dateWeek: 10 });
        expect(r).toBeNull();
    });

    test('Squad max 23', () => {
        let accepted = 0;
        for (let i = 0; i < 25; i++) {
            const r = nat.callupPlayer({ playerId: i, playerCountry: 'BRA', countryId: 'BRA', matchType: 'Amistoso', dateWeek: 10 });
            if (r) accepted++;
        }
        expect(accepted).toBe(23);
    });

    test('Qualifier win adds 3 pts', () => {
        nat.processNationalMatch({ countryId: 'BRA', result: 'win', weekOfYear: 15, matchType: 'Qualificador' });
        expect(nat.getQualifierPoints('BRA')).toBe(3);
    });

    test('Friendly does not affect qualifier pts', () => {
        nat.processNationalMatch({ countryId: 'BRA', result: 'win', weekOfYear: 5, matchType: 'Amistoso' });
        expect(nat.getQualifierPoints('BRA')).toBe(0);
    });

    test('Captain = highest OVR in squad', () => {
        nat.callupPlayer({ playerId: 1, playerCountry: 'BRA', countryId: 'BRA', matchType: 'Amistoso', dateWeek: 10 });
        nat.callupPlayer({ playerId: 2, playerCountry: 'BRA', countryId: 'BRA', matchType: 'Amistoso', dateWeek: 10 });
        const players = [{ id: 1, ovr: 70 }, { id: 2, ovr: 90 }];
        const captain = nat.designateCaptain('BRA', players);
        expect(captain.id).toBe(2);
    });

    test('Injury extra +2 weeks recovery', () => {
        const r = nat.processNationalMatch({ countryId: 'BRA', result: 'win', weekOfYear: 5, matchType: 'Copa', injuredPlayers: [1] });
        expect(r.injuries[0].extraWeeks).toBe(2);
    });
});
