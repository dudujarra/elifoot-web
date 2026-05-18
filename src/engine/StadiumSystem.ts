import { rng as systemRng } from './rng.js';
import { STAFF } from './EmojiConstants.js';
import { Player, Manager } from "./types.js";

/**
 * StadiumSystem.js — Estádio, Staff e Scouting
 * Inspirado em Hattrick (stadium tiers) + FM (staff roles + scouting)
 */

// ============================================================
// ESTÁDIO
// ============================================================
export interface StadiumLevel {
    level: number;
    name: string;
    capacity: number;
    vipSeats: number;
    ticketPrice: number;
    upgradeCost: number;
}

export const STADIUM_LEVELS: StadiumLevel[] = [
    { level: 1, name: "Campo Municipal", capacity: 5000, vipSeats: 100, ticketPrice: 20, upgradeCost: 0 },
    { level: 2, name: "Arena Regional", capacity: 15000, vipSeats: 500, ticketPrice: 30, upgradeCost: 10000000 },
    { level: 3, name: "Estádio Moderno", capacity: 35000, vipSeats: 2000, ticketPrice: 40, upgradeCost: 40000000 },
    { level: 4, name: "Arena Premium", capacity: 55000, vipSeats: 5000, ticketPrice: 55, upgradeCost: 100000000 },
    { level: 5, name: "Templo do Futebol", capacity: 80000, vipSeats: 10000, ticketPrice: 70, upgradeCost: 250000000 },
];

export function getStadiumInfo(level: number): StadiumLevel {
    return STADIUM_LEVELS[Math.min(level, STADIUM_LEVELS.length) - 1] || STADIUM_LEVELS[0];
}

export interface TicketRevenueResult {
    attendance: number;
    vipAttendance: number;
    revenue: number;
    stadiumName: string;
}

export function calculateTicketRevenue(stadiumLevel: number, teamReputation: number): TicketRevenueResult {
    const stadium = getStadiumInfo(stadiumLevel);
    const occupancy = 0.4 + (teamReputation / 200); // 40%-90%
    const attendance = Math.floor(stadium.capacity * Math.min(occupancy, 0.95));
    const vipAttendance = Math.floor(stadium.vipSeats * Math.min(occupancy + 0.1, 1.0));
    const revenue = (attendance * stadium.ticketPrice) + (vipAttendance * stadium.ticketPrice * 3);
    return { attendance, vipAttendance, revenue, stadiumName: stadium.name };
}

// ============================================================
// STAFF
// ============================================================
export interface StaffRole {
    id: string;
    name: string;
    emoji: string;
    npc: { name: string; personality: string };
    cost: number;
    effect: any;
    description: string;
}

export const STAFF_ROLES: StaffRole[] = [
    {
        id: "physio", name: "Fisioterapeuta", emoji: STAFF.PHYSIO,
        npc: { name: "Dr. Marina Santos", personality: "metódica" },
        cost: 50000, // semanal
        effect: { injuryReduction: 0.5, energyRecoveryBonus: 5 },
        description: "Reduz chance de lesão em 50% e melhora recuperação de energia."
    },
    {
        id: "scout", name: "Olheiro", emoji: STAFF.SCOUT,
        npc: { name: "Carlos Mendes", personality: "observador" },
        cost: 40000,
        effect: { scoutRange: 2, revealAttributes: true },
        description: "Revela OVR e potencial de jogadores no mercado e em outros times."
    },
    {
        id: "fitness", name: "Preparador Físico", emoji: STAFF.FITNESS,
        npc: { name: "Sérgio Tavares", personality: "exigente" },
        cost: 45000,
        effect: { trainingBoost: 1, energyDecayReduction: 3 },
        description: "Treinos rendem +1 atributo extra e jogadores cansam menos."
    },
    {
        id: "finance", name: "Diretor Financeiro", emoji: STAFF.FINANCE_DIR,
        npc: { name: "Patrícia Lemos", personality: "conservadora" },
        cost: 60000,
        effect: { revenueBonus: 0.1, salaryNegotiation: 0.9 },
        description: "+10% de receita e -10% nos salários negociados."
    },
    {
        id: "youth_coach", name: "Treinador de Base", emoji: STAFF.YOUTH_COACH,
        npc: { name: "Edson Ribeiro", personality: "paciente" },
        cost: 35000,
        effect: { youthBoost: 1, academyLevelBonus: 1 },
        description: "Jovens da base chegam com +1 OVR. Academia funciona como 1 nível acima."
    },
];

