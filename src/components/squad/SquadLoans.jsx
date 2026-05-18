import { PaperPlaneRight } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';

export function SquadLoans({ loanedOut }) {
    if (!loanedOut || loanedOut.length === 0) return null;
    return (
        <EfPanel padding="md" className="ef-squad__warning-panel">
            <div className="ef-squad__h3-accent">
                <PaperPlaneRight size={24} color="var(--accent)" weight="fill" />
                <h3 className="ef-squad__h3-accent">JOGADORES EMPRESTADOS ({loanedOut.length})</h3>
            </div>
            <div className="ef-squad__grid-lg">
                {loanedOut.map((l, i) => (
                    <div key={i} className="ef-squad__loan-card">
                        <div className="ef-sans ef-text-main ef-squad__loan-name">
                            {l.playerName} <span className="ef-text-muted ef-squad__loan-dest">→ {l.destination}</span>
                        </div>
                        <div className="ef-mono ef-text-accent ef-squad__loan-timer">
                            {l.weeksLeft}/{l.totalWeeks} sem
                        </div>
                    </div>
                ))}
            </div>
        </EfPanel>
    );
}
