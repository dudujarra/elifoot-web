/**
 * Tooltip — Simple hover tooltip component.
 * Created as a lightweight replacement to fix build (no external dep).
 */
import { useState } from 'react';

export function Tooltip({ content, children }) {
    const [show, setShow] = useState(false);

    return (
        <span
            className="ef-tooltip-trigger"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}>
            {children}
            {show && content && (
                <span className="ef-tooltip-bubble">
                    {content}
                </span>
            )}
        </span>
    );
}

export default Tooltip;
