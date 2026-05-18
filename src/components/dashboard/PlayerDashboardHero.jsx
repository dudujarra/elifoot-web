import React from 'react';
import { SoccerBall } from '@phosphor-icons/react';
import { EfClubBadge } from '../ui';

export function PlayerDashboardHero({ player, team, engine, pers, positionWatermark, starStr, ovr }) {
    return (
        <section className="ef-player-dashboard__hero">
            <div className="ef-player-dashboard__hero-watermark" aria-hidden>{positionWatermark}</div>

            <div className="ef-player-dashboard__portrait">
                {team?.name && <EfClubBadge name={team.name} size="lg" />}
            </div>

            <div className="ef-player-dashboard__hero-body">
                <div className="ef-player-dashboard__profile-tag ef-mono">
                    <span aria-hidden>{pers.emoji}</span> PLAYER PROFILE • {pers.name.toUpperCase()}
                </div>
                <h1 className="ef-player-dashboard__player-name ef-heading-xl">{player.name}</h1>
                <div className="ef-player-dashboard__player-stars">
                    {starStr.map((s, i) => <React.Fragment key={i}>{s}</React.Fragment>)}
                </div>

                <div className="ef-player-dashboard__info-cells">
                    <div className="ef-player-dashboard__info-cell">
                        <p className="ef-player-dashboard__info-label ef-mono ef-text-muted">CLUB</p>
                        <p className="ef-player-dashboard__info-value ef-mono">{team.name}</p>
                    </div>
                    <div className="ef-player-dashboard__info-cell">
                        <p className="ef-player-dashboard__info-label ef-mono ef-text-muted">AGE</p>
                        <p className="ef-player-dashboard__info-value ef-mono">{player.age} ANOS</p>
                    </div>
                    <div className="ef-player-dashboard__info-cell">
                        <p className="ef-player-dashboard__info-label ef-mono ef-text-muted">POSITION</p>
                        <p className="ef-player-dashboard__info-value ef-mono">{player.position}</p>
                    </div>
                    <div className="ef-player-dashboard__info-cell ef-player-dashboard__info-cell--trophy">
                        <p className="ef-player-dashboard__info-label ef-mono ef-text-muted">OVERALL</p>
                        <p className="ef-player-dashboard__info-value ef-player-dashboard__info-value--trophy ef-mono">{ovr} OVR</p>
                    </div>
                </div>
            </div>

            <div className="ef-player-dashboard__hero-meta">
                <div className="ef-player-dashboard__money ef-mono">
                    R$ {(player.money).toLocaleString('pt-BR')}
                </div>
                <div className="ef-tag-mono ef-tag-mono--accent">
                    <SoccerBall weight="fill" /> {player.seasonGoals} GOLS
                </div>
                <div className="ef-player-dashboard__action-slots">
                    <div className="ef-player-dashboard__action-slots-label ef-mono">
                        <span>SEM {engine.currentWeek}/38</span>
                        <span>AÇÕES</span>
                    </div>
                    <div className="ef-player-dashboard__action-slots-bar">
                        {Array.from({ length: player.maxActionSlots }).map((_, i) => (
                            <div key={i} className={`ef-action-slot${i < player.actionSlots ? ' ef-action-slot--filled' : ''}`} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
