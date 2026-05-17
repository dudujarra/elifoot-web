/**
 * ViewOnboarding — SPEC-F5.1 wire component
 *
 * Reusable que cada view monta no topo. Detecta hasOnboardingPending,
 * renderiza overlay tooltip, marca seen ao fechar.
 */

import { useState, useEffect, useCallback } from 'react';
import { ChatCircle, X, ArrowRight } from '@phosphor-icons/react';
import {
    hasOnboardingPending,
    getOnboardingForView,
    markOnboardingSeen,
} from '../engine/OnboardingTriggers';
import '../styles/view-onboarding.css';

export function ViewOnboarding({ viewId }) {
    const [step, setStep] = useState(0);
    const [shown, setShown] = useState(false);

    // Trigger only on first mount per view
    useEffect(() => {
        if (!viewId) return;
        if (hasOnboardingPending(viewId)) {
            setShown(true);
            setStep(0);
        }
    }, [viewId]);

    const content = getOnboardingForView(viewId);
    const close = useCallback(() => {
        markOnboardingSeen(viewId);
        setShown(false);
    }, [viewId]);

    const next = useCallback(() => {
        if (!content) return close();
        if (step >= content.steps.length - 1) return close();
        setStep(s => s + 1);
    }, [step, content, close]);

    useEffect(() => {
        if (!shown) return;
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [shown, close]);

    if (!shown || !content) return null;

    const currentStep = content.steps[step] || '';
    const isLast = step >= content.steps.length - 1;

    return (
        <div
            role="dialog"
            aria-label={`Tutorial ${content.title}`}
            className="ef-onboarding"
        >
            <div className="ef-onboarding__header">
                <ChatCircle size={14} color="var(--info)" weight="fill" />
                <span className="ef-onboarding__title">
                    {content.title}
                </span>
                <button
                    type="button"
                    onClick={close}
                    aria-label="Fechar tutorial"
                    className="ef-onboarding__close"
                >
                    <X size={10} weight="bold" />
                </button>
            </div>
            <p className="ef-onboarding__body">
                {currentStep}
            </p>
            <div className="ef-onboarding__footer">
                <span className="ef-onboarding__step-counter">
                    {step + 1}/{content.steps.length}
                </span>
                <button
                    type="button"
                    onClick={next}
                    className="ef-onboarding__next-btn"
                >
                    {isLast ? 'ENTENDI' : 'PRÓXIMA'}
                    {!isLast && <ArrowRight size={10} weight="bold" />}
                </button>
            </div>
        </div>
    );
}

export default ViewOnboarding;
