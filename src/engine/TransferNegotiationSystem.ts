import { rng as systemRng } from './rng.js';
import { Player, Team } from "./types.js";

// ============================================================
// RIVALRY SYSTEM & TRANSFER NEGOTIATION
// ============================================================
export const RIVALRIES: Record<string, string[]> = {
    // Brazilian derbies — teamId pairs
    // These are generated at runtime by matching teams in same zone/division
};

/**
 * Check if two teams are rivals (same city/zone)
 */
export function isRivalry(team1: Team, team2: Team): boolean {
    if (!team1 || !team2) return false;
    // Same zone = rivalry
    return team1.zone === team2.zone && team1.division === team2.division;
}

/**
 * Transfer Negotiation — counter-offer system
 */
export interface CounterOfferResult {
    round: number;
    accepted: boolean;
    counterAmount: number;
    msg: string;
    final: boolean;
}

export function generateCounterOffer(player: Player, initialOffer: number, round: number): CounterOfferResult {
    const baseValue = player.value || (player.ovr * 100000);
    const desiredPrice = baseValue * (1.3 + systemRng() * 0.7); // 130-200% of value

    if (round >= 3) {
        // Final offer — take it or leave it
        return {
            round,
            accepted: initialOffer >= desiredPrice * 0.85,
            counterAmount: Math.floor(desiredPrice * 0.9),
            msg: initialOffer >= desiredPrice * 0.85
                ? `${player.name} aceita a proposta!`
                : `${player.name} recusa a oferta final. Negociação encerrada.`,
            final: true,
        };
    }

    if (initialOffer >= desiredPrice) {
        return { round, accepted: true, counterAmount: initialOffer, msg: `Oferta aceita por ${player.name}!`, final: true };
    }

    // Counter with a price between current and desired
    const gap = desiredPrice - initialOffer;
    const counterAmount = Math.floor(initialOffer + gap * (0.4 + round * 0.15));

    return {
        round,
        accepted: false,
        counterAmount,
        msg: `O agente de ${player.name} pede R$ ${(counterAmount / 1000000).toFixed(1)}M.`,
        final: false,
    };
}
