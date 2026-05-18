import { EfPanel } from '../ui/EfPanel';
import { ArrowCircleUp, ArrowCircleDown, MinusCircle } from '@phosphor-icons/react';

export function SquadSummary({ sorted }) {
    const count = sorted.length || 1;
    const sumOvr = sorted.reduce((acc, p) => acc + (p.ovr || 0), 0);
    const sumEnergy = sorted.reduce((acc, p) => acc + (p.energy || 0), 0);
    const sumMoral = sorted.reduce((acc, p) => acc + (p.moral || 50), 0);
    const avgOvr = (sumOvr / count).toFixed(1);
    const avgEnergy = Math.round(sumEnergy / count);
    const avgMoral = Math.round(sumMoral / count);
    const moralLabel = avgMoral > 70 ? 'FORTE' : avgMoral > 40 ? 'NEUTRA' : 'FRACA';
    const MoralIcon = avgMoral > 70 ? ArrowCircleUp : avgMoral > 40 ? MinusCircle : ArrowCircleDown;
    const moralCls = avgMoral > 70 ? 'ef-text-primary' : avgMoral > 40 ? 'ef-text-muted' : 'ef-text-danger';

    return (
        <EfPanel padding="md" className="ef-squad__summary">
            <div className="ef-squad__summary-cell">
                <span className="ef-squad__summary-label">MÉDIA OVR</span>
                <span className="ef-squad__summary-value ef-text-accent">{avgOvr}</span>
            </div>
            <div className="ef-squad__summary-cell">
                <span className="ef-squad__summary-label">COND. MÉDIA</span>
                <div className="ef-squad__summary-cond">
                    <span className="ef-squad__summary-value ef-text-primary">{avgEnergy}%</span>
                    <div className="ef-squad__summary-bar">
                        <div className={`ef-squad__summary-bar-fill w-${Math.round(avgEnergy)}`} />
                    </div>
                </div>
            </div>
            <div className="ef-squad__summary-cell">
                <span className="ef-squad__summary-label">MORAL EQUIPE</span>
                <div className={`ef-squad__summary-moral ${moralCls}`}>
                    <MoralIcon weight="fill" size={20} />
                    <span className="ef-squad__summary-value">{moralLabel}</span>
                </div>
            </div>
        </EfPanel>
    );
}
