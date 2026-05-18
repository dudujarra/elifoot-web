/* eslint-disable react-refresh/only-export-components */
/**
 * MatchHighlightModal — SPEC-F1.1
 *
 * Overlay rapido (3s auto-dismiss) que destaca eventos críticos
 * (gol, vermelho) durante partida live. Pausa ticker via prop.
 */

import { useEffect, useCallback } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { CheckCircle, Warning, SoccerBall } from '@phosphor-icons/react';
import '../styles/match-highlight-modal.css';

// ─── pure helpers exportados pra teste ───

export function getHighlightIcon(eventType) {
    if (eventType === 'goal') return SoccerBall;
    if (eventType === 'red' || eventType === 'red-card') return Warning;
    return CheckCircle;
}

export function getHighlightColor(eventType) {
    if (eventType === 'goal') return 'var(--accent)';
    if (eventType === 'red' || eventType === 'red-card') return 'var(--danger)';
    return 'var(--text-main)';
}

export function extractHighlightContext(narrationEntry) {
    if (!narrationEntry) return null;
    const text = narrationEntry.text || '';
    let type = 'other';
    if (text.includes('⚽') || text.toLowerCase().includes('goool')) type = 'goal';
    else if (text.includes('🟥') || text.toLowerCase().includes('vermelho')) type = 'red';
    else return null; // não é highlight
    return {
        type,
        minute: narrationEntry.minute || 0,
        text,
    };
}

export function MatchHighlightModal({ context, onDismiss, autoDismissMs = 3000 }) {
    const trapRef = useFocusTrap(!!context);

    const handleDismiss = useCallback(() => {
        if (typeof onDismiss === 'function') onDismiss();
    }, [onDismiss]);

    useEffect(() => {
        if (!context) return;
        const t = setTimeout(handleDismiss, autoDismissMs);
        const onKey = (e) => { if (e.key === 'Escape') handleDismiss(); };
        window.addEventListener('keydown', onKey);
        return () => {
            clearTimeout(t);
            window.removeEventListener('keydown', onKey);
        };
    }, [context, handleDismiss, autoDismissMs]);

    if (!context) return null;

    const Icon = getHighlightIcon(context.type);
    const color = getHighlightColor(context.type);

    return (
        <div
            ref={trapRef}
            className="ef-highlight-overlay"
            role="alert"
            aria-live="assertive"
        >
            {/* eslint-disable-next-line no-restricted-syntax -- dynamic highlight color */}
            <div className="ef-highlight-card" style={{ '--highlight-color': color }}>
                <div className="ef-highlight-icon-row">
                    <Icon size={64} color={color} weight="fill" />
                </div>
                <div className="ef-highlight-minute">
                    MINUTO {context.minute}
                </div>
                <div className="ef-highlight-text">
                    {context.text}
                </div>
            </div>
        </div>
    );
}

export default MatchHighlightModal;
