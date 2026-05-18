/**
 * EfTooltip — Stitch component (refactor de Tooltip.jsx legacy)
 *
 * Hover delay 200ms, fade-in 100ms, beveled.
 * 16-bit Brutalist Arcade edition.
 */

import { useState, useRef, useLayoutEffect } from 'react';
import '../../styles/tooltip.css';

export function EfTooltip({
    content,
    children,
    position = 'auto',
    delay = 200,
    color = 'info',
    className = ''
}) {
    const [visible, setVisible] = useState(false);
    const [computedPos, setComputedPos] = useState('top');
    const triggerRef = useRef(null);
    const bubbleRef = useRef(null);
    const timerRef = useRef(null);

    const handleEnter = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(true), delay);
    };

    const handleLeave = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setVisible(false);
    };

    // BUG-081 (SPEC-158): aceitável — useLayoutEffect mede DOM (getBoundingClientRect).
    // Só roda após mount/visible; impossível derivar via useMemo sem render-time DOM.
    /* eslint-disable react-hooks/set-state-in-effect */
    useLayoutEffect(() => {
        if (!visible || !triggerRef.current || !bubbleRef.current) return;
        if (position !== 'auto') {
            setComputedPos(position);
            return;
        }
        const rect = triggerRef.current.getBoundingClientRect();
        const h = bubbleRef.current.offsetHeight;
        if (rect.top < h + 16) setComputedPos('bottom');
        else setComputedPos('top');
    }, [visible, position]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (!content) return children;

    const HEADER_COLOR = {
        info: 'var(--info)',
        success: 'var(--primary)',
        warning: 'var(--accent)',
        danger: 'var(--danger)'
    };

    return (
        <span
            ref={triggerRef}
            className={`ef-tooltip-trigger ${className}`}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
            onFocus={handleEnter}
            onBlur={handleLeave}
        >
            {children}
            {visible && (
                <span
                    ref={bubbleRef}
                    role="tooltip"
                    className={`ef-tooltip-bubble ef-tooltip-pos-${computedPos} ef-dyn-borderTopColor`}
                    style={{
                        "--ef-dyn-borderTopColor": HEADER_COLOR[color] || HEADER_COLOR.info,
                    }}
                >
                    {content}
                </span>
            )}
        </span>
    );
}

export default EfTooltip;
