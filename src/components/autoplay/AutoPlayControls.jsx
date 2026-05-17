/**
 * AutoPlayControls — Control bar extracted from AutoPlayView
 * Play/Pause/Stop, Export, Reset Brain, New Game+, LLM mode
 */

import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import {
    Play, Pause, Stop, Brain, DownloadSimple, XCircle,
    ChartBar, ArrowsClockwise
} from '@phosphor-icons/react';
import { SAVE_KEY } from '../../engine/constants.js';

export default function AutoPlayControls({
    controllerRef, stats, forceUpdate, llmStatus, setLlmStatus
}) {
    const handleStart = () => controllerRef.current?.start();
    const handlePause = () => { controllerRef.current?.pause(); forceUpdate(); };
    const handleStop = () => { controllerRef.current?.stop(); forceUpdate(); };
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
                    const s = JSON.parse(raw);
                    if (s && typeof s === 'object') {
                        s.anomalies = []; s.successes = []; s.decisions = []; s.seasonHistory = [];
                        localStorage.setItem('olefut_autoplay_state', JSON.stringify(s));
                    }
                }
            }
        } catch { /* ignore */ }
        try { controllerRef.current.resetBrain(); } catch { /* ignore */ }
        setTimeout(() => window.location.reload(), 100);
    };

    const handleNewGamePlus = () => {
        if (!controllerRef.current) return;
        if (!window.confirm('NEW GAME+\n\nSalva o ML treinado e ZERA gameplay. Continuar?')) return;
        try {
            const snapshot = controllerRef.current.newGamePlus();
            window.alert(`NEW GAME+ ativado!\nQ-States: ${snapshot.states}\nRecarregando...`);
        } catch (e) { window.alert(`Erro: ${e.message}`); return; }
        setTimeout(() => window.location.reload(), 100);
    };

    const handleResetAll = () => {
        if (!controllerRef.current) return;
        if (!window.confirm('[!] RESET TUDO: apaga TUDO. Sem volta.')) return;
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
        if (!window.confirm('Carregar Llama 3.2 1B (~700MB)? Requer WebGPU.')) return;
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
        <EfPanel variant="elev" padding="md" className="ef-ap__panel-mb-sm">
            <div className="ef-ap__chip-wrap-mb">
                {!stats?.running ? (
                    <EfButton variant="primary" onClick={handleStart}>
                        <Play size={14} weight="fill" className="ef-icon-inline" />Iniciar
                    </EfButton>
                ) : (
                    <EfButton variant="secondary" onClick={handlePause}>
                        <Pause size={14} weight="fill" className="ef-icon-inline" />Pausar
                    </EfButton>
                )}
                <EfButton variant="secondary" onClick={handleStop}>
                    <Stop size={14} weight="fill" className="ef-icon-inline" />Parar
                </EfButton>
                <EfButton variant="secondary" onClick={handleExport}>
                    <DownloadSimple size={14} weight="bold" className="ef-icon-inline" />Exportar JSON
                </EfButton>
                <EfButton variant="secondary" onClick={handleExportTelemetry}>
                    <ChartBar size={14} weight="bold" className="ef-icon-inline" />Export Telemetry
                </EfButton>
                <EfButton variant="secondary" onClick={handleResetBrain} className="ef-ap__danger-btn">
                    <Brain size={14} weight="bold" className="ef-icon-inline" />Reset Brain
                </EfButton>
                <EfButton variant="secondary" onClick={handleNewGamePlus} className="ef-ap__accent-btn-bold">
                    <Brain size={14} weight="fill" className="ef-icon-inline" />New Game+
                </EfButton>
                <EfButton variant="secondary" onClick={handleResetAll} className="ef-ap__danger-btn-bold">
                    <XCircle size={14} weight="fill" className="ef-icon-inline" />Reset Tudo
                </EfButton>
            </div>

            {/* LLM Bridge Panel */}
            <EfPanel variant="sunk" padding="md" className="ef-ap__llm-panel">
                <div className="ef-ap__llm-header">
                    <span><Brain size={14} weight="fill" className="ef-icon-inline-md" />BUY/SELL ENGINE</span>
                    <span className="ef-ap__llm-mode-tag">mode: <strong>{llmStatus.mode}</strong></span>
                </div>
                {llmStatus.mode === 'webllm' && (
                    <div className="ef-text-sm-muted">
                        status: <strong>{llmStatus.loadStatus}</strong>
                        {llmStatus.loadStatus === 'ready' && <span className="ef-ap__llm-ready"> [OK] LLM ativo</span>}
                    </div>
                )}
                <div className="ef-ap__llm-actions">
                    {llmStatus.mode === 'heuristic' ? (
                        <EfButton variant="secondary" size="sm" onClick={handleLoadLLM} className="ef-ap__llm-load-btn">
                            <Brain size={14} weight="fill" className="ef-icon-inline" />Carregar WebLLM
                        </EfButton>
                    ) : (
                        <EfButton variant="secondary" size="sm" onClick={handleResetLLM} className="ef-ap__llm-reset-btn">
                            <ArrowsClockwise size={14} weight="bold" className="ef-icon-inline" />Voltar Heurística
                        </EfButton>
                    )}
                </div>
            </EfPanel>
        </EfPanel>
    );
}
