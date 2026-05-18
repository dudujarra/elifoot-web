/**
 * MatchAnalyst — SPEC-A4
 *
 * Análise pós-jogo: gera 3 cards (melhor decisão / duvidosa / sorte-azar)
 * baseado em outcome, tática, formação, substituições.
 *
 * Pure function. Headless. Determinístico.
 */

export interface TacticMatchup {
    strongVs: string[];
    weakVs: string[];
}

const TACTIC_AGAINST_STYLE: Record<string, TacticMatchup> = {
    // Tática nossa : estilo oponente vencedor (rationale)
    'Defensivo': { strongVs: ['Ofensivo', 'Pressing'], weakVs: ['Posse', 'Contra-Ataque'] },
    'Ofensivo':  { strongVs: ['Defensivo', 'Posse'],   weakVs: ['Contra-Ataque', 'Pressing'] },
    'Contra-Ataque': { strongVs: ['Ofensivo', 'Pressing'], weakVs: ['Defensivo'] },
    'Posse': { strongVs: ['Pressing', 'Defensivo'], weakVs: ['Contra-Ataque'] },
    'Pressing': { strongVs: ['Posse'], weakVs: ['Contra-Ataque', 'Ofensivo'] },
    'Normal': { strongVs: [], weakVs: [] },
};

export interface MatchResult {
    isHomeTeam?: boolean;
    homeGoals?: number;
    awayGoals?: number;
}

export interface MatchAnalystOptions {
    result?: MatchResult;
    tacticUsed?: string;
    formationUsed?: string;
    opponentStyle?: string;
    _recentForm?: string[];
    subsUsed?: number;
}

export interface AnalysisCard {
    title: string;
    body: string;
    type: string;
}

export interface MatchAnalysis {
    best: AnalysisCard;
    dubious: AnalysisCard;
    luck: AnalysisCard;
}

/**
 * Gera análise pós-jogo.
 */
export function analyzeMatch({
    result = {},
    tacticUsed = 'Normal',
    formationUsed = '4-3-3',
    opponentStyle = 'Normal',
    _recentForm = [],
    subsUsed = 0,
}: MatchAnalystOptions = {}): MatchAnalysis {
    const ourGoals = result.isHomeTeam ? (result.homeGoals || 0) : (result.awayGoals || 0);
    const theirGoals = result.isHomeTeam ? (result.awayGoals || 0) : (result.homeGoals || 0);
    const diff = ourGoals - theirGoals;
    const outcome = diff > 0 ? 'win' : diff < 0 ? 'loss' : 'draw';

    const matchup = TACTIC_AGAINST_STYLE[tacticUsed] || { strongVs: [], weakVs: [] };
    const tacticWasGood = matchup.strongVs.includes(opponentStyle);
    const tacticWasWeak = matchup.weakVs.includes(opponentStyle);

    // === BEST DECISION ===
    let best: AnalysisCard;
    if (outcome === 'win') {
        if (tacticWasGood) {
            best = {
                title: 'TÁTICA CERTEIRA',
                body: `${tacticUsed} contra ${opponentStyle} do adversário — leitura precisa.`,
                type: 'tactic',
            };
        } else if (subsUsed > 0) {
            best = {
                title: 'GESTÃO DE ELENCO',
                body: `Substituições mudaram o ritmo. Você sentiu o jogo.`,
                type: 'subs',
            };
        } else {
            best = {
                title: 'CONVICÇÃO',
                body: `Manteve ${formationUsed} e foi premiado. Time confiou na tática.`,
                type: 'formation',
            };
        }
    } else if (outcome === 'draw') {
        best = {
            title: 'EQUILÍBRIO',
            body: `Empate mostra que ${tacticUsed} segurou. Não deu pra mais.`,
            type: 'tactic',
        };
    } else {
        // Loss
        best = {
            title: 'POSTURA RESPEITÁVEL',
            body: `Time não desistiu. ${formationUsed} manteve estrutura até o fim.`,
            type: 'spirit',
        };
    }

    // === DUBIOUS DECISION ===
    let dubious: AnalysisCard;
    if (outcome === 'loss' && tacticWasWeak) {
        dubious = {
            title: 'TÁTICA QUESTIONÁVEL',
            body: `${tacticUsed} é fraca contra ${opponentStyle}. Considere ajustar.`,
            type: 'tactic',
        };
    } else if (subsUsed === 0 && (outcome === 'loss' || outcome === 'draw')) {
        dubious = {
            title: 'BANCO INTOCADO',
            body: `Zero substituições. Reservas existem por algum motivo.`,
            type: 'subs',
        };
    } else if (outcome === 'win' && tacticWasWeak) {
        dubious = {
            title: 'VITÓRIA APESAR DA TÁTICA',
            body: `${tacticUsed} vs ${opponentStyle} não é ideal. Sorte ou competência?`,
            type: 'tactic',
        };
    } else {
        dubious = {
            title: 'PREPARAÇÃO',
            body: `Próximo jogo, observe melhor o estilo adversário.`,
            type: 'preparation',
        };
    }

    // === LUCK ===
    let luck: AnalysisCard;
    if (outcome === 'win' && diff >= 3) {
        luck = {
            title: 'TUDO DEU CERTO',
            body: `${ourGoals}x${theirGoals}. Tarde abençoada.`,
            type: 'good',
        };
    } else if (outcome === 'loss' && diff <= -3) {
        luck = {
            title: 'NOITE PARA ESQUECER',
            body: `${ourGoals}x${theirGoals}. Bola não rolou redonda.`,
            type: 'bad',
        };
    } else if (outcome === 'draw' && ourGoals >= 2) {
        luck = {
            title: 'PONTO QUE PARECE DERROTA',
            body: `Empate ${ourGoals}x${theirGoals} sabe a pouco — chances tinham.`,
            type: 'neutral',
        };
    } else if (outcome === 'win' && diff === 1) {
        luck = {
            title: 'NA RAÇA',
            body: `${ourGoals}x${theirGoals}. Decidiu nos detalhes.`,
            type: 'good',
        };
    } else if (outcome === 'loss' && diff === -1) {
        luck = {
            title: 'PRÓXIMO E LONGE',
            body: `${ourGoals}x${theirGoals}. Um lance separa vitória de derrota.`,
            type: 'neutral',
        };
    } else {
        luck = {
            title: 'DENTRO DO ESPERADO',
            body: `${ourGoals}x${theirGoals}. Resultado coerente com o jogo.`,
            type: 'neutral',
        };
    }

    return { best, dubious, luck };
}

export { TACTIC_AGAINST_STYLE };
