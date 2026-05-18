import { smartSellDecision, rankCandidates } from '../../learning/SmartMarketEngine.js';
import { rng as systemRng } from '../../../engine/rng.js';
import { EngineLogger } from '../../../engine/EngineLogger.js';

export class TransferMarketNode {
    execute(parent, engine, teamId, stateKey, ctx) {
        try {
            const team = engine.getTeam(teamId);
            if (!team) return;
            
            this.processIncomingOffers(parent, engine, team);
            
            if (this.processUrgentSignings(parent, engine, team)) {
                return; // Early exit if we handled bankruptcy sign
            }
            
            this.scoutAndBuy(parent, engine, team);
            this.marketInquiries(parent, engine, team);
            
        } catch (err) { EngineLogger.capture(err, 'TransferMarketNode.execute', { week: parent.stats.weeksPlayed }); }
    }

    processIncomingOffers(parent, engine, team) {
        if (!Array.isArray(engine.transferOffers) || engine.transferOffers.length === 0) return;
        
        for (const offer of engine.transferOffers.slice(0, 3)) {
            if (!offer?.playerId || !offer?.offerAmount) continue;
            const player = team.squad.find(p => p.id === offer.playerId);
            if (!player) {
                engine.rejectTransferOffer?.(offer.playerId);
                continue;
            }
            
            const decision = smartSellDecision(parent.brain, { team, player, offerAmount: offer.offerAmount });
            
            if (parent.llmBridge._mode === 'webllm' && parent.llmBridge._loadStatus === 'ready') {
                const prompt = `Futebol manager. Recebi oferta de R$ ${(offer.offerAmount/1e6).toFixed(1)}M por ${player.name} (OVR ${player.ovr}, pos ${player.position}, idade ${player.age || '?'}). Meu saldo: R$ ${((team.balance||0)/1e6).toFixed(1)}M. Elenco tem ${team.squad.length} jogadores. Devo VENDER ou MANTER? Responda apenas VENDER ou MANTER e o motivo em 1 linha.`;
                parent.llmBridge.decide(prompt).then(resp => {
                    if (resp.source === 'webllm' && resp.text) {
                        parent._logDecision('LLM_CONSULT_SELL', {
                            player: player.name, ovr: player.ovr, amount: offer.offerAmount,
                            llmResponse: resp.text.substring(0, 200), heuristicSaid: decision.sell ? 'SELL' : 'KEEP'
                        }, 0);
                    }
                }).catch((err) => { EngineLogger.capture(err, 'AutoPlayDecisions.llmNonBlocking'); });
            }

            if (decision.sell && typeof engine.acceptTransferOffer === 'function') {
                const standings = engine.getStandings(team.zone, team.division) || [];
                const posBefore = (standings.findIndex(s => s.teamId === team.id) + 1) || standings.length;
                parent._pendingTransferRewards.push({
                    type: 'SELL', stateKey: decision.stateKey, action: decision.action,
                    weekDone: engine.currentWeek, positionBefore: posBefore,
                    balanceBefore: team.balance, playerWasStarter: (player.ovr || 0) >= 65,
                    offerRatio: offer.offerAmount / Math.max(player.value || 1, 1)
                });
                const result = engine.acceptTransferOffer(offer.playerId);
                if (result?.success) {
                    parent.stats.transfers++;
                    parent._logSuccess('TRANSFER_SOLD', `Vendeu ${player.name} (OVR${player.ovr}) por R$ ${(offer.offerAmount/1e6).toFixed(1)}M. ${decision.reason}${parent.llmBridge._mode === 'webllm' ? ' [LLM ativo]' : ''}`);
                    parent._logDecision('SELL_PLAYER', {
                        playerId: offer.playerId, amount: offer.offerAmount,
                        source: parent.llmBridge._mode === 'webllm' ? 'webllm+heuristic' : decision.source,
                        reason: decision.reason, biases: decision.biases || []
                    }, 0);
                }
            } else {
                engine.rejectTransferOffer?.(offer.playerId);
            }
        }
    }

    processUrgentSignings(parent, engine, team) {
        if ((team.balance || 0) < 0) {
            const squadSize = team.squad.length;
            if (squadSize < 18 && engine.marketPlayers && engine.marketPlayers.length > 0) {
                const freeAgents = engine.marketPlayers.sort((a, b) => b.ovr - a.ovr);
                const chosen = freeAgents[0];
                if (chosen) {
                    engine.marketPlayers = engine.marketPlayers.filter(p => p.id !== chosen.id);
                    chosen.contract = { weeksLeft: 38, salary: 2000 };
                    team.squad.push(chosen);
                    parent.stats.transfers++;
                    parent._logSuccess('FREE_AGENT', `Assinou o agente livre ${chosen.name} (OVR${chosen.ovr}) para evitar falência.`);
                    return true;
                }
            }
            return true;
        }
        return false;
    }