export class StaffManager {
    hired: string[];

    constructor() {
        this.hired = []; // array of staff role ids
    }

    hire(roleId: string): { success: boolean; msg: string; role?: StaffRole } {
        if (this.hired.includes(roleId)) return { success: false, msg: "Já contratado." };
        const role = STAFF_ROLES.find((r: StaffRole) => r.id === roleId);
        if (!role) return { success: false, msg: "Cargo inválido." };
        this.hired.push(roleId);
        return { success: true, msg: `${role.emoji} ${role.npc.name} contratado como ${role.name}!`, role };
    }

    fire(roleId: string): { success: boolean; msg: string } {
        if (!this.hired.includes(roleId)) return { success: false, msg: "Não contratado." };
        this.hired = this.hired.filter((id: string) => id !== roleId);
        const role = STAFF_ROLES.find((r: StaffRole) => r.id === roleId);
        return { success: true, msg: `${role?.npc.name} demitido.` };
    }

    has(roleId: string): boolean { return this.hired.includes(roleId); }

    /**
     * BUG-019 fix: retorna staff member object com .name (npc) ou null
     * DashboardView (tab Clube) lê member.name → precisa flatten npc.name pro top-level.
     */
    getStaff(roleId: string): (StaffRole & { roleName: string }) | null {
        if (!this.hired.includes(roleId)) return null;
        const role = STAFF_ROLES.find((r: StaffRole) => r.id === roleId);
        if (!role) return null;
        return {
            ...role,
            name: role.npc?.name || role.name,
            roleName: role.name, // preserva nome do cargo
        };
    }

    /**
     * Retorna todos staff hired (full role objects).
     */
    getAllStaff(): StaffRole[] {
        return this.hired.map((id: string) => STAFF_ROLES.find((r: StaffRole) => r.id === id)).filter((Boolean as any) as (r: StaffRole | undefined) => r is StaffRole);
    }

    getWeeklyCost(): number {
        return this.hired.reduce((sum: number, id: string) => {
            const role = STAFF_ROLES.find((r: StaffRole) => r.id === id);
            return sum + (role ? role.cost : 0);
        }, 0);
    }

    getEffects(): Record<string, any> {
        const effects: Record<string, any> = {};
        this.hired.forEach((id: string) => {
            const role = STAFF_ROLES.find((r: StaffRole) => r.id === id);
            if (role) Object.assign(effects, { [id]: role.effect });
        });
        return effects;
    }
}

// ============================================================
// SCOUTING
// ============================================================
export interface ScoutRegion {
    id: string;
    name: string;
    tier: number;
    cost: number;
}

const SCOUT_REGIONS: ScoutRegion[] = [
    { id: "brazil", name: "🇧🇷 Brasil", tier: 2, cost: 0 },
    { id: "argentina", name: "🇦🇷 Argentina", tier: 2, cost: 50000 },
    { id: "europe", name: "🇪🇺 Europa", tier: 1, cost: 200000 },
    { id: "africa", name: "🌍 África", tier: 3, cost: 30000 },
    { id: "asia", name: "🌏 Ásia", tier: 3, cost: 20000 },
];

export { SCOUT_REGIONS };

export interface ScoutResult {
    success: boolean;
    msg: string;
    players: any[];
    region?: ScoutRegion;
}

export function scoutRegion(regionId: string, hasScout: boolean, Data: any): ScoutResult {
    const region = SCOUT_REGIONS.find((r: ScoutRegion) => r.id === regionId);
    if (!region) return { success: false, msg: 'Regiao de scouting invalida.', players: [] };

    const count = hasScout ? 5 : 2;
    const players: unknown[] = [];

    for (let i = 0; i < count; i++) {
        const positions = ['GOL', 'DEF', 'MEI', 'ATA'];
        const pos = positions[Math.floor(systemRng() * positions.length)];
        const player = Data.generatePlayer(pos, region.tier);

        // Sem scout, esconde detalhes
        if (!hasScout) {
            player._hidden = true;
            player._realOvr = player.ovr;
            player.ovr = '??';
        }

        player.scoutRegion = region.name;
        player.askingPrice = player.value || (5000000 + Math.floor(systemRng() * 20000000));
        players.push(player);
    }

    return { success: true, msg: `Scouting concluido: ${players.length} jogadores encontrados.`, players, region };
}
