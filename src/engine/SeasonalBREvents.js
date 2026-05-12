/**
 * SeasonalBREvents — SPEC-C6
 *
 * 4 eventos sazonais BR distribuídos ao longo das 38 semanas de temporada.
 * Cada evento: carta narrativa PT-BR com escolhas e effects.
 *
 * Pure module. Determinístico.
 */

export const SeasonalBREvents = [
    {
        id: 'season_jan_preseason',
        week: 1,
        title: 'PRÉ-TEMPORADA — JANEIRO',
        text: 'Galera voltou das férias. Confraternização no CT. Como recebe a turma?',
        options: [
            {
                label: 'Discurso motivacional bonito',
                effect: { moralDelta: 8, energyDelta: -2 },
                resultText: 'Time embolsa com a fala. Começa temporada animado.',
            },
            {
                label: 'Treino puxado direto',
                effect: { moralDelta: -3, energyDelta: -8 },
                resultText: 'Sem rodeios. Galera entende, mas resmunga.',
            },
            {
                label: 'Churrasco com dirigentes',
                effect: { moralDelta: 5, energyDelta: 2 },
                resultText: 'Picanha e cerveja. Vestiário e diretoria mais perto.',
            },
        ],
    },
    {
        id: 'season_jun_copa_america',
        week: 13,
        title: 'PAUSA COPA AMÉRICA — JUNHO',
        text: 'Seleção convoca 2 dos seus titulares. Pausa de 3 semanas no Brasileirão. Como aproveita?',
        options: [
            {
                label: 'Pré-temporada relâmpago intensa',
                effect: { moralDelta: 3, energyDelta: 5 },
                resultText: 'Volta da pausa com gás. Reservas ganharam ritmo.',
            },
            {
                label: 'Descanso pra todo mundo',
                effect: { moralDelta: 8, energyDelta: 10 },
                resultText: 'Time volta inteiro fisicamente.',
            },
            {
                label: 'Amistosos contra times menores',
                effect: { moralDelta: 5, energyDelta: 0 },
                resultText: 'Mantém ritmo, gera renda extra.',
            },
        ],
    },
    {
        id: 'season_oct_youth_visit',
        week: 26,
        title: 'DIA DAS CRIANÇAS — OUTUBRO',
        text: 'Categoria de base visita o CT. Pirralhada de olho nos craques. Como gerencia?',
        options: [
            {
                label: 'Profissionais brincam com elenco juvenil',
                effect: { moralDelta: 6 },
                resultText: 'Garotada eufórica. Imprensa adorou as fotos.',
            },
            {
                label: 'Treino normal, base assiste',
                effect: { moralDelta: 2 },
                resultText: 'Inspira pelo exemplo. Sem distrair o time.',
            },
            {
                label: 'Cancelar visita pra focar no jogo',
                effect: { moralDelta: -4 },
                resultText: 'Diretoria não gostou. PR fraco.',
            },
        ],
    },
    {
        id: 'season_dec_year_review',
        week: 38,
        title: 'BALANÇO FIM DE ANO — DEZEMBRO',
        text: 'Temporada acabou. Imprensa pergunta sobre o ano. Como responde?',
        options: [
            {
                label: 'Análise técnica fria, foca no que vem',
                effect: { moralDelta: 0 },
                resultText: 'Profissional. Diretoria registra postura.',
            },
            {
                label: 'Emocional, agradece ao elenco',
                effect: { moralDelta: 5 },
                resultText: 'Time se sente valorizado. Vestiário unido pra próxima.',
            },
            {
                label: 'Crítica pública aos erros',
                effect: { moralDelta: -6 },
                resultText: 'Manchete amarela. Vestiário racha.',
            },
        ],
    },
];

/**
 * Pure: retorna evento sazonal se a semana atual tem trigger.
 *
 * @param {number} week
 * @returns {object|null}
 */
export function getSeasonalEvent(week) {
    if (typeof week !== 'number') return null;
    return SeasonalBREvents.find(e => e.week === week) || null;
}

/**
 * Lista de semanas que disparam eventos sazonais.
 */
export function getSeasonalTriggerWeeks() {
    return SeasonalBREvents.map(e => e.week);
}

/**
 * Conta eventos para validação.
 */
export function getSeasonalEventCount() {
    return SeasonalBREvents.length;
}