    scoutAndBuy(parent, engine, team) {
        if (parent.stats.weeksPlayed % 4 !== 0 || typeof engine.scoutLeague !== 'function') return;
        try {
            const positions = ['GOL', 'DEF', 'MEI', 'ATA'];
            const positionStrength = positions.map(pos => {
                const players = team.squad.filter(p => p.position === pos);
                const avgOVR = players.length > 0 ? players.reduce((s, p) => s + (p.ovr || 0), 0) / players.length : 0;
                return { pos, avgOVR, count: players.length };
            });
            const weakest = positionStrength.sort((a, b) => a.avgOVR - b.avgOVR)[0];

            const urgentScout = parent._urgentScout;
            if (urgentScout) parent._urgentScout = false;

            if (weakest && (weakest.avgOVR < 70 || urgentScout)) {
                const candidates = engine.scoutLeague(weakest.pos, weakest.avgOVR + 5, 10);
                if (candidates.length > 0) {
                    const biasCtx = { windowWeeksLeft: Math.max(0, 38 - (engine.currentWeek || 0)), totalWindowWeeks: 38 };
                    const ranked = rankCandidates({ brain: parent.brain, team, candidates, biasCtx, limit: 3 });
                    const best = ranked[0];
                    
                    if (best) {
                        const target = best.candidate;
                        const player = target.player || target;
                        const offerAmount = best.askingPrice;

                        if (parent.llmBridge._mode === 'webllm' && parent.llmBridge._loadStatus === 'ready') {
                            const prompt = `Futebol manager. Quero contratar ${player.name} (OVR ${player.ovr}, pos ${player.position || weakest.pos}, idade ${player.age || '?'}) por R$ ${(offerAmount/1e6).toFixed(1)}M. Meu saldo: R$ ${((team.balance||0)/1e6).toFixed(1)}M. Posição mais fraca: ${weakest.pos} (média OVR ${weakest.avgOVR.toFixed(0)}). Vale a pena COMPRAR ou ESPERAR? Responda COMPRAR ou ESPERAR e o motivo em 1 linha.`;
                            parent.llmBridge.decide(prompt).then(resp => {
                                if (resp.source === 'webllm' && resp.text) {
                                    parent._logDecision('LLM_CONSULT_BUY', {
                                        target: player.name, ovr: player.ovr, amount: offerAmount,
                                        llmResponse: resp.text.substring(0, 200), heuristicSaid: 'BUY'
                                    }, 0);
                                }
                            }).catch((err) => { EngineLogger.capture(err, 'AutoPlayDecisions.llmNonBlocking'); });
                        }

                        const result = engine.makeBuyOffer(target.teamId, player.id, offerAmount);
                        const standings = engine.getStandings(team.zone, team.division) || [];
                        const posBefore = (standings.findIndex(s => s.teamId === team.id) + 1) || standings.length;

                        if (parent.telemetry?.history) {
                            if (!Array.isArray(parent.telemetry.history.offers)) parent.telemetry.history.offers = [];
                            parent.telemetry.history.offers.push({
                                week: engine.currentWeek, playerId: player?.id, amount: offerAmount,
                                playerValue: target.value || (player.ovr || 60) * 50_000,
                                accepted: result?.accepted === true, simulated: false, source: best.decision.source
                            });
                            if (parent.telemetry.history.offers.length > 200) {
                                parent.telemetry.history.offers = parent.telemetry.history.offers.slice(-200);
                            }
                        }
                        
                        parent._logDecision('BUY_OFFER', {
                            target: player.name, position: player.position || weakest.pos,
                            ovr: player.ovr || target.ovr, amount: offerAmount,
                            accepted: result?.accepted || false, reason: best.decision.reason, source: best.decision.source
                        }, 0);

                        if (result?.accepted) {
                            parent.stats.transfers++;
                            parent._pendingTransferRewards.push({
                                type: 'BUY', stateKey: best.decision.stateKey, action: best.decision.action,
                                weekDone: engine.currentWeek, positionBefore: posBefore,
                                balanceBefore: team.balance, playerOvr: player.ovr || 60
                            });
                            parent.brain?.remember({
                                week: engine.currentWeek, season: engine.seasonNumber, action: `BUY_${weakest.pos}_OVR${player.ovr}`,
                                result: 'accepted', reward: 3, details: `R$ ${(offerAmount / 1_000_000).toFixed(1)}M via ML`
                            });
                        } else if (result?.success === true) {
                            parent.brain?.remember({
                                week: engine.currentWeek, season: engine.seasonNumber, action: `BUY_${weakest.pos}_OVR${player.ovr}`,
                                result: `rejected`, reward: -1
                            });
                        }
                    } else {
                        parent._logDecision('BUY_ALL_REJECTED_BY_ML', { position: weakest.pos, candidatesScanned: candidates.length, brainStates: Object.keys(parent.brain?.qTable || {}).length }, 0);
                    }
                }
            }
        } catch (err) { EngineLogger.capture(err, 'TransferMarketNode.scoutBuy', { week: parent.stats.weeksPlayed }); }
    }

    marketInquiries(parent, engine, team) {
        if (parent.stats.weeksPlayed % 8 === 0 && team.squad?.length > 0) {
            const candidate = team.squad[Math.floor(systemRng() * team.squad.length)];
            const playerVal = candidate.value || (candidate.ovr || 60) * 50_000;
            const askPrice = playerVal * (1.2 + systemRng() * 0.6);
            parent._logDecision('MARKET_INQUIRY', { playerId: candidate.id, askPrice: Math.round(askPrice) }, 0);
        }
    }
}

