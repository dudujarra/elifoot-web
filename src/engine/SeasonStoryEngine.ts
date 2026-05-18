/**
 * SPEC-150: Season Story Engine — gera resumo narrativo de cada temporada.
 * AUDIT-FIX #G: Adicionado sistema de arcos inter-temporada.
 */
export interface StoryInput {
    wins?: number;
    draws?: number;
    losses?: number;
    _goalsFor?: number;
    _goalsAgainst?: number;
    topScorer?: { name: string; goals: number } | null;
    longestWinStreak?: number;
    biggestWin?: { diff: number; score: string } | null;
    worstLoss?: { diff: number; score: string } | null;
    position?: number;
    promoted?: boolean;
    relegated?: boolean;
    division?: number;
    seasonNumber?: number;
    previousStories?: SeasonStory[];
}

export interface SeasonStory {
    headline: string;
    topScorer: string | null;
    record: string;
    moment: string | null;
    mood: string;
    season: number;
    arc: string | null;
}

export function generateSeasonStory({
    wins = 0, draws = 0, losses = 0, _goalsFor = 0, _goalsAgainst = 0,
    topScorer = null, longestWinStreak = 0, biggestWin = null, worstLoss = null,
    position = 10, promoted = false, relegated = false, division = 1, seasonNumber = 1,
    previousStories = []
}: StoryInput = {}): SeasonStory {

    const record = `${wins}V ${draws}E ${losses}D`;
    const mood = (promoted && wins >= 20) ? 'epic'
        : relegated ? 'tragic'
        : position <= 3 ? 'great'
        : position >= 17 ? 'survival'
        : 'mediocre';

    // ── AUDIT-FIX #G: Inter-season arc detection ──────────────
    const arc = detectArc(previousStories, mood, division, position, seasonNumber);

    let headline: string;
    if (arc.active && arc.headline) {
        // Use arc narrative instead of generic headline
        headline = arc.headline;
    } else if (promoted && wins >= 20) {
        const divNames = ['', 'Série A', 'Série B', 'Série C', 'Série D'];
        headline = `Campeão! Promovido para ${divNames[division - 1] || 'divisão acima'} com ${wins} vitórias`;
    } else if (promoted) {
        headline = `Promovido! ${wins}V na temporada`;
    } else if (relegated) {
        headline = `Rebaixado após temporada difícil (${wins}V ${losses}D)`;
    } else if (longestWinStreak >= 8) {
        headline = `Sequência histórica de ${longestWinStreak} vitórias seguidas`;
    } else if (biggestWin && biggestWin.diff >= 4) {
        headline = `Goleada memorável de ${biggestWin.score}`;
    } else {
        headline = `Temporada ${position}º — ${wins}V ${draws}E ${losses}D`;
    }

    const scorerText = topScorer && topScorer.goals > 0
        ? `${topScorer.name} — ${topScorer.goals} gols`
        : null;

    const moment = longestWinStreak >= 5
        ? `Sequência de ${longestWinStreak} vitórias`
        : (worstLoss && worstLoss.diff >= 4 ? `Goleada sofrida: ${worstLoss.score}` : null);

    return { headline, topScorer: scorerText, record, moment, mood, season: seasonNumber, arc: arc.name || null };
}

export interface ArcResult {
    active: boolean;
    name?: string;
    headline?: string;
}

/**
 * AUDIT-FIX #G: Detect multi-season narrative arcs.
 * Tracks patterns across previous seasons and generates contextual headlines.
 */
function detectArc(previousStories: SeasonStory[], currentMood: string, division: number, position: number, season: number): ArcResult {
    if (!previousStories || previousStories.length < 2) {
        return { active: false };
    }

    const recent = previousStories.slice(-5);

    // ── ARC: DYNASTY (3+ consecutive good/epic seasons) ──────
    const consecutiveGood = countConsecutiveFromEnd(recent, (s: SeasonStory) => s.mood === 'great' || s.mood === 'epic');
    if (consecutiveGood >= 2 && (currentMood === 'great' || currentMood === 'epic')) {
        const years = consecutiveGood + 1;
        return {
            active: true,
            name: 'DYNASTY',
            headline: `🏛️ ${years}ª temporada consecutiva no topo — a DINASTIA continua!`
        };
    }

    // ── ARC: REBUILDING (2+ mediocre/survival after tragic) ──
    const hadTragic = recent.some((s: SeasonStory) => s.mood === 'tragic');
    const recentMediocre = countConsecutiveFromEnd(recent, (s: SeasonStory) => s.mood === 'mediocre' || s.mood === 'survival');
    if (hadTragic && recentMediocre >= 1 && (currentMood === 'mediocre' || currentMood === 'survival')) {
        const years = recentMediocre + 1;
        return {
            active: true,
            name: 'REBUILDING',
            headline: `🔨 Ano ${years} de reconstrução — o projeto começa a tomar forma`
        };
    }

    // ── ARC: PHOENIX (great/epic season right after tragic) ──
    const lastMood = recent[recent.length - 1]?.mood;
    if (lastMood === 'tragic' && (currentMood === 'great' || currentMood === 'epic')) {
        return {
            active: true,
            name: 'PHOENIX',
            headline: `🔥 RENASCIMENTO! Da humilhação ao topo em uma temporada!`
        };
    }

    // ── ARC: YO-YO (alternating tragic/great moods) ──────────
    if (recent.length >= 3) {
        const pattern = recent.slice(-3).map((s: SeasonStory) => s.mood);
        const isYoyo = (pattern[0] === 'tragic' && pattern[1] === 'great' && currentMood === 'tragic') ||
                       (pattern[0] === 'great' && pattern[1] === 'tragic' && currentMood === 'great');
        if (isYoyo) {
            return {
                active: true,
                name: 'YOYO',
                headline: `🎢 O ELEVADOR não para — mais uma temporada na montanha-russa!`
            };
        }
    }

    // ── ARC: UNDERDOG CLIMB (steadily improving position) ────
    if (recent.length >= 2) {
        const improving = recent.every((s: SeasonStory, i: number) => {
            if (i === 0) return true;
            // mood order: tragic < survival < mediocre < great < epic
            const moodOrder: Record<string, number> = { tragic: 0, survival: 1, mediocre: 2, great: 3, epic: 4 };
            return (moodOrder[s.mood] || 0) >= (moodOrder[recent[i-1].mood] || 0);
        });
        const currentOrder: Record<string, number> = { tragic: 0, survival: 1, mediocre: 2, great: 3, epic: 4 };
        if (improving && (currentOrder[currentMood] || 0) > (currentOrder[recent[recent.length - 1]?.mood] || 0)) {
            return {
                active: true,
                name: 'UNDERDOG',
                headline: `📈 A escalada continua! ${season}ª temporada de progresso constante!`
            };
        }
    }

    return { active: false };
}

function countConsecutiveFromEnd<T>(arr: T[], predicate: (item: T) => boolean): number {
    let count = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
        if (predicate(arr[i])) count++;
        else break;
    }
    return count;
}
