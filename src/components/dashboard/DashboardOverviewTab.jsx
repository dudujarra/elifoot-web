import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { ScarcityBanner, DreadIndicator } from '../GDDSystems';
import { AhaMomentCard } from '../ProgressiveDisclosure';
import { Wallet, Newspaper, Bank, WarningCircle, ChartLineUp, Lightbulb } from '@phosphor-icons/react';

export function DashboardOverviewTab({ engine, team, seasonWeek, forceUpdate }) {
    const stats = engine.managerStats;

    return (
        <div className="ef-dashboard-overview">
            {seasonWeek <= 2 && engine.seasonNumber === 1 && (
                <div className="ef-bento-playbook">
                    <EfPanel padding="md" className="ef-dashboard-playbook">
                        <div className="ef-dashboard-playbook__title"><Lightbulb weight="fill" /> PLAYBOOK DO TREINADOR</div>
                        <div className="ef-dashboard-playbook__content">
                            <p><strong>1.</strong> <strong>Táticas:</strong> escolha formação e tática antes de jogar</p>
                            <p><strong>2.</strong> <strong>Treino:</strong> treine o plantel toda semana para melhorar atributos</p>
                            <p><strong>3.</strong> <strong>Plantel:</strong> escale seus melhores 11 e monitore energia</p>
                            <p><strong>4.</strong> <strong>Clube:</strong> upgrade estádio e base para crescer</p>
                            <p><strong>5.</strong> <strong>Jogo:</strong> no intervalo, ajuste tática e faça substituições</p>
                        </div>
                    </EfPanel>
                </div>
            )}
            <div className="ef-bento-scarcity"><ScarcityBanner engine={engine} /></div>
            <div className="ef-bento-dread"><DreadIndicator engine={engine} /></div>
            <div className="ef-bento-ahamoment"><AhaMomentCard engine={engine} /></div>
            <div className="ef-bento-finance">
                <EfPanel padding="md">
                    <div className="ef-panel-section-label"><Wallet weight="fill" /> FINANÇAS</div>
                    {engine.weeklyFinance ? (
                        <table className="ef-dashboard-finance__table">
                            <tbody>
                                {engine.weeklyFinance.details.map((d, i) => (
                                    <tr key={i} className="ef-dashboard-finance__row">
                                        <td className="ef-dashboard-finance__label">{d.label}</td>
                                        <td className={`ef-dashboard-finance__value ${d.type === 'income' ? 'ef-dashboard-finance__value--income' : 'ef-dashboard-finance__value--expense'}`}>
                                            {d.type === 'income' ? '+' : '-'}R$ {(d.amount / 1000).toFixed(0)}K
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="ef-dashboard-finance__empty">Jogue a próxima partida para ver o relatório.</p>}
                </EfPanel>
            </div>
            {(engine.weekEvents?.length ?? 0) > 0 && (
                <div className="ef-bento-events">
                    <EfPanel padding="md">
                        <div className="ef-panel-section-label"><Newspaper weight="fill" /> EVENTOS DA SEMANA</div>
                        <div className="ef-dashboard-events">
                            {(engine.weekEvents || []).map((ev, i) => {
                                const evText = typeof ev === 'string' ? ev : (ev?.text || ev?.msg || '');
                                const isGood = evText.includes('📈') || evText.includes('🎉') || evText.includes('📚') || evText.includes('🇧🇷') || evText.includes('🎂');
                                const isBad = evText.includes('📉') || evText.includes('☠️') || evText.includes('👴') || evText.includes('🕺') || evText.includes('🥊');
                                return (
                                    <div key={i} className={`ef-dashboard-event ${isGood ? 'ef-dashboard-event--good' : isBad ? 'ef-dashboard-event--bad' : 'ef-dashboard-event--neutral'}`}>
                                        {evText}
                                    </div>
                                );
                            })}
                        </div>
                    </EfPanel>
                </div>
            )}
            {engine.activeLoan && (
                <div className="ef-bento-loan">
                    <EfPanel padding="md" className="ef-dashboard-loan">
                        <div className="ef-panel-section-label ef-text-accent"><Bank weight="fill" /> EMPRÉSTIMO ATIVO</div>
                        <table className="ef-dashboard-loan__table">
                            <tbody>
                                <tr className="ef-dashboard-loan__row"><td className="ef-dashboard-loan__label">Principal</td><td className="ef-dashboard-loan__value">R$ {(engine.activeLoan.principal / 1_000_000).toFixed(1)}M</td></tr>
                                <tr className="ef-dashboard-loan__row"><td className="ef-dashboard-loan__label">Parcela</td><td className="ef-dashboard-loan__value ef-dashboard-loan__value--danger">R$ {(engine.activeLoan.weeklyPayment / 1000).toFixed(0)}K</td></tr>
                                <tr className="ef-dashboard-loan__row"><td className="ef-dashboard-loan__label">Restante</td><td className="ef-dashboard-loan__value">{engine.activeLoan.weeksRemaining} sem</td></tr>
                            </tbody>
                        </table>
                        {team.balance >= engine.activeLoan.totalOwed && (
                            <EfButton variant="primary" size="md" className="ef-dashboard-loan__payoff-btn" onClick={() => { engine.payOffLoan(); forceUpdate(); }}>
                                Quitar Antecipadamente
                            </EfButton>
                        )}
                    </EfPanel>
                </div>
            )}
            {typeof engine.boardTension === 'number' && (
                <div className="ef-bento-tension">
                    <EfPanel padding="md" className={`ef-dashboard-board-tension ${engine.boardTension < -20 ? 'ef-dashboard-board-tension--danger' : engine.boardTension > 40 ? 'ef-dashboard-board-tension--stable' : 'ef-dashboard-board-tension--warning'}`}>
                        <div className={`ef-dashboard-board-tension__title ${engine.boardTension < -20 ? 'ef-dashboard-board-tension__title--danger' : engine.boardTension > 40 ? 'ef-dashboard-board-tension__title--stable' : 'ef-dashboard-board-tension__title--warning'}`}><WarningCircle weight="fill" /> TENSÃO DA DIRETORIA</div>
                        <div className="ef-dashboard-board-tension__content">
                            <span className="ef-dashboard-board-tension__status">
                                {engine.boardTension >= 40 ? 'Estável' : engine.boardTension >= 0 ? 'Atenção' : engine.boardTension >= -40 ? 'Pressão' : 'Crise'}
                            </span>
                            <strong className={`ef-dashboard-board-tension__value ${engine.boardTension >= 0 ? 'ef-dashboard-board-tension__value--positive' : 'ef-dashboard-board-tension__value--negative'}`}>
                                {engine.boardTension > 0 ? '+' : ''}{engine.boardTension}
                            </strong>
                        </div>
                        <div className="ef-progress ef-progress--sm ef-dashboard-progress--mt">
                            <div
                                className={`ef-progress__fill ${engine.boardTension >= 0 ? '' : 'ef-progress__fill--danger'} w-${Math.round(Math.max(0, Math.min(100, (engine.boardTension + 100) / 2)))}`} />
                        </div>
                    </EfPanel>
                </div>
            )}
            {stats.rollingForm && stats.rollingForm.length > 0 && (
                <div className="ef-bento-form">
                    <EfPanel padding="md">
                        <div className="ef-panel-section-label"><ChartLineUp weight="fill" /> FORMA RECENTE</div>
                        <div className="ef-dashboard-form-chips">
                            {stats.rollingForm.map((r, i) => (
                                <span key={i} className={`ef-form-chip ef-form-chip--${r.toLowerCase()}`}>{r}</span>
                            ))}
                        </div>
                    </EfPanel>
                </div>
            )}
        </div>
    );
}
