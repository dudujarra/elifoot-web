/**
 * TacticSuggester — SPEC-A3
 *
 * Sugere tática pré-jogo via comparação de setores. Pure function.
 * Headless (zero React/DOM). Determinístico.
 */

export const TACTICS_ENUM: readonly string[] = [
    'Ofensivo', 'Defensivo', 'Contra-Ataque', 'Posse', 'Pressing', 'Normal',
] as const;

export type TacticName = (typeof TACTICS_ENUM)[number];

export interface SectorValues {
    readonly goalkeeper?: number;
    readonly defense?: number;
    readonly midfield?: number;
    readonly attack?: number;
}

export interface TacticSuggestion {
    readonly tactic: TacticName;
    readonly rationale: string;
}

export interface SuggestTacticOpts {
    readonly ourSectors?: SectorValues;
    readonly oppSectors?: SectorValues;
    readonly isHome?: boolean;
}

/**
 * Calcula sugestão tática baseada em diff de setores.
 */
export function suggestTactic({
    ourSectors = {},
    oppSectors = {},
    isHome = true,
}: SuggestTacticOpts = {}): TacticSuggestion {
    const ourAtk: number = ourSectors.attack || 50;
    const ourDef: number = ourSectors.defense || 50;
    const oppAtk: number = oppSectors.attack || 50;
    const oppDef: number = oppSectors.defense || 50;

    const ourOvr: number = (ourAtk + ourDef + (ourSectors.midfield || 50)) / 3;
    const oppOvr: number = (oppAtk + oppDef + (oppSectors.midfield || 50)) / 3;

    const dOppAtkVsOurDef: number = oppAtk - ourDef;
    const dOurAtkVsOppDef: number = ourAtk - oppDef;
    const ovrGap: number = ourOvr - oppOvr;

    // Caso: ambos fortes (gap pequeno + setores altos) → contra-ataque
    if (oppAtk > 70 && oppDef > 70 && Math.abs(ovrGap) < 5) {
        return {
            tactic: 'Contra-Ataque',
            rationale: 'Adversário forte nos dois lados. Contra-ataque explora brechas.',
        };
    }

    // Caso: oponente bem mais forte no ataque que nossa defesa → defensivo
    if (dOppAtkVsOurDef > 10) {
        return {
            tactic: 'Defensivo',
            rationale: `Ataque adversário ${oppAtk} vs nossa defesa ${ourDef}. Segurar o jogo.`,
        };
    }

    // Caso: nosso ataque bem maior que defesa adversária → ofensivo
    if (dOurAtkVsOppDef > 10) {
        return {
            tactic: 'Ofensivo',
            rationale: `Nosso ataque ${ourAtk} vs defesa adversária ${oppDef}. Pressionar e marcar.`,
        };
    }

    // Caso: somos bem mais fortes (vantagem geral) → pressing
    if (ovrGap > 8 && isHome) {
        return {
            tactic: 'Pressing',
            rationale: 'Em casa com vantagem técnica. Marcação alta sufoca.',
        };
    }

    // Caso: equilibrado (gap pequeno) → normal
    if (Math.abs(ovrGap) < 5) {
        return {
            tactic: 'Normal',
            rationale: 'Times equilibrados. Manter postura padrão.',
        };
    }

    // Default: jogo controlado pela posse
    return {
        tactic: 'Posse',
        rationale: 'Manter a bola e controlar o ritmo do jogo.',
    };
}
