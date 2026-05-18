import { getPenaltySaveBonus, getPenaltyConversionBonus } from '../engine/PlayerTraits.js';

export const KEEPER_SAVE_MULT = 0.8;

export function calculateSaveChance(defTeam, defSectors, minute, systemRng, spatialEngine, isDerby) {
    const gkPool = (defTeam.squad || []).filter(p => p.isTitular && p.position === 'GOL' && !p.injury);
    const keeper = gkPool.length > 0 ? gkPool[Math.floor(systemRng() * gkPool.length)] : null;

    if (!keeper) return { saveChance: defSectors.goalkeeper * systemRng() * KEEPER_SAVE_MULT, keeper: null };

    const keeperTransientFatigue = spatialEngine.getTransientFatigueModifier(keeper, minute);
    const keeperCognitiveMod = spatialEngine.getCognitiveModifier(keeper, minute, isDerby);
    const finalKeeperMod = keeperTransientFatigue * keeperCognitiveMod;
    
    const saveChance = defSectors.goalkeeper * systemRng() * KEEPER_SAVE_MULT * finalKeeperMod;
    
    return { saveChance, keeper };
}

export function resolvePenalties(homeTeam, awayTeam, homeAttackers, awayAttackers, systemRng, isManagerMatch, rawEvents) {
    const homeGol = (homeTeam.squad || []).find(p => p.position === 'GOL' && p.isTitular);
    const awayGol = (awayTeam.squad || []).find(p => p.position === 'GOL' && p.isTitular);
    const homeTaker = homeAttackers.length > 0 ? homeAttackers[Math.floor(systemRng() * homeAttackers.length)] : null;
    const awayTaker = awayAttackers.length > 0 ? awayAttackers[Math.floor(systemRng() * awayAttackers.length)] : null;

    const homeSaveBonus  = getPenaltySaveBonus(homeGol);
    const awaySaveBonus  = getPenaltySaveBonus(awayGol);
    const homeKingBonus  = getPenaltyConversionBonus(homeTaker);
    const awayKingBonus  = getPenaltyConversionBonus(awayTaker);

    const homeWinProb = (homeKingBonus / awaySaveBonus) /
        ((homeKingBonus / awaySaveBonus) + (awayKingBonus / homeSaveBonus));

    const homeWins = systemRng() < homeWinProb;
    
    if (isManagerMatch && rawEvents) {
        if (homeWins) {
            const note = homeGol?.traits?.includes('penalty_stopper') ? ' (Pegador de Pênalti!)' : '';
            rawEvents.push({ minute: 91, type: 'penalties_win', teamName: homeTeam.name, note });
        } else {
            const note = awayGol?.traits?.includes('penalty_stopper') ? ' (Pegador de Pênalti!)' : '';
            rawEvents.push({ minute: 91, type: 'penalties_win', teamName: awayTeam.name, note });
        }
    }

    return homeWins;
}
