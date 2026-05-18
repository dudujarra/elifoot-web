import { useState, useCallback } from 'react';

export function useLLMAdvice(engine, team) {
    const [advicePanel, setAdvicePanel] = useState({ open: false, loading: false, text: '' });

    const handleAuxiliarAdvice = useCallback(async () => {
        if (!engine?.llmNarrative || !team) return;
        setAdvicePanel({ open: true, loading: true, text: '' });
        
        const standings = engine.getStandings ? engine.getStandings(team.zone, team.division) : [];
        const myPos = standings.findIndex((s) => s.teamId === team.id) + 1;
        const _avgOvr = team.squad?.length
            ? Math.round(team.squad.reduce((s, p) => s + (p.ovr || 50), 0) / (team.squad.length || 1))
            : 50;
        
        const divisionAvg = standings.length
            ? Math.round(standings.reduce((s, row) => {
                const t = engine.getTeam ? engine.getTeam(row.teamId) : null;
                if (!t || !t.squad) return s;
                return s + Math.round(t.squad.reduce((ss, p) => ss + (p.ovr || 50), 0) / (t.squad.length || 1));
            }, 0) / standings.length)
            : 50;
            
        try {
            const text = await engine.llmNarrative.managerAdvice({
                ownTeam: { name: team.name, avgOvr: _avgOvr, formation: team.formation, currentTactic: engine.currentTactic },
                opponent: { name: 'Próximo adversário', avgOvr: divisionAvg, recentForm: engine.managerStats?.rollingForm?.slice(-5) || [] },
                position: myPos || 0,
                totalTeams: standings.length || 20,
            });
            setAdvicePanel({ open: true, loading: false, text });
        } catch {
            setAdvicePanel({ open: true, loading: false, text: 'Auxiliar indisponível no momento.' });
        }
    }, [engine, team]);

    return { advicePanel, setAdvicePanel, handleAuxiliarAdvice };
}
