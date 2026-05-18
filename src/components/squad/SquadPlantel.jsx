import React from 'react';
import { EfPanel } from '../ui/EfPanel';
import { HexagonChart } from '../HexagonChart';
import { PlayerAttributesGrid } from '../ui/PlayerAttributesGrid';
import { calculateRatingForPosition } from '../../engine/Positions';
import { Star, Sparkle, Heartbeat, FirstAid, CheckCircle, PaperPlaneRight, UserMinus, ArrowCircleUp, ArrowCircleDown, MinusCircle } from '@phosphor-icons/react';
import { electStarPlayer } from '../../engine/StarPlayerLink';

const getMoralIcon = (m) => {
    if (m > 70) return <ArrowCircleUp weight="fill" color="var(--primary)" />;
    if (m > 40) return <MinusCircle weight="fill" color="var(--text-muted)" />;
    return <ArrowCircleDown weight="fill" color="var(--danger)" />;
};

const getFormTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowCircleUp size={14} weight="fill" color="var(--primary)" />;
    if (trend === 'down') return <ArrowCircleDown size={14} weight="fill" color="var(--danger)" />;
    return null;
};

const renderConditionBar = (energy) => {
    const pct = Math.max(0, Math.min(100, Math.round(energy)));
    const tone = pct > 60 ? 'ok' : pct > 30 ? 'warn' : 'danger';
    return (
        <div className="ef-squad__cond">
            <span className={`ef-squad__cond-pct ef-squad__cond-pct--${tone}`}>{pct}%</span>
            <div className="ef-squad__cond-track">
                <div
                    className={`ef-squad__cond-fill ef-squad__cond-fill--${tone} w-${Math.round(pct)}`} />
            </div>
        </div>
    );
};

