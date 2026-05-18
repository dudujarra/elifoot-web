import { Player, PlayerCareerStats } from "./types.js";

export function initCareerStats(player: Player): PlayerCareerStats {
    if (!player.career) {
        player.career = {
            totalGoals: 0,
            totalAssists: 0,
            totalApps: 0,
            totalCards: 0,
            totalMotm: 0,
            hatTricks: 0, // BUG-086: Hat_trick achievement callsite
            seasonGoals: 0,
            seasonAssists: 0,
            seasonApps: 0,
            seasonCards: 0,
            seasonMotm: 0,
            history: [], // [{season, team, goals, assists, apps}]
        };
    } else {
        if (player.career.hatTricks === undefined) {
            // BUG-086: backfill em saves antigos
            player.career.hatTricks = 0;
        }
        if (!Array.isArray(player.career.history)) {
            player.career.history = [];
        }
    }
    return player.career!;
}

export function recordMatchStats(player: Player, goals: number, assists: number, cards: number, isMotm: boolean): void {
    const career = initCareerStats(player);
    career.totalGoals += goals;
    career.totalAssists += assists;
    career.totalApps += 1;
    career.totalCards += cards;
    career.seasonGoals += goals;
    career.seasonAssists += assists;
    career.seasonApps += 1;
    career.seasonCards += cards;
    if (isMotm) {
        career.totalMotm += 1;
        career.seasonMotm += 1;
    }
    // BUG-086: hat-trick = 3+ gols na partida (callsite real para Hat_trick achievement)
    if (goals >= 3) {
        career.hatTricks = (career.hatTricks || 0) + 1;
    }
}

export function closeSeasonStats(player: Player, seasonNum: number, teamName: string): void {
    const career = initCareerStats(player);
    career.history.push({
        season: seasonNum,
        team: teamName,
        goals: career.seasonGoals,
        assists: career.seasonAssists,
        apps: career.seasonApps,
        cards: career.seasonCards,
        motm: career.seasonMotm,
    });
    // CRIT-01: Cap at 25 seasons to prevent unbounded heap growth in soak tests
    if (career.history.length > 25) career.history.shift();
    // Reset season
    career.seasonGoals = 0;
    career.seasonAssists = 0;
    career.seasonApps = 0;
    career.seasonCards = 0;
    career.seasonMotm = 0;
}
