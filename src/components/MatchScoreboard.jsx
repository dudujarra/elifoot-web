/* eslint-disable no-restricted-syntax -- dynamic border/bg colors from props require CSS vars */
/**
 * MatchScoreboard — extracted from MatchView (AKITA-319 F1.4 partial split)
 *
 * Pure presentational. Recebe state via props. Sem hooks próprios.
 *
 * Extraído pra reduzir LOC de MatchView (god-view) e isolar componente reutilizável.
 */

import { EfPanel, EfClubBadge } from './ui';
import '../styles/match-scoreboard.css';

export function MatchScoreboard({
    half,
    result,
    runningScore,
    currentMinute,
    isPlaying,
    goalBurstActive,
    colors,
}) {
    if (!result) return null;
    return (
        <EfPanel padding="md" className="ef-scoreboard" style={{ '--scoreboard-border': colors.border, '--scoreboard-bg': colors.bg }}>
            {goalBurstActive && (
                <div className="ef-scoreboard__burst" />
            )}

            <div className="ef-sans ef-text-accent ef-scoreboard__header">
                <div className="ef-scoreboard__label ef-scoreboard__label--home">MANDANTE</div>
                <div className="ef-mono ef-text-primary ef-scoreboard__half-badge">
                    {half}
                </div>
                <div className="ef-scoreboard__label ef-scoreboard__label--away">VISITANTE</div>
            </div>

            <div className="ef-scoreboard__body">
                <div className="ef-scoreboard__team">
                    <EfClubBadge name={result.home} size="xl" />
                    <span className="ef-sans ef-text-main ef-scoreboard__team-name">{result.home}</span>
                </div>

                <div className="ef-scoreboard__center">
                    <div className="ef-score-box">
                        <div className="ef-score-box__num">{runningScore.home}</div>
                        <div className="ef-score-box__sep">-</div>
                        <div className="ef-score-box__num">{runningScore.away}</div>
                    </div>

                    <div className="ef-clock">
                        <span className={`ef-clock__time${isPlaying ? ' ef-clock__time--playing' : ''}`}>
                            {String(currentMinute).padStart(2, '0')}:00
                        </span>
                        {isPlaying && <div className="ef-clock__dot" />}
                    </div>
                </div>

                <div className="ef-scoreboard__team">
                    <EfClubBadge name={result.away} size="xl" />
                    <span className="ef-sans ef-text-main ef-scoreboard__team-name">{result.away}</span>
                </div>
            </div>
        </EfPanel>
    );
}

export default MatchScoreboard;
