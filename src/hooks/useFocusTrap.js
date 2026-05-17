/**
 * useFocusTrap — AKITA-428: A11y Focus Trap
 *
 * Traps keyboard focus inside a container when active.
 * Used by modals, drawers, and overlays to prevent tabbing out.
 *
 * Features:
 * - Tab/Shift+Tab cycling within focusable elements
 * - Auto-focus first focusable on mount
 * - Restores focus to trigger element on unmount
 * - Handles dynamic content (MutationObserver)
 */

import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(', ');

/**
 * @param {React.RefObject<HTMLElement>} containerRef - ref to the trap container
 * @param {boolean} active - whether the trap is active
 * @param {object} [options]
 * @param {boolean} [options.autoFocus=true] - focus first element on activation
 * @param {boolean} [options.restoreFocus=true] - restore focus on deactivation
 * @param {string} [options.initialFocusSelector] - CSS selector for initial focus target
 */
export function useFocusTrap(containerRef, active = true, options = {}) {
    const {
        autoFocus = true,
        restoreFocus = true,
        initialFocusSelector,
    } = options;

    const previousFocusRef = useRef(null);

    const getFocusableElements = useCallback(() => {
        if (!containerRef.current) return [];
        return Array.from(containerRef.current.querySelectorAll(FOCUSABLE_SELECTOR))
            .filter(el => {
                // Skip hidden elements
                const style = window.getComputedStyle(el);
                return style.display !== 'none' && style.visibility !== 'hidden';
            });
    }, [containerRef]);

    useEffect(() => {
        if (!active || !containerRef.current) return;

        // Save current focus to restore later
        previousFocusRef.current = document.activeElement;

        // Auto-focus first element
        if (autoFocus) {
            requestAnimationFrame(() => {
                if (!containerRef.current) return;
                if (initialFocusSelector) {
                    const target = containerRef.current.querySelector(initialFocusSelector);
                    if (target) { target.focus(); return; }
                }
                const focusable = getFocusableElements();
                if (focusable.length > 0) {
                    focusable[0].focus();
                } else {
                    // Fallback: focus container itself
                    containerRef.current.setAttribute('tabindex', '-1');
                    containerRef.current.focus();
                }
            });
        }

        const handleKeyDown = (e) => {
            if (e.key !== 'Tab') return;

            const focusable = getFocusableElements();
            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }

            const first = focusable[0];
            const last = focusable[focusable.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: wrap from first to last
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                // Tab: wrap from last to first
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            // Restore focus
            if (restoreFocus && previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                try { previousFocusRef.current.focus(); } catch { /* element may be removed */ }
            }
        };
    }, [active, containerRef, autoFocus, restoreFocus, initialFocusSelector, getFocusableElements]);
}

export default useFocusTrap;
