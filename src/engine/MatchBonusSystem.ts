/**
 * MatchBonusSystem.ts — "Bicho" (Premiação por Vitória)
 *
 * Mecânica clássica do Elifoot: antes da partida, o manager oferece
 * um bônus financeiro aos jogadores. Se vencer, o dinheiro sai do caixa
 * e a moral dispara. Se perder/empatar, o bicho não é pago mas a
 * frustração derruba a moral mais forte.
 *
 * Stateless. Recebe dados, retorna efeitos.
 */

import { BONUS, MOOD } from './EmojiConstants.ts';

// ── Types ──────────────────────────────────────────────────────

type BonusTierId = 'none' | 'small' | 'medium' | 'large';

interface BonusTier {
    readonly id: BonusTierId;
    readonly name: string;
    readonly emoji: string;
    readonly costPerPlayer: number;
    readonly moralBoostPre: number;
    readonly ovrBuff: number;
    readonly energyDrainExtra: number;
    readonly frustrationPenalty: number;
}

interface BonusPlayer {
    isTitular: boolean;
    injury: unknown;
    suspension?: unknown;
    moral: number;
    energy: number;
    name: string;
}

interface BonusTeam {
    squad: BonusPlayer[];
    balance: number;
}

interface PendingBonus {
    tierId: BonusTierId;
    costPerPlayer: number;
    totalCost: number;
    moralBoostPre: number;
    ovrBuff: number;
    energyDrainExtra: number;
    frustrationPenalty: number;
    playerCount: number;
}

interface Engine {
    pendingMatchBonus: PendingBonus | null;
    manager: { teamId: number };
    getTeam(id: number): BonusTeam | null;
}

interface SetBonusResult {
    success: boolean;
    msg: string;
    tier?: BonusTier;
    totalCost?: number;
}

interface SettleBonusResult {
    paid: boolean;
    amount: number;
    moralChange: number;
    msg: string;
}

// ── Data ───────────────────────────────────────────────────────

export const MATCH_BONUS_TIERS: readonly BonusTier[] = [
    {
        id: 'none',
        name: 'Sem Bicho',
        emoji: BONUS.NONE,
        costPerPlayer: 0,
        moralBoostPre: 0,
        ovrBuff: 0,
        energyDrainExtra: 0,
        frustrationPenalty: 0,
    },
    {
        id: 'small',
        name: 'Bicho Leve',
        emoji: BONUS.LOW,
        costPerPlayer: 5_000,
        moralBoostPre: 3,
        ovrBuff: 0.02,
        energyDrainExtra: 3,
        frustrationPenalty: -2,
    },
    {
        id: 'medium',
        name: 'Bicho Normal',
        emoji: BONUS.MEDIUM,
        costPerPlayer: 15_000,
        moralBoostPre: 6,
        ovrBuff: 0.05,
        energyDrainExtra: 5,
        frustrationPenalty: -5,
    },
    {
        id: 'large',
        name: 'Bicho Pesado',
        emoji: BONUS.HIGH,
        costPerPlayer: 40_000,
        moralBoostPre: 10,
        ovrBuff: 0.08,
        energyDrainExtra: 8,
        frustrationPenalty: -10,
    },
] as const;

// ── Functions ──────────────────────────────────────────────────

/**
 * Define o bicho para a próxima partida.
 * Chamado pela UI pré-match.
 */
