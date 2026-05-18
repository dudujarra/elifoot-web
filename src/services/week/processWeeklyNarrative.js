import { processDressingRoom } from '../../engine/systems/DressingRoomSystem.js';
import { processMoraleEvents, processMentoring } from '../../engine/PlayerTraits.js';
import { pickInterruptEvent } from '../../engine/InterruptEvents.js';
import { processAmbitionWeekly } from '../../engine/AmbitionEngine.js';
import { evaluate as evaluateCoachProposal } from '../../engine/CoachProposalSystem.js';
import { evaluate as evaluateOrganicChallenge } from '../../engine/OrganicChallengeSystem.js';
import { getCalendarEvent } from '../../engine/SeasonSystem.js';
import { EngineLogger } from '../EngineLogger.js';

export function processWeeklyNarrative(engine, team) {
    // Dressing Room Dynamics (SPEC-146: pass position context for narrative selection)
    const _drStandings = engine.getStandings(team.zone, team.division);
    const _drPos = _drStandings.findIndex(s => s.teamId === team.id) + 1;
    const dressingRoom = processDressingRoom(team.squad, {
        position: _drPos || undefined,
        totalTeams: _drStandings.length || undefined,
        streak: engine.managerStats?.streak,
    });
    dressingRoom.events.forEach(e => engine.weekEvents.push(e));

    // Morale Events (narrative)
    const moraleEvts = processMoraleEvents(team.squad, engine.board);
    moraleEvts.forEach(e => engine.weekEvents.push(e));

    // Mentoring (veteran teaches youth)
    const mentorEvts = processMentoring(team.squad);
    mentorEvts.forEach(e => engine.weekEvents.push(e));

    // SPEC-068: InterruptEvents — forced decision events (~10%/week)
    try {
        const interrupt = pickInterruptEvent(engine, team);
        if (interrupt) {
            engine.pendingInterrupt = {
                id: interrupt.id,
                type: interrupt.type,
                title: interrupt.title,
                text: interrupt.text,
                options: interrupt.options,
            };
            engine.weekEvents.push(`⚡ ${interrupt.title}`);
        }
    } catch (_e) { EngineLogger.capture(_e, 'WeekProcessor.interruptEvents'); }

    // SPEC-200: Ambition Engine — player satisfaction vs club prestige
    try {
        const ambitionEvents = processAmbitionWeekly(team);
        ambitionEvents.forEach(e => {
            engine.weekEvents.push(e.msg || `🔔 ${e.type}: ${e.playerName}`);
            // Armazenar transfer requests no engine para a UI consumir
            if (e.type === 'transfer_request' || e.type === 'relegation_exit') {
                if (!engine._ambitionTransferRequests) engine._ambitionTransferRequests = [];
                engine._ambitionTransferRequests.push(e);
                // BUG-F2-03: cap to prevent save bloat over a 38-week season
                if (engine._ambitionTransferRequests.length > 20) {
                    engine._ambitionTransferRequests = engine._ambitionTransferRequests.slice(-20);
                }
            }
        });
    } catch (err) {
        EngineLogger.capture(err, 'WeekProcessor.ambitionEngine');
        console.warn('[AmbitionEngine] Error in weekly processing:', err.message);
    }

    // Remove retired players
    const retired = team.squad.filter(p => p._retired);
    retired.forEach(p => {
        engine.weekEvents.push(`👴 ${p.name} (${p.age} anos) anunciou aposentadoria.`);
    });
    team.squad = team.squad.filter(p => !p._retired);

    // Youth intake (1x por temporada, semana 38)
    if (engine.currentWeek > 0 && engine.currentWeek % 38 === 0) {
        const youths = engine.triggerYouthIntake();
        youths.forEach(y => {
            engine.weekEvents.push(`🎓 ${y.name} (${y.position}, ${y.age} anos, OVR ${y.ovr}) promovido da base!`);
        });
    }

    // Calendar events
    const seasonWeek = ((engine.currentWeek - 1) % 38) + 1;
    const calEvent = getCalendarEvent(seasonWeek);
    if (calEvent) {
        engine.weekEvents.push(`📅 ${calEvent.name}: ${calEvent.msg}`);
        if (calEvent.effect) {
            if (calEvent.effect.moral) team.squad.forEach(p => { p.moral = Math.max(0, Math.min(100, (p.moral || 50) + calEvent.effect.moral)); });
            if (calEvent.effect.energy) team.squad.forEach(p => { p.energy = Math.max(0, Math.min(100, p.energy + calEvent.effect.energy)); });
        }
    }

    // Sponsor income
    if (engine.currentSponsor) {
        team.balance += engine.currentSponsor.weeklyPay;
        if (engine.weeklyFinance) {
            engine.weeklyFinance.income += engine.currentSponsor.weeklyPay;
            engine.weeklyFinance.details.push({ label: `Patrocínio (${engine.currentSponsor.name})`, amount: engine.currentSponsor.weeklyPay, type: 'income' });
        }
    }

    // SPEC-073: Coach Proposal evaluation (mid-season or near end)
    try {
        if (engine.currentWeek >= 10 && engine.currentWeek % 8 === 0) {
            const formArr = (() => {
                const s = engine.managerStats.streak;
                if (s > 0) return Array(Math.min(s, 4)).fill('W');
                if (s < 0) return Array(Math.min(-s, 4)).fill('L');
                return ['D', 'D'];
            })();
            const clubTier = team.division === 1 ? 'big' : team.division === 2 ? 'mid' : 'small';
            const proposal = evaluateCoachProposal({
                managerId: engine.manager.teamId,
                currentClubId: team.id,
                currentClubTier: clubTier,
                currentContractWeeksLeft: engine.managerContract?.weeksRemaining || 20,
                managerReputation: engine.manager.reputation || 10,
                recentForm: formArr,
                currentObjectiveMet: engine.lastContractResolution?.outcome === 'fulfilled',
                week: engine.currentWeek,
                season: engine.seasonNumber,
            });
            if (proposal.proposalAvailable && proposal.proposal) {
                engine.pendingCoachProposal = proposal.proposal;
                engine.weekEvents.push(`📨 Proposta: ${proposal.proposal.fromClubName} quer contratá-lo! (${proposal.proposal.reason})`);
            }
        }
    } catch (err) { EngineLogger.capture(err, 'WeekProcessor.coachProposal'); }

    // SPEC-074: Organic Challenge evaluation
    try {
        if (engine.currentWeek >= 5 && engine.currentWeek % 10 === 0 && !engine.activeChallenge) {
            const standings = engine.getStandings(team.zone, team.division);
            const relegationZone = standings.slice(-4).map(s => {
                const t = engine.getTeam(s.teamId);
                return t ? { id: t.id, name: t.name, division: t.division } : null;
            }).filter(Boolean);
            const challenge = evaluateOrganicChallenge({
                managerId: engine.manager.teamId,
                currentClubId: team.id,
                season: engine.seasonNumber,
                week: engine.currentWeek,
                managerReputation: engine.manager.reputation || 10,
                clubsInRelegationZone: relegationZone,
            });
            if (challenge.challengeAvailable && challenge.challenge) {
                engine.activeChallenge = challenge.challenge;
                engine.weekEvents.push(`🎯 Desafio: ${challenge.challenge.description}`);
            }
        }
    } catch (err) { EngineLogger.capture(err, 'WeekProcessor.organicChallenge'); }
}
