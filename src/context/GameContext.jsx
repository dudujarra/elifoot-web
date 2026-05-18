/* eslint-disable react-refresh/only-export-components */
/**
 * GameContext — AKITA-416 refactored
 *
 * Decomposed from 374-line God Component into lean orchestration shell.
 * Save/load/serialize logic extracted to gameSaveManager.js.
 * Engine creation remains synchronous (required by init flow).
 *
 * Consumers: 24 components via useGame().
 */
import React, { createContext, useContext, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createEngine } from '../engine/engineFactory.js';
import { MonitorService } from '../services/MonitorService';
import { getUnifiedView } from '../engine/UnifiedModeBridge';
import {
    saveToStorage, loadFromStorage, clearStorage, restoreEngine
} from './gameSaveManager.js';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

// ─── View ↔ URL routing ──────────────────────────────────────
const VIEW_TO_PATH = {
    start: '/',
    dashboard: '/dashboard',
    player_dashboard: '/player-dashboard',
    player_match: '/player-match',
    match: '/match',
    squad: '/squad',
    market: '/market',
    standings: '/standings',
    monitor: '/monitor',
    styleguide: '/styleguide',
    achievements: '/achievements',
    tutorial: '/tutorial',
    press: '/press',
    shop: '/shop',
    autoplay: '/autoplay',
    saves: '/saves',
    rivalries: '/rivalries',
    chronicle: '/chronicle',
    lineage: '/lineage',
    autoplaylab: '/autoplay-lab',
};
const PATH_TO_VIEW = Object.fromEntries(Object.entries(VIEW_TO_PATH).map(([k, v]) => [v, k]));

// ─── Provider ─────────────────────────────────────────────────
export const GameProvider = ({ children }) => {
    const engineRef = useRef(createEngine());
    const [, setTick] = useState(0);
    // SPEC-169 (Bloco 3.3): forceUpdate memoizado pra estabilidade
    // referencial — antes recriava-se a cada render do provider, forçando
    // todos os consumers de useGame() a re-renderizar.
    const forceUpdate = useCallback(() => setTick(t => t + 1), []);

    // v1.7: Auto-instrument engine for monitor (sem user action)
    React.useEffect(() => {
        try {
            MonitorService.getInstance().instrumentEngine(engineRef.current);
        } catch { /* ignore */ }
    }, []);

    // BUG-020: try restore on mount
    const restored = loadFromStorage();
    const [gameState, setGameState] = useState(
        restored?.gameState || {
            started: false,
            view: 'start',
            manager: '',
            teamId: null,
            mode: 'manager'
        }
    );

    // BUG-081 (SPEC-158): aceitável — one-time mount restore da engine via localStorage.
    // restoreEngine muta engineRef e força re-render. Não cabe initializer (depende de Mount).
    /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
    useEffect(() => {
        if (restored?.engine) {
            restoreEngine(engineRef.current, restored.engine);
            forceUpdate();
        }
    }, []);
    /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

    // Auto-save em mudança gameState
    useEffect(() => {
        if (gameState.started) {
            saveToStorage(engineRef.current, gameState);
        }
    }, [gameState]);

    const navigate = useNavigate();
    const location = useLocation();

    // Sync URL → gameState.view on popstate (browser back/forward)
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const viewFromUrl = PATH_TO_VIEW[location.pathname];
        if (viewFromUrl && viewFromUrl !== gameState.view) {
            setGameState(prev => ({ ...prev, view: viewFromUrl }));
        }
    }, [location.pathname, gameState.view]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // SPEC-169: handlers memoizados pra evitar invalidação do context value
    const startGame = useCallback((name, teamId, scenario = 'livre', mode = 'manager', position = 'ATA', personality = 'maverick') => {
        clearStorage(); // limpa save antigo ao começar nova carreira
        engineRef.current.initGame(name, teamId, mode, scenario, position);
        if (mode === 'player' && engineRef.current.proPlayer) {
            engineRef.current.proPlayer.personality = personality;
        }
        try {
            MonitorService.getInstance().recordGameplay('GAME_START', {
                name, teamId, scenario, mode, position, personality
            });
            // Re-instrument após initGame (alguns métodos podem ter sido reset)
            MonitorService.getInstance().instrumentEngine(engineRef.current);
        } catch { /* ignore */ }
        const initialView = mode === 'player' ? 'player_dashboard' : 'dashboard';
        setGameState({
            started: true,
            view: initialView,
            manager: name,
            teamId,
            mode
        });
        navigate(VIEW_TO_PATH[initialView] || '/dashboard');
    }, [navigate]);

    const changeView = useCallback((view) => {
        setGameState(prev => {
            try {
                MonitorService.getInstance().recordGameplay('NAV', {
                    from: prev.view,
                    to: view
                });
            } catch { /* ignore */ }
            return { ...prev, view };
        });
        navigate(VIEW_TO_PATH[view] || '/');
    }, [navigate]);

    // BUG-022 fix: mode-aware dashboard route (avoid player→manager unintended switch)
    const getDashboardView = useCallback(
        () => gameState.mode === 'player' ? 'player_dashboard' : 'dashboard',
        [gameState.mode]
    );

    const saveGame = useCallback(() => saveToStorage(engineRef.current, gameState), [gameState]);
    const resetGame = useCallback(() => {
        clearStorage();
        engineRef.current = createEngine();
        setGameState({ started: false, view: 'start', manager: '', teamId: null, mode: 'manager' });
        navigate('/');
    }, [navigate]);

    const getEngine = useCallback(() => engineRef.current, []);

    // SPEC-169: value memoizado. Só muda quando gameState muda
    const value = useMemo(() => ({
        gameState, startGame, changeView, getEngine, forceUpdate, saveGame, resetGame, getDashboardView, getUnifiedView: () => getUnifiedView(engineRef.current)
    }), [gameState, startGame, changeView, getEngine, forceUpdate, saveGame, resetGame, getDashboardView]);

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};