export function setMatchBonus(engine: Engine, tierId: string): SetBonusResult {
    const tier = MATCH_BONUS_TIERS.find(t => t.id === tierId);
    if (!tier) return { success: false, msg: 'Tipo de bicho inválido.' };

    const team = engine.getTeam(engine.manager.teamId);
    if (!team) return { success: false, msg: 'Time não encontrado.' };

    const titulares = (team.squad || []).filter(p => p.isTitular && !p.injury && !p.suspension);
    const totalCost = tier.costPerPlayer * titulares.length;

    if (tierId !== 'none' && team.balance < totalCost) {
        return {
            success: false,
            msg: `Saldo insuficiente! Bicho custa R$ ${(totalCost / 1000).toFixed(0)}K (${titulares.length} titulares × R$ ${(tier.costPerPlayer / 1000).toFixed(0)}K).`,
        };
    }

    // BUG-F1-03: Revert previous moral boost if switching tiers
    const prevBonus = engine.pendingMatchBonus;
    if (prevBonus && prevBonus.moralBoostPre > 0) {
        titulares.forEach(p => {
            p.moral = Math.max(0, (p.moral || 50) - prevBonus.moralBoostPre);
        });
    }

    // Handle 'none' early — no cost, no boost
    if (tierId === 'none') {
        engine.pendingMatchBonus = null;
        return { success: true, msg: 'Sem bicho para esta partida.', tier, totalCost: 0 };
    }

    // Armazena no engine (consumed by MatchSimulator)
    engine.pendingMatchBonus = {
        tierId: tier.id,
        costPerPlayer: tier.costPerPlayer,
        totalCost,
        moralBoostPre: tier.moralBoostPre,
        ovrBuff: tier.ovrBuff,
        energyDrainExtra: tier.energyDrainExtra,
        frustrationPenalty: tier.frustrationPenalty,
        playerCount: titulares.length,
    };

    // Aplicar boost de moral pré-jogo imediatamente
    if (tier.moralBoostPre > 0) {
        titulares.forEach(p => {
            p.moral = Math.min(100, (p.moral || 50) + tier.moralBoostPre);
        });
    }

    return {
        success: true,
        msg: `${tier.emoji} Bicho "${tier.name}" definido! R$ ${(totalCost / 1000).toFixed(0)}K em jogo. Jogadores motivados!`,
        tier,
        totalCost,
    };
}

/**
 * Resolve o bicho pós-match.
 * Chamado pelo MatchSimulator após apurar resultado.
 */
export function settleMatchBonus(engine: Engine, didWin: boolean): SettleBonusResult | null {
    const bonus = engine.pendingMatchBonus;
    if (!bonus || bonus.tierId === 'none') {
        engine.pendingMatchBonus = null;
        return null;
    }

    const team = engine.getTeam(engine.manager.teamId);
    if (!team) {
        engine.pendingMatchBonus = null;
        return null;
    }

    const titulares = (team.squad || []).filter(p => p.isTitular && !p.injury);

    if (didWin) {
        // PAGA O BICHO — dinheiro sai do caixa
        team.balance -= bonus.totalCost;

        // Moral extra pela vitória + bicho
        titulares.forEach(p => {
            p.moral = Math.min(100, (p.moral || 50) + 3);
        });

        // Energy drain extra (correram mais motivados)
        titulares.forEach(p => {
            p.energy = Math.max(0, (p.energy || 50) - bonus.energyDrainExtra);
        });

        engine.pendingMatchBonus = null;
        return {
            paid: true,
            amount: bonus.totalCost,
            moralChange: 3,
            msg: `${MATCH_BONUS_TIERS.find(t => t.id === bonus.tierId)?.emoji || '💰'} Bicho pago! R$ ${(bonus.totalCost / 1000).toFixed(0)}K debitado. Jogadores felizes!`,
        };
    } else {
        // NÃO PAGA — mas frustração derruba moral
        titulares.forEach(p => {
            p.moral = Math.max(0, (p.moral || 50) + bonus.frustrationPenalty);
        });

        // Energy drain extra mesmo perdendo (correram mais)
        titulares.forEach(p => {
            p.energy = Math.max(0, (p.energy || 50) - Math.floor(bonus.energyDrainExtra * 0.5));
        });

        engine.pendingMatchBonus = null;
        return {
            paid: false,
            amount: 0,
            moralChange: bonus.frustrationPenalty,
            msg: `${MOOD.ANGRY} Bicho prometido mas sem vitória. Moral caiu ${bonus.frustrationPenalty}. Time frustrado.`,
        };
    }
}

/**
 * Retorna o buff de OVR ativo (para o MatchSimulator aplicar nos setores).
 * @returns multiplicador (ex: 1.05 = +5%)
 */
export function getMatchBonusBuff(engine: Engine): number {
    const bonus = engine.pendingMatchBonus;
    if (!bonus || bonus.tierId === 'none') return 1.0;
    return 1.0 + bonus.ovrBuff;
}
