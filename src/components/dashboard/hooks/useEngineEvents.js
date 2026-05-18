import { useEffect } from 'react';

export function useEngineEvents(engine, team, setPendingUnlock, setPendingAchievement) {
    useEffect(() => {
        if (!team || !engine || typeof engine.consumeUIEvents !== 'function') return;

        // Process all structured UI events via transactional boundary
        const processedEvents = engine.consumeUIEvents();
        if (!processedEvents || processedEvents.length === 0) return;

        processedEvents.forEach(evt => {
            if (evt.type === 'UNLOCK') {
                setPendingUnlock(evt.viewId);
            }
            if (evt.type === 'ACHIEVEMENT') {
                setPendingAchievement({
                    emoji: evt.ach?.emoji || '🏆',
                    name: 'Conquista Desbloqueada!',
                    description: `${evt.ach?.name} — ${evt.ach?.description}`
                });
            }
        });
    }, [engine, team, setPendingUnlock, setPendingAchievement]);
}
