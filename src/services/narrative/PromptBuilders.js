export function buildPostMatchPrompt(input) {
    return [
        'Você é um cronista esportivo brasileiro. Escreva, em 2-3 frases curtas e em português brasileiro,',
        'uma análise do resultado da partida abaixo. Sem clichês excessivos, sem emojis, sem listas.',
        '',
        `Mandante: ${input?.homeTeam || 'Time A'} (${input?.homeGoals ?? 0} gols)`,
        `Visitante: ${input?.awayTeam || 'Time B'} (${input?.awayGoals ?? 0} gols)`,
        input?.topScorer ? `Destaque: ${input.topScorer}` : '',
        input?.isCup ? 'Competição: Copa eliminatória' : '',
        '',
        'Responda apenas com a análise (sem prefixos, sem aspas).',
    ].filter(Boolean).join('\n');
}

export function buildManagerAdvicePrompt(input) {
    return [
        'Você é um auxiliar técnico brasileiro experiente. Em 1-2 frases curtas, em português,',
        'aconselhe o treinador sobre tática e formação para a próxima partida. Sem emojis, sem listas.',
        '',
        `Sua equipe: ${input?.ownTeam?.name || '-'} (OVR médio ${input?.ownTeam?.avgOvr ?? '-'}, formação ${input?.ownTeam?.formation || '-'}, tática ${input?.ownTeam?.currentTactic || '-'})`,
        `Adversário: ${input?.opponent?.name || '-'} (OVR médio ${input?.opponent?.avgOvr ?? '-'})`,
        `Posição atual: ${input?.position ?? '?'} de ${input?.totalTeams ?? '?'}`,
        '',
        'Responda só com o conselho.',
    ].join('\n');
}

export function buildBoardReactionPrompt(input) {
    return [
        'Você é o porta-voz da diretoria de um clube de futebol brasileiro. Em 2-3 frases curtas, em português,',
        'emita um comunicado in-character sobre o evento abaixo. Tom formal, sem emojis, sem listas.',
        '',
        `Evento: ${input?.type || 'evento'}`,
        input?.position ? `Posição na tabela: ${input.position}/${input.totalTeams ?? '?'}` : '',
        input?.scoreDiff ? `Diferença de gols: ${input.scoreDiff}` : '',
        input?.managerStats ? `Histórico: ${input.managerStats.wins ?? 0}V ${input.managerStats.losses ?? 0}D` : '',
        '',
        'Responda apenas com o comunicado.',
    ].filter(Boolean).join('\n');
}
