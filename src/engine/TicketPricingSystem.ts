/**
 * TicketPricingSystem.js — Controle de Preço dos Ingressos
 *
 * Mecânica clássica do Elifoot: o manager define a política de preços.
 * - Barato: lota o estádio, vantagem em casa brutal, renda baixa.
 * - Normal: padrão equilibrado.
 * - Caro: meia-lotação, pouca vantagem em casa, renda alta se time está bem.
 *
 * Stateless. Recebe dados, retorna modificadores.
 *
 * Fluxo:
 * 1. UI chama setTicketPolicy(engine, policyId)
 * 2. calculateWeeklyFinances lê engine.ticketPolicy para bilheteria
 * 3. MatchSimulator lê getHomeAdvantageFromTickets(engine) para xG
 */

import { TICKET } from './EmojiConstants.js';
// ============================================================
// POLÍTICAS DE INGRESSO
// ============================================================
export interface TicketPolicy {
    id: 'cheap' | 'normal' | 'expensive';
    name: string;
    emoji: string;
    priceMultiplier: number;
    attendanceMultiplier: number;
    homeAdvantageBoost: number;
    moralWeeklyBoost: number;
    description: string;
}

export const TICKET_POLICIES: TicketPolicy[] = [
    {
        id: 'cheap',
        name: 'Ingresso Popular',
        emoji: TICKET.STANDARD,
        priceMultiplier: 0.5,       // receita = 50% do normal
        attendanceMultiplier: 1.3,  // +30% público
        homeAdvantageBoost: 1.08,   // +8% vantagem em casa nos setores
        moralWeeklyBoost: 1,        // torcida feliz = +1 moral/semana
        description: 'Ingresso barato lota o estádio. Torcida empurra o time em casa, mas a renda despenca.',
    },
    {
        id: 'normal',
        name: 'Ingresso Normal',
        emoji: TICKET.STADIUM,
        priceMultiplier: 1.0,
        attendanceMultiplier: 1.0,
        homeAdvantageBoost: 1.0,
        moralWeeklyBoost: 0,
        description: 'Preço padrão. Equilíbrio entre renda e público.',
    },
    {
        id: 'expensive',
        name: 'Ingresso Premium',
        emoji: TICKET.DIAMOND,
        priceMultiplier: 1.8,       // receita = 180% do normal
        attendanceMultiplier: 0.6,  // -40% público
        homeAdvantageBoost: 0.95,   // -5% vantagem em casa
        moralWeeklyBoost: -1,       // torcida reclamando = -1 moral/semana
        description: 'Preços altos rendem muito, mas esvaziam o estádio. Time perde vantagem em casa.',
    },
];

export interface SetTicketPolicyResult {
    success: boolean;
    msg: string;
    policy?: TicketPolicy;
}

export function setTicketPolicy(engine: any, policyId: string): SetTicketPolicyResult {
    const policy = TICKET_POLICIES.find(p => p.id === policyId);
    if (!policy) return { success: false, msg: 'Política inválida.' };

    engine.ticketPolicy = policyId;
    return {
        success: true,
        msg: `${policy.emoji} Política de ingressos alterada para "${policy.name}". ${policy.description}`,
        policy,
    };
}

export function getActiveTicketPolicy(engine: any): TicketPolicy {
    const policyId = engine.ticketPolicy || 'normal';
    return TICKET_POLICIES.find(p => p.id === policyId) || TICKET_POLICIES[1];
}

export function getHomeAdvantageFromTickets(engine: any): number {
    return getActiveTicketPolicy(engine).homeAdvantageBoost;
}

export interface TicketFinanceModifiers {
    priceMultiplier: number;
    attendanceMultiplier: number;
}

export function getTicketFinanceModifiers(engine: any): TicketFinanceModifiers {
    const policy = getActiveTicketPolicy(engine);
    return {
        priceMultiplier: policy.priceMultiplier,
        attendanceMultiplier: policy.attendanceMultiplier,
    };
}

export function getTicketMoralBoost(engine: any): number {
    return getActiveTicketPolicy(engine).moralWeeklyBoost;
}
