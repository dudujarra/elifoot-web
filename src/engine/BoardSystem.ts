/**
 * BoardSystem — Diretoria, metas e demissão
 * Inspirado em FM (board confidence) + Hattrick (patience)
 */

import { BOARD as BOARD_EMOJI, NARRATIVE, MOOD } from './EmojiConstants.js';
import { BOARD as BOARD_CONST, MORALE } from './GameConstants.js';

export interface BoardMember {
    readonly name: string;
    readonly role: string;
    readonly emoji: string;
    readonly patience: number;
}

export const BOARD_MEMBERS: Readonly<Record<string, BoardMember>> = {
    president: { name: "Dr. Antônio Ferreira", role: "Presidente", emoji: BOARD_EMOJI.BUILDING, patience: 6 },
    director:  { name: "Helena Vieira",        role: "Diretora de Futebol", emoji: NARRATIVE.STATS, patience: 4 },
};

export interface Objective {
    readonly id: string;
    readonly text: string;
    readonly target: number | string;
    readonly metric: string;
    readonly weight: number;
}

export interface BoardStatus {
    readonly label: string;
    readonly color: string;
    readonly emoji: string;
}

export interface BoardSystemOptions {
    readonly fireCooldown?: number;
    readonly currentWeek?: number;
    readonly boardPatience?: number;
}

/**
 * Gerar objetivos baseados na divisão e orçamento.
 */
export function generateObjectives(division: number, balance: number): Objective[] {
    const objectives: Objective[] = [];

    if (division === 1) {
        if (balance > BOARD_CONST.BUDGET_HIGH) {
            objectives.push({ id: "title", text: "Ser campeão da liga", target: 1, metric: "position", weight: 40 });
            objectives.push({ id: "cup_semi", text: "Chegar na semifinal da Copa", target: "semi", metric: "cup", weight: 20 });
        } else {
            objectives.push({ id: "top4", text: "Terminar no Top 4", target: 4, metric: "position", weight: 40 });
        }
        objectives.push({ id: "finance", text: "Não ter saldo negativo", target: 0, metric: "balance", weight: 20 });
    } else if (division === 2) {
        objectives.push({ id: "promotion", text: "Subir para a Série A", target: 2, metric: "position", weight: 50 });
        objectives.push({ id: "finance", text: "Manter finanças saudáveis", target: 0, metric: "balance", weight: 20 });
    } else {
        objectives.push({ id: "mid_table", text: "Não ser rebaixado", target: 16, metric: "position", weight: 50 });
    }

    objectives.push({ id: "morale", text: "Manter moral do elenco acima de 40%", target: MORALE.FLOOR_MENTALIST, metric: "morale", weight: 20 });
    return objectives;
}

export class BoardSystem {
    confidence: number;
    objectives: Objective[];
    isFired: boolean;
    warningGiven: boolean;
    fireProtection: number;
    lastFiredWeek: number;
    fireCooldown: number;
    hiredWeek: number;
    boardPatience: number;

    constructor(division: number, balance: number, options: BoardSystemOptions = {}) {
        this.confidence = BOARD_CONST.INITIAL_CONFIDENCE;
        this.objectives = generateObjectives(division, balance);
        this.isFired = false;
        this.warningGiven = false;
        this.fireProtection = BOARD_CONST.FIRE_PROTECTION_WEEKS;
        this.lastFiredWeek = -999;
        this.fireCooldown = options.fireCooldown || 0;
        this.hiredWeek = options.currentWeek || 0;
        this.boardPatience = options.boardPatience || 1.0;
    }

    updateConfidence(
        currentPosition: number,
        _totalTeams: number,
        streak: number,
        avgMorale: number,
        balance: number,
        currentWeek: number,
    ): void {
        if (currentWeek - this.hiredWeek < this.fireProtection) return;

        let delta = 0;

        const posObj = this.objectives.find(o => o.metric === "position");
        if (posObj) {
            if (currentPosition <= (posObj.target as number)) {
                delta += 2;
            } else if (currentPosition <= (posObj.target as number) + 4) {
                delta -= 1;
            } else {
                delta -= 2;
            }
        }

        if (streak >= 3) delta += 2;
        else if (streak <= -5) delta -= 5;
        else if (streak <= -3) delta -= 2;

        if (avgMorale < 30) delta -= 2;
        else if (avgMorale > 70) delta += 1;

        if (balance < 0) delta -= 1;

        if (delta < 0) {
            delta = delta * (1 / Math.max(0.1, this.boardPatience));
        }

        this.confidence = Math.max(0, Math.min(100, this.confidence + delta));

        if (this.confidence < 30 && !this.warningGiven) {
            this.warningGiven = true;
        }

        if (this.confidence < 10) {
            if (currentWeek - this.lastFiredWeek >= this.fireCooldown) {
                this.isFired = true;
                this.lastFiredWeek = currentWeek;
            }
        }
    }

    getStatus(): BoardStatus {
        if (this.confidence >= 70) return { label: "Satisfeita", color: "#39FF14", emoji: MOOD.HAPPY };
        if (this.confidence >= 45) return { label: "Observando", color: "#FFD700", emoji: BOARD_EMOJI.THINKING };
        if (this.confidence >= 25) return { label: "Insatisfeita", color: "#FF3333", emoji: MOOD.ANGRY };
        return { label: "Furiosa", color: "#FF3333", emoji: MOOD.FIRE };
    }
}
