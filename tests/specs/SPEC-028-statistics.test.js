// SPEC-028: Analytics & Statistics harness
import { describe, test, expect, beforeEach } from 'vitest';
import { StatisticsSystem } from '../../src/engine/systems/StatisticsSystem.js';

describe('SPEC-028: Statistics System', () => {
    let stats;
    beforeEach(() => {
        stats = new StatisticsSystem();
    });

    test('Record match updates team stats', () => {
        stats.recordMatch({ matchId: 1, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 3, awayGoals: 1, scorers: [101, 101, 102] });
        const t1 = stats.getTeamStats(1, 2026);
        expect(t1.wins).toBe(1);
        expect(t1.goalsFor).toBe(3);
        expect(t1.goalsAgainst).toBe(1);
    });

    test('Player stats track goals', () => {
        stats.recordMatch({ matchId: 1, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 2, awayGoals: 0, scorers: [101, 101] });
        const p = stats.getPlayerStats(101, 2026);
        expect(p.goals).toBe(2);
    });

    test('Clean sheet counted', () => {
        stats.recordMatch({ matchId: 1, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 2, awayGoals: 0, scorers: [101, 101] });
        const t1 = stats.getTeamStats(1, 2026);
        expect(t1.cleanSheets).toBe(1);
    });

    test('Form calculated', () => {
        for (let i = 0; i < 5; i++) {
            stats.recordMatch({ matchId: i, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 2, awayGoals: 0, scorers: [101, 101] });
        }
        const t1 = stats.getTeamStats(1, 2026);
        expect(['Excellent', 'Good']).toContain(t1.form);
    });

    test('Season grade A+ = 90+ pts', () => {
        // 30 wins = 90 pts
        for (let i = 0; i < 30; i++) {
            stats.recordMatch({ matchId: i, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 1, awayGoals: 0, scorers: [101] });
        }
        const t1 = stats.getTeamStats(1, 2026);
        expect(t1.seasonGrade).toBe('A+');
    });

    test('Goal difference calculated', () => {
        stats.recordMatch({ matchId: 1, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 5, awayGoals: 1, scorers: [101] });
        const t1 = stats.getTeamStats(1, 2026);
        expect(t1.goalDifference).toBe(4);
    });

    test('Comparison returns diff', () => {
        stats.recordMatch({ matchId: 1, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 3, awayGoals: 0, scorers: [101, 101, 101] });
        stats.recordMatch({ matchId: 2, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 1, awayGoals: 0, scorers: [102] });
        const comp = stats.getComparison(101, 102, 2026);
        expect(comp.goals_diff).toBe(2);
    });

    test('Top scorer tracked', () => {
        stats.recordMatch({ matchId: 1, season: 2026, homeTeamId: 1, awayTeamId: 2, homeGoals: 3, awayGoals: 0, scorers: [101, 101, 102] });
        const t1 = stats.getTeamStats(1, 2026);
        expect(t1.topScorer.playerId).toBe(101);
    });
});
