import { PERSONALITY } from './EmojiConstants.js';

// Personalidades — modificam facções e cartas disponíveis
export interface ProPersonalityDef {
    name: string;
    emoji: string;
    description: string;
    fansMultiplier: number;
    bossFailMultiplier: number;
    trainXPMultiplier: number;
    sponsorsGrowthMultiplier: number;
    fansCap?: number;
    teammatesWeeklyBonus?: number;
}

export const PERSONALITIES: Record<string, ProPersonalityDef> = {
    maverick: {
        name: "Maverick",
        emoji: PERSONALITY.MAVERICK,
        description: "Showman. Jogadas arriscadas rendem 2x fans. Erros custam 2x boss.",
        fansMultiplier: 2.0,
        bossFailMultiplier: 2.0,
        trainXPMultiplier: 1.0,
        sponsorsGrowthMultiplier: 1.0
    },
    virtuoso: {
        name: "Virtuoso",
        emoji: PERSONALITY.VIRTUOSO,
        description: "Técnico. Treino dá +50% XP. Sponsors crescem -50%.",
        fansMultiplier: 1.0,
        bossFailMultiplier: 1.0,
        trainXPMultiplier: 1.5,
        sponsorsGrowthMultiplier: 0.5
    },
    heartbeat: {
        name: "Heartbeat",
        emoji: PERSONALITY.HEARTBEAT,
        description: "Líder. Teammates +1/semana. Nunca mais que +3 fans/evento.",
        fansMultiplier: 1.0,
        bossFailMultiplier: 1.0,
        trainXPMultiplier: 1.0,
        sponsorsGrowthMultiplier: 1.0,
        fansCap: 3,
        teammatesWeeklyBonus: 1
    }
};
