/**
 * YouthAcademy.js — Base de formação + Empréstimos
 * Inspirado em FM (intake anual, personalidade do HoYD) + OléFUT (simplicidade)
 */

import { Data } from './data';
import { ATTRIBUTE_CATEGORIES, calculateOvrFromAttributes } from './PlayerAttributes.js';
import { STAFF, UI } from './EmojiConstants.js';

import { rng as systemRng } from './rng.js';
import { Player } from "./types.js";

// NPC: Coordenador da Base
export interface YouthCoordinator {
    name: string;
    role: string;
    emoji: string;
}

export const YOUTH_COORDINATOR: YouthCoordinator = { name: "Roberto Menezes", role: "Coord. da Base", emoji: STAFF.YOUTH_COACH };

const YOUTH_PERSONALITIES = ["Profissional", "Ambicioso", "Casual", "Determinado", "Preguiçoso"];

/**
 * Gera intake anual de jovens. Qualidade depende do nível da base e reputação.
 * @param {number} academyLevel - 1 a 5
 * @param {number} clubReputation - 1 a 100
 * @returns {object[]} array de jovens
 */

export function generateYouthIntake(academyLevel: number = 1, clubReputation: number = 50): Player[] {
    const count = 1 + Math.floor(systemRng() * academyLevel); // 1 a academyLevel jovens
    const youngsters = [];

    for (let i = 0; i < count; i++) {
        const positions = ['GOL', 'DEF', 'MEI', 'ATA'];
        const pos = positions[Math.floor(systemRng() * positions.length)];

        // Tier baseado no nível da base
        const qualityRoll = systemRng() * (academyLevel + clubReputation / 25);
        const tier = qualityRoll > 4 ? 1 : qualityRoll > 2.5 ? 2 : 3;

        const player = Data.generatePlayer(pos, tier);

        // Sobrescrever dados para jovem
        player.age = 15 + Math.floor(systemRng() * 3); // 15-17
        player.ovr = Math.max(35, player.ovr - 15 - Math.floor(systemRng() * 10));
        player.potential = player.ovr + 10 + Math.floor(systemRng() * 25); // potencial escondido
        player.personality = YOUTH_PERSONALITIES[Math.floor(systemRng() * YOUTH_PERSONALITIES.length)];
        player.isYouth = true;
        player.energy = 100;
        player.moral = 70;
        player.isTitular = false;
        player.injury = null;
        player.contract = { weeksLeft: 76, salary: 2000 }; // 2 temporadas
        player.value = 500000 + Math.floor(systemRng() * 2000000);

        // Ajustar atributos para jovem (reduzir tudo levemente para refletir falta de base profissional)
        if (player.attributes) {
            Object.keys(ATTRIBUTE_CATEGORIES).forEach((cat: string) => {
                (ATTRIBUTE_CATEGORIES as any)[cat].forEach((attr: string) => {
                    if (player.attributes[cat][attr]) {
                        player.attributes[cat][attr] = Math.max(1, player.attributes[cat][attr] - Math.floor(systemRng() * 2));
                    }
                });
            });
            const macroPos = ['GOL', 'DEF', 'MEI', 'ATA'].includes(player.position) ? player.position : 'MEI';
            player.ovr = calculateOvrFromAttributes(player.attributes, macroPos);
            // Ensure potential is still valid after ovr recalculation
            player.potential = Math.max(player.potential, player.ovr + Math.floor(systemRng() * 15));
        }

        youngsters.push(player);
    }

    return youngsters;
}

/**
 * Custo de upgrade da academia.
 */
export function getAcademyUpgradeCost(currentLevel: number): number {
    const costs = [0, 5000000, 15000000, 40000000, 100000000];
    return costs[currentLevel] || 999999999;
}

// ============================================================
// SISTEMA DE EMPRÉSTIMOS
// ============================================================

/**
 * Empresta um jogador. Ele sai do squad por N semanas e volta com atributos modificados.
 * @param {object} team - time
 * @param {number} playerId - id do jogador
 * @param {number} weeks - duração
 * @returns {object} loan record
 */
