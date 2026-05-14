import React, { useState, useCallback } from 'react';
import { AnimatedStat } from '../hooks/useCountUp';
import { Help } from './Help';
import { useGame } from '../context/GameContext';
import { FORMATIONS, TACTICS, TEAM_TALKS, TRAINING_TYPES } from '../engine/ManagerSystems';
import { STAFF_ROLES, SCOUT_REGIONS, getStadiumInfo } from '../engine/StadiumSystem';
import { getAcademyUpgradeCost } from '../engine/YouthAcademy';
import { ChallengesWidget } from './ChallengesWidget';
import { getAllAchievements } from '../engine/MetaProgression';
import TrophyCeremony from './TrophyCeremony';
import { UnlockTooltip, AhaMomentCard, AchievementPopup } from './ProgressiveDisclosure';
import { ScarcityBanner, DreadIndicator, useKeyboardNav, TutorialOverlay, IronmanMode } from './GDDSystems';
import { EfPanel } from './ui/EfPanel';
import { EfButton } from './ui/EfButton';
import { EfModal } from './ui/EfModal';
import {
  Users, ShoppingCart, ChartBar, SoccerBall, TrendUp, TrendDown, Heartbeat,
  Newspaper, Lightning, Envelope, Wallet, Bank, Building, GraduationCap, Binoculars,
  Megaphone, Microphone, MicrophoneStage, Lightbulb, WarningCircle, ChartLineUp,
  Trophy, Flame, Bell, WarningOctagon, Gavel, ListNumbers, Bandaids
} from '@phosphor-icons/react';

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
            setPendingAchievement({ emoji: '🏅', name: 'Conquista Desbloqueada!', description: achieveEvent });
        }
    }, [engine?.currentWeek]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // SPEC-167: triggers the LLM-or-template manager advice.
    // Declared before early return to keep React hook ordering stable (BUG-021).
    const handleAuxiliarAdvice = useCallback(async () => {
        if (!engine?.llmNarrative || !team) return;
        setAdvicePanel({ open: true, loading: true, text: '' });
        const standings = engine.getStandings ? engine.getStandings(team.zone, team.division) : [];
        const myPos = standings.findIndex(s => s.teamId === team.id) + 1;
        const avgOvr = team.squad?.length
            ? Math.round(team.squad.reduce((s, p) => s + (p.ovr || 50), 0) / team.squad.length)
            : 50;
        const divisionAvg = standings.length
            ? Math.round(standings.reduce((s, row) => {
                const t = engine.getTeam ? engine.getTeam(row.teamId) : null;
                if (!t || !t.squad) return s;
                return s + Math.round(t.squad.reduce((ss, p) => ss + (p.ovr || 50), 0) / t.squad.length);
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

    if (!team) return <div className="main-content" style={{ padding: '24px', fontFamily: 'var(--font-mono)' }}>Time não encontrado.</div>;

    const sectors = engine.getTeamSectors(team.id);
    const standings = engine.getStandings(team.zone, team.division);
    const pos = standings.findIndex(s => s.teamId === team.id) + 1;
    const avgMoral = team.squad.reduce((s, p) => s + (p.moral || 50), 0) / team.squad.length;
    const avgEnergy = team.squad.reduce((s, p) => s + p.energy, 0) / team.squad.length;
    const stats = engine.managerStats;
    const cond = engine.matchCondition;
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

    // SPEC-186 helpers: top 5 scorers from team squad (sort by goals desc)
    const topScorers = [...(team.squad || [])]
        .filter(p => (p.goals || 0) > 0)
        .sort((a, b) => (b.goals || 0) - (a.goals || 0))
        .slice(0, 5);
    const initial = (s) => (s?.[0] || '?').toUpperCase();

    return (
        <div className="min-h-screen crt-scanlines text-on-background font-body-md">
            <TrophyCeremony trophy={engine.trophyCeremony?.trophy} season={engine.trophyCeremony?.season} visible={!!engine.trophyCeremony} onDismiss={() => { engine.trophyCeremony = null; forceUpdate(); }} />

            {/* === STITCH TOP NAV (sticky) === */}
            <nav className="bg-forest-dark flex justify-between items-center w-full px-4 md:px-margin-desktop h-16 z-50 border-b-4 border-pitch sticky top-0">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border-2 border-neon p-0.5 bg-forest-dark flex items-center justify-center">
                        <span className="font-headline-sm text-headline-sm text-trophy">{initial(team.name)}</span>
                    </div>
                    <h1 className="font-headline-lg text-headline-lg text-neon drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] hidden md:block">{team.name?.toUpperCase()}</h1>
                </div>
                <div className="hidden md:flex gap-8">
                    <button onClick={() => changeView('squad')} className="text-parchment font-label-lg text-label-lg opacity-80 hover:text-neon transition-colors">PLANTEL</button>
                    <button onClick={() => setTab('tactics')} className={`${tab === 'tactics' ? 'text-neon border-b-4 border-neon pb-1' : 'text-parchment opacity-80 hover:text-neon'} font-label-lg text-label-lg transition-colors`}>TÁTICAS</button>
                    <button onClick={() => changeView('market')} className="text-parchment font-label-lg text-label-lg opacity-80 hover:text-neon transition-colors">MERCADO</button>
                    <button onClick={() => changeView('standings')} className="text-parchment font-label-lg text-label-lg opacity-80 hover:text-neon transition-colors">TABELA</button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-abyss px-3 py-1 border-2 border-pitch">
                        <Wallet weight="fill" className="text-trophy" size={16} />
                        <span className="font-label-lg text-label-lg text-trophy">R$ {(team.balance / 1000000).toFixed(1)}M</span>
                    </div>
                    {boardStatus && (
                        <div className="hidden sm:flex items-center gap-1 bg-abyss px-2 py-1 border-2 border-pitch" title={`Diretoria: ${boardStatus.label}`}>
                            <span className="text-label-md">{boardStatus.emoji}</span>
                            <span className="font-label-md text-label-md text-smoke">{boardStatus.label}</span>
                        </div>
                    )}
                    <Bell weight="fill" className="text-neon cursor-pointer" size={24} />
                </div>
            </nav>

            {/* === MAIN CANVAS === */}
            <main className="p-margin-mobile md:p-margin-desktop bg-crt-black/60 max-w-[1400px] mx-auto">

                {/* Season/position header strip */}
                <div className="mb-gutter flex flex-wrap items-center justify-between gap-3 px-2">
                    <div className="flex items-center gap-3">
                        <span className="bg-amber text-crt-black px-3 py-1 font-headline-sm text-headline-sm">SEM {seasonWeek}/38 • TEMP {engine.seasonNumber}</span>
                        <span className="bg-forest-dark border-2 border-pitch px-3 py-1 font-label-md text-label-md text-parchment">{pos}º • SÉRIE {['A','B','C','D'][team.division - 1]}</span>
                        <span className="font-label-md text-label-md text-smoke">{stats.wins}V {stats.draws}E {stats.losses}D</span>
                        {stats.streak > 0 && <span className="inline-flex items-center gap-1 font-label-md text-label-md text-neon"><TrendUp weight="bold" /> {stats.streak}</span>}
                        {stats.streak < 0 && <span className="inline-flex items-center gap-1 font-label-md text-label-md text-danger"><TrendDown weight="bold" /> {Math.abs(stats.streak)}</span>}
                    </div>
                </div>

                {/* === HERO PANEL — PRÓXIMO JOGO (Stitch faithful) === */}
                <section className="mb-gutter bg-forest-dark border-4 border-pitch p-6 relative overflow-hidden crt-bevel">
                    <div className="absolute top-0 right-0 p-2 bg-pitch text-crt-black font-headline-sm text-headline-sm">PRÓXIMO JOGO</div>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
                        <div className="flex items-center gap-8 md:gap-12">
                            <div className="text-center group">
                                <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-neon bg-abyss flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <span className="font-headline-lg text-[40px] md:text-[56px] text-neon">{initial(team.name)}</span>
                                </div>
                                <p className="font-headline-sm text-headline-sm text-parchment mt-4">{team.name?.toUpperCase()}</p>
                            </div>
                            <div className="font-headline-lg text-headline-lg text-smoke animate-pulse">VS</div>
                            <div className="text-center group">
                                <div className="w-24 h-24 md:w-32 md:h-32 border-4 border-danger bg-abyss flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <span className="font-headline-lg text-[40px] md:text-[56px] text-danger">{initial(nextOpponentName)}</span>
                                </div>
                                <p className="font-headline-sm text-headline-sm text-parchment mt-4">{String(nextOpponentName).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="w-full md:w-auto text-center md:text-right space-y-4">
                            <div className="bg-abyss border-2 border-smoke p-4 inline-block">
                                <p className="font-label-md text-label-md text-smoke mb-1">ESTÁDIO: {stadiumLabel}</p>
                                <p className="font-label-md text-label-md text-neon">FORMAÇÃO: {team.formation} • {TACTICS[engine.currentTactic]?.name?.toUpperCase()}</p>
                            </div>
                            <button
                                onClick={() => {
                                    const events = engine.getPacingEvents?.() || [];
                                    if (events.length > 0) {
                                        setPacingQueue(events);
                                    } else {
                                        engine.checkPressConference();
                                        if (!engine.pressQuestion) changeView('match'); else forceUpdate();
                                    }
                                }}
                                className="w-full md:w-auto px-8 py-4 bg-neon text-crt-black font-headline-md text-headline-md border-b-4 border-r-4 border-green-800 hover:bg-primary-fixed active:translate-y-1 active:border-0 transition-all"
                            >
                                <span className="inline-flex items-center gap-2"><SoccerBall weight="fill" /> ESCALAR E JOGAR</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* === 3-COLUMN BENTO GRID === */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">

                    {/* Column 1: Alertas */}
                    <div className="bg-forest-dark border-4 border-pitch flex flex-col crt-bevel">
                        <div className="p-3 bg-pitch flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-crt-black">ALERTAS</h3>
                            <WarningOctagon weight="fill" className="text-crt-black" size={20} />
                        </div>
                        <div className="p-4 space-y-3 flex-1">
                            {injured.length === 0 && expiringContracts.length === 0 && avgEnergy >= 50 && (engine.transferOffers?.length ?? 0) === 0 && stats.streak < 3 && (
                                <p className="font-label-md text-label-md text-smoke text-center py-4">Sem alertas. Clube em paz.</p>
                            )}
                            {injured.length > 0 && (
                                <div className="flex items-center gap-3 bg-abyss p-3 border-l-4 border-danger">
                                    <Bandaids weight="fill" className="text-danger" size={20} />
                                    <div className="flex-1">
                                        <p className="font-label-lg text-label-lg text-parchment">LESÃO</p>
                                        <p className="font-label-md text-label-md text-danger">{injured.length} JOGADOR{injured.length > 1 ? 'ES' : ''} FORA</p>
                                    </div>
                                </div>
                            )}
                            {expiringContracts.length > 0 && (
                                <div className="flex items-center gap-3 bg-abyss p-3 border-l-4 border-amber">
                                    <Gavel weight="fill" className="text-amber" size={20} />
                                    <div className="flex-1">
                                        <p className="font-label-lg text-label-lg text-parchment">CONTRATO EXPIRA</p>
                                        <p className="font-label-md text-label-md text-amber">{expiringContracts.length} JOGADOR{expiringContracts.length > 1 ? 'ES' : ''}</p>
                                    </div>
                                </div>
                            )}
                            {avgEnergy < 50 && (
                                <div className="flex items-center gap-3 bg-abyss p-3 border-l-4 border-danger">
                                    <Lightning weight="fill" className="text-danger" size={20} />
                                    <div className="flex-1">
                                        <p className="font-label-lg text-label-lg text-parchment">PLANTEL CANSADO</p>
                                        <p className="font-label-md text-label-md text-danger">{avgEnergy.toFixed(0)}% ENERGIA</p>
                                    </div>
                                </div>
                            )}
                            {(engine.transferOffers?.length ?? 0) > 0 && (
                                <button onClick={() => setTab('transfers')} className="flex w-full items-center gap-3 bg-abyss p-3 border-l-4 border-pitch hover:border-neon transition-colors text-left">
                                    <Envelope weight="fill" className="text-pitch" size={20} />
                                    <div className="flex-1">
                                        <p className="font-label-lg text-label-lg text-parchment">OFERTAS</p>
                                        <p className="font-label-md text-label-md text-pitch">{engine.transferOffers.length} RECEBIDA{engine.transferOffers.length > 1 ? 'S' : ''}</p>
                                    </div>
                                </button>
                            )}
                            {stats.streak >= 3 && (
                                <div className="flex items-center gap-3 bg-abyss p-3 border-l-4 border-neon">
                                    <Flame weight="fill" className="text-neon" size={20} />
                                    <div className="flex-1">
                                        <p className="font-label-lg text-label-lg text-neon">HOT STREAK!</p>
                                        <p className="font-label-md text-label-md text-smoke">{stats.streak} VITÓRIAS SEGUIDAS</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Column 2: Ações Rápidas */}
                    <div className="bg-forest-dark border-4 border-pitch flex flex-col crt-bevel">
                        <div className="p-3 bg-pitch flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-crt-black">AÇÕES RÁPIDAS</h3>
                            <Lightning weight="fill" className="text-crt-black" size={20} />
                        </div>
                        <div className="p-4 grid grid-cols-1 gap-3 flex-1">
                            <button onClick={() => changeView('squad')} className="flex items-center gap-4 bg-forest p-4 border-2 border-pitch hover:border-neon group transition-all">
                                <Users weight="fill" className="text-neon group-hover:scale-110 transition-transform" size={24} />
                                <span className="font-headline-sm text-headline-sm text-parchment group-hover:text-neon">PLANTEL</span>
                            </button>
                            <button onClick={() => changeView('market')} className="flex items-center gap-4 bg-forest p-4 border-2 border-pitch hover:border-neon group transition-all">
                                <ShoppingCart weight="fill" className="text-neon group-hover:scale-110 transition-transform" size={24} />
                                <span className="font-headline-sm text-headline-sm text-parchment group-hover:text-neon">MERCADO</span>
                            </button>
                            <button onClick={() => changeView('standings')} className="flex items-center gap-4 bg-forest p-4 border-2 border-pitch hover:border-neon group transition-all">
                                <ListNumbers weight="fill" className="text-neon group-hover:scale-110 transition-transform" size={24} />
                                <span className="font-headline-sm text-headline-sm text-parchment group-hover:text-neon">TABELA</span>
                            </button>
                            <button onClick={handleAuxiliarAdvice} className="flex items-center gap-4 bg-forest p-4 border-2 border-pitch hover:border-neon group transition-all">
                                <GraduationCap weight="fill" className="text-neon group-hover:scale-110 transition-transform" size={24} />
                                <span className="font-headline-sm text-headline-sm text-parchment group-hover:text-neon">AUXILIAR</span>
                            </button>
                        </div>
                    </div>

                    {/* Column 3: Top Scorers / Recent Form */}
                    <div className="bg-forest-dark border-4 border-pitch flex flex-col crt-bevel">
                        <div className="p-3 bg-pitch flex justify-between items-center">
                            <h3 className="font-headline-sm text-headline-sm text-crt-black">ARTILHEIROS</h3>
                            <Trophy weight="fill" className="text-crt-black" size={20} />
                        </div>
                        <div className="p-4 space-y-2 flex-1">
                            {topScorers.length === 0 ? (
                                <p className="font-label-md text-label-md text-smoke text-center py-4">Nenhum gol marcado ainda.</p>
                            ) : (
                                topScorers.map((p, i) => (
                                    <div key={p.id || i} className={`flex justify-between items-center p-2 bg-abyss${i === 0 ? '' : '/50'} border-b-2 border-pitch${i === 0 ? '' : '/50'}`}>
                                        <span className={`font-label-lg text-label-lg ${i === 0 ? 'text-trophy' : 'text-parchment'}`}>{i + 1}. {p.name?.toUpperCase()}</span>
                                        <span className={`font-headline-sm text-headline-sm ${i === 0 ? 'text-neon' : 'text-smoke'}`}>{String(p.goals).padStart(2, '0')} GOLS</span>
                                    </div>
                                ))
                            )}
                            {stats.rollingForm && stats.rollingForm.length > 0 && (
                                <div className="pt-2 border-t-2 border-pitch/50 mt-3">
                                    <p className="font-label-md text-label-md text-smoke mb-2">FORMA RECENTE</p>
                                    <div className="flex gap-1">
                                        {stats.rollingForm.map((r, i) => {
                                            const color = r === 'V' ? 'bg-neon text-crt-black' : r === 'E' ? 'bg-amber text-crt-black' : 'bg-danger text-parchment';
                                            return <span key={i} className={`${color} font-headline-sm text-headline-sm px-2 py-1 inline-block`}>{r}</span>;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* === SECTORS STRIP (compact, with Help tooltips P1-7 regression) === */}
                <div className="mb-gutter bg-forest-dark border-4 border-pitch p-4 crt-bevel grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex flex-col items-center bg-abyss p-3 border-2 border-pitch">
                        <span className="font-headline-lg text-headline-lg text-amber"><AnimatedStat value={sectors.goalkeeper} /></span>
                        <span className="font-label-md text-label-md text-smoke mt-1 inline-flex items-center gap-1"><Help id="sector.gol" />GOL</span>
                    </div>
                    <div className="flex flex-col items-center bg-abyss p-3 border-2 border-pitch">
                        <span className="font-headline-lg text-headline-lg text-pitch"><AnimatedStat value={sectors.defense} /></span>
                        <span className="font-label-md text-label-md text-smoke mt-1 inline-flex items-center gap-1"><Help id="sector.def" />DEF</span>
                    </div>
                    <div className="flex flex-col items-center bg-abyss p-3 border-2 border-pitch">
                        <span className="font-headline-lg text-headline-lg text-neon"><AnimatedStat value={sectors.midfield} /></span>
                        <span className="font-label-md text-label-md text-smoke mt-1 inline-flex items-center gap-1"><Help id="sector.mei" />MEI</span>
                    </div>
                    <div className="flex flex-col items-center bg-abyss p-3 border-2 border-pitch">
                        <span className="font-headline-lg text-headline-lg text-danger"><AnimatedStat value={sectors.attack} /></span>
                        <span className="font-label-md text-label-md text-smoke mt-1 inline-flex items-center gap-1"><Help id="sector.ata" />ATA</span>
                    </div>
                </div>

                {/* === TAB CONTENT AREA (Stitch panel wrapper) === */}
                <div className="bg-forest-dark border-4 border-pitch crt-bevel mb-gutter">
                    <div className="p-3 bg-pitch flex justify-between items-center flex-wrap gap-2">
                        <h3 className="font-headline-sm text-headline-sm text-crt-black">
                            {tab === 'overview' && 'VISÃO GERAL'}
                            {tab === 'tactics' && 'TÁTICAS'}
                            {tab === 'training' && 'TREINO'}
                            {tab === 'club' && 'CLUBE'}
                            {tab === 'transfers' && 'OFERTAS'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {[{id:'overview',label:'GERAL'},{id:'tactics',label:'TÁTICAS'},{id:'training',label:'TREINO'},{id:'club',label:'CLUBE'},...((engine.transferOffers?.length ?? 0) > 0 ? [{id:'transfers',label:'OFERTAS'}] : [])].map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTab(t.id)}
                                    className={`px-3 py-1 font-headline-sm text-headline-sm border-2 transition-all ${tab === t.id ? 'bg-crt-black border-neon text-neon' : 'bg-abyss border-crt-black text-smoke hover:text-parchment hover:border-pitch'}`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 md:p-6">
                        {/* TAB CONTENTS */}
                        {tab === 'overview' && (
                            <div className="ef-dashboard-overview">
                                {/* Left Sub-column */}
                                <div className="ef-dashboard-overview__left">
                                    {seasonWeek <= 2 && engine.seasonNumber === 1 && (
                                        <EfPanel padding="md" className="ef-dashboard-playbook">
                                            <div className="ef-dashboard-playbook__title"><Lightbulb weight="fill" /> PLAYBOOK DO TREINADOR</div>
                                            <div className="ef-dashboard-playbook__content">
                                                <p>1️⃣ <strong>Táticas:</strong> escolha formação e tática antes de jogar</p>
                                                <p>2️⃣ <strong>Treino:</strong> treine o plantel toda semana para melhorar atributos</p>
                                                <p>3️⃣ <strong>Plantel:</strong> escale seus melhores 11 e monitore energia</p>
                                                <p>4️⃣ <strong>Clube:</strong> upgrade estádio e base para crescer</p>
                                                <p>5️⃣ <strong>Jogo:</strong> no intervalo, ajuste tática e faça substituições</p>
                                            </div>
                                        </EfPanel>
                                    )}
                                    <ScarcityBanner engine={engine} />
                                    <DreadIndicator engine={engine} />
                                    <AhaMomentCard engine={engine} />
                                    
                                    <EfPanel padding="md">
                                        <div className="ef-panel-section-label"><Wallet weight="fill" /> FINANÇAS</div>
                                        {engine.weeklyFinance ? (
                                            <table className="ef-dashboard-finance__table">
                                                <tbody>
                                                    {engine.weeklyFinance.details.map((d, i) => (
                                                        <tr key={i} className="ef-dashboard-finance__row">
                                                            <td className="ef-dashboard-finance__label">{d.label}</td>
                                                            <td className={`ef-dashboard-finance__value ${d.type === 'income' ? 'ef-dashboard-finance__value--income' : 'ef-dashboard-finance__value--expense'}`}>
                                                                {d.type === 'income' ? '+' : '-'}R$ {(d.amount / 1000).toFixed(0)}K
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ) : <p className="ef-dashboard-finance__empty">Jogue a próxima partida para ver o relatório.</p>}
                                    </EfPanel>

                                    {engine.activeLoan && (
                                        <EfPanel padding="md" className="ef-dashboard-loan">
                                            <div className="ef-panel-section-label ef-text-accent"><Bank weight="fill" /> EMPRÉSTIMO ATIVO</div>
                                            <table className="ef-dashboard-loan__table">
                                                <tbody>
                                                    <tr className="ef-dashboard-loan__row"><td className="ef-dashboard-loan__label">Principal</td><td className="ef-dashboard-loan__value">R$ {(engine.activeLoan.principal / 1_000_000).toFixed(1)}M</td></tr>
                                                    <tr className="ef-dashboard-loan__row"><td className="ef-dashboard-loan__label">Parcela</td><td className="ef-dashboard-loan__value ef-dashboard-loan__value--danger">R$ {(engine.activeLoan.weeklyPayment / 1000).toFixed(0)}K</td></tr>
                                                    <tr className="ef-dashboard-loan__row"><td className="ef-dashboard-loan__label">Restante</td><td className="ef-dashboard-loan__value">{engine.activeLoan.weeksRemaining} sem</td></tr>
                                                </tbody>
                                            </table>
                                            {team.balance >= engine.activeLoan.totalOwed && (
                                                <EfButton variant="primary" size="md" className="ef-dashboard-loan__payoff-btn" onClick={() => { engine.payOffLoan(); forceUpdate(); }}>
                                                    Quitar Antecipadamente
                                                </EfButton>
                                            )}
                                        </EfPanel>
                                    )}
                                </div>
                                {/* Right Sub-column */}
                                <div className="ef-dashboard-overview__right">
                                    {(engine.weekEvents?.length ?? 0) > 0 && (
                                        <EfPanel padding="md">
                                            <div className="ef-panel-section-label"><Newspaper weight="fill" /> EVENTOS DA SEMANA</div>
                                            <div className="ef-dashboard-events">
                                                {(engine.weekEvents || []).map((ev, i) => {
                                                    const evText = typeof ev === 'string' ? ev : (ev?.text || ev?.msg || '');
                                                    const isGood = evText.includes('📈') || evText.includes('🎉') || evText.includes('📚') || evText.includes('🇧🇷') || evText.includes('🎂');
                                                    const isBad = evText.includes('📉') || evText.includes('☠️') || evText.includes('👴') || evText.includes('🕺') || evText.includes('🥊');
                                                    return (
                                                        <div key={i} className={`ef-dashboard-event ${isGood ? 'ef-dashboard-event--good' : isBad ? 'ef-dashboard-event--bad' : 'ef-dashboard-event--neutral'}`}>
                                                            {evText}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </EfPanel>
                                    )}

                                    {typeof engine.boardTension === 'number' && (
                                        <EfPanel padding="md" className={`ef-dashboard-board-tension ${engine.boardTension < -20 ? 'ef-dashboard-board-tension--danger' : engine.boardTension > 40 ? 'ef-dashboard-board-tension--stable' : 'ef-dashboard-board-tension--warning'}`}>
                                            <div className={`ef-dashboard-board-tension__title ${engine.boardTension < -20 ? 'ef-dashboard-board-tension__title--danger' : engine.boardTension > 40 ? 'ef-dashboard-board-tension__title--stable' : 'ef-dashboard-board-tension__title--warning'}`}><WarningCircle weight="fill" /> TENSÃO DA DIRETORIA</div>
                                            <div className="ef-dashboard-board-tension__content">
                                                <span className="ef-dashboard-board-tension__status">
                                                    {engine.boardTension >= 40 ? 'Estável' : engine.boardTension >= 0 ? 'Atenção' : engine.boardTension >= -40 ? 'Pressão' : 'Crise'}
                                                </span>
                                                <strong className={`ef-dashboard-board-tension__value ${engine.boardTension >= 0 ? 'ef-dashboard-board-tension__value--positive' : 'ef-dashboard-board-tension__value--negative'}`}>
                                                    {engine.boardTension > 0 ? '+' : ''}{engine.boardTension}
                                                </strong>
                                            </div>
                                            <div className="ef-progress ef-progress--sm" style={{ marginTop: '16px' }}>
                                                <div className={`ef-progress__fill ${engine.boardTension >= 0 ? '' : 'ef-progress__fill--danger'}`} style={{ width: `${Math.max(0, Math.min(100, (engine.boardTension + 100) / 2))}%` }} />
                                            </div>
                                        </EfPanel>
                                    )}

                                    {stats.rollingForm && stats.rollingForm.length > 0 && (
                                        <EfPanel padding="md">
                                            <div className="ef-panel-section-label"><ChartLineUp weight="fill" /> FORMA RECENTE</div>
                                            <div className="ef-dashboard-form-chips">
                                                {stats.rollingForm.map((r, i) => (
                                                    <span key={i} className={`ef-form-chip ef-form-chip--${r.toLowerCase()}`}>{r}</span>
                                                ))}
                                            </div>
                                        </EfPanel>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === 'tactics' && (
                            <div className="ef-dashboard-tactics-grid">
                                <EfPanel padding="lg">
                                    <div className="ef-dashboard-tactics__section-title">FORMAÇÃO</div>
                                    <div className="ef-dashboard-tactics__buttons">
                                        {Object.keys(FORMATIONS).map(f => (
                                            <EfButton key={f} variant={team.formation === f ? 'primary' : 'secondary'} size="md" onClick={() => { engine.setFormation(f); forceUpdate(); }}>
                                              {f}
                                            </EfButton>
                                        ))}
                                    </div>
                                    <div className="ef-dashboard-tactics__section-title ef-dashboard-tactics__section-title--secondary">TÁTICA DE JOGO</div>
                                    <div className="ef-dashboard-tactics__buttons">
                                        {Object.entries(TACTICS).map(([k, v]) => (
                                            <EfButton key={k} variant={engine.currentTactic === k ? 'primary' : 'secondary'} size="md" onClick={() => { engine.setTactic(k); forceUpdate(); }}>
                                              {v.name}
                                            </EfButton>
                                        ))}
                                    </div>
                                    <p className="ef-dashboard-tactics__description">{TACTICS[engine.currentTactic]?.description}</p>
                                </EfPanel>

                                <EfPanel padding="lg">
                                    <div className="ef-panel-section-label ef-panel-section-label--strong" style={{ fontSize: '1rem', marginBottom: '24px' }}><Megaphone weight="fill" /> PRELEÇÃO</div>
                                    <div className="ef-dashboard-talks">
                                        {TEAM_TALKS.map(t => {
                                            const moral = t.effect?.moralBoost ?? 0;
                                            const energy = t.effect?.energyCost ?? 0;
                                            const moralTxt = moral > 0 ? `moral +${moral}` : moral < 0 ? `moral ${moral}` : 'moral neutra';
                                            const energyTxt = energy > 0 ? `, custa ${energy} energia` : energy < 0 ? `, recupera energia` : '';
                                            return (
                                            <EfButton key={t.id} variant="secondary" size="md" title={`${t.name}: ${moralTxt}${energyTxt}. "${t.text}"`} className="ef-dashboard-talk-btn" onClick={() => handleTeamTalk(t.id)}>
                                                {t.name}
                                            </EfButton>
                                            );
                                        })}
                                    </div>
                                </EfPanel>
                            </div>
                        )}

                        {tab === 'training' && (
                            <EfPanel padding="lg">
                                <div className="ef-dashboard-training__title">TREINO SEMANAL</div>
                                <div className="ef-dashboard-training__grid">
                                    {TRAINING_TYPES.map(t => (
                                        <EfButton key={t.id} variant={engine.currentTraining === t.id ? 'primary' : 'secondary'} size="lg" title={`Treino ${t.name}: ${t.description} (drena energia do plantel)`} className="ef-dashboard-training-btn" onClick={() => handleTrain(t.id)}>
                                            <span className="ef-dashboard-training-btn__name">{t.name}</span>
                                            <span className={`ef-dashboard-training-btn__desc ${engine.currentTraining === t.id ? 'ef-dashboard-training-btn__desc--active' : ''}`}>{t.description}</span>
                                        </EfButton>
                                    ))}
                                </div>
                            </EfPanel>
                        )}

                        {tab === 'club' && (
                            <div className="ef-dashboard-club-grid">
                                <div className="ef-dashboard-club__left">
                                    <EfPanel padding="md" className="ef-dashboard-club__panel">
                                        <div className="ef-panel-section-label ef-panel-section-label--strong"><Building weight="fill" /> {stadiumInfo.name}</div>
                                        <div className="ef-dashboard-club-facility__info">Cap: {stadiumInfo.capacity.toLocaleString()} • R$ {stadiumInfo.ticketPrice}/ingresso</div>
                                        <div className="ef-progress ef-progress--sm" style={{ marginBottom: '16px' }}>
                                            <div className="ef-progress__fill ef-progress__fill--info" style={{ width: `${(engine.stadiumLevel / 5) * 100}%` }} />
                                        </div>
                                        <div className="ef-dashboard-club-facility__actions">
                                            <span className="ef-dashboard-club-facility__level">NÍVEL {engine.stadiumLevel}/5</span>
                                            {engine.stadiumLevel < 5 && (
                                                <EfButton variant="primary" size="sm" title="Aumenta capacidade do estádio (mais bilheteria por jogo). Consome do caixa." onClick={() => { const r = engine.upgradeStadium(); setLog(r.msg); forceUpdate(); }}>UPGRADE</EfButton>
                                            )}
                                        </div>
                                    </EfPanel>

                                    <EfPanel padding="md" className="ef-dashboard-club__panel">
                                        <div className="ef-panel-section-label ef-panel-section-label--strong"><GraduationCap weight="fill" /> BASE Nv.{engine.academyLevel}</div>
                                        <div className="ef-dashboard-club-facility__info">Produz {engine.academyLevel + 1} jovens/temporada</div>
                                        <div className="ef-progress ef-progress--sm" style={{ marginBottom: '16px' }}>
                                            <div className="ef-progress__fill ef-progress__fill--accent" style={{ width: `${(engine.academyLevel / 5) * 100}%` }} />
                                        </div>
                                        <div className="ef-dashboard-club-facility__actions">
                                            <span className="ef-dashboard-club-facility__level">NÍVEL {engine.academyLevel}/5</span>
                                            {engine.academyLevel < 5 && (
                                                <EfButton variant="primary" size="sm" title="Melhora a base — produz mais e melhores jovens por temporada. Consome do caixa." onClick={() => { const r = engine.upgradeAcademy(); setLog(r.msg); forceUpdate(); }}>UPGRADE</EfButton>
                                            )}
                                        </div>
                                    </EfPanel>
                                </div>
                                <div className="ef-dashboard-club__right">
                                    <EfPanel padding="md" className="ef-dashboard-club__panel">
                                        <div className="ef-panel-section-label ef-panel-section-label--strong"><Users weight="fill" /> STAFF</div>
                                        <table className="ef-dashboard-club-staff__table">
                                            <tbody>
                                                {STAFF_ROLES.map(role => {
                                                    const member = engine.staff?.getStaff(role.id);
                                                    return (
                                                        <tr key={role.id} className="ef-dashboard-club-staff__row">
                                                            <td className="ef-dashboard-club-staff__label">{role.name}</td>
                                                            <td className="ef-dashboard-club-staff__value">
                                                                {member ? <strong className="ef-dashboard-club-staff__name">{member.name}</strong> : <EfButton variant="secondary" size="sm" title={`Contrata ${role.name} (paga salário semanal; ativa o bônus do cargo)`} onClick={() => { const r = engine.hireStaff(role.id); setLog(r.msg); forceUpdate(); }}>Contratar</EfButton>}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </EfPanel>

                                    <EfPanel padding="md" className="ef-dashboard-club__panel">
                                        <div className="ef-panel-section-label ef-panel-section-label--strong"><Binoculars weight="fill" /> SCOUTING</div>
                                        <div className="ef-dashboard-club-scouting__regions">
                                            {SCOUT_REGIONS.map(r => (
                                                <EfButton key={r.id} variant="secondary" size="sm" onClick={() => { const res = engine.scoutRegionAction(r.id); setLog(res.msg); forceUpdate(); }}>
                                                    {r.name}
                                                </EfButton>
                                            ))}
                                        </div>
                                        {engine.scoutedPlayers?.length > 0 && (
                                            <table className="ef-dashboard-club-scouting__table">
                                                <tbody>
                                                    {engine.scoutedPlayers.map((p, i) => (
                                                        <tr key={i} className="ef-dashboard-club-scouting__row">
                                                            <td className="ef-dashboard-club-scouting__player">{p.name} <span className="ef-dashboard-club-scouting__meta">({p.position}, OVR {p.ovr})</span></td>
                                                            <td className="ef-dashboard-club-scouting__actions"><EfButton variant="primary" size="sm" onClick={() => { const r = engine.signScoutedPlayer(i); setLog(r?.msg); forceUpdate(); }}>Assinar</EfButton></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </EfPanel>
                                </div>
                            </div>
                        )}

                        {tab === 'transfers' && (engine.transferOffers?.length ?? 0) > 0 && (
                            <EfPanel padding="lg">
                                <div className="ef-panel-section-label ef-panel-section-label--strong"><Envelope weight="fill" /> OFERTAS RECEBIDAS</div>
                                <table className="ef-dashboard-transfers__table">
                                    <tbody>
                                        {engine.transferOffers.map((offer, i) => (
                                            <tr key={i} className="ef-dashboard-transfers__row">
                                                <td className="ef-dashboard-transfers__offer">
                                                    <strong className="ef-dashboard-transfers__player-name">{offer.playerName}</strong> <span className="ef-dashboard-transfers__ovr">(OVR {offer.playerOvr})</span>
                                                    <div className="ef-dashboard-transfers__offer-detail">{offer.buyerClub} • <span className="ef-dashboard-transfers__amount">R$ {(offer.offerAmount / 1000000).toFixed(1)}M</span></div>
                                                </td>
                                                <td className="ef-dashboard-transfers__actions">
                                                    <div className="ef-dashboard-transfers__buttons">
                                                        <EfButton variant="primary" size="sm" title="Aceitar oferta (irreversível: jogador sai do plantel imediatamente)" onClick={() => handleAcceptOffer(offer.playerId)}>ACEITAR</EfButton>
                                                        <EfButton variant="danger" size="sm" title="Recusar oferta (cuidado: jogador pode ficar insatisfeito e pedir saída)" onClick={() => handleRejectOffer(offer.playerId)}>RECUSAR</EfButton>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </EfPanel>
                        )}
                    </div>
                </div>

                {/* === STITCH GIANT FOOTER CTA — AVANÇAR SEMANA === */}
                <div className="mt-gutter pb-24 md:pb-8">
                    <button
                        type="button"
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
                        className="w-full py-6 bg-neon text-crt-black font-headline-lg text-headline-lg border-b-8 border-r-8 border-green-900 active:translate-y-1 active:translate-x-1 active:border-b-4 active:border-r-4 transition-all hover:brightness-110"
                    >
                        AVANÇAR SEMANA
                    </button>
                </div>
            </main>

            {/* === STITCH MOBILE BOTTOM NAV (fixed) === */}
            <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center h-16 md:hidden bg-crt-black border-t-4 border-pitch z-50">
                <button onClick={() => changeView('squad')} className="flex flex-col items-center justify-center text-smoke p-2 flex-1 h-full hover:bg-forest-dark hover:text-neon transition-colors">
                    <Users weight="fill" size={20} />
                    <span className="font-label-md text-label-md mt-1">PLANTEL</span>
                </button>
                <button onClick={() => changeView('market')} className="flex flex-col items-center justify-center text-smoke p-2 flex-1 h-full hover:bg-forest-dark hover:text-neon transition-colors">
                    <ShoppingCart weight="fill" size={20} />
                    <span className="font-label-md text-label-md mt-1">MERCADO</span>
                </button>
                <button onClick={() => changeView('standings')} className="flex flex-col items-center justify-center text-smoke p-2 flex-1 h-full hover:bg-forest-dark hover:text-neon transition-colors">
                    <ChartBar weight="fill" size={20} />
                    <span className="font-label-md text-label-md mt-1">TABELA</span>
                </button>
            </nav>

                {/* Feedback log */}
                {log && <div className="event-toast success" onClick={() => setLog('')}>{log}</div>}

                {/* Modals */}
                {engine.pressQuestion && (
                    <EfModal title={<><MicrophoneStage size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Coletiva de Imprensa</>} onClose={() => {}}>
                        <p style={{ marginBottom: '24px', fontSize: '1rem', lineHeight: 1.5, fontFamily: 'var(--font-sans)' }}>{engine.pressQuestion.text}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {engine.pressQuestion.options.map(opt => (
                                <EfButton key={opt.id} variant="secondary" size="md" onClick={() => { const result = engine.answerPress(opt.id); if (result) setLog(`Coletiva: ${result.answer}`); forceUpdate(); }} style={{ textAlign: 'left', width: '100%', justifyContent: 'flex-start', padding: '16px', fontFamily: 'var(--font-sans)' }}>
                                    {opt.text}
                                </EfButton>
                            ))}
                        </div>
                    </EfModal>
                )}

                {pendingUnlock && <UnlockTooltip viewId={pendingUnlock} onDismiss={() => setPendingUnlock(null)} />}
                {pendingAchievement && <AchievementPopup achievement={pendingAchievement} onDismiss={() => setPendingAchievement(null)} />}
                <TutorialOverlay visible={showTutorial} onDismiss={() => setShowTutorial(false)} />

                {/* SPEC-167: Auxiliar advice modal */}
                {advicePanel.open && (
                    <EfModal title="Conselho do Auxiliar" onClose={() => setAdvicePanel({ open: false, loading: false, text: '' })}>
                        <div className="ef-dashboard-advice-panel">
                            {advicePanel.loading
                                ? <p className="ef-dashboard-advice-panel__loading">Analisando...</p>
                                : <p className="ef-dashboard-advice-panel__text">{advicePanel.text}</p>
                            }
                        </div>
                        <EfButton variant="primary" size="md" onClick={() => setAdvicePanel({ open: false, loading: false, text: '' })}>
                            FECHAR
                        </EfButton>
                    </EfModal>
                )}

                {/* SPEC-167: Última narrativa pós-jogo */}
                {engine.lastMatchNarrative && (
                    <div className="ef-dashboard-narrative-wrapper">
                        <EfPanel padding="md" className="ef-dashboard-narrative">
                            <div className="ef-dashboard-narrative__title">
                                <Newspaper weight="fill" /> CRÔNICA DA PARTIDA
                            </div>
                            <p className="ef-dashboard-narrative__text">{engine.lastMatchNarrative}</p>
                        </EfPanel>
                    </div>
                )}

                {/* AUDIT-FIX #17: Pacing Friction Modal */}
                {pacingQueue.length > 0 && (() => {
                    const evt = pacingQueue[0];
                    const severityClass = { critical: 'ef-dashboard-pacing__alert--critical', warning: 'ef-dashboard-pacing__alert--warning', info: 'ef-dashboard-pacing__alert--info' }[evt.severity] || 'ef-dashboard-pacing__alert--info';
                    return (
                        <EfModal title={evt.title} onClose={() => {}}>
                            <div className={`ef-dashboard-pacing__alert ${severityClass}`}>
                                <p className="ef-dashboard-pacing__body">{evt.body}</p>
                            </div>
                            <div className="ef-dashboard-pacing__buttons">
                                {evt.action && (
                                    <EfButton variant="primary" size="md" onClick={() => {
                                        setPacingQueue([]);
                                        if (evt.action === 'tactics') setTab('tactics');
                                        else changeView(evt.action);
                                    }}>
                                        RESOLVER AGORA
                                    </EfButton>
                                )}
                                <EfButton variant="secondary" size="md" onClick={() => {
                                    const rest = pacingQueue.slice(1);
                                    if (rest.length > 0) {
                                        setPacingQueue(rest);
                                    } else {
                                        setPacingQueue([]);
                                        engine.checkPressConference();
                                        if (!engine.pressQuestion) changeView('match'); else forceUpdate();
                                    }
                                }}>
                                    {pacingQueue.length > 1 ? 'PRÓXIMO ALERTA' : 'ENTENDIDO — JOGAR'}
                                </EfButton>
                            </div>
                        </EfModal>
                    );
                })()}
        </div>
    );
}
