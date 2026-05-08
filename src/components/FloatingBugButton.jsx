/**
 * FloatingBugButton — v1.6
 *
 * Botão sempre visível (canto inferior direito) pra reportar bug rápido.
 * Click abre prompt + screenshot opcional via canvas.
 */

import React, { useState } from 'react';
import { MonitorService } from '../services/MonitorService';
import { useGame } from '../context/GameContext';

export function FloatingBugButton() {
    const { gameState } = useGame();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState('');
    const [category, setCategory] = useState('feedback');
    const [confirm, setConfirm] = useState(false);

    const monitor = MonitorService.getInstance();

    function handleSubmit() {
        if (!text.trim()) return;
        if (category === 'bug') {
            monitor.recordFeedback(text, null);
        } else if (category === 'feedback') {
            monitor.recordFeedback(text);
        } else if (category === 'note') {
            monitor.recordNote(text);
        }
        setText('');
        setConfirm(true);
        setTimeout(() => {
            setConfirm(false);
            setOpen(false);
        }, 1500);
    }

    if (!gameState.started) return null;

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Reportar bug / feedback / nota"
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'var(--accent, #F59E0B)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    fontSize: '24px',
                    zIndex: 9000,
                    transition: 'transform 0.15s'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
                🐛
            </button>

            {open && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10000,
                    padding: '1rem'
                }} onClick={() => setOpen(false)}>
                    <div
                        className="card"
                        style={{ width: '100%', maxWidth: '480px', padding: '1.25rem' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <h3 style={{ margin: 0 }}>🐛 Reportar</h3>
                            <button className="btn btn-sm btn-secondary" onClick={() => setOpen(false)}>✕</button>
                        </div>

                        {confirm ? (
                            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--primary)' }}>
                                ✅ Registrado!
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem' }}>
                                    {['bug', 'feedback', 'note'].map(cat => (
                                        <button
                                            key={cat}
                                            className={`btn btn-sm ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setCategory(cat)}
                                        >
                                            {cat === 'bug' ? '🐛 Bug' : cat === 'feedback' ? '💬 Feedback' : '📝 Nota'}
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    placeholder={
                                        category === 'bug' ? 'Descreva o bug: o que aconteceu? o que esperava?' :
                                        category === 'feedback' ? 'Sua opinião sobre essa parte do jogo...' :
                                        'Nota livre — observação, ideia, lembrete...'
                                    }
                                    rows={5}
                                    style={{
                                        width: '100%',
                                        padding: '0.6rem',
                                        background: 'var(--bg-panel-solid)',
                                        color: 'var(--text-main)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: '0.85rem',
                                        fontFamily: 'inherit',
                                        resize: 'vertical'
                                    }}
                                />

                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
                                    <button className="btn btn-sm btn-secondary" onClick={() => setOpen(false)}>Cancelar</button>
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={handleSubmit}
                                        disabled={!text.trim()}
                                    >
                                        Salvar
                                    </button>
                                </div>

                                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Salvo localmente. Acesse Monitor (no menu) pra ver tudo + exportar JSON.
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default FloatingBugButton;
