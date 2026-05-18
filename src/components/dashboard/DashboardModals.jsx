import { MicrophoneStage } from '@phosphor-icons/react';
import { EfModal } from '../ui/EfModal';
import { EfButton } from '../ui/EfButton';
import { UnlockTooltip, AchievementPopup } from '../ProgressiveDisclosure';
import { TutorialOverlay } from '../GDDSystems';

export function DashboardModals({
    engine,
    setLog,
    forceUpdate,
    pendingUnlock,
    setPendingUnlock,
    pendingAchievement,
    setPendingAchievement,
    showTutorial,
    setShowTutorial,
    advicePanel,
    setAdvicePanel,
    pacingQueue,
    setPacingQueue,
    setTab,
    changeView
}) {
    return (
        <>
            {engine.pressQuestion && (
                <EfModal title={<><MicrophoneStage size={18} className="ef-dashboard-press-icon" /> Coletiva de Imprensa</>} onClose={() => {}}>
                    <p className="ef-dashboard-press-question">{engine.pressQuestion.text}</p>
                    <div className="ef-dashboard-press-options">
                        {engine.pressQuestion.options.map((opt) => (
                            <EfButton key={opt.id} variant="secondary" size="md" onClick={() => { const result = engine.answerPress(opt.id); if (result) setLog(`Coletiva: ${result.answer}`); forceUpdate(); }} className="ef-dashboard-press-opt-btn">
                                {opt.text}
                            </EfButton>
                        ))}
                    </div>
                </EfModal>
            )}

            {pendingUnlock && <UnlockTooltip viewId={pendingUnlock} onDismiss={() => setPendingUnlock(null)} />}
            {pendingAchievement && <AchievementPopup achievement={pendingAchievement} onDismiss={() => setPendingAchievement(null)} />}
            <TutorialOverlay visible={showTutorial} onDismiss={() => setShowTutorial(false)} />

            {/* SPEC-167: Auxiliar advice modal */}
            {advicePanel.open && (
                <EfModal title="Conselho do Auxiliar" onClose={() => setAdvicePanel({ open: false, loading: false, text: '' })}>
                    <div className="ef-dashboard-advice-panel">
                        {advicePanel.loading
                            ? (
                                <div className="ef-dashboard-skeleton-wrapper">
                                    <div className="ef-skeleton-line ef-w-90"></div>
                                    <div className="ef-skeleton-line ef-w-75"></div>
                                    <div className="ef-skeleton-line ef-w-85"></div>
                                </div>
                              )
                            : <p className="ef-dashboard-advice-panel__text">{advicePanel.text}</p>
                        }
                    </div>
                    <EfButton variant="primary" size="md" onClick={() => setAdvicePanel({ open: false, loading: false, text: '' })}>
                        FECHAR
                    </EfButton>
                </EfModal>
            )}

            {/* AUDIT-FIX #17: Pacing Friction Modal */}
            {pacingQueue.length > 0 && (() => {
                const evt = pacingQueue[0];
                const severityClass = { critical: 'ef-dashboard-pacing__alert--critical', warning: 'ef-dashboard-pacing__alert--warning', info: 'ef-dashboard-pacing__alert--info' }[evt.severity] || 'ef-dashboard-pacing__alert--info';
                return (
                    <EfModal title={evt.title} onClose={() => {}}>
                        <div className={`ef-dashboard-pacing__alert ${severityClass}`}>
                            <p className="ef-dashboard-pacing__body">{evt.body}</p>
                        </div>
                        <div className="ef-dashboard-pacing__buttons">
                            {evt.action && (
                                <EfButton variant="primary" size="md" onClick={() => {
                                    setPacingQueue([]);
                                    if (evt.action === 'tactics') setTab('tactics');
                                    else changeView(evt.action);
                                }}>
                                    RESOLVER AGORA
                                </EfButton>
                            )}
                            <EfButton variant="secondary" size="md" onClick={() => {
                                const rest = pacingQueue.slice(1);
                                if (rest.length > 0) {
                                    setPacingQueue(rest);
                                } else {
                                    setPacingQueue([]);
                                    engine.checkPressConference();
                                    if (!engine.pressQuestion) changeView('match'); else forceUpdate();
                                }
                            }}>
                                {pacingQueue.length > 1 ? 'PRÓXIMO ALERTA' : 'ENTENDIDO — JOGAR'}
                            </EfButton>
                        </div>
                    </EfModal>
                );
            })()}
        </>
    );
}

export default DashboardModals;
