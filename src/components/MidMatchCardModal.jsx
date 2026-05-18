/* eslint-disable react-refresh/only-export-components */
/**
 * MidMatchCardModal — SPEC-B2.2
 *
 * Overlay pausa-style com carta de decisão mid-match.
 * Pronto para wiring no MatchView quando shouldTriggerMidMatch dispara.
 */

import { useCallback, useEffect } from 'react';
import { ChatCircle, X } from '@phosphor-icons/react';
import '../styles/decision-modal.css';

// ─── helpers exportados para teste ───

export function formatEffectChip(effect) {
    if (!effect || typeof effect !== 'object') return '';
    const parts = [];
    if (typeof effect.moralDelta === 'number') {
        parts.push(`Moral ${effect.moralDelta > 0 ? '+' : ''}${effect.moralDelta}`);
    }
    if (typeof effect.energyDelta === 'number') {
        parts.push(`Energia ${effect.energyDelta > 0 ? '+' : ''}${effect.energyDelta}`);
    }
    if (typeof effect.tacticShift === 'string' && effect.tacticShift.length > 0) {
        parts.push(`Tática: ${effect.tacticShift}`);
    }
    return parts.join(' · ');
}

export function MidMatchCardModal({ card, onChoose, onClose }) {
    const handleChoose = useCallback((opt, idx) => {
        if (typeof onChoose === 'function') onChoose(opt, idx);
        if (typeof onClose === 'function') onClose();
    }, [onChoose, onClose]);

    const handleClose = useCallback(() => {
        if (typeof onClose === 'function') onClose();
    }, [onClose]);

    useEffect(() => {
        if (!card) return;
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [card, handleClose]);

    if (!card) return null;

    return (
        <div
            className="ef-decision-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ef-midmatch-title"
        >
            {}
            <div className="ef-decision-card" style={{ '--decision-accent': 'var(--accent)' }}>
                <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Fechar carta"
                    className="ef-decision-close"
                >
                    <X size={14} weight="bold" />
                </button>

                <div className="ef-decision-header">
                    <ChatCircle size={20} color="var(--accent)" weight="fill" />
                    <span id="ef-midmatch-title" className="ef-decision-title">
                        DECISÃO DO TÉCNICO
                    </span>
                </div>

                <p className="ef-decision-body">
                    {card.text}
                </p>

                <div className="ef-decision-options">
                    {card.options.map((opt, idx) => {
                        const chip = formatEffectChip(opt.effect);
                        return (
                            <button
                                key={`${card.id}-opt-${idx}`}
                                type="button"
                                onClick={() => handleChoose(opt, idx)}
                                className="ef-decision-option-btn"
                            >
                                <div className={`ef-decision-option-label${chip ? ' ef-decision-option-label--has-chip' : ''}`}>{opt.label}</div>
                                {chip && (
                                    <div className="ef-decision-option-chip">
                                        {chip}
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default MidMatchCardModal;
