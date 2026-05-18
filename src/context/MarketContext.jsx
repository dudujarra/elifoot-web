import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useGame } from './GameContext';

const MarketContext = createContext();

export const useMarket = () => useContext(MarketContext);

export const MarketProvider = ({ children }) => {
    const { getEngine, gameState, forceUpdate } = useGame();
    const [log, setLog] = useState('');

    const engine = getEngine();
    const team = engine?.getTeam(gameState.teamId);

    const handleBuy = useCallback((player) => {
        if (!team || team.balance < player.value) return;
        if (engine.requiresAuction && engine.requiresAuction(player)) {
            const result = engine.startAuction(player, player.value);
            setLog(result.msg?.toUpperCase() || 'LEILÃO INICIADO!');
            forceUpdate();
            return { success: true, auction: true };
        }
        const idx = engine.marketPlayers.findIndex(p => p.id === player.id);
        if (idx === -1) return;
        team.balance -= player.value;
        player.contract = { weeksLeft: 76, salary: Math.floor(player.value * 0.001) };
        player.moral = 60;
        player.energy = 100;
        team.squad.push({ ...player, isTitular: false });
        engine.marketPlayers.splice(idx, 1);
        setLog(`CONTRATADO: ${player.name} (R$ ${(player.value / 1000000).toFixed(1)}M)`);
        forceUpdate();
        return { success: true };
    }, [engine, team, forceUpdate]);

    const handleSell = useCallback((playerId, amount) => {
        const result = engine.sellPlayer(playerId, amount);
        setLog(result.msg.toUpperCase());
        forceUpdate();
        return result;
    }, [engine, forceUpdate]);

    const handleScout = useCallback((regionId) => {
        const result = engine.scoutRegionAction(regionId);
        setLog(result.msg.toUpperCase() || `SCOUT: ENCONTRADOS ${result.players?.length || 0} JOGADORES!`);
        forceUpdate();
        return result;
    }, [engine, forceUpdate]);

    const value = useMemo(() => ({
        marketPlayers: engine?.marketPlayers || [],
        activeAuctions: engine?.activeAuctions || [],
        team,
        log,
        setLog,
        handleBuy,
        handleSell,
        handleScout
    }), [engine, team, log, handleBuy, handleSell, handleScout]);

    return (
        <MarketContext.Provider value={value}>
            {children}
        </MarketContext.Provider>
    );
};
