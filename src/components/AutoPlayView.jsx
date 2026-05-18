/**
 * AutoPlayView — Soak Test UI (Refactored)
 *
 * Módulo wrapper (God Component desmembrado).
 * Reduzido de 950+ linhas para < 200, delegando view/logic para
 * sub-componentes especializados na pasta AutoPlay/.
 */

import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { getAutoPlay } from '../services/AutoPlayService';
import LearningPanel from './learning/LearningPanel';
import CareerInfoPanel from './learning/CareerInfoPanel';
import BrainDashboard from './learning/BrainDashboard';
import { SAVE_KEY } from '../engine/constants.js';
import { EfModal } from './ui/EfModal';
import { Robot } from '@phosphor-icons/react';
import '../styles/autoplay-view.css';

// Sub-components
import AutoPlaySetup from './AutoPlay/AutoPlaySetup';
import { AutoPlayDashboard } from './AutoPlay/AutoPlayDashboard';
import { AutoPlayControls } from './AutoPlay/AutoPlayControls';
import AutoPlayStats from './AutoPlay/AutoPlayStats';
import AutoPlayTelemetry from './AutoPlay/AutoPlayTelemetry';

export function AutoPlayView() {
    const { getEngine, forceUpdate } = useGame();
    const engine = getEngine();
    const controllerRef = useRef(null);
    const [stats, setStats] = useState(null);
    const [speed, setSpeed] = useState(50);
    const [pacingQueue, setPacingQueue] = useState([]);
    
    // SPEC-119: LLM mode state
    const [llmStatus, setLlmStatus] = useState({ mode: 'heuristic', loadStatus: 'idle' });

    useEffect(() => {
        if (!engine) return;
        controllerRef.current = getAutoPlay(engine);
        const interval = setInterval(() => {
            if (controllerRef.current) {
                setStats(controllerRef.current.getStats());
            }
        }, 250);
        return () => clearInterval(interval);
    }, [engine]);

    useEffect(() => {
        const id = setInterval(() => {
            if (controllerRef.current?.llmBridge) {
                setLlmStatus(controllerRef.current.llmBridge.status());
            }
        }, 1000);
        return () => clearInterval(id);
    }, []);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!engine) return;
        const events = engine.getPacingEvents?.() || [];
        if (events.length > 0) {
            setPacingQueue(events);
            const timer = setTimeout(() => {
                setPacingQueue([]);
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setPacingQueue([]);
        }
    }, [stats?.weeksPlayed, engine]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (!engine || !engine.manager?.teamId) {
        return <AutoPlaySetup />;
    }

    const handleStart = () => {
        if (controllerRef.current) {
            controllerRef.current.start(speed);
        }
    };

    const handlePause = () => {
        if (controllerRef.current) {
            controllerRef.current.pause();
            forceUpdate();
        }
    };

    const handleStop = () => {
        if (controllerRef.current) {
            controllerRef.current.stop();
            forceUpdate();
        }
    };

    const handleSpeedChange = (newDelay) => {
        setSpeed(newDelay);
        if (controllerRef.current) {
            controllerRef.current.weekDelay = newDelay;
        }
    };

    const handleExport = () => controllerRef.current?.exportReport();
    const handleExportTelemetry = () => controllerRef.current?.exportTelemetryReport();

    const handleResetBrain = () => {
        if (!controllerRef.current) return;
        if (!window.confirm('Reset aprendizado? Bot esquece Q-table + memória + logs. Stats counters mantém.')) return;
        try { controllerRef.current.pause(); } catch { /* ignore */ }
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('olefut_autoplay_brain');
                const raw = localStorage.getItem('olefut_autoplay_state');
                if (raw) {
                    const savedStats = JSON.parse(raw);
                    if (savedStats && typeof savedStats === 'object') {
                        savedStats.anomalies = [];
                        savedStats.successes = [];
                        savedStats.decisions = [];
                        savedStats.seasonHistory = [];
                        localStorage.setItem('olefut_autoplay_state', JSON.stringify(savedStats));
                    }
                }
            }
        } catch { /* ignore */ }
        try { controllerRef.current.resetBrain(); } catch { /* ignore */ }
        setTimeout(() => window.location.reload(), 100);
    };

    const handleNewGamePlus = () => {
        if (!controllerRef.current) return;
        if (!window.confirm('NEW GAME+\n\nSalva o ML treinado (Q-table + memória) e ZERA o gameplay.\nContinuar?')) return;
        try {
            const snapshot = controllerRef.current.newGamePlus();
            window.alert(`NEW GAME+ ativado!\nBrain salvo (${snapshot.states} states).\nGameplay zerado. Recarregando...`);
        } catch (e) {
            window.alert(`Erro no New Game+: ${e.message}`);
            return;
        }
        setTimeout(() => window.location.reload(), 100);
    };

    const handleResetAll = () => {
        if (!controllerRef.current) return;
        if (!window.confirm('[!] RESET TUDO: apaga TUDO (Q-table + stats + save jogo + LLM). Sem volta.')) return;
        try { controllerRef.current.pause(); } catch { /* ignore */ }
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.removeItem('olefut_autoplay_brain');
                localStorage.removeItem('olefut_autoplay_state');
                localStorage.removeItem('olefut_llm_mode');
                localStorage.removeItem(SAVE_KEY);
                localStorage.removeItem('olefut_genetic_state');
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('olefut_')) localStorage.removeItem(k);
                }
            }
        } catch { /* ignore */ }
        setTimeout(() => window.location.reload(), 100);
    };

    const handleLoadLLM = async () => {
        if (!controllerRef.current?.llmBridge) return;
        if (!window.confirm('Carregar Llama 3.2 1B (~700MB primeiro uso)? Requer WebGPU.')) return;
        controllerRef.current.llmBridge.setMode('webllm');
        await controllerRef.current.llmBridge.init();
        setLlmStatus(controllerRef.current.llmBridge.status());
    };

    const handleResetLLM = () => {
        if (!controllerRef.current?.llmBridge) return;
        controllerRef.current.llmBridge.setMode('heuristic');
        setLlmStatus({ mode: 'heuristic', loadStatus: 'idle' });
    };

    return (
        <div className="ef-anim-fade-in ef-scene-shell ef-ap">
            <div className="ef-ap__scanlines" aria-hidden="true" />
            
            <div className="ef-ap__container-md">
                <AutoPlayDashboard stats={stats} speed={speed} handleSpeedChange={handleSpeedChange} />
                
                <AutoPlayControls 
                    stats={stats} 
                    llmStatus={llmStatus} 
                    handleStart={handleStart} 
                    handlePause={handlePause} 
                    handleStop={handleStop} 
                    handleExport={handleExport} 
                    handleExportTelemetry={handleExportTelemetry} 
                    handleResetBrain={handleResetBrain} 
                    handleNewGamePlus={handleNewGamePlus} 
                    handleResetAll={handleResetAll} 
                    handleLoadLLM={handleLoadLLM} 
                    handleResetLLM={handleResetLLM} 
                />

                <AutoPlayStats stats={stats} />
                <AutoPlayTelemetry stats={stats} />

                {/* SPEC-124: Career info panel */}
                <CareerInfoPanel controllerRef={controllerRef} />

                {/* SPEC-123: Real-time learning panel */}
                <LearningPanel controllerRef={controllerRef} />

                {/* ML Brain Dashboard */}
                <BrainDashboard controllerRef={controllerRef} />

                <div className="ef-ap__heading-grey">
                    VELOCIDADE ATIVA: {speed}ms/week — controles no painel SIMULATION VELOCITY acima
                </div>
            </div>

            {/* Pacing Friction Modal Auto-Resolution UI */}
            {pacingQueue.length > 0 && (() => {
                const evt = pacingQueue[0];
                const pacingMod = evt.severity || 'info';
                return (
                    <EfModal title={evt.title} onClose={() => {}}>
                        <div className={`ef-ap__pacing-body ef-ap__pacing-border ef-ap__pacing-body--${pacingMod}`}>
                            <p className="ef-sans ef-text-main ef-ap__pacing-text">{evt.body}</p>
                        </div>
                        <div className="ef-ap__pacing-actions">
                            <div className="ef-ap__pacing-resolving">
                                <Robot size={14} weight="fill" className="ef-icon-inline-md" />
                                Auto-resolvendo (Soak Test)...
                            </div>
                        </div>
                    </EfModal>
                );
            })()}
        </div>
    );
}

export default AutoPlayView;
