// Eventos para quando o jogador está no banco de reservas
export const BenchEventsDeck = [
    {
        id: "bench_warm_up",
        text: "O técnico olha para o banco. Seus olhos param em você por um segundo.",
        options: [
            { label: "Levantar e começar a aquecer", effect: { boss: 2, fans: 0 }, resultText: "O técnico nota sua dedicação." },
            { label: "Ficar sentado e torcer", effect: { boss: 0, fans: 1 }, resultText: "Você torce junto com a galera." },
            { label: "Reclamar em voz baixa", effect: { boss: -3, fans: 0, teammates: -1 }, resultText: "Um companheiro ouviu. Clima pesado." }
        ]
    },
    {
        id: "bench_teammate_scores",
        text: "Seu substituto acabou de fazer um golaço! A torcida grita o nome dele.",
        options: [
            { label: "Comemorar e aplaudir", effect: { teammates: 3, boss: 1 }, resultText: "Demonstrou espírito de equipe." },
            { label: "Ficar indiferente", effect: { teammates: -2, boss: -1 }, resultText: "A câmera pegou sua cara fechada." },
            { label: "Ir até ele e abraçar", effect: { teammates: 5, fans: 2, boss: 2 }, resultText: "Imagem linda. Torcida aprova." }
        ]
    },
    {
        id: "bench_coach_talk",
        text: "No intervalo, o técnico vem até você. 'Preciso de mais intensidade na próxima semana.'",
        options: [
            { label: "Acenar e concordar", effect: { boss: 2 }, resultText: "Aceitou o feedback com humildade." },
            { label: "Perguntar o que precisa melhorar", effect: { boss: 3 }, resultText: "O técnico gostou da proatividade." },
            { label: "Questionar a escalação", effect: { boss: -5, fans: 2 }, resultText: "Tensão no vestiário. Mas a torcida te apoia." }
        ]
    },
    {
        id: "bench_fan_chant",
        text: "Um grupo de torcedores começa a gritar seu nome pedindo que entre em campo.",
        options: [
            { label: "Acenar para a torcida", effect: { fans: 3, boss: -1 }, resultText: "A torcida te ama, o técnico não curtiu." },
            { label: "Ignorar e focar no jogo", effect: { boss: 2, fans: -1 }, resultText: "Profissionalismo acima de tudo." },
            { label: "Fazer gesto pedindo calma", effect: { fans: 1, boss: 1 }, resultText: "Maturidade. Todos aprovam." }
        ]
    },
    {
        id: "bench_media_camera",
        text: "A câmera da TV foca no seu rosto no banco. Milhões te assistem neste exato momento.",
        options: [
            { label: "Sorrir e acenar", effect: { fans: 2, sponsors: 2 }, resultText: "Boa imagem! Sponsors gostam." },
            { label: "Manter cara séria e focada", effect: { boss: 2, fans: 0 }, resultText: "Imagem de profissional." },
            { label: "Fazer cara de irritado", effect: { fans: -2, boss: -3, sponsors: -2 }, resultText: "Viral negativo. Manchetes amanhã." }
        ]
    },
    {
        id: "bench_injury_scare",
        text: "Um titular se machucou! O técnico olha para o banco avaliando quem entra.",
        options: [
            { label: "Se oferecer imediatamente", effect: { boss: 3, energy: -10 }, resultText: "Entrou e deu tudo nos minutos finais." },
            { label: "Esperar ser chamado", effect: { boss: 1 }, resultText: "Aguardou com compostura." },
            { label: "Fingir que está com dor muscular", effect: { boss: -5, teammates: -3 }, resultText: "Ninguém acreditou. Reputação manchada." }
        ]
    }
];
