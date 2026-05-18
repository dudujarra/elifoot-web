import React, { createContext, useContext, useState, useRef, useEffect, useMemo } from 'react';
import { useGame } from './GameContext';
import { OffPitchEventsDeck } from '../engine/OffPitchEventsDeck';
import { rng as systemRng } from '../engine/rng.js';

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export function PlayerProvider({ children }) {
    const { getEngine, changeView, forceUpdate } = useGame();
    const engine = getEngine();
    const player = engine?.proPlayer;
    const team = engine?.getTeam(engine?.manager?.teamId);

    const [log, setLog] = useState('');
    const [offPitchEvent, setOffPitchEvent] = useState(null);
    const [offPitchResult, setOffPitchResult] = useState(null);
    const [mentalBreakModal, setMentalBreakModal] = useState(false);
    const [banner, setBanner] = useState(null);
    const [showSubAttrs, setShowSubAttrs] = useState(false);
    const [tab, setTab] = useState('overview');

    const prevTeamIdRef = useRef(player?.teamId ?? null);
    const prevRetiredRef = useRef(player?._retired ?? false);
    const prevMotmRef = useRef(player?.career?.seasonMotm ?? 0);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!player) return;
        const eligible = OffPitchEventsDeck.filter(e => {
            if (!e.trigger) return true;
            try { return !!e.trigger(player); }
            catch { return false; }
        });
        if (eligible.length > 0 && systemRng() < 0.4) {
            setOffPitchEvent(eligible[Math.floor(systemRng() * eligible.length)]);
        }
    }, [engine?.currentWeek, player]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (!player) return;
        if (player.teamId !== prevTeamIdRef.current && prevTeamIdRef.current !== null) {
            setBanner('hired');
        }
        prevTeamIdRef.current = player.teamId;

        if (player._retired && !prevRetiredRef.current) {
            setBanner('retirement');
        }
        prevRetiredRef.current = player._retired;

        const motm = player.career?.seasonMotm ?? 0;
        if (motm > prevMotmRef.current) {
            setBanner('motm');
        }
        prevMotmRef.current = motm;
    }, [player, player?.teamId, player?._retired, player?.career?.seasonMotm]);

    const handleTrain = (skill) => { const result = player.train(skill); setLog(result.msg); forceUpdate(); };
    const handleRest = () => { const result = player.rest(); setLog(result.msg); forceUpdate(); };
    const handleBuyDrink = () => { const result = player.buyEnergyDrink(); setLog(result.msg); forceUpdate(); };
    const handleUseDrink = () => { const result = player.consumeEnergyDrink(); setLog(result.msg); forceUpdate(); };
    const handleTrainSubAttr = (subAttr) => { if (!player.trainSubAttr) return; const result = player.trainSubAttr(subAttr); setLog(result.msg); forceUpdate(); };
    const handleBuyTrait = (traitId) => { const result = player.buyTrait(traitId); setLog(result.msg); forceUpdate(); };
    const handleBuyLifestyle = (itemId) => { const result = player.buyLifestyle(itemId); setLog(result.msg); forceUpdate(); };
    const handleAdvance = () => changeView('player_match');

    const handleOffPitchChoice = (option) => {
        const eff = option.effect;
        /* eslint-disable react-hooks/immutability */
        if (eff.boss) player.relationships.boss = Math.max(0, Math.min(100, player.relationships.boss + eff.boss));
        if (eff.fans) player.relationships.fans = Math.max(0, Math.min(100, player.relationships.fans + eff.fans));
        if (eff.teammates) player.relationships.teammates = Math.max(0, Math.min(100, player.relationships.teammates + eff.teammates));
        if (eff.sponsors) player.relationships.sponsors = Math.max(0, Math.min(100, player.relationships.sponsors + eff.sponsors));
        if (eff.money) player.money += eff.money;
        if (eff.energy) player.energy = Math.max(0, Math.min(100, player.energy + eff.energy));
        if (eff.actionSlots) player.actionSlots = Math.max(0, player.actionSlots + eff.actionSlots);
        if (eff.wage_multiplier) player.wage = Math.floor(player.wage * eff.wage_multiplier);
        if (eff.stress) player.addStress(eff.stress, 'evento');

        if (option.flags?.set) player.setFlag(option.flags.set);
        if (option.flags?.clear) player.clearFlag(option.flags.clear);
        /* eslint-enable react-hooks/immutability */

        if (player.mentalBreakActive) setMentalBreakModal(true);
        setOffPitchResult(option.resultText);
        setOffPitchEvent(null);
        forceUpdate();
    };

    const handleMentalBreak = (choice) => {
        player.resolveMentalBreak(choice);
        setMentalBreakModal(false);
        setLog(`Mental break resolvido: ${choice}`);
        forceUpdate();
    };

    const value = useMemo(() => ({
        engine, player, team, changeView,
        log, setLog,
        offPitchEvent, setOffPitchEvent,
        offPitchResult, setOffPitchResult,
        mentalBreakModal, setMentalBreakModal,
        banner, setBanner,
        showSubAttrs, setShowSubAttrs,
        tab, setTab,
        handleTrain, handleRest, handleBuyDrink, handleUseDrink, handleTrainSubAttr,
        handleBuyTrait, handleBuyLifestyle, handleAdvance, handleOffPitchChoice, handleMentalBreak
    }), [
        engine, player, team, changeView,
        log, offPitchEvent, offPitchResult, mentalBreakModal, banner, showSubAttrs, tab
    ]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
}
