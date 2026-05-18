import { Bug, GameController, ChatCircleText, Note } from '@phosphor-icons/react';

export const CATEGORY_ICONS = {
    bug: <Bug size={16} />,
    gameplay: <GameController size={16} />,
    feedback: <ChatCircleText size={16} />,
    note: <Note size={16} />
};

export const CATEGORY_LABELS = {
    bug: 'Bug',
    gameplay: 'Gameplay',
    feedback: 'Feedback',
    note: 'Nota'
};

export function severityKey(s) {
    if (s === 'critical') return 'critical';
    if (s === 'error') return 'error';
    if (s === 'warning') return 'warning';
    if (s === 'info') return 'info';
    return 'default';
}

export function severityTagLabel(s) {
    if (s === 'critical') return 'CRIT';
    if (s === 'error') return 'ERROR';
    if (s === 'warning') return 'WARN';
    if (s === 'info') return 'INFO';
    return 'NOTE';
}

export function formatTs(ts) {
    return new Date(ts).toLocaleString('pt-BR');
}

export function formatLogTs(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    const ms = String(d.getMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss}.${ms}`;
}

export function formatUptime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hrs = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    const pad = (n, w = 2) => String(n).padStart(w, '0');
    return `${pad(days, 3)}:${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}
