/**
 * AutoPlaySetup — Setup panel extracted from AutoPlayView
 * Configures zone, division, team, scenario, difficulty before starting soak test.
 */
import { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { RealDB } from '../../engine/db/index';
import { DIFFICULTY_MODES, getDifficulty, setDifficulty } from '../../engine/systems/DifficultyModes';
import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { Robot, TrendDown, Lightning } from '@phosphor-icons/react';

export default function AutoPlaySetup() {
    const { startGame, changeView } = useGame();
    const [setupTeamId, setSetupTeamId] = useState('');
    const [setupZone, setSetupZone] = useState('BRA');
    const [setupDiv, setSetupDiv] = useState(4);
    const [setupScenario, setSetupScenario] = useState('fallen');
    const [setupDifficultyId, setSetupDifficultyId] = useState(getDifficulty().id);

    const allTeams = useMemo(() => {
        const result = [];
        let id = 1;
        for (const zone of Object.keys(RealDB)) {
            for (const div of Object.keys(RealDB[zone])) {
                RealDB[zone][div].forEach(club => {
                    result.push({ id: id++, name: club.name, zone, div: parseInt(div) });
                });
            }
        }
        return result;
    }, []);

    const zones = [...new Set(allTeams.map(t => t.zone))].sort();
    const filteredTeams = allTeams.filter(t => t.zone === setupZone && t.div === setupDiv);

    const handleSetupStart = () => {
        if (!setupTeamId) return;
        try {
            if (typeof localStorage !== 'undefined') {
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('olefut_')) localStorage.removeItem(k);
                }
            }
        } catch { /* ignore */ }
        setDifficulty(setupDifficultyId);
        startGame('AutoPlayBot', parseInt(setupTeamId), setupScenario, 'manager', 'ATA', 'maverick');
        setTimeout(() => changeView('autoplay'), 100);
    };

    return (
        <div className="ef-anim-fade-in ef-scene-shell ef-ap">
            <div className="ef-ap__container-sm">
                <EfPanel variant="elev" padding="md" className="ef-ap__header-flex">
                    <h2 className="ef-arcade-h ef-arcade-h--xxl">
                        <Robot size={22} weight="fill" className="ef-icon-inline-lg" />
                        AUTOPLAY SETUP
                    </h2>
                    <EfButton variant="secondary" size="sm" onClick={() => changeView('start')}>← VOLTAR</EfButton>
                </EfPanel>
                <EfPanel variant="elev" padding="md">
                    <p className="ef-ap__setup-info">Configure o bot antes de iniciar o soak test.</p>

                    <label className="ef-ap__field-label">ZONA</label>
                    <div className="ef-ap__chip-row-wrap">
                        {zones.map(z => (
                            <EfButton key={z} variant={setupZone === z ? 'primary' : 'secondary'}
                                onClick={() => { setSetupZone(z); setSetupTeamId(''); }}
                                className="ef-ap__setup-zone-btn">{z}</EfButton>
                        ))}
                    </div>

                    <label className="ef-ap__field-label">DIVISÃO</label>
                    <div className="ef-ap__chip-row">
                        {[1, 2, 3, 4].map(d => (
                            <EfButton key={d} variant={setupDiv === d ? 'primary' : 'secondary'}
                                onClick={() => { setSetupDiv(d); setSetupTeamId(''); }}
                                className="ef-ap__chip-input">Div {d}</EfButton>
                        ))}
                    </div>

                    <label className="ef-ap__field-label">TIME ({filteredTeams.length} disponíveis)</label>
                    <select value={setupTeamId} onChange={e => setSetupTeamId(e.target.value)} className="ef-ap__setup-select">
                        <option value="">Selecione o time...</option>
                        {filteredTeams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    <label className="ef-ap__field-label">CENÁRIO</label>
                    <div className="ef-ap__chip-row">
                        <EfButton variant={setupScenario === 'livre' ? 'primary' : 'secondary'}
                            onClick={() => setSetupScenario('livre')} className="ef-ap__chip-input">Livre</EfButton>
                        <EfButton variant={setupScenario === 'fallen' ? 'primary' : 'secondary'}
                            onClick={() => setSetupScenario('fallen')} className="ef-ap__chip-input">
                            <TrendDown size={14} weight="bold" className="ef-icon-inline" />Gigante Caído
                        </EfButton>
                    </div>

                    <label className="ef-ap__field-label">DIFICULDADE</label>
                    <div className="ef-ap__chip-row-wrap ef-ap__chip-row-wrap--mb-1">
                        {Object.values(DIFFICULTY_MODES).map(d => (
                            <EfButton key={d.id} variant={setupDifficultyId === d.id ? 'primary' : 'secondary'}
                                onClick={() => setSetupDifficultyId(d.id)} className="ef-ap__setup-diff-btn"
                                title={d.description}>{d.emoji} {d.name}</EfButton>
                        ))}
                    </div>

                    <EfButton variant="primary" onClick={handleSetupStart} disabled={!setupTeamId} className="ef-ap__setup-submit">
                        <Lightning size={16} weight="fill" className="ef-icon-inline-md" />INICIAR AUTOPLAY
                    </EfButton>
                </EfPanel>
            </div>
        </div>
    );
}
