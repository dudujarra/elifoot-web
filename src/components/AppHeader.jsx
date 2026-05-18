/**
 * AppHeader.jsx — Top bar extracted from App.jsx
 * Contains: save, sound, LLM toggle, monitor, reset buttons.
 * All inline styles extracted to CSS classes in app-layout.css.
 */
import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { isSoundEnabled, setSoundEnabled, sfx } from '../utils/sound';
import { EfButton } from './ui/EfButton';
import { Brain, FloppyDisk, SpeakerHigh, SpeakerSlash, ChartBar, ArrowsClockwise, CheckCircle } from '@phosphor-icons/react';

export function AppHeader() {
    const { gameState, getEngine, saveGame, resetGame, changeView } = useGame();
    const [soundOn, setSoundOn] = useState(isSoundEnabled());
    const [savedToast, setSavedToast] = useState(false);
    const [llmEnabled, setLlmEnabled] = useState(() => {
        try {
            const engine = getEngine?.();
            return !!engine?.llmNarrative?.isLLMEnabled?.();
        } catch { return false; }
    });
    const [llmLoading, setLlmLoading] = useState(false);
    const [llmToast, setLlmToast] = useState(null);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        try {
            const engine = getEngine?.();
            if (!engine?.llmNarrative) return;
            setLlmEnabled(!!engine.llmNarrative.isLLMEnabled?.());
        } catch { /* engine not ready yet */ }
    }, [gameState.started, gameState.view, getEngine]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const engine = getEngine();

    const handleSave = () => {
        if (saveGame) saveGame();
        sfx.success();
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 1500);
    };

    const handleSoundToggle = () => {
        const next = !soundOn;
        setSoundEnabled(next);
        setSoundOn(next);
        if (next) sfx.click();
    };

    const handleLLMToggle = async () => {
        const engine = getEngine?.();
        const svc = engine?.llmNarrative;
        if (!svc) return;
        if (llmEnabled) {
            svc.disableLLM();
            setLlmEnabled(false);
            setLlmLoading(false);
            setLlmToast({ kind: 'ok', text: 'Auxiliar IA desligado — voltando a usar templates.' });
            setTimeout(() => setLlmToast(null), 2000);
            return;
        }
        setLlmEnabled(true);
        setLlmLoading(true);
        setLlmToast({ kind: 'loading', text: 'Auxiliar IA carregando modelo (~500MB)…' });
        try {
            const result = await svc.enableLLM();
            if (result?.ok) {
                setLlmToast({ kind: 'ok', text: 'Auxiliar IA pronto. Roda local, sem custo, sem API.' });
            } else {
                setLlmToast({ kind: 'err', text: `Auxiliar IA falhou: ${result?.error || 'erro desconhecido'}. Usando templates.` });
            }
        } catch (err) {
            setLlmToast({ kind: 'err', text: `Auxiliar IA falhou: ${err?.message || err}. Usando templates.` });
        } finally {
            setLlmLoading(false);
            setTimeout(() => setLlmToast(null), 3500);
        }
    };

    const handleReset = () => {
        if (window.confirm('Apagar carreira e voltar pra tela inicial? Não tem como recuperar.')) {
            if (resetGame) resetGame();
        }
    };

    return (
        <header className="top-bar glass-panel">
            <div className="logo">
                <img src="/assets/images/olefut_logo_celeste.webp" alt="OléFUT" className="app-header__logo-img" />
            </div>
            <div className="user-info app-header__controls">
                <span className="manager-name">{gameState.manager}</span>
                {gameState.mode === 'player' && engine.proPlayer && (
                    <strong>R$ {engine.proPlayer.money}</strong>
                )}
                {gameState.mode === 'manager' && (
                    <span>Sem {engine.currentWeek}/38</span>
                )}
                <EfButton variant="secondary" size="sm" onClick={handleSave}
                    title="Salvar manual (auto-save ativo)" aria-label="Salvar manual"
                    className="app-header__btn">
                    <FloppyDisk size={16} weight="fill" />
                </EfButton>
                <EfButton variant="secondary" size="sm" onClick={handleSoundToggle}
                    title={soundOn ? 'Som ON (clique pra desligar)' : 'Som OFF (clique pra ligar)'}
                    aria-label={soundOn ? 'Som ligado' : 'Som desligado'}
                    className="app-header__btn">
                    {soundOn ? <SpeakerHigh size={16} weight="fill" /> : <SpeakerSlash size={16} weight="fill" />}
                </EfButton>
                <EfButton variant="secondary" size="sm" onClick={handleLLMToggle}
                    disabled={llmLoading}
                    title={llmLoading ? 'Auxiliar IA carregando…' : llmEnabled ? 'Auxiliar IA ON (clique pra usar só templates)' : 'Auxiliar IA OFF — clique pra baixar modelo local (~500MB, opt-in)'}
                    aria-pressed={llmEnabled} aria-label="Toggle Auxiliar IA"
                    className={`app-header__btn ${llmLoading ? 'app-header__btn--loading' : ''} ${llmEnabled ? 'app-header__btn--active' : ''}`}>
                    <Brain size={16} weight={llmEnabled ? 'fill' : 'regular'} />
                </EfButton>
                <EfButton variant="secondary" size="sm" onClick={() => changeView?.('monitor')}
                    title="Monitor (bugs/gameplay/feedback)" aria-label="Abrir monitor"
                    className="app-header__btn">
                    <ChartBar size={16} weight="fill" />
                </EfButton>
                <EfButton variant="secondary" size="sm" onClick={handleReset}
                    title="Resetar carreira" aria-label="Resetar carreira"
                    className="app-header__btn">
                    <ArrowsClockwise size={16} weight="bold" />
                </EfButton>
            </div>
            {savedToast && (
                <div className="app-toast app-toast--success" role="status">
                    <CheckCircle size={14} weight="fill" aria-hidden /> Salvo!
                </div>
            )}
            {llmToast && (
                <div style={savedToast ? { '--ef-dyn-top': '7rem' } : undefined}
                     className={`app-toast app-toast--${llmToast.kind} ${savedToast ? 'ef-dyn-top' : ''}`} role="status">
                    {llmToast.text}
                </div>
            )}
        </header>
    );
}
