/* eslint-disable no-restricted-syntax -- --chronicle-color CSS var set dynamically */
/* eslint-disable react-refresh/only-export-components */
/**
 * ChronicleSeasonEndModal — SPEC-B3
 *
 * Modal full-screen mostrado automaticamente ao fim de temporada.
 * Render quando engine.pendingChronicleSeason e truthy.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { useGame } from '../context/GameContext';
import { Scroll, Download, Image as ImageIcon, X, Trophy, CloudRain } from '@phosphor-icons/react';
import '../styles/chronicle-modal.css';

// ─── pure helpers exportados pra teste ───

export function buildChronicleMarkdown(chronicle) {
    if (!chronicle) return '';
    const moodHeader = chronicle.mood === 'triumph'
        ? 'TRIUNFO'
        : chronicle.mood === 'despair'
        ? 'TRAGEDIA'
        : 'CRONICA';
    return [
        `# Cronica — Temporada ${chronicle.season}`,
        ``,
        `**${moodHeader}** — ${chronicle.clubName || ''}`,
        `Tecnico: ${chronicle.managerName || ''}`,
        ``,
        chronicle.chronicle || '',
    ].join('\n');
}

export function buildChronicleFilename(chronicle) {
    if (!chronicle) return 'cronica.md';
    const club = (chronicle.clubName || 'clube').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const season = chronicle.season || 1;
    return `cronica-temp-${season}-${club}.md`;
}

export function buildChroniclePngFilename(chronicle) {
    if (!chronicle) return 'cronica.png';
    const club = (chronicle.clubName || 'clube').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const season = chronicle.season || 1;
    return `cronica-temp-${season}-${club}.png`;
}

/**
 * Renderiza a crônica como PNG via canvas API (sem deps externas).
 * Retorna data URL pronta para download.
 */
export function renderChronicleToCanvas(chronicle, opts = {}) {
    if (!chronicle || typeof document === 'undefined') return null;
    const moodColor = chronicle.mood === 'triumph'
        ? 'var(--accent)'
        : chronicle.mood === 'despair'
        ? 'var(--danger)'
        : 'var(--text-main)';
    const moodLabel = chronicle.mood === 'triumph'
        ? 'TRIUNFO'
        : chronicle.mood === 'despair'
        ? 'TRAGEDIA'
        : 'CRONICA';

    const width = opts.width || 800;
    const lineHeight = opts.lineHeight || 24;
    const padding = opts.padding || 40;
    const titleHeight = 100; // SPEC-F4.4: expandido pra fit highlights

    // Wrap text manual para canvas
    const body = (chronicle.chronicle || '').split(/\s+/);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    const ctxMeasure = tempCanvas.getContext('2d');
    ctxMeasure.font = '14px monospace';
    const maxLineWidth = width - padding * 2;
    const lines = [];
    let currentLine = '';
    body.forEach(word => {
        const test = currentLine ? currentLine + ' ' + word : word;
        const w = ctxMeasure.measureText(test).width;
        if (w > maxLineWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = test;
        }
    });
    if (currentLine) lines.push(currentLine);

    const height = titleHeight + (lines.length * lineHeight) + padding * 2 + 60;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = 'var(--color-bg-deep)';
    ctx.fillRect(0, 0, width, height);

    // Border
    ctx.strokeStyle = moodColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Mood label
    ctx.fillStyle = moodColor;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(moodLabel, padding, padding + 4);

    // Title
    ctx.fillStyle = 'var(--text-main)';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(`Temporada ${chronicle.season} — ${chronicle.clubName || ''}`, padding, padding + 36);

    // Manager
    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '14px monospace';
    ctx.fillText(`Tecnico: ${chronicle.managerName || ''}`, padding, padding + 60);

    // Body
    ctx.fillStyle = 'var(--text-main)';
    ctx.font = '14px monospace';
    lines.forEach((line, idx) => {
        ctx.fillText(line, padding, padding + titleHeight + (idx + 1) * lineHeight);
    });

    // SPEC-F4.4: highlights row (top scorer + star player)
    const seasonData = chronicle.seasonData || {};
    let highlightY = padding + titleHeight + (lines.length * lineHeight) + 20;
    if (seasonData.topScorer || seasonData.starPlayer) {
        ctx.fillStyle = moodColor;
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('DESTAQUES DA TEMPORADA', padding, highlightY);
        highlightY += 20;
        ctx.fillStyle = 'var(--text-main)';
        ctx.font = '12px monospace';
        if (seasonData.topScorer) {
            ctx.fillText(`Artilheiro: ${seasonData.topScorer.name} (${seasonData.topScorer.goals}g)`, padding, highlightY);
            highlightY += 16;
        }
        if (seasonData.starPlayer && seasonData.starPlayer.name) {
            ctx.fillText(`Estrela: ${seasonData.starPlayer.name} (${seasonData.starPlayer.apps}j, ${seasonData.starPlayer.goals}g)`, padding, highlightY);
            highlightY += 16;
        }
    }

    // Footer
    ctx.fillStyle = 'var(--text-muted)';
    ctx.font = '11px monospace';
    ctx.fillText('OléFUT — generated by OléFUT', padding, height - padding / 2);

    return canvas.toDataURL('image/png');
}

