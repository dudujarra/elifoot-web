/**
 * SPEC-F4.2 + F4.3: StarPlayerNarrative
 * Pure logic for generating star player quotes and detecting narrative moments.
 */

export const WEEKLY_QUOTE_TEMPLATES: readonly string[] = [
    "O {PLAYER} esta treinando forte, o foco e absoluto na proxima partida.",
    "{PLAYER} foi o ultimo a sair do campo no treino de hoje.",
    "Jornalistas elogiam a forma fisica de {PLAYER} nesta semana.",
    "{PLAYER} deu entrevista garantindo raca no proximo jogo.",
    "Clima bom: {PLAYER} comandou as brincadeiras no vestiario.",
    "Rumores sobre {PLAYER} sao ignorados pelo elenco.",
    "{PLAYER} fez trabalho de recuperacao intenso no DM.",
    "Torcida fez faixa especial para {PLAYER} na porta do CT.",
    "A precisao de {PLAYER} nos passes impressionou o tecnico hoje.",
    "{PLAYER} e um lider nato dentro e fora de campo."
] as const;

export type MomentType =
    | 'title_winner' | 'long_injury' | 'hat_trick'
    | 'derby_winner' | 'hundred_apps' | 'fifty_apps' | 'first_goal';

export const MOMENT_TEMPLATES: Readonly<Record<MomentType, string>> = {
    first_goal:   "Primeiro gol na temporada para {PLAYER}!",
    hat_trick:    "Hat-trick espetacular de {PLAYER}!",
    fifty_apps:   "{PLAYER} completa 50 jogos pelo clube!",
    hundred_apps: "Marca historica: 100 jogos de {PLAYER}!",
    long_injury:  "Drama: {PLAYER} sofre lesao e para por {WEEKS} semanas.",
    derby_winner: "{PLAYER} decide o classico e consagra a vitoria!",
    title_winner: "{PLAYER} levanta a taca do {TROPHY} com a equipe!",
};

export interface StarPlayer {
    readonly name: string;
    readonly seasonApps?: number;
    readonly seasonGoals?: number;
    [key: string]: unknown;
}

export interface MomentContext {
    readonly trophyWon?: string;
    readonly injuryWeeks?: number;
    readonly goalsThisMatch?: number;
    readonly isDerby?: boolean;
    readonly matchResult?: string;
    readonly previousApps?: number;
    readonly previousGoals?: number;
}

export interface StarMoment {
    readonly type: MomentType;
    readonly text: string;
}

/**
 * Retorna uma quote aleatória baseada em seed determinístico.
 */
export function getWeeklyQuote(player: StarPlayer | null, seed: number = 0): string {
    if (!player || !player.name) return '';
    const idx: number = Math.abs(seed) % WEEKLY_QUOTE_TEMPLATES.length;
    return WEEKLY_QUOTE_TEMPLATES[idx].replace('{PLAYER}', player.name);
}

/**
 * Detecta um momento narrativo na partida.
 */
export function detectStarMoment(player: StarPlayer | null, context: MomentContext = {}): StarMoment | null {
    if (!player) return null;

    if (context.trophyWon) {
        return {
            type: 'title_winner',
            text: MOMENT_TEMPLATES.title_winner.replace('{PLAYER}', player.name).replace('{TROPHY}', context.trophyWon),
        };
    }

    if ((context.injuryWeeks || 0) >= 6) {
        return {
            type: 'long_injury',
            text: MOMENT_TEMPLATES.long_injury.replace('{PLAYER}', player.name).replace('{WEEKS}', String(context.injuryWeeks)),
        };
    }

    if ((context.goalsThisMatch || 0) >= 3) {
        return {
            type: 'hat_trick',
            text: MOMENT_TEMPLATES.hat_trick.replace('{PLAYER}', player.name),
        };
    }

    if (context.isDerby && (context.goalsThisMatch || 0) >= 1 && context.matchResult === 'W') {
        return {
            type: 'derby_winner',
            text: MOMENT_TEMPLATES.derby_winner.replace('{PLAYER}', player.name),
        };
    }

    if ((player.seasonApps || 0) >= 100 && (context.previousApps || 0) < 100) {
        return {
            type: 'hundred_apps',
            text: MOMENT_TEMPLATES.hundred_apps.replace('{PLAYER}', player.name),
        };
    }

    if ((player.seasonApps || 0) >= 50 && (context.previousApps || 0) < 50) {
        return {
            type: 'fifty_apps',
            text: MOMENT_TEMPLATES.fifty_apps.replace('{PLAYER}', player.name),
        };
    }

    if ((player.seasonGoals || 0) >= 1 && context.previousGoals === 0) {
        return {
            type: 'first_goal',
            text: MOMENT_TEMPLATES.first_goal.replace('{PLAYER}', player.name),
        };
    }

    return null;
}
