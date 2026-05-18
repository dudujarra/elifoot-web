
import { Heartbeat, Newspaper, Lightning, Envelope } from '@phosphor-icons/react';
import { EfPanel } from '../ui/EfPanel';

export function DashboardAlerts({ injured, expiringContracts, avgEnergy, engine, setTab }) {
    if (injured.length === 0 && expiringContracts.length === 0 && avgEnergy >= 50 && (engine.transferOffers?.length ?? 0) === 0) {
        return null;
    }

    return (
        <div className="ef-dashboard-alerts">
            {injured.length > 0 && (
                <EfPanel padding="sm" className="ef-dashboard-alert ef-dashboard-alert--injury">
                    <Heartbeat color="var(--danger)" weight="fill" />
                    <span className="ef-dashboard-alert__text ef-dashboard-alert__text--danger">
                        {injured.length} LESIONADO{injured.length > 1 ? 'S' : ''}
                    </span>
                </EfPanel>
            )}
            {expiringContracts.length > 0 && (
                <EfPanel padding="sm" className="ef-dashboard-alert ef-dashboard-alert--contract">
                    <Newspaper color="var(--accent)" weight="fill" />
                    <span className="ef-dashboard-alert__text ef-dashboard-alert__text--secondary">
                        {expiringContracts.length} CONTRATO{expiringContracts.length > 1 ? 'S' : ''}
                    </span>
                </EfPanel>
            )}
            {avgEnergy < 50 && (
                <EfPanel padding="sm" className="ef-dashboard-alert ef-dashboard-alert--energy">
                    <Lightning color="var(--danger)" weight="fill" />
                    <span className="ef-dashboard-alert__text ef-dashboard-alert__text--danger">
                        CANSADO ({avgEnergy.toFixed(0)}%)
                    </span>
                </EfPanel>
            )}
            {(engine.transferOffers?.length ?? 0) > 0 && (
                <EfPanel padding="sm" className="ef-dashboard-alert ef-dashboard-alert--transfer ef-dashboard-alert--clickable" onClick={() => setTab('transfers')}>
                    <Envelope color="var(--info)" weight="fill" />
                    <span className="ef-dashboard-alert__text ef-dashboard-alert__text--info">
                        {(engine.transferOffers?.length ?? 0)} OFERTA{(engine.transferOffers?.length ?? 0) > 1 ? 'S' : ''}
                    </span>
                </EfPanel>
            )}
        </div>
    );
}
