/**
 * AutoPlayLabView — F1 UI
 *
 * Single view: dropdown preset + config + RUN + results + export.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { EfPanel, EfButton } from './ui';
import { runBatch, seedRange, randomSeeds } from '../services/AutoPlayLab/BatchRunner';
import { PRESETS, PRESET_CATEGORIES } from '../services/AutoPlayLab/presets';
import { toCSV, toJSON, downloadFile, timestampedFilename } from '../services/AutoPlayLab/Exporter';
import { ArrowLeft, Play, Download, Flask } from '@phosphor-icons/react';
import '../styles/autoplay-lab-view.css';

export function AutoPlayLabView() {
    const { changeView, getDashboardView } = useGame();
    const [presetId, setPresetId] = useState('balance_winrate');
    const [saves, setSaves] = useState(20);
    const [weeks, setWeeks] = useState(38);
    const [seedStart, setSeedStart] = useState(1000);
    const [useRandomSeeds, setUseRandomSeeds] = useState(false);
    const [running, setRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [eta, setEta] = useState('');
    // Bug-fix V11: track mount pra skip setState após unmount
    const mountedRef = useRef(true);
    useEffect(() => () => { mountedRef.current = false; }, []);

    const preset = PRESETS[presetId];

    const handleRun = useCallback(async () => {
        if (running || !preset) return;
        setRunning(true);
        setProgress(0);
        setResults(null);
        setAnalysis(null);
        const startTs = Date.now();
        const seeds = useRandomSeeds
            ? randomSeeds(saves, seedStart)
            : seedRange(seedStart, seedStart + saves);
        try {
            const batchResults = await runBatch({
                seeds,
                weeks,
                onProgress: (done, total) => {
                    if (!mountedRef.current) return;
                    setProgress(done / total);
                    const elapsedMs = Date.now() - startTs;
                    const eta_ms = elapsedMs / done * (total - done);
                    setEta(`${Math.ceil(eta_ms / 1000)}s`);
                },
            });
            if (!mountedRef.current) return;
            setResults(batchResults);
            try {
                const ana = preset.analyze(batchResults, preset);
                setAnalysis(ana);
            } catch (e) {
                setAnalysis({ error: e.message });
            }
        } finally {
            if (mountedRef.current) {
                setRunning(false);
                setEta('');
            }
        }
    }, [running, preset, saves, weeks, seedStart, useRandomSeeds]);

    const handleExportCSV = useCallback(() => {
        if (!results) return;
        downloadFile(timestampedFilename(presetId, 'csv'), toCSV(results));
    }, [results, presetId]);

    const handleExportJSON = useCallback(() => {
        if (!results) return;
        downloadFile(timestampedFilename(presetId, 'json'), toJSON({ analysis, results }), 'application/json');
    }, [results, analysis, presetId]);

    // Group presets by category
    const presetsByCategory = {};
    Object.values(PRESETS).forEach(p => {
        if (!presetsByCategory[p.category]) presetsByCategory[p.category] = [];
        presetsByCategory[p.category].push(p);
    });

    return (
        <div className="ef-aplab__scene">
            <div className="ef-aplab__container">

                {/* HEADER */}
                <EfPanel padding="lg" className="ef-aplab__panel-gold-bottom">
                    <div className="ef-aplab__inline">
                        <Flask size={28} color="var(--color-gold-arcade)" weight="fill" />
                        <div className="ef-aplab__header-text">
                            <h2 className="ef-aplab__title">
                                AUTOPLAY LAB
                            </h2>
                            <div className="ef-aplab__subtitle">
                                Simula N saves headless. Valida engine, balance, IA, conteúdo.
                            </div>
                        </div>
                        <EfButton variant="secondary" size="md" onClick={() => changeView(getDashboardView())}>
                            <ArrowLeft size={16} /> SAIR
                        </EfButton>
                    </div>
                </EfPanel>

                {/* CONFIG */}
                <EfPanel padding="md" className="ef-aplab__panel-mb">
                    <div className="ef-aplab__grid-2">
                        <label className="ef-aplab__label-col">
                            <span className="ef-aplab__field-label">PRESET</span>
                            <select
                                value={presetId}
                                onChange={e => setPresetId(e.target.value)}
                                disabled={running}
                                className="ef-aplab__input"
                            >
                                {Object.entries(presetsByCategory).map(([cat, list]) => (
                                    <optgroup key={cat} label={PRESET_CATEGORIES[cat] || cat}>
                                        {list.map(p => (
                                            <option key={p.id} value={p.id}>{p.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                            {preset && (
                                <div className="ef-aplab__field-desc">
                                    {preset.description}
                                </div>
                            )}
                        </label>

                        <label className="ef-aplab__label-col">
                            <span className="ef-aplab__field-label">SAVES</span>
                            <input
                                type="number"
                                value={saves}
                                onChange={e => setSaves(Math.max(1, parseInt(e.target.value) || 1))}
                                disabled={running}
                                min="1"
                                max="1000"
                                className="ef-aplab__input"
                            />
                        </label>

                        <label className="ef-aplab__label-col">
                            <span className="ef-aplab__field-label">SEMANAS/SAVE</span>
                            <input
                                type="number"
                                value={weeks}
                                onChange={e => setWeeks(Math.max(1, parseInt(e.target.value) || 38))}
                                disabled={running}
                                min="1"
                                max="380"
                                className="ef-aplab__input"
                            />
                        </label>

                        <label className="ef-aplab__label-col">
                            <span className="ef-aplab__field-label">SEED START</span>
                            <input
                                type="number"
                                value={seedStart}
                                onChange={e => setSeedStart(parseInt(e.target.value) || 1000)}
                                disabled={running}
                                className="ef-aplab__input"
                            />
                        </label>
                    </div>

                    <label className="ef-aplab__label-checkbox">
                        <input
                            type="checkbox"
                            checked={useRandomSeeds}
                            onChange={e => setUseRandomSeeds(e.target.checked)}
                            disabled={running}
                        />
                        Random seeds (crash hunting)
                    </label>

                    <div className="ef-aplab__action-row">
                        <EfButton variant="primary" size="lg" onClick={handleRun} disabled={running}>
                            <Play size={16} weight="fill" /> {running ? 'RODANDO...' : 'RODAR'}
                        </EfButton>
                        {running && (
                            <div className="ef-aplab__progress-info">
                                Progress: {Math.round(progress * 100)}% · ETA {eta}
                                <div className="ef-aplab__progress-track">
                                    <div className={`ef-aplab__progress-fill w-${Math.round(progress * 100)}`} />
                                </div>
                            </div>
                        )}
                    </div>
                </EfPanel>

                {/* RESULTS */}
                {analysis && (
                    <EfPanel padding="md" className="ef-aplab__panel-mb">
                        <div className="ef-aplab__results-header">
                            <div className="ef-aplab__results-label">
                                RESULTADOS — {preset?.label?.toUpperCase()}
                            </div>
                        </div>
                        <pre className="ef-aplab__results-pre">
                            {JSON.stringify(analysis, null, 2)}
                        </pre>
                        <div className="ef-aplab__results-actions">
                            <EfButton variant="secondary" size="md" onClick={handleExportCSV}>
                                <Download size={14} /> EXPORT CSV
                            </EfButton>
                            <EfButton variant="secondary" size="md" onClick={handleExportJSON}>
                                <Download size={14} /> EXPORT JSON
                            </EfButton>
                            <div className="ef-aplab__results-stats">
                                {results?.length || 0} saves · {results?.filter(r => !r.crash).length || 0} OK · {results?.filter(r => r.crash).length || 0} crashes
                            </div>
                        </div>
                    </EfPanel>
                )}

            </div>
        </div>
    );
}

export default AutoPlayLabView;
