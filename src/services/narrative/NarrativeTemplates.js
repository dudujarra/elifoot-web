export const POST_MATCH_TEMPLATES = {
    bigWin: [
        '{home} atropelou {away} por {hg} a {ag}. Apresentação dominante do início ao fim. A torcida saiu em êxtase.',
        'Goleada histórica: {home} {hg} x {ag} {away}. O time funcionou nos quatro setores. Resultado que vale como recado para a próxima rodada.',
        'Vitória inquestionável de {home} sobre {away} por {hg} a {ag}. Confiança em alta e moral renovada no vestiário.',
    ],
    win: [
        'Vitória sólida de {home} sobre {away} por {hg} a {ag}. Time controlou os momentos-chave e levou os três pontos.',
        '{home} venceu {away} por {hg} a {ag}. Resultado importante para a campanha, mesmo com alguns sustos.',
        'Boa resposta de {home} no {hg} a {ag} contra o {away}. Postura competitiva e eficiência ofensiva.',
    ],
    narrowWin: [
        'Vitória sofrida de {home} por {hg} a {ag} sobre {away}. O time segurou o placar nos minutos finais.',
        '{home} {hg} x {ag} {away} em jogo apertado. Os três pontos vêm com mais alívio do que celebração.',
        'Triunfo magro mas precioso: {home} {hg} x {ag} {away}. A defesa segurou o que veio.',
    ],
    draw: [
        'Empate em {hg} a {ag} entre {home} e {away}. Resultado deixa gosto ambíguo: nem comemora, nem chora.',
        '{home} {hg} x {ag} {away} — empate equilibrado. Os dois lados terminaram contentes em fases distintas do jogo.',
        'Ficou no {hg} a {ag} entre {home} e {away}. Um ponto que pode pesar mais à frente.',
    ],
    narrowLoss: [
        'Derrota apertada de {home} para {away} por {hg} a {ag}. O time competiu, mas faltou eficiência.',
        '{home} {hg} x {ag} {away} — pouco para tirar de positivo apesar da entrega. Pequenos detalhes definiram.',
        'Resultado adverso: {home} {hg} x {ag} {away}. Há muito o que conversar no vestiário.',
    ],
    loss: [
        'Derrota de {home} para {away} por {hg} a {ag}. Apresentação irregular e setores não responderam.',
        '{home} {hg} x {ag} {away} — resultado preocupante. A diretoria deve cobrar respostas rápidas.',
        'Tropeço duro de {home} contra {away}. O {hg} a {ag} expõe limitações que precisam ser corrigidas.',
    ],
    humiliation: [
        'Humilhação histórica: {home} {hg} x {ag} {away}. Vergonha pública e crise potencial no vestiário.',
        '{home} {hg} x {ag} {away}: goleada sofrida que vira ferida aberta. A semana será longa.',
        'Vexame de {home} ao perder por {hg} a {ag} para {away}. Reconstrução começa agora.',
    ],
};

export const MANAGER_ADVICE_TEMPLATES = {
    bigAdvantage: [
        'Você tem vantagem técnica clara (OVR {ownOvr} vs {oppOvr}). Mantenha {formation} ofensivo e pressione alto. Confie no elenco.',
        'O elenco é superior ao do {opp}. Aposte em {formation} com tática agressiva e finalize cedo para não dar esperança.',
        'Diferença técnica favorável: {ownOvr} contra {oppOvr}. {formation} ofensivo é a leitura óbvia, mas atenção ao contra-ataque.',
    ],
    advantage: [
        'Você é favorito moderado. {formation} continua sendo bom, mas considere reforçar o meio para controlar o ritmo.',
        'Pequena vantagem técnica. Mantenha {formation} e o equilíbrio. Não deixe o adversário forçar erros.',
        'Favorito apertado. {formation} normal é prudente — não tente blitz prematura.',
    ],
    even: [
        'Jogo equilibrado pela frente. {formation} com tática normal é o mais seguro. Vale assistir os primeiros 20 minutos antes de mudar nada.',
        'Confronto parelho. Olho no meio-campo: quem dominar ali vence. Considere fechar a defesa nos minutos finais.',
        'Sem favorito claro. Confie em {formation} e ajuste no intervalo conforme leitura do jogo.',
    ],
    underdog: [
        'O {opp} é favorito. Aposte em {formation} defensivo ou contra-ataque. Um ponto já é resultado aceitável.',
        'Você é azarão. Compactar atrás e explorar transição rápida pode surpreender. Não abra o jogo.',
        'Inferioridade técnica clara. Tática defensiva e bola parada são suas armas principais.',
    ],
    bigUnderdog: [
        'Missão difícil contra {opp} (OVR {oppOvr} vs {ownOvr}). Foco total em defender e roubar bola em transição. Pé no chão.',
        'Cenário adverso: {opp} bem mais forte. Defenda em bloco baixo, busque um gol oportunista. Sobrevivência conta.',
        'O {opp} é favoritíssimo. Defensivo extremo e aproveitar erro adversário. Não há vergonha em jogar para empatar.',
    ],
};

