/* eslint-disable react-hooks/preserve-manual-memoization */
import { useState, useMemo } from 'react';
import { getStadiumInfo } from '../../../engine/StadiumSystem';
import { getClubColors } from '../../../data/clubColors';

import { useEngineEvents } from './useEngineEvents';
import { useLLMAdvice } from './useLLMAdvice';
import { useDashboardActions } from './useDashboardActions';

export function useDashboardState(engine, team, gameState, changeView, forceUpdate) {
    const [log, setLog] = useState('');
    const [tab, setTab] = useState('overview');
    const [pendingUnlock, setPendingUnlock] = useState(null);
    const [pendingAchievement, setPendingAchievement] = useState(null);
    const [pacingQueue, setPacingQueue] = useState([]);
    const [showTutorial, setShowTutorial] = useState(() => {
        try { return !localStorage.getItem('olefut_tutorial_done') && (engine?.seasonNumber || 1) === 1; }
        catch { return false; }
    });

    // 1. Process Structured Engine Events
    useEngineEvents(engine, team, setPendingUnlock, setPendingAchievement);

    // 2. Specialized LLM Advice Hook
    const { advicePanel, setAdvicePanel, handleAuxiliarAdvice } = useLLMAdvice(engine, team);

    // 3. Specialized Actions Hook
    const actions = useDashboardActions(engine, forceUpdate, setLog, setPacingQueue, changeView);

    // 4. Memoized Derivations (Fixing React Warnings for re-computations)
    const sectors = useMemo(() => engine?.getTeamSectors ? engine.getTeamSectors(team?.id) : null, [engine, team?.id]);
    const injured = useMemo(() => team?.squad ? team.squad.filter((p) => p.injury) : [], [team?.squad]);
    const expiringContracts = useMemo(() => team?.squad ? team.squad.filter((p) => p.contract && p.contract.weeksLeft <= 8) : [], [team?.squad]);
    
    const avgEnergy = useMemo(() => {
        return team?.squad?.length ? team.squad.reduce((s, p) => s + (p.energy || 50), 0) / (team.squad.length || 1) : 50;
    }, [team?.squad]);

    const stadiumInfo = useMemo(() => getStadiumInfo(engine?.stadiumLevel), [engine?.stadiumLevel]);
    const seasonWeek = engine?.currentWeek ? ((engine.currentWeek - 1) % 38) + 1 : 1;

    const nextOpponentName = (engine?.nextMatch?.opponentName) || (engine?.getNextOpponent?.()?.name) || 'PRÓXIMO ADVERSÁRIO';
    const stadiumLabel = (stadiumInfo?.name || 'ESTÁDIO').toUpperCase();
    const teamColors = useMemo(() => getClubColors(team?.name || ''), [team?.name]);

    return {
        log, setLog,
        tab, setTab,
        pendingUnlock, setPendingUnlock,
        pendingAchievement, setPendingAchievement,
        pacingQueue, setPacingQueue,
        showTutorial, setShowTutorial,
        advicePanel, setAdvicePanel,
        ...actions, // handleTrain, handleTeamTalk, handleAcceptOffer, handleRejectOffer, onPlayMatch, dismissTrophyCeremony
        handleAuxiliarAdvice,
        sectors, injured, expiringContracts, avgEnergy, stadiumInfo, seasonWeek,
        nextOpponentName, stadiumLabel, teamColors
    };
}

