
// Hexagon radar geometry — six axes, 360° / 6 = 60° apart, start at top (270°).
export function hexPoint(idx, valuePct) {
    const angle = (-90 + idx * 60) * (Math.PI / 180);
    const r = 44 * (valuePct / 100); // 44 = max radius (leaves room for labels)
    return {
        x: 50 + r * Math.cos(angle),
        y: 50 + r * Math.sin(angle)
    };
}

export function hexRing(scale) {
    return Array.from({ length: 6 }, (_, i) => {
        const angle = (-90 + i * 60) * (Math.PI / 180);
        const r = 44 * scale;
        return `${50 + r * Math.cos(angle)},${50 + r * Math.sin(angle)}`;
    }).join(' ');
}

export function buildRadarAxes(skills) {
    const ovr = Math.round(
        ((skills.technique || 0) + (skills.pace || 0) + (skills.power || 0) + (skills.vision || 0)) / 4
    );
    return [
        { key: 'ATK', label: 'ATK', value: skills.pace || 0 },
        { key: 'TEC', label: 'TEC', value: skills.technique || 0 },
        { key: 'CRI', label: 'CRI', value: skills.vision || 0 },
        { key: 'TAC', label: 'TAC', value: Math.round(((skills.power || 0) + (skills.vision || 0)) / 2) },
        { key: 'DEF', label: 'DEF', value: skills.power || 0 },
        { key: 'OVR', label: 'OVR', value: ovr }
    ];
}

export function buildRadarPoints(axes) {
    return axes.map((a, i) => {
        const p = hexPoint(i, a.value);
        return `${p.x},${p.y}`;
    }).join(' ');
}

/**
 * HexagonRadar component
 * @param {Object} props
 * @param {Array} props.axes - [{ key, label, value }]
 * @param {string} props.points - Computed SVG polygon points string
 * @param {string} [props.className] - Optional extra class
 */
export function HexagonRadar({ axes, points, className = '' }) {
    return (
        <div className={`ef-player-dashboard__radar ${className}`}>
            <svg viewBox="0 0 100 100" className="ef-player-dashboard__radar-svg" aria-label="Hexagon attribute radar chart">
                <polygon className="ef-player-dashboard__radar-ring" points={hexRing(1.0)} />
                <polygon className="ef-player-dashboard__radar-ring" points={hexRing(0.75)} />
                <polygon className="ef-player-dashboard__radar-ring" points={hexRing(0.5)} />
                <polygon className="ef-player-dashboard__radar-ring" points={hexRing(0.25)} />
                {axes.map((_, i) => {
                    const angle = (-90 + i * 60) * (Math.PI / 180);
                    const x2 = 50 + 44 * Math.cos(angle);
                    const y2 = 50 + 44 * Math.sin(angle);
                    return (
                        <line
                            key={i}
                            className="ef-player-dashboard__radar-axis"
                            x1="50" y1="50" x2={x2} y2={y2}
                        />
                    );
                })}
                <polygon className="ef-player-dashboard__radar-data" points={points} />
            </svg>
            <div className="ef-player-dashboard__radar-labels">
                {axes.map((a, i) => (
                    <span
                        key={a.key}
                        className={`ef-player-dashboard__radar-label ef-player-dashboard__radar-label--p${i} ef-mono`}
                    >
                        {a.label} ({a.value})
                    </span>
                ))}
            </div>
        </div>
    );
}

export default HexagonRadar;
