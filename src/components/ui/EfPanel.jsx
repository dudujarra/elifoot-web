/**
 * EfPanel — SNES 16-bit Brutalist Arcade Container
 *
 * Heavy metal beveled container with zero transparency.
 * Variants: default | elev | sunk | hero | warning | danger
 *
 * SPEC-169 (Bloco 3.3): wrapped em React.memo. Panel é container leaf
 * que aparece dezenas de vezes por tela (dashboard tem 8+ panels).
 * children muda quando algo dentro muda; com memo, panels-irmãos
 * estáveis não re-renderizam.
 */

import { memo } from 'react';

function EfPanelImpl({
    variant = 'default',
    title,
    icon,
    headerColor,
    padding = 'md',
    children,
    onClick,
    className = '',
    style = {}
}) {
    return (
        <div
            onClick={onClick}
            className={`ef-panel ef-panel-${variant} ef-panel-p-${padding} ${className}`.trim()}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                ...style
            }}
        >
            {title && (
                <div className="ef-panel-header" style={headerColor ? { background: headerColor } : {}}>
                    {icon && <span>{icon}</span>}
                    {title}
                </div>
            )}
            <div className={`ef-panel-content`}>
                {children}
            </div>
        </div>
    );
}

export const EfPanel = memo(EfPanelImpl);
EfPanel.displayName = 'EfPanel';

export default EfPanel;
