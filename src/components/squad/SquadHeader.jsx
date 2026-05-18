import { Users, User } from '@phosphor-icons/react';
import { EfClubBadge } from '../ui/EfClubBadge';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';

export function SquadHeader({ team, loadingReal, handleLoadRealSquad, back, changeView }) {
    return (
        <EfPanel variant="hero" padding="lg" className="ef-squad__header">
            <div className="ef-squad__identity">
                <EfClubBadge name={team.name} size="lg" />
                <div className="ef-squad__identity-col">
                    <h2 className="ef-heading-xl ef-squad__team-name">
                        {team.name?.toUpperCase()}
                    </h2>
                    <div className="ef-squad__capacity">
                        <div className="ef-squad__capacity-track">
                            <div
                                className={`ef-squad__capacity-fill w-${Math.round(Math.min(100, (team.squad.length / 30) * 100))}`} />
                        </div>
                        <span className="ef-squad__capacity-label">
                            <Users weight="fill" /> {team.squad.length}/30 JOGADORES NO PLANTEL
                        </span>
                    </div>
                </div>
            </div>
            <div className="ef-squad__header-right">
                <div className="ef-squad__action-block">
                    <EfButton variant="secondary" size="md" onClick={() => changeView(back)} className="ef-squad__btn-bold">VOLTAR</EfButton>
                    <EfButton variant="primary" size="md" title="Carrega o plantel real do clube" onClick={handleLoadRealSquad} disabled={loadingReal} className="ef-squad__btn-bold">
                        {loadingReal ? 'CARREGANDO...' : 'PLANTEL REAL'}
                    </EfButton>
                </div>
                {team.manager && team.manager.name && (
                    <div className="ef-tag-mono ef-tag-mono--info">
                        <User weight="fill" /> TREINADOR: {team.manager.name.toUpperCase()}
                    </div>
                )}
                {team.manager?.stats && (
                    <div className="ef-squad__manager-stats">
                        {team.manager.stats.wins || 0}V <span>{team.manager.stats.draws || 0}E</span> <span className="ef-text-danger">{team.manager.stats.losses || 0}D</span>
                    </div>
                )}
            </div>
        </EfPanel>
    );
}
