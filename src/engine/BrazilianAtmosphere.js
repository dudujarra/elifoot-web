/**
 * BrazilianAtmosphere — SPEC-B6
 *
 * Camada cosmética de brasilianidade para match events.
 * Catálogo de 30+ frases PT-BR contextuais.
 *
 * Pure function. Determinístico (seed-based).
 */

const ATMOSPHERE = {
    goal: [
        'O Maracanã treme com a vibração da torcida.',
        'A camisa 10 ergue os braços, o povo grita.',
        'Estádio em silêncio antes da explosão.',
        'Beira de campo vira festa, banco no abraço coletivo.',
        'A virada começou — ou foi confirmada.',
        'Bola na rede, comando já comemorando antes do juiz validar.',
        'Tarde de sol e gol — combinação perfeita.',
        'A geral pula em uníssono, a arquibancada chora junto.',
    ],
    goal_home: [
        'Pacaembu pega fogo, a casa marcou.',
        'Beira-Rio explode, gol em casa.',
        'A torcida da Vila grita junto, cada lance vibrado.',
    ],
    goal_away: [
        'Visitante calou o estádio adversário.',
        'Gol fora de casa pesa o dobro — quem joga sabe.',
        'Banco visitante invade o gramado, gritaria contida na arquibancada anfitriã.',
    ],
    card: [
        'Cartão amarelo no peito, técnico no banco já discutindo com o quarto árbitro.',
        'Falta dura, torcida adversária pede vermelho.',
        'Juiz mostra cartão, jogada que vinha boa fica truncada.',
        'Amarelo merecido. Próxima falta pode ser expulsão.',
        'Reclamação geral, mas o cartão é claro.',
    ],
    red_card: [
        'Expulsão! Time vira chave, vai pro tudo ou nada com um a menos.',
        'Vermelho direto. Comando ainda discute com o quarto árbitro.',
        'A imprensa amanhã vai falar mais da expulsão que do jogo.',
        'Estádio dividido entre revolta e festa.',
    ],
    miss: [
        'Cara a cara, mas a bola saiu chorando pela linha de fundo.',
        'Atacante já comemorava — tarde para reagir.',
        'Trave salva o adversário, sorte que nem se brinca.',
        'O goleiro nem se mexeu, a bola pediu desculpa pra trave.',
    ],
    save: [
        'Defesa milagrosa! Torcida aplaude de pé.',
        'O goleiro voou no canto, pegou o impossível.',
        'Reflexo de gente grande. Salvou o time.',
        'Quase gol — a luva foi mais rápida.',
    ],
    derby: [
        'Clássico é clássico — não se compara com nenhuma outra partida.',
        'O Brasileirão para — derby tem regra própria.',
        'Bandeira do rival queima no setor oposto. A mística pede vitória.',
        'Cada lance vale o dobro. Cada pisada é histórica.',
        'A geral lembra de cada lance dos clássicos passados.',
    ],
    late_drama: [
        'Últimos minutos, tudo se decide aqui.',
        'Pressão final. Quem tiver coração maior vence.',
        'Acréscimos viraram batalha campal pela bola.',
        'Cronômetro corre contra um, voa contra outro.',
    ],
};

const ALL_EVENT_TYPES = Object.keys(ATMOSPHERE);

/**
 * Retorna frase atmosférica determinística por seed.
 *
 * @param {string} eventType — chave de ATMOSPHERE
 * @param {number} seed — número inteiro para determinismo
 * @returns {{ flavorString: string, category: string }}
 */
export function getAtmosphere(eventType, seed = 0) {
    const list = ATMOSPHERE[eventType];
    if (!list || list.length === 0) {
        return { flavorString: '', category: 'unknown' };
    }
    const idx = Math.abs(seed) % list.length;
    return { flavorString: list[idx], category: eventType };
}

/**
 * Retorna múltiplas frases (sem repetir) — útil pra montagem narrativa.
 *
 * @param {string} eventType
 * @param {number} count
 * @param {number} seed
 * @returns {string[]}
 */
export function getAtmosphereSet(eventType, count = 3, seed = 0) {
    const list = ATMOSPHERE[eventType] || [];
    if (list.length === 0) return [];
    const result = [];
    const used = new Set();
    let cursor = Math.abs(seed) % list.length;
    while (result.length < count && result.length < list.length) {
        if (!used.has(cursor)) {
            result.push(list[cursor]);
            used.add(cursor);
        }
        cursor = (cursor + 1) % list.length;
    }
    return result;
}

export { ATMOSPHERE, ALL_EVENT_TYPES };