export function SquadPlantel({ sorted, sortBy, handleSort, expandedId, setExpandedId, toggleTitular, handleLoan, handleSell, engine, forceUpdate }) {
    return (
        <EfPanel padding="none" className="ef-squad__panel-table">
            <table className="ef-squad__table">
                <thead className="ef-squad__thead">
                    <tr>
                        <th className="ef-squad__th ef-squad__th--narrow">ST</th>
                        <th onClick={() => handleSort('position')} className={`${sortBy === 'position' ? 'ef-text-primary' : 'ef-text-muted'} ef-squad__th ef-squad__th--pos`}>POS</th>
                        <th onClick={() => handleSort('name')} className={`${sortBy === 'name' ? 'ef-text-primary' : 'ef-text-muted'} ef-squad__th ef-squad__th--name ef-squad__th--sortable`}>JOGADOR</th>
                        <th onClick={() => handleSort('ovr')} className={`${sortBy === 'ovr' ? 'ef-text-primary' : 'ef-text-muted'} ef-squad__th ef-squad__th--pos`}>OVR</th>
                        <th onClick={() => handleSort('energy')} className={`${sortBy === 'energy' ? 'ef-text-primary' : 'ef-text-muted'} ef-squad__th ef-squad__th--energy ef-squad__th--sortable`}>COND</th>
                        <th onClick={() => handleSort('moral')} className={`${sortBy === 'moral' ? 'ef-text-primary' : 'ef-text-muted'} ef-squad__th ef-squad__th--mor ef-squad__th--sortable`}>MOR</th>
                        <th className="ef-squad__th ef-squad__th--action">AÇÃO</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map((p) => {
                        const isSelected = p.isTitular;
                        const rowCls = [
                            'ef-squad__row',
                            isSelected ? 'ef-squad__row--selected' : '',
                            p.injury ? 'ef-squad__row--injured' : ''
                        ].filter(Boolean).join(' ');
                        return (
                            <React.Fragment key={p.id}>
                                <tr
                                    className={rowCls}
                                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                                >
                                    <td className="ef-squad__td">
                                        {p.injury ? (
                                            <FirstAid weight="fill" size={16} className="ef-squad__status-medical" />
                                        ) : p.suspension ? (
                                            <div className="ef-squad__status-susp">SUSP</div>
                                        ) : (
                                            <div
                                                onClick={(e) => { e.stopPropagation(); toggleTitular(p.id); }}
                                                className={`ef-st-toggle${isSelected ? ' ef-st-toggle--active' : ''}`}
                                                title={'Alternar Titular/Reserva'}
                                            >
                                                {isSelected
                                                    ? <CheckCircle weight="bold" color="var(--primary)" size={16} />
                                                    : <span className="ef-squad__status-dot" aria-hidden="true" />}
                                            </div>
                                        )}
                                    </td>
                                    <td className="ef-squad__td">
                                        <span className={`ef-squad__pos-badge ef-squad__pos-badge--${(p.position || '').toLowerCase()}`}>
                                            {p.naturalPosition || p.position}
                                        </span>
                                    </td>
                                    <td className="ef-squad__name-cell">
                                        <div className="ef-squad__name-col">
                                            <div className="ef-squad__name-row">
                                                {p.isSuper && <Star weight="fill" color="var(--accent)" size={14} />}
                                                {p.isWonderkid && <Sparkle weight="fill" color="var(--color-purple-wonder)" size={14} />}
                                                {p.nickname ? `"${p.nickname}" ${p.name.split(' ').pop()}` : p.name}
                                                {getFormTrendIcon(p.form?.trend)}
                                            </div>
                                            {p.injury ? (
                                                <div className="ef-squad__sub-label ef-squad__sub-label--danger">
                                                    LESIONADO{p.injury?.weeksRemaining ? ` (${p.injury.weeksRemaining} SEM)` : ''}
                                                </div>
                                            ) : p.suspension ? (
                                                <div className="ef-squad__sub-label ef-squad__sub-label--danger">
                                                    SUSPENSO ({p.suspension} JOG)
                                                </div>
                                            ) : (
                                                <div className="ef-squad__sub-label">
                                                    {p.age} ANOS{p.specialty ? ` • ${p.specialty}` : ''}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="ef-squad__ovr-cell">
                                        {p.ovr}
                                    </td>
                                    <td className="ef-squad__td ef-squad__td--cond">
                                        {renderConditionBar(p.energy)}
                                    </td>
                                    <td className="ef-squad__td">
                                        <div className="ef-squad__mor">
                                            {getMoralIcon(p.moral || 50)}
                                            <span className="ef-mono ef-squad__mor-num">{p.moral || 50}</span>
                                        </div>
                                    </td>
                                    <td className="ef-squad__td">
                                        <div className="ef-squad__flex-center-gap">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); if (!p.injury && !p.suspension) toggleTitular(p.id); }}
                                                disabled={!!p.injury || !!p.suspension}
                                                className={`ef-squad__action-pill${(p.injury || p.suspension) ? ' ef-squad__action-pill--blocked' : ''}${isSelected ? ' ef-squad__action-pill--active' : ''}`}
                                            >
                                                {(p.injury || p.suspension) ? 'BLOQ.' : (isSelected ? 'TIT.' : 'ESCALAR')}
                                            </button>
                                            {!p.isTitular && !p.injury && p.age <= 23 && (
                                                <button onClick={(e) => { e.stopPropagation(); handleLoan(p.id); }} className="ef-icon-btn ef-icon-btn--info">
                                                    <PaperPlaneRight size={16} weight="bold" />
                                                </button>
                                            )}
                                            {!p.isTitular && (
                                                <button onClick={(e) => { e.stopPropagation(); handleSell(p); }} className="ef-icon-btn ef-icon-btn--danger">
                                                    <UserMinus size={16} weight="bold" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); electStarPlayer(engine, engine.starPlayerId === p.id ? null : p.id); forceUpdate(); }}
                                                className={engine.starPlayerId === p.id ? 'ef-icon-btn ef-icon-btn--accent' : 'ef-icon-btn'}
                                            >
                                                <Star size={16} weight={engine.starPlayerId === p.id ? 'fill' : 'regular'} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {expandedId === p.id && (
                                    <tr key={`${p.id}-details`} className="ef-squad__details-row">
                                        <td colSpan="7" className="ef-squad__details-cell">
                                            <div className="ef-squad__details-flex">
                                                <div className="ef-squad__details-box">
                                                    <HexagonChart player={p} size={180} />
                                                </div>
                                                <div className="ef-squad__details-col">
                                                    <div className="ef-sans ef-text-main ef-squad__detail-name">
                                                        {p.name}
                                                    </div>
                                                    <div className="ef-mono ef-text-muted ef-squad__detail-meta">
                                                        {p.personality && (
                                                            <div>
                                                                <Heartbeat weight="fill" /> {p.personality} • {p.playstyle || 'Caneleiro'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="ef-mono ef-squad__detail-stats-row">
                                                        <div className="ef-squad__detail-stat ef-squad__detail-stat--primary">
                                                            <div className="ef-text-muted ef-squad__detail-stat-label">OVR / POT</div>
                                                            <div className="ef-text-main ef-squad__detail-stat-value">{p.ovr} <span className="ef-squad__detail-stat-sep">/</span> <span className={p.potential > p.ovr + 5 ? 'ef-text-primary' : 'ef-text-muted'}>{p.potential || p.ovr}</span></div>
                                                        </div>
                                                        <div className="ef-squad__detail-stat ef-squad__detail-stat--accent">
                                                            <div className="ef-text-muted ef-squad__detail-stat-label">VALOR DE MERCADO</div>
                                                            <div className="ef-text-accent ef-squad__detail-stat-value">R$ {((p.marketValue || p.value) / 1e6).toFixed(1)}M</div>
                                                        </div>
                                                        <div className="ef-squad__detail-stat ef-squad__detail-stat--info">
                                                            <div className="ef-text-muted ef-squad__detail-stat-label">RATING (POS)</div>
                                                            <div className="ef-text-info ef-squad__detail-stat-value">{(p.attributes || p.attacking) ? calculateRatingForPosition(p, p.naturalPosition || 'MEC') : p.ovr}</div>
                                                        </div>
                                                    </div>
                                                    {p.personality && (
                                                        <div className="ef-sans ef-squad__badge-wrap">
                                                            <Heartbeat weight="fill" /> PERFIL: {p.personality}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <PlayerAttributesGrid player={p} />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </EfPanel>
    );
}
