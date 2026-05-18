import React, { useState, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { useKeyboardNav } from './GDDSystems';
import { getStadiumInfo } from '../engine/StadiumSystem';
import { getClubColors } from '../data/clubColors';
import TrophyCeremony from './TrophyCeremony';
import { EfPanel } from './ui/EfPanel';
import { EfButton } from './ui/EfButton';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardHeroMatch } from './dashboard/DashboardHeroMatch';
import { DashboardAlerts } from './dashboard/DashboardAlerts';
import { DashboardMatchInfo } from './dashboard/DashboardMatchInfo';
import { DashboardOverviewTab } from './dashboard/DashboardOverviewTab';
import { DashboardTacticsTab } from './dashboard/DashboardTacticsTab';
import { DashboardTrainingTab } from './dashboard/DashboardTrainingTab';
import { DashboardClubTab } from './dashboard/DashboardClubTab';
import { DashboardTransfersTab } from './dashboard/DashboardTransfersTab';
import { DashboardBottomNav } from './dashboard/DashboardBottomNav';
import { DashboardModals } from './dashboard/DashboardModals';
import { DashboardNarrative } from './dashboard/DashboardNarrative';
import { SoccerBall, GraduationCap } from '@phosphor-icons/react';

import '../styles/trophy-ceremony.css';
import '../styles/progressive-disclosure.css';
import '../styles/gdd-systems.css';
import '../styles/dashboard-view.css';

