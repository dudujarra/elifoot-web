/**
 * SeasonSystem.js — Patrocínio, Calendário de Eventos, Promoção/Rebaixamento e Legado
 * AKITA-011 + AKITA-012 consolidados
 */

import { REPUTATION } from './EmojiConstants.js';
// ============================================================
// PATROCÍNIO
// ============================================================
// SPEC-125 BUG-071: cut sponsor pay 50% — bot accumulating R$ 4.7B+ peak
// because sponsor income > all expenses combined. Realistic football economy.
// SPEC-145: sponsor weeklyPay increased ~30% to better cover reduced player salaries
export const SPONSOR_TIERS = [
    { id: "bronze", name: "🥉 Loja do Bairro", weeklyPay: 32500, reqDivision: 4, reqPosition: 99 },
    { id: "silver", name: "🥈 Rede Regional", weeklyPay: 130000, reqDivision: 3, reqPosition: 10 },
    { id: "gold", name: "🥇 Marca Nacional", weeklyPay: 390000, reqDivision: 2, reqPosition: 6 },
    { id: "diamond", name: "💎 Multinacional", weeklyPay: 975000, reqDivision: 1, reqPosition: 4 },
    { id: "platinum", name: "👑 Patrocinador Master", weeklyPay: 1950000, reqDivision: 1, reqPosition: 1 },
];

export function evaluateSponsor(division, position) {
    let best = SPONSOR_TIERS[0];
    for (const tier of SPONSOR_TIERS) {
        if (division <= tier.reqDivision && position <= tier.reqPosition) {
            best = tier;
        }
    }
    return best;
}

// ============================================================
// CALENDÁRIO DE EVENTOS
// ============================================================
export const CALENDAR_EVENTS = [
    { week: 1, name: "🏁 Início da Temporada", effect: { moral: 5 }, msg: "Nova temporada! O elenco está motivado." },
    { week: 5, name: "🏆 Sorteio da Copa", effect: null, msg: "Sorteio da copa realizado." },
    { week: 10, name: "📊 Avaliação Trimestral", effect: null, msg: "A diretoria avalia seu desempenho." },
    { week: 15, name: "🔄 Janela de Transferências Aberta", effect: null, msg: "Janela de transferências aberta! Aproveite." },
    { week: 19, name: "⚡ Derby da Cidade", effect: { moral: 3, energy: -5 }, msg: "O clássico está chegando! Tensão no ar." },
    { week: 20, name: "🔒 Janela de Transferências Fechada", effect: null, msg: "Janela de transferências fechou." },
    { week: 25, name: "📊 Avaliação Semestral", effect: null, msg: "Metade da temporada. A diretoria está de olho." },
    { week: 30, name: "🔥 Reta Final", effect: { moral: -3, energy: -5 }, msg: "Reta final! Pressão total sobre o elenco." },
    { week: 34, name: "🎓 Revelação da Base", effect: null, msg: "Novos jovens serão promovidos em breve." },
    { week: 38, name: "🏁 Fim da Temporada", effect: { moral: 0 }, msg: "Temporada encerrada!" },
];

export function getCalendarEvent(week) {
    return CALENDAR_EVENTS.find(e => e.week === week) || null;
}

// ============================================================
// PROMOÇÃO / REBAIXAMENTO
// Real Brazilian football rules:
//   Série A (div 1): bottom 4 relegated
//   Série B (div 2): top 4 promoted, bottom 4 relegated
//   Série C (div 3): top 4 promoted, bottom 4 relegated
//   Série D (div 4): top 4 promoted, no relegation (div 5 doesn't exist)
// ============================================================

// Returns {promoCount, relCount} for a given division
export function getDivisionCounts(division) {
    if (division === 1) return { promoCount: 0, relCount: 4 }; // div 1: only relegates
    if (division === 4) return { promoCount: 4, relCount: 0 }; // div 4: only promotes
    return { promoCount: 4, relCount: 4 };                     // div 2/3: both 4
}

export function calculateSeasonEnd(standings, division = 2) {
    const { promoCount, relCount } = getDivisionCounts(division);
    const n = standings.length;
    // Guard: can't promote/relegate more than half the league
    const safePromo = Math.min(promoCount, Math.floor(n / 2));
    const safeRel = Math.min(relCount, Math.floor(n / 2));
    const promoted = standings.slice(0, safePromo).map(s => s.teamId);
    const relegated = safeRel > 0 ? standings.slice(-safeRel).map(s => s.teamId) : [];
    return { promoted, relegated };
}

export function processPromoRelegation(teams, standings, zone, division) {
    const { promoted, relegated } = calculateSeasonEnd(standings, division);
    const changes = [];

    promoted.forEach(teamId => {
        const team = teams.find(t => t.id === teamId);
        if (team && division > 1) {
            team.division--;
            changes.push({ teamId, name: team.name, action: 'promoted', from: division, to: division - 1 });
        }
    });

    relegated.forEach(teamId => {
        const team = teams.find(t => t.id === teamId);
        if (team && division < 4) {
            team.division++;
            changes.push({ teamId, name: team.name, action: 'relegated', from: division, to: division + 1 });
        }
    });

    return changes;
}

// ============================================================
// LEGADO DO TREINADOR
// ============================================================
export class ManagerLegacy {
    constructor(managerName) {
        this.managerName = managerName;
        this.reputation = 30; // 0-100
        this.seasons = [];
        this.titles = [];
        this.totalWins = 0;
        this.totalMatches = 0;
    }

    closeSeason(teamName, division, position, wins, draws, losses) {
        const season = {
            teamName,
            division,
            position,
            wins,
            draws,
            losses,
            record: `${wins}V ${draws}E ${losses}D`,
        };

        // Titles
        if (position === 1) {
            season.title = `Campeão da Série ${['A','B','C','D'][division - 1]}`;
            this.titles.push(season.title);
            this.reputation = Math.min(100, this.reputation + 15);
        } else if (position <= 2 && division > 1) {
            season.title = "Promovido";
            this.reputation = Math.min(100, this.reputation + 8);
        } else if (position >= 19) {
            season.title = "Rebaixado";
            this.reputation = Math.max(0, this.reputation - 10);
        }

        this.totalWins += wins;
        this.totalMatches += wins + draws + losses;
        this.seasons.push(season);

        // Base reputation from win rate
        const winRate = this.totalMatches > 0 ? this.totalWins / this.totalMatches : 0;
        this.reputation = Math.max(this.reputation, Math.floor(winRate * 60));

        return season;
    }

    getLevel() {
        if (this.reputation >= 80) return { label: "Lendário", emoji: REPUTATION.LEGENDARY };
        if (this.reputation >= 60) return { label: "Renomado", emoji: REPUTATION.RENOWNED };
        if (this.reputation >= 40) return { label: "Reconhecido", emoji: REPUTATION.RECOGNIZED };
        if (this.reputation >= 20) return { label: "Iniciante", emoji: REPUTATION.BEGINNER };
        return { label: "Desconhecido", emoji: REPUTATION.UNKNOWN };
    }
}
