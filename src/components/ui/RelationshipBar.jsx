
/**
 * Retro "loading-block" relationship bar — Stitch v1.1 aesthetic.
 * @param {Object} props
 * @param {string} props.label - Relationship label (e.g. 'Treinador')
 * @param {number} props.value - 0 to 100 percentage
 * @param {string} props.type - 'boss', 'fans', 'teammates', 'sponsors'
 * @param {React.ReactNode} props.icon - Phosphor icon element
 */
export function RelationshipBar({ label, value, type, icon }) {
    const fillMod = type === 'boss'
        ? 'ef-player-dashboard__bar-fill--danger'
        : type === 'fans'
            ? ''
            : type === 'teammates'
                ? 'ef-player-dashboard__bar-fill--accent'
                : 'ef-player-dashboard__bar-fill--info';
    return (
        <div className="ef-player-dashboard__rel-bar">
            <label className="ef-player-dashboard__rel-label ef-sans ef-text-muted">
                <span className="ef-player-dashboard__rel-icon">{icon} {label}</span>
                <span className="ef-player-dashboard__rel-value ef-mono">{value}%</span>
            </label>
            <div className="ef-player-dashboard__bar ef-player-dashboard__bar--retro">
                <div
                    className={`ef-player-dashboard__bar-fill ${fillMod} w-${Math.round(value)}`}>
                    <div className="ef-player-dashboard__bar-blocks" aria-hidden />
                </div>
            </div>
        </div>
    );
}

export default RelationshipBar;
