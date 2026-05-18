import { LIFESTYLE } from './EmojiConstants.js';

export interface LifestyleItem {
    type: string;
    name: string;
    cost: number;
    moodBonus?: number;
    slotBonus?: number;
    fansBonus?: number;
    sponsorsBonus?: number;
    bossBonus?: number;
    energyPenalty?: number;
    returnPercent?: number;
    stabilityBonus?: number;
    sponsorsCut?: number;
    emoji: string;
    oneShot?: boolean;
    requiresLifetimeFlag?: string;
}

export const LIFESTYLE_CATALOG: Record<string, LifestyleItem> = {
    // Casa (Tier 1-3) — boost mood + actionSlots
    apartment_t1:  { type: 'house', name: 'Apartamento Simples',  cost: 50000,   moodBonus: 5,  slotBonus: 0, fansBonus: 0,  emoji: LIFESTYLE.APARTMENT },
    house_t2:      { type: 'house', name: 'Casa Confortável',     cost: 200000,  moodBonus: 10, slotBonus: 1, fansBonus: 0,  emoji: LIFESTYLE.HOUSE },
    mansion_t3:    { type: 'house', name: 'Mansão de Luxo',       cost: 1000000, moodBonus: 15, slotBonus: 2, fansBonus: 5,  emoji: LIFESTYLE.MANSION },

    // Carro
    car_popular:   { type: 'car', name: 'Carro Popular',        cost: 30000,   moodBonus: 2,  slotBonus: 0, sponsorsBonus: 0,  emoji: LIFESTYLE.CAR_POPULAR },
    car_luxo:      { type: 'car', name: 'Carro Luxo',           cost: 200000,  moodBonus: 5,  slotBonus: 0, sponsorsBonus: 5,  emoji: LIFESTYLE.CAR_LUXURY },
    car_super:     { type: 'car', name: 'Super Esportivo',      cost: 2000000, moodBonus: 10, slotBonus: 0, sponsorsBonus: 20, emoji: LIFESTYLE.CAR_SUPER },

    // Festas / lifestyle ações
    party_private: { type: 'event', name: 'Festa Privada',      cost: 10000,   moodBonus: 5,  energyPenalty: -10, fansBonus: 2,  emoji: LIFESTYLE.PARTY, oneShot: true },
    charity_ngo:   { type: 'event', name: 'Doação ONG',         cost: 50000,   moodBonus: 3,  fansBonus: 10, bossBonus: 5, emoji: LIFESTYLE.CHARITY, oneShot: true },
    investment_stocks: { type: 'investment', name: 'Investimento Ações', cost: 100000, returnPercent: 8, moodBonus: 0, emoji: LIFESTYLE.INVESTMENT, oneShot: true },
    wedding:       { type: 'event', name: 'Casamento', cost: 500000, moodBonus: 20, stabilityBonus: 10, sponsorsCut: 0.10, emoji: LIFESTYLE.WEDDING, oneShot: true, requiresLifetimeFlag: 'unmarried' }
};
