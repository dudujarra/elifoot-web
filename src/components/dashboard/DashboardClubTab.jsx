import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { Building, GraduationCap, Users, Binoculars } from '@phosphor-icons/react';
import { STAFF_ROLES, SCOUT_REGIONS } from '../../engine/StadiumSystem';

export function DashboardClubTab({ engine, stadiumInfo, forceUpdate, setLog }) {
    return (
        <div className="ef-dashboard-club-grid">
            <div className="ef-dashboard-club__left">
                <EfPanel padding="md" className="ef-dashboard-club__panel">
                    <div className="ef-panel-section-label ef-panel-section-label--strong"><Building weight="fill" /> {stadiumInfo.name}</div>
                    <div className="ef-dashboard-club-facility__info">Cap: {stadiumInfo.capacity.toLocaleString()} • R$ {stadiumInfo.ticketPrice}/ingresso</div>
                    <div className="ef-progress ef-progress--sm ef-dashboard-progress--mb">
                        <div
                            className={`ef-progress__fill ef-progress__fill--info w-${Math.round((engine.stadiumLevel / 5) * 100)}`} />
                    </div>
                    <div className="ef-dashboard-club-facility__actions">
                        <span className="ef-dashboard-club-facility__level">NÍVEL {engine.stadiumLevel}/5</span>
                        {engine.stadiumLevel < 5 && (
                            <EfButton variant="primary" size="sm" title="Aumenta capacidade do estádio (mais bilheteria por jogo). Consome do caixa." onClick={() => { const r = engine.upgradeStadium(); setLog(r.msg); forceUpdate(); }}>UPGRADE</EfButton>
                        )}
                    </div>
                </EfPanel>

                <EfPanel padding="md" className="ef-dashboard-club__panel">
                    <div className="ef-panel-section-label ef-panel-section-label--strong"><GraduationCap weight="fill" /> BASE Nv.{engine.academyLevel}</div>
                    <div className="ef-dashboard-club-facility__info">Produz {engine.academyLevel + 1} jovens/temporada</div>
                    <div className="ef-progress ef-progress--sm ef-dashboard-progress--mb">
                        <div
                            className={`ef-progress__fill ef-progress__fill--accent w-${Math.round((engine.academyLevel / 5) * 100)}`} />
                    </div>
                    <div className="ef-dashboard-club-facility__actions">
                        <span className="ef-dashboard-club-facility__level">NÍVEL {engine.academyLevel}/5</span>
                        {engine.academyLevel < 5 && (
                            <EfButton variant="primary" size="sm" title="Melhora a base — produz mais e melhores jovens por temporada. Consome do caixa." onClick={() => { const r = engine.upgradeAcademy(); setLog(r.msg); forceUpdate(); }}>UPGRADE</EfButton>
                        )}
                    </div>
                </EfPanel>
            </div>
            <div className="ef-dashboard-club__right">
                <EfPanel padding="md" className="ef-dashboard-club__panel">
                    <div className="ef-panel-section-label ef-panel-section-label--strong"><Users weight="fill" /> STAFF</div>
                    <table className="ef-dashboard-club-staff__table">
                        <tbody>
                            {STAFF_ROLES.map((role) => {
                                const member = engine.staff?.getStaff(role.id);
                                return (
                                    <tr key={role.id} className="ef-dashboard-club-staff__row">
                                        <td className="ef-dashboard-club-staff__label">{role.name}</td>
                                        <td className="ef-dashboard-club-staff__value">
                                            {member ? <strong className="ef-dashboard-club-staff__name">{member.name}</strong> : <EfButton variant="secondary" size="sm" title={`Contrata ${role.name} (paga salário semanal; ativa o bônus do cargo)`} onClick={() => { const r = engine.hireStaff(role.id); setLog(r.msg); forceUpdate(); }}>Contratar</EfButton>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </EfPanel>

                <EfPanel padding="md" className="ef-dashboard-club__panel">
                    <div className="ef-panel-section-label ef-panel-section-label--strong"><Binoculars weight="fill" /> SCOUTING</div>
                    <div className="ef-dashboard-club-scouting__regions">
                        {SCOUT_REGIONS.map((r) => (
                            <EfButton key={r.id} variant="secondary" size="sm" onClick={() => { const res = engine.scoutRegionAction(r.id); setLog(res.msg); forceUpdate(); }}>
                                {r.name}
                            </EfButton>
                        ))}
                    </div>
                    {engine.scoutedPlayers?.length > 0 && (
                        <table className="ef-dashboard-club-scouting__table">
                            <tbody>
                                {engine.scoutedPlayers.map((p, i) => (
                                    <tr key={i} className="ef-dashboard-club-scouting__row">
                                        <td className="ef-dashboard-club-scouting__player">{p.name} <span className="ef-dashboard-club-scouting__meta">({p.position}, OVR {p.ovr})</span></td>
                                        <td className="ef-dashboard-club-scouting__actions"><EfButton variant="primary" size="sm" onClick={() => { const r = engine.signScoutedPlayer(i); setLog(r?.msg); forceUpdate(); }}>Assinar</EfButton></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </EfPanel>
            </div>
        </div>
    );
}
