import { CheckCircle } from '@phosphor-icons/react';

export function MarketToast({ log, setLog }) {
    if (!log) return null;
    return (
        <div className="ef-anim-pulse-glow ef-toast-success" onClick={() => setLog('')}>
            <CheckCircle size={20} weight="fill" color="var(--color-emerald-confirm)" />
            {log}
        </div>
    );
}
