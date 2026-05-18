import { EfModal } from '../ui/EfModal';
import { EfButton } from '../ui/EfButton';

export function PlayerDashboardModals({ 
    offPitchEvent, 
    setOffPitchEvent, 
    handleOffPitchChoice, 
    mentalBreakModal, 
    _setMentalBreakModal, 
    player, 
    handleMentalBreak 
}) {
    return (
        <>
            {offPitchEvent && (
                <EfModal title="Evento da Semana" onClose={() => setOffPitchEvent(null)}>
                    <p className="ef-sans ef-player-dashboard__modal-body">{offPitchEvent.text}</p>
                    <div className="ef-player-dashboard__modal-stack">
                        {offPitchEvent.options.map((opt, i) => (
                            <EfButton key={i} variant="secondary" onClick={() => handleOffPitchChoice(opt)} className="ef-sans ef-player-dashboard__modal-option-btn">{opt.label}</EfButton>
                        ))}
                    </div>
                </EfModal>
            )}

            {mentalBreakModal && (
                <EfModal title="CRISE MENTAL" onClose={() => {}}>
                    <p className="ef-sans ef-text-danger ef-player-dashboard__break-title">Stress em {player.stress}%</p>
                    <p className="ef-sans ef-player-dashboard__break-desc">Você não aguenta mais a pressão. Precisa de uma válvula de escape.</p>
                    <div className="ef-player-dashboard__modal-stack">
                        <EfButton variant="secondary" onClick={() => handleMentalBreak('party')} className="ef-player-dashboard__break-option">Sair pra festa (Stress -40, Treinador -10)</EfButton>
                        <EfButton variant="secondary" onClick={() => handleMentalBreak('isolation')} className="ef-player-dashboard__break-option">Isolamento total (Stress -30, Time -8)</EfButton>
                        <EfButton variant="secondary" onClick={() => handleMentalBreak('therapy')} className="ef-player-dashboard__break-option">Terapia R$2000 (Stress -20)</EfButton>
                    </div>
                </EfModal>
            )}
        </>
    );
}