export const BOARD_REACTION_TEMPLATES = {
    title: [
        'A diretoria está em festa pelo título conquistado. Sua continuidade no comando é certa. O elenco terá investimento ampliado na próxima temporada.',
        'Conquistar o título consolida sua posição. A diretoria parabeniza publicamente e renova a confiança. Há margem para projetos maiores.',
        'Título celebrado pela diretoria. Reconhecemos o trabalho consistente e queremos manter o ciclo vencedor. Bonificação a caminho.',
    ],
    promotion: [
        'O acesso conquistado mudou o patamar do clube. A diretoria mostra gratidão pública e promete reforços para a divisão superior.',
        'Subir de divisão era o objetivo central, e foi entregue. A diretoria reafirma a parceria e abre crédito para o próximo desafio.',
        'Acesso garantido. A diretoria está satisfeita, mas já cobra planejamento sério para se manter na divisão de cima.',
    ],
    relegation: [
        'O rebaixamento gerou crise interna. A diretoria está profundamente decepcionada e fará uma reavaliação completa do comando técnico.',
        'Cair de divisão é fracasso inaceitável. A diretoria não esconde a frustração e estuda mudanças estruturais imediatas.',
        'Rebaixamento dói. A diretoria emite nota dura cobrando responsabilidades e prometendo reconstrução. O futuro do técnico está em aberto.',
    ],
    sacking_risk: [
        'A diretoria emite alerta formal: os resultados estão muito abaixo do esperado. Sua permanência será reavaliada nas próximas semanas.',
        'Reunião tensa na diretoria. Sem reação imediata, mudanças no comando técnico não estão descartadas.',
        'A confiança da diretoria caiu para níveis críticos. Próximas rodadas serão decisivas para sua permanência.',
    ],
    win_streak: [
        'A diretoria parabeniza publicamente a sequência de vitórias. O trabalho dá frutos e o vestiário responde. Continue assim.',
        'Sequência vitoriosa anima a diretoria. Reconhecimento oficial e sinal verde para planos futuros.',
        'A boa fase é destacada pela diretoria, que pretende reforçar a confiança no plantel. Mantenha o foco.',
    ],
    humiliation: [
        'A goleada sofrida choca a diretoria. Cobrança imediata por explicações no vestiário. Reincidência terá consequências severas.',
        'Humilhação pública. A diretoria exige resposta rápida e estuda medidas internas para evitar nova vergonha.',
        'Resultado vexatório acende sinal vermelho na diretoria. Reunião extraordinária convocada — sua liderança será testada.',
    ],
    default: [
        'A diretoria acompanha de perto os acontecimentos. Aguarda evolução antes de qualquer manifestação oficial.',
        'A diretoria optou por reserva sobre o momento. O trabalho continua sob avaliação interna.',
        'Sem manifestação oficial por agora. A diretoria prefere conversar a portas fechadas.',
    ],
};

export function fnv1aHash(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = (h * 0x01000193) >>> 0;
    }
    return h >>> 0;
}

