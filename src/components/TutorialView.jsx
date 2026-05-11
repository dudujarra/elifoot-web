/**
 * TutorialView — SPEC-072
 *
 * Onboarding 5 steps. Skip allowed. Resume via Help.
 * State persisted in localStorage 'elifoot_tutorial_done'.
 */

import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { EfPanel } from './ui/EfPanel';
import { EfButton } from './ui/EfButton';
import bgTutorial from '../assets/environments/bg_tutorial.png';
import { 
    SoccerBall, ChartBar, Strategy, Television, Medal, 
    ArrowRight, ArrowLeft, FastForward
} from '@phosphor-icons/react';

const STEPS = [
    {
        title: 'BEM-VINDO AO OLÉ FUT',
        body: 'Você é o manager do seu clube brasileiro favorito. Conduza sua equipe da Série D ao topo do mundo. Decisões táticas, transferências e gestão financeira — tudo em suas mãos.',
        icon: <SoccerBall size={64} weight="duotone" color="#39FF14" />
    },
    {
        title: 'O DASHBOARD',
        body: 'Esta é sua central de comando. Veja o estado do clube, próximo jogo, alertas e balanço. As abas laterais dão acesso ao Plantel e Mercado. Clique em "Avançar Semana" para progredir no tempo.',
        icon: <ChartBar size={64} weight="duotone" color="#40BAF7" />
    },
    {
        title: 'TÁTICA E FORMAÇÃO',
        body: 'Antes de cada jogo, escolha sua mentalidade tática e esquema. Analise o adversário no pré-jogo e ajuste sua equipe para explorar as fraquezas oponentes.',
        icon: <Strategy size={64} weight="duotone" color="#FFD700" />
    },
    {
        title: 'SIMULAÇÃO AO VIVO',
        body: 'Assista à narração do jogo e acompanhe as estatísticas em tempo real. Pause a qualquer momento para fazer substituições táticas e virar o placar.',
        icon: <Television size={64} weight="duotone" color="#FF3333" />
    },
    {
        title: 'CONQUISTAS E CARREIRA',
        body: 'Sua jornada ficará na história. Acumule troféus, ganhe prestígio, mude de clube e desbloqueie as 60+ conquistas disponíveis no Hall da Fama.',
        icon: <Medal size={64} weight="duotone" color="#FFD700" />
    }
];

const STORAGE_KEY = 'elifoot_tutorial_done';

export function TutorialView() {
    const { changeView, getDashboardView } = useGame();
    const [step, setStep] = useState(0);

    const colors = {
        bg: '#0D1117',
        panelBg: '#161B22',
        panelElevated: '#1A1F24',
        border: '#2D3748',
        text: '#FDFBF7',
        textMuted: '#8E9E94',
        accent: '#39FF14',
        secondary: '#40BAF7',
        warning: '#FFD700',
        danger: '#FF3333'
    };

    const finish = () => {
        try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
        changeView('start');
    };

    const skip = () => {
        try { localStorage.setItem(STORAGE_KEY, 'skipped'); } catch { /* ignore */ }
        changeView('start');
    };

    const next = () => {
        if (step < STEPS.length - 1) setStep(step + 1);
        else finish();
    };

    const prev = () => {
        if (step > 0) setStep(step - 1);
    };

    const cur = STEPS[step];

    return (
        <div className="ef-anim-fade-in" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100dvh',
            padding: '24px',
            backgroundColor: colors.bg,
            backgroundImage: `linear-gradient(rgba(13, 17, 23, 0.85), rgba(13, 17, 23, 0.95)), url(${bgTutorial})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            imageRendering: 'pixelated',
            color: colors.text,
            fontFamily: 'var(--font-sans)'
        }}>
            <EfPanel padding="lg" style={{
                maxWidth: '600px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '24px',
                borderTop: `4px solid ${colors.secondary}`
            }}>
                <div className="ef-anim-pop-in" key={`icon-${step}`} style={{ 
                    width: '120px', 
                    height: '120px', 
                    backgroundColor: colors.bg,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${colors.border}`,
                    boxShadow: `0 0 30px rgba(64, 186, 247, 0.2)`
                }}>
                    {cur.icon}
                </div>
                
                <div className="ef-anim-slide-up" key={`content-${step}`}>
                    <h2 style={{ margin: '0 0 16px 0', fontSize: '1.5rem', color: colors.text, fontWeight: '900', fontFamily: 'var(--font-sans)' }}>
                        {cur.title}
                    </h2>
                    <p style={{ margin: 0, fontSize: '1rem', lineHeight: '1.6', color: colors.textMuted }}>
                        {cur.body}
                    </p>
                </div>
                
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '8px',
                    width: '100%',
                    margin: '8px 0'
                }}>
                    {STEPS.map((_, i) => (
                        <div
                            key={i}
                            style={{
                                flex: 1,
                                height: '4px',
                                borderRadius: '2px',
                                backgroundColor: i === step ? colors.secondary : i < step ? colors.accent : colors.border,
                                transition: 'background-color 300ms ease'
                            }}
                        />
                    ))}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '8px' }}>
                    {step > 0 && (
                        <EfButton variant="secondary" size="lg" onClick={prev} style={{ flex: 1 }}>
                            <ArrowLeft size={20} /> ANTERIOR
                        </EfButton>
                    )}
                    <EfButton variant="primary" size="lg" onClick={next} style={{ flex: step === 0 ? 1 : 2 }}>
                        {step < STEPS.length - 1 ? (
                            <>PRÓXIMO <ArrowRight size={20} /></>
                        ) : (
                            <>INICIAR CARREIRA <SoccerBall size={20} weight="fill" /></>
                        )}
                    </EfButton>
                </div>
                
                <div style={{ marginTop: '8px' }}>
                    <button
                        onClick={skip}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: colors.textMuted,
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontFamily: 'var(--font-mono)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px'
                        }}
                    >
                        <FastForward size={14} /> PULAR TUTORIAL
                    </button>
                </div>
            </EfPanel>
        </div>
    );
}

// Helper: check tutorial state
export function isTutorialDone() {
    try {
        return localStorage.getItem(STORAGE_KEY) !== null;
    } catch {
        return false;
    }
}

export default TutorialView;
