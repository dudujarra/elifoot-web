import { EfPanel } from '../ui/EfPanel';
import { EfButton } from '../ui/EfButton';
import { TRAINING_TYPES } from '../../engine/ManagerSystems';

export function DashboardTrainingTab({ engine, handleTrain }) {
    return (
        <EfPanel padding="lg">
            <div className="ef-dashboard-training__title">TREINO SEMANAL</div>
            <div className="ef-dashboard-training__grid">
                {TRAINING_TYPES.map((t) => (
                    <EfButton key={t.id} variant={engine.currentTraining === t.id ? 'primary' : 'secondary'} size="lg" title={`Treino ${t.name}: ${t.description} (drena energia do plantel)`} className="ef-dashboard-training-btn" onClick={() => handleTrain(t.id)}>
                        <span className="ef-dashboard-training-btn__name">{t.name}</span>
                        <span className={`ef-dashboard-training-btn__desc ${engine.currentTraining === t.id ? 'ef-dashboard-training-btn__desc--active' : ''}`}>{t.description}</span>
                    </EfButton>
                ))}
            </div>
        </EfPanel>
    );
}