export interface LoanRecord {
    player: Player;
    playerId: string | number;
    playerName: string;
    weeksLeft: number;
    totalWeeks: number;
    destination: string;
}

export interface LoanOutResult {
    success: boolean;
    msg: string;
    loan?: LoanRecord;
}

export function loanPlayerOut(team: { squad: Player[] }, playerId: number, weeks: number = 20): LoanOutResult {
    const player = team.squad.find((p: Player) => p.id === playerId);
    if (!player) return { success: false, msg: "Jogador não encontrado." };
    if (player.isTitular) return { success: false, msg: "Não pode emprestar titular." };
    if (player.injury) return { success: false, msg: "Não pode emprestar jogador lesionado." };

    // Remove do squad e salva no loanedOut
    team.squad = team.squad.filter((p: Player) => p.id !== playerId);

    const loanRecord = {
        player: { ...player },
        playerId: player.id,
        playerName: player.name,
        weeksLeft: weeks,
        totalWeeks: weeks,
        destination: getRandomLoanDest(),
    };

    return { success: true, msg: `${player.name} emprestado para ${loanRecord.destination} por ${weeks} semanas.`, loan: loanRecord };
}

/**
 * Processa empréstimos a cada semana. Quando acaba, jogador volta melhorado (ou não).
 * @param {object[]} loans - array de loanRecords
 * @param {object} team - time do manager
 * @returns {object[]} jogadores que voltaram
 */
export function processLoans(loans: LoanRecord[], team: { squad: Player[] }): Player[] {
    const returning: Player[] = [];

    loans.forEach((loan: { destination: string, weeksLeft: number, player: Player }) => {
        loan.weeksLeft--;
        if (loan.weeksLeft <= 0) {
            const player = loan.player;

            // Desenvolvimento: jovens melhoram mais
            const isYoung = player.age! < 21;
            const growthChance = isYoung ? 0.7 : 0.3;

            if (systemRng() < growthChance) {
                // Sucesso: atributos melhoram levemente
                const oldOvr = player.ovr;
                if (player.attributes) {
                    Object.keys(ATTRIBUTE_CATEGORIES).forEach((cat: string) => {
                        (ATTRIBUTE_CATEGORIES as any)[cat].forEach((attr: string) => {
                            if (systemRng() < 0.3) { // 30% chance of a stat going up
                                player.attributes[cat][attr] = Math.min(20, player.attributes[cat][attr] + 1);
                            }
                        });
                    });
                    const macroPos = ['GOL', 'DEF', 'MEI', 'ATA'].includes(player.position) ? player.position : 'MEI';
                    player.ovr = calculateOvrFromAttributes(player.attributes, macroPos);
                }

                const actualBoost = player.ovr - oldOvr;
                player.loanResult = `${UI.CHECK} ${player.name} voltou de ${loan.destination} melhorado (+${Math.max(0, actualBoost)} OVR)!`;
            } else {
                // Fracasso: atributos FIS -1, moral baixa
                if (player.attributes && player.attributes.physical.stamina) {
                    player.attributes.physical.stamina = Math.max(1, player.attributes.physical.stamina - 1);
                }
                if (player.attributes) {
                    const macroPos = ['GOL', 'DEF', 'MEI', 'ATA'].includes(player.position) ? player.position : 'MEI';
                    player.ovr = calculateOvrFromAttributes(player.attributes, macroPos);
                }
                player.moral = Math.max(20, (player.moral || 50) - 10);
                player.loanResult = `${UI.CROSS} ${player.name} voltou de ${loan.destination} sem evolução.`;
            }

            player.energy = 80;
            player.isTitular = false;
            team.squad.push(player);
            returning.push(player);
        }
    });

    return returning;
}

function getRandomLoanDest(): string {
    const dests = [
        "Ponte Preta", "Guarani", "Chapecoense", "Avaí", "CRB",
        "Vila Nova", "Tombense", "Operário", "Brusque", "Novorizontino",
        "Londrina", "ABC", "Sampaio Corrêa", "CSA", "Juventude",
    ];
    return dests[Math.floor(systemRng() * dests.length)];
}