export function DashboardView() {
    const { gameState, changeView, getEngine, forceUpdate } = useGame();
    const engine = getEngine();
    const team = engine.getTeam(gameState.teamId);
    
    const [log, setLog] = useState('');
    const [tab, setTab] = useState('overview');
    const [pendingUnlock, setPendingUnlock] = useState(null);
    const [pendingAchievement, setPendingAchievement] = useState(null);
    const [pacingQueue, setPacingQueue] = useState([]);
    const [showTutorial, setShowTutorial] = useState(() => {
        try { return !localStorage.getItem('olefut_tutorial_done') && (engine?.seasonNumber || 1) === 1; }
        catch { return false; }
    });
    // SPEC-167: manager advice panel state
    const [advicePanel, setAdvicePanel] = useState({ open: false, loading: false, text: '' });

    useKeyboardNav({ changeView, currentView: gameState?.view || 'dashboard' });

    // BUG-081 (SPEC-158): aceitável — abre modais em resposta a eventos da engine (unlock/achievement).
    // Event-subscriber side-effect. setState dispara render que mostra modal.
    /* eslint-disable react-hooks/set-state-in-effect */
    React.useEffect(() => {
        if (!team) return;
        if (!engine?.weekEvents) return;
        const unlockEvent = engine.weekEvents.find(e => typeof e === 'string' && e.includes('🔓 Novo acesso'));
        if (unlockEvent) {
            const match = unlockEvent.match(/desbloqueado: (\w+)/);
            if (match && match[1]) setPendingUnlock(match[1]);
        }
        const achieveEvent = engine.weekEvents.find(e => typeof e === 'string' && (e.includes('🏆 CONQUISTA') || e.includes('🎖️')));
        if (achieveEvent) {
            setPendingAchievement({ emoji: '*', name: 'Conquista Desbloqueada!', description: achieveEvent });
        }
    }, [engine?.currentWeek, engine?.weekEvents, team]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // SPEC-167: triggers the LLM-or-template manager advice.
    // Declared before early return to keep React hook ordering stable (BUG-021).
    const handleAuxiliarAdvice = useCallback(async () => {
        if (!engine?.llmNarrative || !team) return;
        setAdvicePanel({ open: true, loading: true, text: '' });
        const standings = engine.getStandings ? engine.getStandings(team.zone, team.division) : [];
        const myPos = standings.findIndex(s => s.teamId === team.id) + 1;
        const avgOvr = team.squad?.length
            ? Math.round(team.squad.reduce((s, p) => s + (p.ovr || 50), 0) / (team.squad.length || 1))
            : 50;
        const divisionAvg = standings.length
            ? Math.round(standings.reduce((s, row) => {
                const t = engine.getTeam ? engine.getTeam(row.teamId) : null;
                if (!t || !t.squad) return s;
                return s + Math.round(t.squad.reduce((ss, p) => ss + (p.ovr || 50), 0) / (t.squad.length || 1));
            }, 0) / standings.length)
            : 50;
        try {
            const text = await engine.llmNarrative.managerAdvice({
                ownTeam: { name: team.name, avgOvr, formation: team.formation, currentTactic: engine.currentTactic },
                opponent: { name: 'Próximo adversário', avgOvr: divisionAvg, recentForm: engine.managerStats?.rollingForm?.slice(-5) || [] },
                position: myPos || 0,
                totalTeams: standings.length || 20,
            });
            setAdvicePanel({ open: true, loading: false, text });
        } catch {
            setAdvicePanel({ open: true, loading: false, text: 'Auxiliar indisponível no momento.' });
        }
    }, [engine, team]);

    if (!team) return <div className="main-content ef-dashboard-error">Time não encontrado.</div>;

    const sectors = engine.getTeamSectors(team.id);
    const standings = engine.getStandings(team.zone, team.division);
    const pos = standings.findIndex(s => s.teamId === team.id) + 1;
    const _avgMoral = team.squad.reduce((s, p) => s + (p.moral || 50), 0) / (team.squad.length || 1);
    const avgEnergy = team.squad.reduce((s, p) => s + (p.energy || 50), 0) / (team.squad.length || 1);
    const stats = engine.managerStats;
    const _cond = engine.matchCondition;
    const boardStatus = engine.board ? engine.board.getStatus() : null;
    const injured = team.squad.filter(p => p.injury);
    const expiringContracts = team.squad.filter(p => p.contract && p.contract.weeksLeft <= 8);
    const stadiumInfo = getStadiumInfo(engine.stadiumLevel);
    const seasonWeek = ((engine.currentWeek - 1) % 38) + 1;

    const handleTrain = (id) => { const result = engine.doTraining(id); setLog(result.msg); forceUpdate(); };
    const handleTeamTalk = (id) => { const result = engine.doTeamTalk(id); if (result.success) setLog(`"${result.talk.text}"`); forceUpdate(); };
    const handleAcceptOffer = (playerId) => { const result = engine.acceptTransferOffer(playerId); setLog(result.msg); forceUpdate(); };
    const handleRejectOffer = (playerId) => { engine.rejectTransferOffer(playerId); setLog('Oferta recusada.'); forceUpdate(); };

    // SPEC-176/183: Stitch-aligned next-match preview data (real engine, no hallucinated names)
    const nextOpponentName = (engine.nextMatch?.opponentName) || (engine.getNextOpponent?.()?.name) || 'PRÓXIMO ADVERSÁRIO';
    const stadiumLabel = (stadiumInfo?.name || 'ESTÁDIO').toUpperCase();
    const teamColors = getClubColors(team.name);

    return (
        /* eslint-disable-next-line no-restricted-syntax -- dynamic team colors */
        <div className="ef-dashboard-container" style={{
            '--team-primary': teamColors.primary,
            '--team-secondary': teamColors.secondary,
            '--team-accent': teamColors.accent
        }}>
            <div className="ef-dashboard-inner">
                <TrophyCeremony trophy={engine.trophyCeremony?.trophy} season={engine.trophyCeremony?.season} visible={!!engine.trophyCeremony} onDismiss={() => { engine.trophyCeremony = null; forceUpdate(); }} />

                <DashboardHeader pos={pos} team={team} stats={stats} boardStatus={boardStatus} engine={engine} />
                <DashboardHeroMatch team={team} nextOpponentName={nextOpponentName} stadiumLabel={stadiumLabel} engine={engine} setPacingQueue={setPacingQueue} changeView={changeView} forceUpdate={forceUpdate} />
                <DashboardAlerts injured={injured} expiringContracts={expiringContracts} avgEnergy={avgEnergy} engine={engine} setTab={setTab} />

                {/* === BENTO GRID LAYOUT === */}
                <div className="ef-dashboard-main-grid">
                    {/* LEFT COLUMN: Navigation & Actions */}
                    <div className="ef-dashboard-nav">
                        <EfPanel padding="md" className="ef-dashboard-nav__tabs">
                            {[{id:'overview',label:'Visão Geral'},{id:'tactics',label:'Táticas'},{id:'training',label:'Treino'},{id:'club',label:'Clube'},...((engine.transferOffers?.length ?? 0) > 0 ? [{id:'transfers',label:'Ofertas'}] : [])].map(t => (
                                <EfButton key={t.id} variant={tab === t.id ? 'primary' : 'secondary'} size="md" onClick={() => setTab(t.id)} className="ef-dashboard-nav-tab-btn">
                                    {t.label}
                                </EfButton>
                            ))}
                        </EfPanel>

                        <div className="ef-dashboard-nav__actions">
                            {/* SPEC-167: Conselho do Auxiliar */}
                            <EfButton variant="secondary" size="md" title="Sugestão tática do auxiliar técnico baseada no adversário" className="ef-dashboard-nav-action-btn" onClick={handleAuxiliarAdvice}>
                                <GraduationCap weight="bold" /> Conselho do Auxiliar
                            </EfButton>
                            <EfButton variant="primary" size="lg" title="Joga a próxima partida e avança 1 semana (processa treino, finanças, lesões, eventos)" className="ef-dashboard-nav-play-btn" onClick={() => {
                                // AUDIT-FIX #17: Check pacing friction before match
                                const events = engine.getPacingEvents?.() || [];
                                if (events.length > 0) {
                                    setPacingQueue(events);
                                } else {
                                    engine.checkPressConference();
                                    if (!engine.pressQuestion) changeView('match'); else forceUpdate();
                                }
                            }}>
                                <SoccerBall weight="fill" /> JOGAR PARTIDA
                            </EfButton>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Content Area */}
                    <div className="ef-dashboard-content">
                        {/* NEXT MATCH INFO (Always visible above tabs) */}
                        <DashboardMatchInfo team={team} engine={engine} sectors={sectors} />

                        {/* TAB CONTENTS */}
                        {tab === 'overview' && (
                            <DashboardOverviewTab 
                                engine={engine} 
                                team={team} 
                                seasonWeek={seasonWeek} 
                                forceUpdate={forceUpdate} 
                            />
                        )}

                        {tab === 'tactics' && (
                            <DashboardTacticsTab 
                                engine={engine} 
                                team={team} 
                                forceUpdate={forceUpdate} 
                                handleTeamTalk={handleTeamTalk} 
                            />
                        )}

                        {tab === 'training' && (
                            <DashboardTrainingTab 
                                engine={engine} 
                                forceUpdate={forceUpdate} 
                                handleTrain={handleTrain} 
                            />
                        )}

                        {tab === 'club' && (
                            <DashboardClubTab 
                                engine={engine} 
                                forceUpdate={forceUpdate} 
                                setLog={setLog} 
                                stadiumInfo={stadiumInfo} 
                            />
                        )}

                        {tab === 'transfers' && (engine.transferOffers?.length ?? 0) > 0 && (
                            <DashboardTransfersTab 
                                engine={engine} 
                                handleAcceptOffer={handleAcceptOffer} 
                                handleRejectOffer={handleRejectOffer} 
                            />
                        )}
                    </div>
                </div>

                {/* BOTTOM NAVIGATION */}
                <DashboardBottomNav changeView={changeView} />

                {/* === STITCH FOOTER CTA — Avançar Semana === */}
                <button
                    type="button"
                    className="ef-dashboard-footer-cta"
                    title="Avança 1 semana (treino, finanças, lesões, eventos) e joga a próxima partida"
                    onClick={() => {
                        const events = engine.getPacingEvents?.() || [];
                        if (events.length > 0) {
                            setPacingQueue(events);
                        } else {
                            engine.checkPressConference();
                            if (!engine.pressQuestion) changeView('match'); else forceUpdate();
                        }
                    }}
                >
                    AVANÇAR SEMANA
                </button>

                {/* Feedback log */}
                {log && <div className="event-toast success" onClick={() => setLog('')}>{log}</div>}

                {/* Modals and Overlays */}
                <DashboardModals 
                    engine={engine}
                    setLog={setLog}
                    forceUpdate={forceUpdate}
                    pendingUnlock={pendingUnlock}
                    setPendingUnlock={setPendingUnlock}
                    pendingAchievement={pendingAchievement}
                    setPendingAchievement={setPendingAchievement}
                    showTutorial={showTutorial}
                    setShowTutorial={setShowTutorial}
                    advicePanel={advicePanel}
                    setAdvicePanel={setAdvicePanel}
                    pacingQueue={pacingQueue}
                    setPacingQueue={setPacingQueue}
                    setTab={setTab}
                    changeView={changeView}
                />

                {/* SPEC-167: Última narrativa pós-jogo */}
                <DashboardNarrative narrative={engine.lastMatchNarrative} />
            </div>
        </div>
    );
}
