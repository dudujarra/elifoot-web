
import { SoccerBall } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function DashboardHeroMatch({ team, nextOpponentName, stadiumLabel, engine, setPacingQueue, changeView, forceUpdate }) {
    return (
        <EfPanel variant="hero" padding="lg" className="ef-dashboard-hero-match">
            <div className="ef-dashboard-hero-match__tag">PRÓXIMO JOGO</div>
            <div className="ef-dashboard-hero-match__body">
                <div className="ef-dashboard-hero-match__teams">
                    <div className="ef-dashboard-hero-match__team">
                        <div className="ef-dashboard-hero-match__crest ef-dashboard-hero-match__crest--home">
                            <span className="ef-dashboard-hero-match__crest-letter">{(team.name?.[0] || 'F').toUpperCase()}</span>
                        </div>
                        <p className="ef-dashboard-hero-match__team-name">{team.name?.toUpperCase()}</p>
                    </div>
                    <div className="ef-dashboard-hero-match__vs">VS</div>
                    <div className="ef-dashboard-hero-match__team">
                        <div className="ef-dashboard-hero-match__crest ef-dashboard-hero-match__crest--away">
                            <span className="ef-dashboard-hero-match__crest-letter">{(nextOpponentName[0] || '?').toUpperCase()}</span>
                        </div>
                        <p className="ef-dashboard-hero-match__team-name">{String(nextOpponentName).toUpperCase()}</p>
                    </div>
                </div>
                <div className="ef-dashboard-hero-match__meta">
                    <div className="ef-dashboard-hero-match__info-box">
                        <p className="ef-dashboard-hero-match__info-label">ESTÁDIO: {stadiumLabel}</p>
                        <p className="ef-dashboard-hero-match__info-value">FORMAÇÃO: {team.formation}</p>
                    </div>
                    <EfButton
                        variant="primary"
                        size="lg"
                        className="ef-dashboard-hero-match__cta"
                        onClick={() => {
                            const events = engine.getPacingEvents?.() || [];
                            if (events.length > 0) {
                                setPacingQueue(events);
                            } else {
                                engine.checkPressConference();
                                if (!engine.pressQuestion) changeView('match'); else forceUpdate();
                            }
                        }}
                    >
                        <SoccerBall weight="fill" /> ESCALAR E JOGAR
                    </EfButton>
                </div>
            </div>
        </EfPanel>
    );
}