const MOOD_META = {
    triumph: { icon: Trophy,    color: 'var(--accent)', label: 'TRIUNFO' },
    despair: { icon: CloudRain, color: 'var(--danger)', label: 'TRAGÉDIA' },
    normal:  { icon: Scroll,    color: 'var(--text-main)', label: 'CRÔNICA' },
};

export function ChronicleSeasonEndModal() {
    const { getEngine, forceUpdate } = useGame();
    const engine = getEngine?.();
    const chronicle = engine?.pendingChronicleSeason || null;
    const trapRef = useFocusTrap(!!chronicle);

    const close = useCallback(() => {
        if (!engine) return;
        engine.pendingChronicleSeason = null;
        if (typeof forceUpdate === 'function') forceUpdate();
    }, [engine, forceUpdate]);

    const handleExport = useCallback(() => {
        if (!chronicle) return;
        const md = buildChronicleMarkdown(chronicle);
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = buildChronicleFilename(chronicle);
        a.click();
        URL.revokeObjectURL(url);
    }, [chronicle]);

    const handleExportPng = useCallback(() => {
        if (!chronicle) return;
        try {
            const dataUrl = renderChronicleToCanvas(chronicle);
            if (!dataUrl) return;
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = buildChroniclePngFilename(chronicle);
            a.click();
        } catch { /* defensive */ }
    }, [chronicle]);

    useEffect(() => {
        if (!chronicle) return;
        const onKey = (e) => {
            if (e.key === 'Escape') close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [chronicle, close]);

    if (!chronicle) return null;

    const moodKey = chronicle.mood || 'normal';
    const meta = MOOD_META[moodKey] || MOOD_META.normal;
    const Icon = meta.icon;

    return (
        <div
            ref={trapRef}
            className="ef-chronicle-overlay"
            role="dialog"
            aria-labelledby="ef-chronicle-title"
            aria-modal="true"
        >
            <div className="ef-chronicle-card" style={{ '--chronicle-color': meta.color }}>
                <button
                    type="button"
                    onClick={close}
                    aria-label="Fechar crônica"
                    className="ef-chronicle-close"
                >
                    <X size={16} weight="bold" />
                </button>

                <div className="ef-chronicle-header">
                    <Icon size={32} color={meta.color} weight="fill" />
                    <div>
                        <div className="ef-chronicle-mood-label">
                            {meta.label}
                        </div>
                        <h2 id="ef-chronicle-title" className="ef-chronicle-title">
                            Temporada {chronicle.season} — {chronicle.clubName}
                        </h2>
                        <div className="ef-chronicle-manager">
                            Técnico: {chronicle.managerName}
                        </div>
                    </div>
                </div>

                <div className="ef-chronicle-body">
                    {chronicle.chronicle}
                </div>

                <div className="ef-chronicle-actions">
                    <button
                        type="button"
                        onClick={handleExport}
                        className="ef-chronicle-btn ef-chronicle-btn--outline"
                    >
                        <Download size={16} weight="bold" /> MD
                    </button>
                    <button
                        type="button"
                        onClick={handleExportPng}
                        className="ef-chronicle-btn ef-chronicle-btn--outline"
                    >
                        <ImageIcon size={16} weight="bold" /> PNG
                    </button>
                    <button
                        type="button"
                        onClick={close}
                        className="ef-chronicle-btn ef-chronicle-btn--solid"
                    >
                        CONTINUAR
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChronicleSeasonEndModal;
