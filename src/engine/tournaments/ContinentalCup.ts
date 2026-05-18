import { Tournament } from './Tournament';

import { rng as systemRng } from '../rng.js';
import { Team } from "../types.js";
import { Engine } from "../engine.js";

export class ContinentalCup extends Tournament {
    constructor(id: string, name: string, groupScheduleWeeks: number[], knockoutScheduleWeeks: number[]) {
        super(id, name);
        this.groupScheduleWeeks = groupScheduleWeeks;
        this.knockoutScheduleWeeks = knockoutScheduleWeeks;
        this.groups = [];
        this.phase = 'GROUPS'; // GROUPS or KNOCKOUT
        this.currentRoundGroup = 0;
        this.knockoutMatches = [];
        this.knockoutPhaseIndex = 0;
    }

    init(teamIds: any[]) {
        super.init(teamIds);
        // BUG-FIX: reset all phase state so tournament restarts each season
        this.phase = 'GROUPS';
        this.currentRoundGroup = 0;
        this.knockoutMatches = [];
        this.knockoutPhaseIndex = 0;
        this.winner = null;
        this.groups = this.createGroups(teamIds, 4);
    }

    createGroups(teamIds: (string | number)[], teamsPerGroup: number) {
        const shuffled = [...teamIds].sort(() => 0.5 - systemRng());
        const groups = [];
        const numGroups = Math.ceil(shuffled.length / teamsPerGroup);
        for (let i = 0; i < numGroups; i++) {
            const groupTeams = shuffled.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup);
            groups.push({
                teams: groupTeams,
                standings: groupTeams.map((id: string | number) => ({
                    teamId: id, played: 0, won: 0, drawn: 0, lost: 0,
                    goalsFor: 0, goalsAgainst: 0, points: 0
                })),
                fixtures: this.generateGroupFixtures(groupTeams)
            });
        }
        return groups;
    }

    generateGroupFixtures(teams: (string | number)[]) {
        const rounds = [];
        const n = teams.length;
        // Simple round-robin (single leg for groups)
        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                rounds.push({ home: teams[i], away: teams[j], score: null, played: false });
            }
        }
        // Split into rounds of n/2 matches
        const matchesPerRound = Math.floor(n / 2);
        const fixtures = [];
        for (let i = 0; i < rounds.length; i += matchesPerRound) {
            fixtures.push(rounds.slice(i, i + matchesPerRound));
        }
        return fixtures;
    }

    advanceWeek(engine: any, week: number) {
        if (this.phase === 'GROUPS') {
            const roundIndex = this.groupScheduleWeeks.indexOf(week);
            if (roundIndex === -1 || roundIndex !== this.currentRoundGroup) return null;

            const allResults: Record<string, unknown>[] = [];
            this.groups.forEach((g: Record<string, unknown>) => {
                if (this.currentRoundGroup >= (g.fixtures as unknown[]).length) return;
                const matches = (g.fixtures as Record<string, unknown>[][])[this.currentRoundGroup];
                matches.forEach((m: Record<string, unknown>) => {
                    if (m.played) return;
                    const result = (engine as Record<string, Function>).playMatch(m.home, m.away, true);
                    m.score = result;
                    m.played = true;
                    allResults.push(m);

                    const homeRow = (g.standings as Record<string, unknown>[]).find((s: Record<string, unknown>) => s.teamId === m.home);
                    const awayRow = (g.standings as Record<string, unknown>[]).find((s: Record<string, unknown>) => s.teamId === m.away);
                    if (!homeRow || !awayRow) return;
                    (homeRow.played as number)++; (awayRow.played as number)++;
                    (homeRow.goalsFor as number) += result.homeGoals; (homeRow.goalsAgainst as number) += result.awayGoals;
                    (awayRow.goalsFor as number) += result.awayGoals; (awayRow.goalsAgainst as number) += result.homeGoals;
                    if (result.homeGoals > result.awayGoals) { (homeRow.won as number)++; (homeRow.points as number) += 3; (awayRow.lost as number)++; }
                    else if (result.homeGoals < result.awayGoals) { (awayRow.won as number)++; (awayRow.points as number) += 3; (homeRow.lost as number)++; }
                    else { (homeRow.drawn as number)++; (homeRow.points as number) += 1; (awayRow.drawn as number)++; (awayRow.points as number) += 1; }
                });
                (g.standings as Record<string, unknown>[]).sort((a: any, b: any) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
            });

            this.currentRoundGroup++;

            // Check if groups finished
            const allGroupsFinished = this.groups.every((g: Record<string, unknown>) => this.currentRoundGroup >= (g.fixtures as unknown[]).length);
            if (allGroupsFinished) {
                this.phase = 'KNOCKOUT';
                const qualifiedTeams: (string | number)[] = [];
                this.groups.forEach((g: Record<string, unknown>) => {
                    qualifiedTeams.push((g.standings as Record<string, unknown>[])[0].teamId as (string | number));
                    if ((g.standings as Record<string, unknown>[]).length > 1) qualifiedTeams.push((g.standings as Record<string, unknown>[])[1].teamId as (string | number));
                });
                this.knockoutMatches = this.createKnockoutRound(qualifiedTeams);
            }

            return allResults.length > 0 ? allResults : null;
        }

        if (this.phase === 'KNOCKOUT') {
            if (this.knockoutPhaseIndex >= this.knockoutScheduleWeeks.length) return null;
            if (this.knockoutScheduleWeeks[this.knockoutPhaseIndex] !== week) return null;

            const results: Record<string, unknown>[] = [];
            const nextPhaseTeams: (string | number)[] = [];

            this.knockoutMatches.forEach((m: Record<string, unknown>) => {
                if (m.away === null) {
                    nextPhaseTeams.push(m.home as (string | number));
                    results.push(m);
                } else {
                    const result = (engine as Record<string, Function>).playMatch(m.home, m.away, true);
                    m.score = result;
                    m.played = true;
                    results.push(m);
                    const winnerId = result.homeGoals > result.awayGoals ? m.home :
                        result.awayGoals > result.homeGoals ? m.away :
                            (systemRng() > 0.5 ? m.home : m.away);
                    nextPhaseTeams.push(winnerId as (string | number));
                }
            });

            this.knockoutPhaseIndex++;
            if (nextPhaseTeams.length === 1) {
                this.winner = nextPhaseTeams[0];
                this.isActive = false;
            } else {
                this.knockoutMatches = this.createKnockoutRound(nextPhaseTeams);
            }

            return results;
        }

        return null;
    }

    createKnockoutRound(teams: (string | number)[]) {
        const matches = [];
        const shuffled = [...teams].sort(() => 0.5 - systemRng());
        for (let i = 0; i < shuffled.length; i += 2) {
            if (shuffled[i + 1]) {
                matches.push({ home: shuffled[i], away: shuffled[i + 1], score: null, played: false });
            } else {
                matches.push({ home: shuffled[i], away: null, score: null, played: false });
            }
        }
        return matches;
    }

    groupScheduleWeeks: number[];
    knockoutScheduleWeeks: number[];
    groups: Record<string, unknown>[];
    phase: string;
    currentRoundGroup: number;
    knockoutMatches: Record<string, unknown>[];
    knockoutPhaseIndex: number;
}
