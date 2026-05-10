// Regression test for BUG-022 / BUG-077
// Division ecosystem degrades: processPromoRelegation only ran for bot's division,
// so div 2 shrank each season (teams leave, nothing refills from div 1 / div 3).
// Fix: processPromoRelegation runs for ALL zone/division leagues each season.
import { describe, test, expect } from 'vitest';
import { processPromoRelegation } from '../../src/engine/SeasonSystem';

import { getDivisionCounts } from '../../src/engine/SeasonSystem';

function makeTeams(divMap) {
    return Object.entries(divMap).map(([id, div]) => ({
        id: parseInt(id), zone: 'BRA', division: div, name: `Team${id}`
    }));
}

function countInDiv(teams, div) {
    return teams.filter(t => t.zone === 'BRA' && t.division === div).length;
}

describe('BUG-022 — All divisions process promo/relegation', () => {

    test('real Brazilian rules: div 2 promotes top 4 and relegates bottom 4', () => {
        // 20 teams in div 2
        const teams = [];
        for (let i = 1; i <= 20; i++) teams.push({ id: i, zone: 'BRA', division: 2, name: `T${i}` });
        const standings = teams.map((t, i) => ({ teamId: t.id, points: 100 - i * 5 }));
        processPromoRelegation(teams, standings, 'BRA', 2);
        // Top 4 promoted to div 1
        expect(teams.find(t => t.id === 1).division).toBe(1);
        expect(teams.find(t => t.id === 4).division).toBe(1);
        expect(teams.find(t => t.id === 5).division).toBe(2); // not promoted
        // Bottom 4 relegated to div 3
        expect(teams.find(t => t.id === 17).division).toBe(3);
        expect(teams.find(t => t.id === 20).division).toBe(3);
        expect(teams.find(t => t.id === 16).division).toBe(2); // not relegated
    });

    test('div 1 only relegates bottom 4, never promotes above div 1', () => {
        const teams = [];
        for (let i = 1; i <= 20; i++) teams.push({ id: i, zone: 'BRA', division: 1, name: `T${i}` });
        const standings = teams.map((t, i) => ({ teamId: t.id, points: 100 - i * 5 }));
        processPromoRelegation(teams, standings, 'BRA', 1);
        expect(teams.find(t => t.id === 1).division).toBe(1); // champion stays
        expect(teams.find(t => t.id === 17).division).toBe(2); // relegated
        expect(teams.find(t => t.id === 20).division).toBe(2); // relegated
        expect(teams.find(t => t.id === 16).division).toBe(1); // 16th stays
    });

    test('div 4 only promotes top 4, never relegates below div 4', () => {
        const teams = [];
        for (let i = 1; i <= 20; i++) teams.push({ id: i, zone: 'BRA', division: 4, name: `T${i}` });
        const standings = teams.map((t, i) => ({ teamId: t.id, points: 100 - i * 5 }));
        processPromoRelegation(teams, standings, 'BRA', 4);
        expect(teams.find(t => t.id === 1).division).toBe(3); // promoted
        expect(teams.find(t => t.id === 4).division).toBe(3); // promoted
        expect(teams.find(t => t.id === 20).division).toBe(4); // cannot go below 4
    });

    test('getDivisionCounts returns correct counts per division', () => {
        expect(getDivisionCounts(1)).toEqual({ promoCount: 0, relCount: 4 });
        expect(getDivisionCounts(2)).toEqual({ promoCount: 4, relCount: 4 });
        expect(getDivisionCounts(3)).toEqual({ promoCount: 4, relCount: 4 });
        expect(getDivisionCounts(4)).toEqual({ promoCount: 4, relCount: 0 });
    });

    test('BUG-022: all 4 divs processed each season → div counts stay stable (20 teams each)', () => {
        // 80 teams total, 20 per division
        const teams = [];
        for (let div = 1; div <= 4; div++) {
            for (let i = 1; i <= 20; i++) {
                teams.push({ id: (div - 1) * 20 + i, zone: 'BRA', division: div, name: `D${div}T${i}` });
            }
        }
        // All divisions processed with fixed standings (top team wins, rest sorted)
        for (let div = 1; div <= 4; div++) {
            const divTeams = teams.filter(t => t.division === div);
            const standings = divTeams.map((t, i) => ({ teamId: t.id, points: 100 - i * 5 }));
            processPromoRelegation(teams, standings, 'BRA', div);
        }
        // Each division should still have 20 teams (4 in + 4 out = net 0)
        expect(countInDiv(teams, 1)).toBe(20);
        expect(countInDiv(teams, 2)).toBe(20);
        expect(countInDiv(teams, 3)).toBe(20);
        expect(countInDiv(teams, 4)).toBe(20);
    });
});
