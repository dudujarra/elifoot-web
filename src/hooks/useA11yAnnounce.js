/**
 * useA11yAnnounce — AKITA-428: Screen Reader Live Announcements
 *
 * Creates an ARIA live region and provides a function to announce messages.
 * Used for dynamic content changes that screen readers need to convey.
 *
 * Uses an invisible element with aria-live="polite" (or "assertive" for urgent).
 */

import { useCallback, useEffect, useRef } from 'react';

let _announceEl = null;

function getAnnounceElement() {
    if (_announceEl && document.body.contains(_announceEl)) return _announceEl;

    _announceEl = document.createElement('div');
    _announceEl.setAttribute('aria-live', 'polite');
    _announceEl.setAttribute('aria-atomic', 'true');
    _announceEl.setAttribute('role', 'status');
    _announceEl.className = 'ef-sr-only';
    // Visually hidden but accessible
    Object.assign(_announceEl.style, {
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
    });
    document.body.appendChild(_announceEl);
    return _announceEl;
}

/**
 * @returns {(message: string, priority?: 'polite' | 'assertive') => void}
 */
export function useA11yAnnounce() {
    const timeoutRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const announce = useCallback((message, priority = 'polite') => {
        const el = getAnnounceElement();
        el.setAttribute('aria-live', priority);

        // Clear and re-set to force screen reader to re-read
        el.textContent = '';
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            el.textContent = message;
        }, 100);
    }, []);

    return announce;
}

export default useA11yAnnounce;
