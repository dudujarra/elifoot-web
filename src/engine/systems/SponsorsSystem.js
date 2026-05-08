// SPEC-013: Sponsors System
// Patrocínios com 5 tiers, contratos semanais, bônus por performance.

export const SPONSOR_TIERS = {
    1: { name: 'Local', baseWeek: 50000, winBonus: 5000, championBonus: 20000, maxContracts: 3 },
    2: { name: 'Regional', baseWeek: 100000, winBonus: 10000, championBonus: 40000, maxContracts: 3 },
    3: { name: 'Nacional', baseWeek: 200000, winBonus: 20000, championBonus: 80000, maxContracts: 3 },
    4: { name: 'Multinacional', baseWeek: 500000, winBonus: 50000, championBonus: 200000, maxContracts: 2 },
    5: { name: 'Global', baseWeek: 1000000, winBonus: 100000, championBonus: 400000, maxContracts: 1 },
};

let nextContractId = 1;

export class SponsorsSystem {
    constructor() {
        this.contracts = [];
    }

    signContract({ tier, duration, weekStart }) {
        if (!SPONSOR_TIERS[tier]) return null;
        if (duration < 1 || duration > 52) return null;

        const tierData = SPONSOR_TIERS[tier];
        const activeOfTier = this.contracts.filter(
            (c) => c.tier === tier && c.active
        ).length;
        if (activeOfTier >= tierData.maxContracts) return null;

        const contract = {
            id: `sponsor_${nextContractId++}`,
            tier,
            name: `${tierData.name} Sponsor #${this.contracts.length + 1}`,
            weekStart,
            weekEnd: weekStart + duration,
            weeklyBase: tierData.baseWeek,
            winBonus: tierData.winBonus,
            championBonus: tierData.championBonus,
            active: true,
        };
        this.contracts.push(contract);
        return contract;
    }

    processWeekly({ wins = 0, champion = false, weekOfYear }) {
        const payouts = [];
        for (const contract of this.contracts) {
            if (!contract.active) continue;
            if (weekOfYear >= contract.weekEnd) {
                contract.active = false;
                continue;
            }
            if (weekOfYear < contract.weekStart) continue;

            const winBonus = wins * contract.winBonus;
            const championBonus = champion ? contract.championBonus : 0;
            const total = contract.weeklyBase + winBonus + championBonus;

            payouts.push({
                contractId: contract.id,
                weeklyPayout: total,
                breakdown: {
                    base: contract.weeklyBase,
                    winBonus,
                    championBonus,
                },
                active: true,
            });
        }
        return payouts;
    }

    cancelContract(contractId) {
        const contract = this.contracts.find((c) => c.id === contractId);
        if (!contract) return false;
        contract.active = false;
        return true;
    }

    isActive(contractId, week) {
        const c = this.contracts.find((x) => x.id === contractId);
        if (!c) return false;
        return c.active && week >= c.weekStart && week < c.weekEnd;
    }

    getActive() {
        return this.contracts.filter((c) => c.active);
    }
}
