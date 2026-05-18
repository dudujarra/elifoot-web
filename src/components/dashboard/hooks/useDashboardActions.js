import { useCallback } from 'react';

export function useDashboardActions(engine, forceUpdate, setLog, setPacingQueue, changeView) {
    const handleTrain = useCallback((id) => { 
        const result = engine.doTraining(id); 
        setLog(result.msg); 
        forceUpdate(); 
    }, [engine, forceUpdate, setLog]);

    const handleTeamTalk = useCallback((id) => { 
        const result = engine.doTeamTalk(id); 
        if (result.success) setLog(`"${result.talk.text}"`); 
        forceUpdate(); 
    }, [engine, forceUpdate, setLog]);

    const handleAcceptOffer = useCallback((playerId) => { 
        const result = engine.acceptTransferOffer(playerId); 
        setLog(result.msg); 
        forceUpdate(); 
    }, [engine, forceUpdate, setLog]);

    const handleRejectOffer = useCallback((playerId) => { 
        engine.rejectTransferOffer(playerId); 
        setLog('Oferta recusada.'); 
        forceUpdate(); 
    }, [engine, forceUpdate, setLog]);

    const onPlayMatch = useCallback(() => {
        const events = engine.getPacingEvents?.() || [];
        if (events.length > 0) {
            setPacingQueue(events);
        } else {
            engine.checkPressConference();
            if (!engine.pressQuestion) changeView('match'); else forceUpdate();
        }
    }, [engine, changeView, setPacingQueue, forceUpdate]);

    const dismissTrophyCeremony = useCallback(() => { 
        // eslint-disable-next-line react-hooks/immutability
        engine.trophyCeremony = null; 
        forceUpdate(); 
    }, [engine, forceUpdate]);

    return {
        handleTrain,
        handleTeamTalk,
        handleAcceptOffer,
        handleRejectOffer,
        onPlayMatch,
        dismissTrophyCeremony
    };
}
