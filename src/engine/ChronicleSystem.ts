import { rng as systemRng } from './rng.js';
import { Player, Team } from "./types.js";

/**
 * ChronicleSystem — SPEC-082: Crônica do Save
 *
 * Prosa narrativa por temporada. Template-driven, sem LLM.
 * Interpolação de dados reais do save (arcos, títulos, vexames, rivalidades).
 *
 * Stateless: recebe dados da season, retorna texto.
 */

const TEMPLATES: Record<string, string[]> = {
    title: [
        'Uma temporada inesquecível. {club} conquistou {title} e escreveu seu nome na história.',
        'O técnico {manager} levou {club} ao topo com {title}. A torcida não vai esquecer.',
    ],
    promotion: [
        '{club} subiu para {nextDivision}. O trabalho de reconstrução começa a dar frutos.',
        'Temporada de superação: {club} conseguiu o acesso tão esperado.',
    ],
    relegation: [
        'Ano difícil para {club}. O rebaixamento é amargo, mas o caminho de volta começa agora.',
        'A temporada terminou da pior forma: {club} desceu para {nextDivision}.',
    ],
    vexame: [
        'O {score} contra {opponent} ainda dói. Mas o técnico sobreviveu e prometeu resposta.',
        'Vexame histórico na temporada — {score}. O clube precisará esquecer para seguir em frente.',
    ],
    solid: [
        'Temporada sólida de {club}: {wins} vitórias, {position}º lugar. Base para crescer.',
        '{club} terminou em {position}º. Sem títulos, mas com consistência que constrói futuros.',
    ],
    neutral: [
        'Mais uma temporada no roteiro do {club}. O trabalho continua.',
    ],
};

export interface SeasonData {
    finalPosition?: number;
    titlesWon?: string[];
    relegationOccurred?: boolean;
    promotionOccurred?: boolean;
    worstLoss?: { score: string; opponent: string; diff: number } | null;
    biggestWin?: { score: string; opponent: string; diff: number } | null;
    wins?: number;
    totalTeams?: number;
    topScorer?: { name: string; goals: number };
    keyDerby?: { result: string; opponent: string; score: string };
    starPlayer?: { name: string; goals?: number; apps?: number };
}

export interface ChronicleResult {
    season: number;
    chronicle: string;
    mood: string;
    clubName: string;
    managerName: string;
    seasonData: SeasonData;
}

export interface GenerateOptions {
    season?: number;
    clubName?: string;
    managerName?: string;
    seasonData?: SeasonData;
}

/**
 * Gera crônica narrativa de uma temporada.
 */
export function generate({ season = 1, clubName = 'Clube', managerName = 'Técnico', seasonData = {} }: GenerateOptions = {}): ChronicleResult {
    const {
        finalPosition = 10,
        titlesWon = [],
        relegationOccurred = false,
        promotionOccurred = false,
        worstLoss = null,
        wins = 0,
        totalTeams = 20,
    } = seasonData;

    let template: string;
    let mood: string;
    let vars: Record<string, any> = { club: clubName, manager: managerName, wins, position: finalPosition };

    if (titlesWon.length > 0) {
        template = pick(TEMPLATES.title);
        vars.title = titlesWon[0];
        mood = 'triumph';
    } else if (promotionOccurred) {
        template = pick(TEMPLATES.promotion);
        vars.nextDivision = 'divisão superior';
        mood = 'rise';
    } else if (relegationOccurred) {
        template = pick(TEMPLATES.relegation);
        vars.nextDivision = 'divisão inferior';
        mood = 'fall';
    } else if (worstLoss && worstLoss.diff >= 4) {
        template = pick(TEMPLATES.vexame);
        vars.score = worstLoss.score || '0-4';
        vars.opponent = worstLoss.opponent || 'adversário';
        mood = 'shame';
    } else if (finalPosition <= Math.ceil(totalTeams * 0.4)) {
        template = pick(TEMPLATES.solid);
        mood = 'solid';
    } else {
        template = pick(TEMPLATES.neutral);
        mood = 'neutral';
    }

    let chronicle = interpolate(template, vars);

    // SPEC-F4.1: enriquecer com referências reais (top scorer, key derby, star player)
    chronicle = enrichWithRealData(chronicle, seasonData);

    return { season, chronicle, mood, clubName, managerName, seasonData };
}

/**
 * SPEC-F4.1: enriquecer chronicle com dados reais agregados.
 * Append parágrafos com nomes de jogadores, eventos específicos.
 */
export function enrichWithRealData(baseChronicle: string, seasonData: SeasonData = {}): string {
    const parts: string[] = [baseChronicle];

    if (seasonData.topScorer) {
        const ts = seasonData.topScorer;
        parts.push(`Artilheiro: ${ts.name} com ${ts.goals} gols. Ele carregou o ataque.`);
    }

    if (seasonData.keyDerby) {
        const kd = seasonData.keyDerby;
        const verbo = kd.result === 'W' ? 'venceu' : kd.result === 'L' ? 'perdeu pra' : 'empatou com';
        parts.push(`Clássico decisivo: ${verbo} ${kd.opponent} por ${kd.score}.`);
    }

    if (seasonData.starPlayer && seasonData.starPlayer.name) {
        const sp = seasonData.starPlayer;
        parts.push(`A estrela ${sp.name} contribuiu ${sp.goals || 0} gols em ${sp.apps || 0} jogos.`);
    }

    if (seasonData.biggestWin) {
        const bw = seasonData.biggestWin;
        parts.push(`Maior vitória: ${bw.score} contra ${bw.opponent}. Festa na arquibancada.`);
    }

    return parts.join(' ');
}

// ─── helpers ────────────────────────────────────────────────

function pick(arr: string[]): string {
    return arr[Math.floor(systemRng() * arr.length)];
}

function interpolate(template: string, vars: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (_: unknown, key: string) => vars[key] !== undefined ? vars[key] : `{${key}}`);
}
