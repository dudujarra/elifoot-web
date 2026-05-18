import { TRAIT } from './EmojiConstants.js';
import { Player } from "./types.js";

export interface SeasonAward {
    type: string;
    emoji: string;
    name: string;
    player: string;
    value: string;
}

export function calculateSeasonAwards(squad: any[], _teamName: string, _seasonNum: number): SeasonAward[] {
    const awards = [];

    // Golden Boot
    const topScorer = [...squad].sort((a: any, b: any) => (b.career?.seasonGoals || 0) - (a.career?.seasonGoals || 0))[0];
    if (topScorer && (topScorer.career?.seasonGoals || 0) > 0) {
        awards.push({
            type: 'golden_boot',
            emoji: TRAIT.BOOT,
            name: 'Artilheiro',
            player: topScorer.name,
            value: `${topScorer.career.seasonGoals} gols`,
        });
    }

    // Assist King
    const topAssist = [...squad].sort((a: any, b: any) => (b.career?.seasonAssists || 0) - (a.career?.seasonAssists || 0))[0];
    if (topAssist && (topAssist.career?.seasonAssists || 0) > 0) {
        awards.push({
            type: 'assist_king',
            emoji: TRAIT.PRECISION,
            name: 'Rei das Assistências',
            player: topAssist.name,
            value: `${topAssist.career.seasonAssists} assistências`,
        });
    }

    // MVP (most MOTM)
    const mvp = [...squad].sort((a: any, b: any) => (b.career?.seasonMotm || 0) - (a.career?.seasonMotm || 0))[0];
    if (mvp && (mvp.career?.seasonMotm || 0) > 0) {
        awards.push({
            type: 'mvp',
            emoji: TRAIT.STAR,
            name: 'Melhor Jogador',
            player: mvp.name,
            value: `${mvp.career.seasonMotm}x Craque do Jogo`,
        });
    }

    // Best Young Player (U21)
    const bestYouth = [...squad].filter((p: Player) => p.age! <= 21)
        .sort((a: any, b: any) => (b.career?.seasonGoals || 0) + (b.career?.seasonAssists || 0) - (a.career?.seasonGoals || 0) - (a.career?.seasonAssists || 0))[0];
    if (bestYouth && ((bestYouth.career?.seasonGoals || 0) + (bestYouth.career?.seasonAssists || 0)) > 0) {
        awards.push({
            type: 'best_youth',
            emoji: TRAIT.GLOWING,
            name: 'Revelação',
            player: bestYouth.name,
            value: `${bestYouth.career.seasonGoals}G ${bestYouth.career.seasonAssists}A`,
        });
    }

    // Iron Man (most appearances + no injury weeks)
    const ironMan = [...squad].sort((a: any, b: any) => (b.career?.seasonApps || 0) - (a.career?.seasonApps || 0))[0];
    if (ironMan && (ironMan.career?.seasonApps || 0) >= 30) {
        awards.push({
            type: 'iron_man',
            emoji: TRAIT.MECHANICAL,
            name: 'Cavalo de Aço',
            player: ironMan.name,
            value: `${ironMan.career.seasonApps} jogos`,
        });
    }

    return awards;
}
