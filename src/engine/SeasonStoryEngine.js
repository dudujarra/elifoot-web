/**
 * SPEC-150: Season Story Engine — gera resumo narrativo de cada temporada.
 */
export function generateSeasonStory({ wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0,
    topScorer = null, longestWinStreak = 0, biggestWin = null, worstLoss = null,
    position = 10, promoted = false, relegated = false, division = 1, seasonNumber = 1 } = {}) {

    const record = `${wins}V ${draws}E ${losses}D`;
    const mood = (promoted && wins >= 20) ? 'epic'
        : relegated ? 'tragic'
        : position <= 3 ? 'great'
        : position >= 17 ? 'survival'
        : 'mediocre';

    let headline;
    if (promoted && wins >= 20) {
        const divNames = ['', 'Série A', 'Série B', 'Série C', 'Série D'];
        headline = `Campeão! Promovido para ${divNames[division - 1] || 'divisão acima'} com ${wins} vitórias`;
    } else if (promoted) {
        headline = `Promovido! ${wins}V na temporada`;
    } else if (relegated) {
        headline = `Rebaixado após temporada difícil (${wins}V ${losses}D)`;
    } else if (longestWinStreak >= 8) {
        headline = `Sequência histórica de ${longestWinStreak} vitórias seguidas`;
    } else if (biggestWin?.diff >= 4) {
        headline = `Goleada memorável de ${biggestWin.score}`;
    } else {
        headline = `Temporada ${position}º — ${wins}V ${draws}E ${losses}D`;
    }

    const scorerText = topScorer?.goals > 0
        ? `${topScorer.name} — ${topScorer.goals} gols`
        : null;

    const moment = longestWinStreak >= 5
        ? `Sequência de ${longestWinStreak} vitórias`
        : (worstLoss?.diff >= 4 ? `Goleada sofrida: ${worstLoss.score}` : null);

    return { headline, topScorer: scorerText, record, moment, mood, season: seasonNumber };
}
