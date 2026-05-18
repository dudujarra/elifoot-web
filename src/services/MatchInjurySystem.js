export const INJURY_MIN_WEEKS = 2;
export const INJURY_RANGE_WEEKS = 4;

export function applyMatchInjury(injTeam, systemRng, minute, isManagerMatch, rawEvents, performanceMap, PERF_INJURY) {
    const candidates = (injTeam.squad || []).filter(p => p.isTitular && !p.injury);
    const injured = candidates.length > 0 ? candidates[Math.floor(systemRng() * candidates.length)] : null;
    
    if (injured) {
        injured.injury = { 
            name: 'Lesao muscular', 
            weeksLeft: INJURY_MIN_WEEKS + Math.floor(systemRng() * INJURY_RANGE_WEEKS), 
            emoji: '🤕' 
        };
        if (isManagerMatch && rawEvents) {
            rawEvents.push({ minute, type: 'injury', injuredName: injured.name, injTeamName: injTeam.name });
        }
        if (performanceMap) {
            performanceMap[injured.id] = (performanceMap[injured.id] || 0) + PERF_INJURY;
        }
    }
    return injured;
}
