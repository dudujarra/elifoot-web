import { processMatchInjuries, processTrainingInjuries, healInjury } from '../../engine/InjurySystem.js';
import { processLoans } from '../../engine/YouthAcademy.js';
import { processPlayerDevelopment } from '../../engine/PlayerDevelopment.js';
import { evaluateGrowth } from '../../engine/GrowthEventSystem.js';
import { evaluateNewUnlocks, persistUnlock } from '../../engine/ViewUnlockSystem.js';

export function processWeeklySquad(engine, team) {
    // Lesões pós-partida
    engine.weekInjuries = processMatchInjuries(team.squad);

    // Lesões de treino — treino dobrado (double) tem risco elevado
    if (engine.currentTraining === 'double') {
        const trainingInjuries = processTrainingInjuries(team.squad, 'double');
        if (trainingInjuries.length > 0) {
            engine.weekInjuries.push(...trainingInjuries);
            engine.weekEvents.push(...trainingInjuries.map(
                inj => `🏥 ${inj.player} se lesionou no treino dobrado! ${inj.emoji} ${inj.name} (${inj.weeksLeft} semanas)`
            ));
        }
    }

    // Curar lesões em andamento
    team.squad.forEach(p => {
        if (p.injury) healInjury(p);
    });

    // Contratos: reduzir semanas
    team.squad.forEach(p => {
        if (p.contract) p.contract.weeksLeft--;
    });

    // Remover jogadores com contrato vencido (exceto titulares)
    const expiredPlayers = team.squad.filter(p => p.contract && p.contract.weeksLeft <= 0 && !p.isTitular);
    if (expiredPlayers.length > 0) {
        engine.weekEvents.push(...expiredPlayers.map(p => `📋 ${p.name} saiu: contrato encerrado.`));
        team.squad = team.squad.filter(p => !(p.contract && p.contract.weeksLeft <= 0 && !p.isTitular));
    }

    // Process loans
    if (engine.loanedOut.length > 0) {
        const returned = processLoans(engine.loanedOut, team);
        returned.forEach(p => {
            engine.weekEvents.push(p.loanResult || `${p.name} voltou do empréstimo.`);
        });
        engine.loanedOut = engine.loanedOut.filter(l => l.weeksLeft > 0);
    }

    // Player Development (weekly growth/decline)
    team.squad.forEach(p => {
        const devChanges = processPlayerDevelopment(p);
        devChanges.forEach(c => {
            if (c.type === 'growth') engine.weekEvents.push(`📈 ${c.player}: ${c.attr} ${c.from}→${c.to}`);
            if (c.type === 'decline') engine.weekEvents.push(`📉 ${c.player}: ${c.attr} ${c.from}→${c.to}`);
        });
    });

    // SPEC-134: growth events (breakthroughs, hot streaks, peak season)
    const recentForm = (() => {
        const streak = engine.managerStats.streak;
        if (streak > 0) return Array(Math.min(streak, 8)).fill('W');
        if (streak < 0) return Array(Math.min(-streak, 8)).fill('L');
        return [];
    })();
    const growthResult = evaluateGrowth({
        teamId: team.id,
        week: engine.currentWeek,
        season: engine.seasonNumber,
        players: team.squad,
        teamRecentResults: recentForm,
    });
    growthResult.growthEvents.forEach(evt => {
        if (evt.type === 'youth_breakthrough') engine.weekEvents.push(`⭐ ${evt.playerName} explodiu! OVR +${evt.ovrDelta}`);
        if (evt.type === 'hot_streak') engine.weekEvents.push(`🔥 ${evt.playerName} em grande fase! (+3 OVR temporário)`);
        if (evt.type === 'peak_season') engine.weekEvents.push(`📈 ${evt.playerName} na melhor fase da carreira! OVR +${evt.ovrDelta}`);
        if (evt.type === 'training_breakthrough') engine.weekEvents.push(`💪 ${evt.playerName} evoluiu no treino! OVR +${evt.ovrDelta}`);
    });

    // SPEC-135: check for newly unlocked views
    const newlyUnlocked = evaluateNewUnlocks(engine.viewUnlockState);
    newlyUnlocked.forEach(({ viewId, reason }) => {
        engine.viewUnlockState = persistUnlock(viewId, engine.viewUnlockState);
        engine.weekEvents.push(`🔓 Novo acesso desbloqueado: ${viewId} — ${reason}`);
    });
}
