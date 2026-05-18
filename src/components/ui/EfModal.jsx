/**
 * EfModal — Stitch component (AKITA-428: A11y upgrade)
 *
 * Centro tela, painel beveled, fundo escuro fade. Esc fecha.
 * Sizes: sm | md | lg | fullscreen
 *
 * A11y: focus trap, aria-modal, aria-labelledby, body scroll lock.
 */

import { useEffect, useRef } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

const SIZE_MAP = {
    sm: '320px',
    md: '480px',
    lg: '720px',
    fullscreen: '100%'
};

export function EfModal({
    open,
    onClose,
    title,
    size = 'md',
    closeOnEsc = true,
    closeOnBackdrop = true,
    children,
    footer
}) {
    const modalRef = useRef(null);

    // Focus trap: Tab/Shift+Tab cycling inside modal
    useFocusTrap(modalRef, !!open);

    // Esc to close
    useEffect(() => {
        if (!open || !closeOnEsc) return;
        const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, closeOnEsc, onClose]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'ef-modal-title' : undefined}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="ef-modal-backdrop"
            ref={modalRef}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="ef-modal-content ef-dyn-maxWidth"
                style={{ "--ef-dyn-maxWidth": SIZE_MAP[size] || SIZE_MAP.md }}
            >
                {/* Header */}
                {title && (
                    <div className="ef-modal-header">
                        <h3 id="ef-modal-title" className="ef-modal-title">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            aria-label="Fechar"
                            className="ef-modal-close"
                            type="button"
                        >
                            X
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="ef-modal-body">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="ef-modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export default EfModal;
