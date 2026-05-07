// Deck de eventos posicionais para partidas interativas (RPG)
// Cada carta tem: id, position (quem recebe), text (narração), options (3 escolhas)
// Cada option: label, skill, difficulty, successText, failText, successType, failType, bossRespect, fansRespect

export const MatchEventsDeck = {
    ATA: [
        {
            id: "one_on_one_wing",
            text: "Você está na cara do gol na entrada da direita da pequena área e um companheiro te acompanha alinhado. O goleiro avança em sua direção.",
            options: [
                { label: "Chutar rasteiro no canto esquerdo", skill: "technique", difficulty: 40, successText: "GOOOL! Bola rasteira no canto!", failText: "Chute fraco, goleiro defende.", successType: "goal", failType: "miss", bossSuccess: 3, bossFailure: -1, fansSuccess: 5, fansFailure: -2 },
                { label: "Tocar para o companheiro livre", skill: "vision", difficulty: 25, successText: "Passe perfeito, companheiro marca!", failText: "IMPEDIMENTO! O bandeira levantou.", successType: "goal", failType: "offside", bossSuccess: 5, bossFailure: 0, fansSuccess: 2, fansFailure: -1 },
                { label: "Cavadinha por cima do goleiro", skill: "technique", difficulty: 75, successText: "CAVADINHA GENIAL! A torcida vai à loucura!", failText: "Goleiro espalma! Que desperdício...", successType: "goal", failType: "miss", bossSuccess: -2, bossFailure: -5, fansSuccess: 10, fansFailure: -5 }
            ]
        },
        {
            id: "counter_attack",
            text: "Contra-ataque fulminante! Você puxa a bola pelo meio com espaço. Um zagueiro corre ao seu lado, outro fecha a entrada da área.",
            options: [
                { label: "Acelerar e chutar de longe", skill: "pace", difficulty: 50, successText: "GOLAÇO de fora da área! Indefensável!", failText: "Chute passou longe do gol.", successType: "goal", failType: "miss", bossSuccess: 2, bossFailure: -2, fansSuccess: 8, fansFailure: -1 },
                { label: "Driblar o zagueiro e finalizar", skill: "technique", difficulty: 60, successText: "Drible desconcertante e gol!", failText: "Perdeu a bola no drible.", successType: "goal", failType: "turnover", bossSuccess: 1, bossFailure: -3, fansSuccess: 7, fansFailure: -3 },
                { label: "Lançamento para o ponta", skill: "vision", difficulty: 30, successText: "Lançamento milimétrico! Gol do companheiro!", failText: "Bola muito forte, saiu pela linha.", successType: "goal", failType: "miss", bossSuccess: 4, bossFailure: 0, fansSuccess: 3, fansFailure: 0 }
            ]
        },
        {
            id: "penalty_kick",
            text: "PÊNALTI! O árbitro aponta para a marca. A torcida inteira se levanta. O goleiro adversário te encara.",
            options: [
                { label: "Chutar com força no meio", skill: "power", difficulty: 35, successText: "GOOOL! Bola estufou a rede pelo meio!", failText: "Goleiro não se mexeu e pegou!", successType: "goal", failType: "saved", bossSuccess: 2, bossFailure: -2, fansSuccess: 4, fansFailure: -3 },
                { label: "Colocar no canto direito", skill: "technique", difficulty: 40, successText: "Bola no ângulo! Perfeito!", failText: "Isolou! Bola foi pra fora.", successType: "goal", failType: "miss", bossSuccess: 2, bossFailure: -3, fansSuccess: 5, fansFailure: -4 },
                { label: "Paradinha e cavadinha", skill: "technique", difficulty: 80, successText: "PARADINHA GENIAL! Golaço de classe!", failText: "Paradinha ridícula. Goleiro pegou fácil.", successType: "goal", failType: "saved", bossSuccess: -3, bossFailure: -8, fansSuccess: 12, fansFailure: -8 }
            ]
        },
        {
            id: "corner_header",
            text: "Escanteio pela direita. A bola vem na sua direção na segunda trave. Dois zagueiros disputam posição com você.",
            options: [
                { label: "Cabecear com força para o chão", skill: "power", difficulty: 45, successText: "GOOOL de cabeça! Bola quicou e entrou!", failText: "Cabeceio fraco, goleiro pegou.", successType: "goal", failType: "saved", bossSuccess: 3, bossFailure: 0, fansSuccess: 5, fansFailure: -1 },
                { label: "Desviar de leve para o canto", skill: "technique", difficulty: 55, successText: "Desvio sutil, bola morreu no canto!", failText: "Não pegou bem, bola saiu.", successType: "goal", failType: "miss", bossSuccess: 2, bossFailure: -1, fansSuccess: 4, fansFailure: -1 },
                { label: "Deixar passar para o companheiro", skill: "vision", difficulty: 20, successText: "Jogada ensaiada! Companheiro marca!", failText: "Bola passou direto, ninguém chegou.", successType: "goal", failType: "miss", bossSuccess: 5, bossFailure: 0, fansSuccess: 2, fansFailure: 0 }
            ]
        }
    ],
    MEI: [
        {
            id: "through_ball",
            text: "Você recebe a bola no meio-campo com espaço. O atacante faz o movimento nas costas da defesa.",
            options: [
                { label: "Lançamento longo em profundidade", skill: "vision", difficulty: 45, successText: "Passe genial! Atacante livre na cara do gol!", failText: "Lançamento impreciso, lateral.", successType: "goal", failType: "miss", bossSuccess: 4, bossFailure: -1, fansSuccess: 5, fansFailure: -1 },
                { label: "Tabela curta e infiltrar", skill: "pace", difficulty: 55, successText: "Tabela perfeita, você finalizou!", failText: "Marcador interceptou a devolução.", successType: "goal", failType: "turnover", bossSuccess: 2, bossFailure: -2, fansSuccess: 6, fansFailure: -2 },
                { label: "Chute de longa distância", skill: "power", difficulty: 65, successText: "BOMBA! Golaço de fora da área!", failText: "Chute sem direção, tiro de meta.", successType: "goal", failType: "miss", bossSuccess: 0, bossFailure: -3, fansSuccess: 10, fansFailure: -2 }
            ]
        },
        {
            id: "free_kick_edge",
            text: "Falta perigosa na entrada da área. Você posiciona a bola. A barreira adversária se forma.",
            options: [
                { label: "Cobrar por cima da barreira", skill: "technique", difficulty: 55, successText: "GOLAÇO! Bola contornou a barreira e entrou!", failText: "Na barreira. Rebote perigoso.", successType: "goal", failType: "miss", bossSuccess: 3, bossFailure: -1, fansSuccess: 8, fansFailure: -1 },
                { label: "Cobrar rasteiro no canto", skill: "technique", difficulty: 45, successText: "Bola passou por baixo da barreira! Gol!", failText: "Bateu na barreira, bola afastada.", successType: "goal", failType: "blocked", bossSuccess: 2, bossFailure: 0, fansSuccess: 5, fansFailure: 0 },
                { label: "Cruzar para a área", skill: "vision", difficulty: 30, successText: "Cruzamento perfeito, cabeçada e gol!", failText: "Zagueiro afastou de cabeça.", successType: "goal", failType: "cleared", bossSuccess: 4, bossFailure: 0, fansSuccess: 3, fansFailure: 0 }
            ]
        }
    ],
    DEF: [
        {
            id: "last_ditch_tackle",
            text: "O atacante adversário passa pelo último zagueiro e está livre na grande área! Você é a última linha.",
            options: [
                { label: "Carrinho deslizante", skill: "power", difficulty: 50, successText: "CARRINHO PERFEITO! Bola afastada!", failText: "Carrinho no corpo! Pênalti e cartão!", successType: "tackle", failType: "penalty_given", bossSuccess: 5, bossFailure: -5, fansSuccess: 6, fansFailure: -4 },
                { label: "Acompanhar e pressionar", skill: "pace", difficulty: 35, successText: "Pressionou até o atacante errar!", failText: "Atacante foi mais rápido, finalizou.", successType: "tackle", failType: "goal_conceded", bossSuccess: 3, bossFailure: -2, fansSuccess: 3, fansFailure: -2 },
                { label: "Cortar a linha de passe", skill: "vision", difficulty: 40, successText: "Leitura perfeita! Interceptou o passe!", failText: "Leu errado, atacante ficou livre.", successType: "interception", failType: "goal_conceded", bossSuccess: 4, bossFailure: -3, fansSuccess: 4, fansFailure: -3 }
            ]
        },
        {
            id: "aerial_duel",
            text: "Bola longa para a área! O centroavante adversário sobe para cabecear. Você disputa com ele.",
            options: [
                { label: "Subir antes e cabecear forte", skill: "power", difficulty: 45, successText: "Ganhou no alto! Bola afastada!", failText: "Perdeu o duelo, cabeçada perigosa.", successType: "header_won", failType: "header_lost", bossSuccess: 3, bossFailure: -2, fansSuccess: 4, fansFailure: -2 },
                { label: "Puxar o atacante discretamente", skill: "technique", difficulty: 60, successText: "Segurou firme, juiz não viu nada.", failText: "Falta! Cartão amarelo!", successType: "foul_hidden", failType: "yellow_card", bossSuccess: -1, bossFailure: -4, fansSuccess: 2, fansFailure: -3 },
                { label: "Posicionar e antecipar", skill: "vision", difficulty: 35, successText: "Posição perfeita, bola no seu peito!", failText: "Atacante apareceu nas costas.", successType: "positioning", failType: "goal_conceded", bossSuccess: 5, bossFailure: -1, fansSuccess: 2, fansFailure: -2 }
            ]
        }
    ],
    GOL: [
        {
            id: "one_on_one_save",
            text: "Atacante vem em velocidade na sua direção! Cara a cara com você. Ele arma o chute.",
            options: [
                { label: "Sair do gol e fechar o ângulo", skill: "pace", difficulty: 45, successText: "FECHOU O GOL! Defesaça nos pés do atacante!", failText: "Saiu cedo demais, cobertura fácil.", successType: "great_save", failType: "goal_conceded", bossSuccess: 5, bossFailure: -3, fansSuccess: 8, fansFailure: -3 },
                { label: "Ficar na linha e esperar", skill: "vision", difficulty: 40, successText: "Esperou e pegou! Reflexo incrível!", failText: "Ficou plantado, bola entrou no canto.", successType: "save", failType: "goal_conceded", bossSuccess: 3, bossFailure: -2, fansSuccess: 5, fansFailure: -2 },
                { label: "Sair com os pés e tentar driblar", skill: "technique", difficulty: 80, successText: "GOLEIRO LÍBERO! Driblou o atacante!", failText: "Perdeu a bola fora da área! Gol!", successType: "sweeper_save", failType: "goal_conceded", bossSuccess: -3, bossFailure: -8, fansSuccess: 15, fansFailure: -10 }
            ]
        },
        {
            id: "penalty_save",
            text: "PÊNALTI contra! O batedor posiciona a bola. A torcida fica em silêncio. Você se prepara.",
            options: [
                { label: "Pular para a direita", skill: "vision", difficulty: 50, successText: "ACERTOU O LADO! DEFESAÇA!", failText: "Chutou do outro lado. Gol.", successType: "penalty_save", failType: "goal_conceded", bossSuccess: 5, bossFailure: -1, fansSuccess: 10, fansFailure: -2 },
                { label: "Pular para a esquerda", skill: "vision", difficulty: 50, successText: "PEGOU! A torcida explode!", failText: "Bateu no meio, você não estava lá.", successType: "penalty_save", failType: "goal_conceded", bossSuccess: 5, bossFailure: -1, fansSuccess: 10, fansFailure: -2 },
                { label: "Ficar parado no centro", skill: "power", difficulty: 55, successText: "FICOU PARADO E PEGOU! Que frieza!", failText: "Chutou no canto, impossível.", successType: "penalty_save", failType: "goal_conceded", bossSuccess: 3, bossFailure: -2, fansSuccess: 12, fansFailure: -1 }
            ]
        }
    ]
};

// Função utilitária para pegar uma carta aleatória
export function drawCard(position) {
    const deck = MatchEventsDeck[position];
    if (!deck || deck.length === 0) return null;
    return deck[Math.floor(Math.random() * deck.length)];
}