export function pickTemplate(bucket, seedKey) {
    if (!bucket || bucket.length === 0) return '';
    const idx = fnv1aHash(seedKey) % bucket.length;
    return bucket[idx];
}

export function fillTemplate(tpl, vars) {
    return Object.keys(vars).reduce(
        (acc, k) => acc.split(`{${k}}`).join(String(vars[k])),
        tpl
    );
}

export function buildPostMatchTemplate(input) {
    const home = String(input?.homeTeam || 'A equipe');
    const away = String(input?.awayTeam || 'o adversário');
    const hg = Number(input?.homeGoals || 0);
    const ag = Number(input?.awayGoals || 0);
    const diff = hg - ag;
    const managerSide = input?.managerSide;
    
    let bucket;
    if (managerSide === 'home' || managerSide === 'away') {
        const myG = managerSide === 'home' ? hg : ag;
        const oppG = managerSide === 'home' ? ag : hg;
        const mDiff = myG - oppG;
        if (mDiff >= 3) bucket = POST_MATCH_TEMPLATES.bigWin;
        else if (mDiff === 2) bucket = POST_MATCH_TEMPLATES.win;
        else if (mDiff === 1) bucket = POST_MATCH_TEMPLATES.narrowWin;
        else if (mDiff === 0) bucket = POST_MATCH_TEMPLATES.draw;
        else if (mDiff === -1) bucket = POST_MATCH_TEMPLATES.narrowLoss;
        else if (mDiff >= -3) bucket = POST_MATCH_TEMPLATES.loss;
        else bucket = POST_MATCH_TEMPLATES.humiliation;
    } else {
        if (Math.abs(diff) >= 4) bucket = diff > 0 ? POST_MATCH_TEMPLATES.bigWin : POST_MATCH_TEMPLATES.humiliation;
        else if (Math.abs(diff) >= 2) bucket = diff > 0 ? POST_MATCH_TEMPLATES.win : POST_MATCH_TEMPLATES.loss;
        else if (Math.abs(diff) === 1) bucket = diff > 0 ? POST_MATCH_TEMPLATES.narrowWin : POST_MATCH_TEMPLATES.narrowLoss;
        else bucket = POST_MATCH_TEMPLATES.draw;
    }
    
    const seed = `${home}|${away}|${hg}|${ag}`;
    const tpl = pickTemplate(bucket, seed);
    return fillTemplate(tpl, { home, away, hg, ag });
}

export function buildManagerAdviceTemplate(input) {
    const ownName = String(input?.ownTeam?.name || 'Sua equipe');
    const oppName = String(input?.opponent?.name || 'o adversário');
    const ownOvr = Number(input?.ownTeam?.avgOvr || 50);
    const oppOvr = Number(input?.opponent?.avgOvr || 50);
    const formation = String(input?.ownTeam?.formation || '4-3-3');
    const gap = ownOvr - oppOvr;
    
    let bucket;
    if (gap >= 10) bucket = MANAGER_ADVICE_TEMPLATES.bigAdvantage;
    else if (gap >= 4) bucket = MANAGER_ADVICE_TEMPLATES.advantage;
    else if (gap > -4) bucket = MANAGER_ADVICE_TEMPLATES.even;
    else if (gap > -10) bucket = MANAGER_ADVICE_TEMPLATES.underdog;
    else bucket = MANAGER_ADVICE_TEMPLATES.bigUnderdog;
    
    const seed = `${ownName}|${oppName}|${ownOvr}|${oppOvr}|${formation}`;
    const tpl = pickTemplate(bucket, seed);
    return fillTemplate(tpl, { own: ownName, opp: oppName, ownOvr, oppOvr, formation });
}

export function buildBoardReactionTemplate(input) {
    const type = String(input?.type || 'default');
    const bucket = BOARD_REACTION_TEMPLATES[type] || BOARD_REACTION_TEMPLATES.default;
    const seed = `${type}|${input?.position ?? ''}|${input?.scoreDiff ?? ''}|${input?.managerStats?.streak ?? ''}`;
    return pickTemplate(bucket, seed);
}
