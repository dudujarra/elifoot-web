// Eventos entre semanas (off-pitch) com triggers contextuais
export const OffPitchEventsDeck = [
    {
        id: "press_conference",
        trigger: (player) => player.starRating >= 2,
        text: "Coletiva de imprensa! Um jornalista pergunta: 'Você acha que merece mais minutos em campo?'",
        options: [
            { label: "Responder diplomaticamente", effect: { boss: 2, fans: 1, sponsors: 1 }, resultText: "Resposta equilibrada. Todos aprovam." },
            { label: "Criticar o técnico publicamente", effect: { boss: -8, fans: 5, sponsors: 3 }, resultText: "Bomba na mídia! Torcida te apoia, técnico furioso." },
            { label: "Elogiar o grupo e desviar", effect: { boss: 3, teammates: 3, fans: -1 }, resultText: "Resposta de líder. Vestiário fortalecido." }
        ]
    },
    {
        id: "sponsor_offer",
        trigger: (player) => player.starRating >= 2 && player.relationships.sponsors > 40,
        text: "Um patrocinador te oferece um contrato publicitário de R$ 5.000. Mas precisa faltar um treino.",
        options: [
            { label: "Aceitar o contrato", effect: { sponsors: 5, boss: -5, money: 5000, actionSlots: -1 }, resultText: "Dinheiro no bolso, mas o técnico não gostou." },
            { label: "Recusar educadamente", effect: { boss: 3, sponsors: -3 }, resultText: "O técnico soube e aprovou sua dedicação." },
            { label: "Negociar para outro dia", effect: { sponsors: 2, money: 3000 }, resultText: "Conseguiu um meio-termo. Bem jogado." }
        ]
    },
    {
        id: "teammate_conflict",
        trigger: (player) => player.relationships.teammates < 50,
        text: "Um companheiro te confronta no vestiário: 'Você está muito individualista em campo!'",
        options: [
            { label: "Pedir desculpas e ouvir", effect: { teammates: 5, fans: -1 }, resultText: "Humildade. O vestiário se acalmou." },
            { label: "Rebater: 'Eu carrego esse time!'", effect: { teammates: -5, fans: 3, boss: -3 }, resultText: "Briga no vestiário. Manchete amanhã." },
            { label: "Conversar em particular depois", effect: { teammates: 3, boss: 1 }, resultText: "Resolveu como adulto. Respeito mútuo." }
        ]
    },
    {
        id: "injury_scare",
        trigger: (player) => player.energy < 40,
        text: "Você sente uma fisgada na coxa durante o aquecimento. Nada grave, mas preocupa.",
        options: [
            { label: "Ir ao fisioterapeuta (gasta 1 slot)", effect: { energy: 20, actionSlots: -1 }, resultText: "Fisio recuperou parcialmente. Melhor prevenir." },
            { label: "Ignorar e jogar assim mesmo", effect: { energy: -10, boss: -2 }, resultText: "Forçou. Se piorar na partida, será pior." },
            { label: "Avisar o técnico honestamente", effect: { boss: 3, energy: 10 }, resultText: "Técnico aliviou seu treino. Boa decisão." }
        ]
    },
    {
        id: "fan_encounter",
        trigger: () => true,
        text: "Um grupo de torcedores te reconhece na rua e pede fotos.",
        options: [
            { label: "Tirar foto e conversar", effect: { fans: 3, sponsors: 1 }, resultText: "Torcida te ama! Imagem positiva." },
            { label: "Recusar educadamente (com pressa)", effect: { fans: -2 }, resultText: "Vídeo no Twitter: 'jogador ignorou fã'." },
            { label: "Convidar para assistir o treino", effect: { fans: 5, boss: -2, teammates: 1 }, resultText: "Gesto incrível! Mas o técnico não gostou da distração." }
        ]
    },
    {
        id: "contract_renewal",
        trigger: (player) => player.renown >= 10,
        text: "O clube oferece renovação de contrato com aumento de 50% no salário.",
        options: [
            { label: "Aceitar imediatamente", effect: { boss: 5, wage_multiplier: 1.5 }, resultText: "Renovação assinada! Estabilidade garantida." },
            { label: "Pedir o dobro", effect: { boss: -3, wage_multiplier: 2.0 }, resultText: "Ousado. O clube aceitou mas não gostou." },
            { label: "Recusar (quer sair)", effect: { boss: -8, fans: -5, teammates: -3 }, resultText: "Clima pesado. Todos se sentiram traídos." }
        ]
    },
    {
        id: "charity_event",
        trigger: () => true,
        text: "Convite para um evento beneficente no dia de folga. Boa exposição mas cansa.",
        options: [
            { label: "Participar com entusiasmo", effect: { fans: 4, sponsors: 3, energy: -10 }, resultText: "Imagem excelente! Mas chegou cansado no treino." },
            { label: "Doar dinheiro mas não ir", effect: { fans: 1, money: -500 }, resultText: "Contribuiu financeiramente. Discreto." },
            { label: "Ignorar o convite", effect: { fans: -1, sponsors: -2 }, resultText: "Oportunidade perdida de melhorar a imagem." }
        ]
    }
];
