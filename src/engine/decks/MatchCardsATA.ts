// ATA Match Cards — 15 cartas (4 Comum, 4 Incomum, 4 Raro, 3 Lendário)
export const MatchCardsATA = [
  // === COMUM (dif 20-40) ===
  { id:"ata_c1", tier:"common", text:"Você recebe na entrada da área com um defensor nas costas. Pouco espaço.", options:[
    {label:"Girar e chutar rasteiro",skill:"technique",difficulty:30,successText:"Giro perfeito, bola no canto!",failText:"Girou mas chutou fraco.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:0,fansSuccess:4,fansFailure:-1},
    {label:"Proteger e esperar apoio",skill:"power",difficulty:25,successText:"Segurou bem, passe para o gol!",failText:"Perdeu a dividida.",successType:"goal",failType:"turnover",bossSuccess:4,bossFailure:0,fansSuccess:2,fansFailure:0},
    {label:"Toque de primeira pro meia",skill:"vision",difficulty:20,successText:"Tabela rápida, meia finalizou!",failText:"Passe interceptado.",successType:"goal",failType:"miss",bossSuccess:3,bossFailure:0,fansSuccess:2,fansFailure:0}
  ]},
  { id:"ata_c2", tier:"common", text:"Cruzamento rasteiro da esquerda. Bola chega na sua frente, zagueiro atrás.", options:[
    {label:"Desviar de primeira",skill:"technique",difficulty:30,successText:"Desvio sutil! Bola no canto!",failText:"Não alcançou a bola.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:0,fansSuccess:4,fansFailure:-1},
    {label:"Dominar e chutar",skill:"power",difficulty:35,successText:"Domínio e bomba! Golaço!",failText:"Dominou mas o zagueiro chegou.",successType:"goal",failType:"blocked",bossSuccess:2,bossFailure:-1,fansSuccess:5,fansFailure:-1},
    {label:"Deixar passar pro segundo pau",skill:"vision",difficulty:20,successText:"Jogada inteligente! Companheiro marcou!",failText:"Ninguém apareceu atrás.",successType:"goal",failType:"miss",bossSuccess:4,bossFailure:0,fansSuccess:2,fansFailure:0}
  ]},
  { id:"ata_c3", tier:"common", text:"Lateral rápido, você recebe na ponta com espaço para correr.", options:[
    {label:"Avançar e cruzar",skill:"vision",difficulty:25,successText:"Cruzamento perfeito, gol de cabeça!",failText:"Cruzamento na defesa.",successType:"goal",failType:"cleared",bossSuccess:3,bossFailure:0,fansSuccess:3,fansFailure:0},
    {label:"Cortar pra dentro e chutar",skill:"technique",difficulty:35,successText:"Corte seco e golaço!",failText:"Chute bloqueado.",successType:"goal",failType:"blocked",bossSuccess:2,bossFailure:-1,fansSuccess:5,fansFailure:-1},
    {label:"Ir na linha e tocar curto",skill:"pace",difficulty:20,successText:"Jogada pela linha! Assistência!",failText:"Bola saiu pela linha de fundo.",successType:"goal",failType:"miss",bossSuccess:4,bossFailure:0,fansSuccess:2,fansFailure:0}
  ]},
  { id:"ata_c4", tier:"common", text:"Bola sobra após escanteio na meia-lua. Ninguém te marca.", options:[
    {label:"Chutar de primeira",skill:"power",difficulty:30,successText:"Bomba de fora! GOOOL!",failText:"Chutou por cima do gol.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:-1,fansSuccess:6,fansFailure:-1},
    {label:"Dominar e armar jogada",skill:"vision",difficulty:20,successText:"Lançamento longo, contra-ataque letal!",failText:"Domínio ruim, perdeu a chance.",successType:"goal",failType:"turnover",bossSuccess:4,bossFailure:0,fansSuccess:2,fansFailure:0},
    {label:"Driblar o marcador que vem",skill:"technique",difficulty:35,successText:"Driblou e ficou livre!",failText:"Perdeu a bola no drible.",successType:"goal",failType:"turnover",bossSuccess:1,bossFailure:-2,fansSuccess:5,fansFailure:-2}
  ]},
  // === INCOMUM (dif 40-60) ===
  { id:"ata_u1", tier:"uncommon", text:"Contra-ataque fulminante! Você puxa pelo meio com espaço. Zagueiro corre ao lado.", options:[
    {label:"Acelerar e chutar de longe",skill:"pace",difficulty:50,successText:"GOLAÇO de fora da área!",failText:"Chute passou longe.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:-2,fansSuccess:8,fansFailure:-1},
    {label:"Driblar o zagueiro",skill:"technique",difficulty:55,successText:"Drible desconcertante e gol!",failText:"Perdeu no drible.",successType:"goal",failType:"turnover",bossSuccess:1,bossFailure:-3,fansSuccess:7,fansFailure:-3},
    {label:"Lançamento pro ponta",skill:"vision",difficulty:40,successText:"Lançamento milimétrico! Gol!",failText:"Bola forte demais.",successType:"goal",failType:"miss",bossSuccess:4,bossFailure:0,fansSuccess:3,fansFailure:0}
  ]},
  { id:"ata_u2", tier:"uncommon", text:"Cara a cara com o goleiro! Ele avança em sua direção.", options:[
    {label:"Chutar rasteiro no canto",skill:"technique",difficulty:45,successText:"Rasteiro no canto! GOOL!",failText:"Goleiro defendeu.",successType:"goal",failType:"saved",bossSuccess:3,bossFailure:-1,fansSuccess:5,fansFailure:-2},
    {label:"Tocar pro companheiro livre",skill:"vision",difficulty:30,successText:"Passe perfeito, gol fácil!",failText:"Impedimento!",successType:"goal",failType:"offside",bossSuccess:5,bossFailure:0,fansSuccess:2,fansFailure:-1},
    {label:"Cavadinha",skill:"technique",difficulty:70,successText:"CAVADINHA GENIAL!",failText:"Goleiro pegou fácil.",successType:"goal",failType:"saved",bossSuccess:-2,bossFailure:-5,fansSuccess:10,fansFailure:-5}
  ]},
  { id:"ata_u3", tier:"uncommon", text:"PÊNALTI! O árbitro aponta. Você pega a bola.", options:[
    {label:"Força no meio",skill:"power",difficulty:40,successText:"GOOOL! Estufou a rede!",failText:"Goleiro não saiu. Pegou!",successType:"goal",failType:"saved",bossSuccess:2,bossFailure:-2,fansSuccess:4,fansFailure:-3},
    {label:"Colocar no canto",skill:"technique",difficulty:45,successText:"Bola no ângulo!",failText:"Isolou!",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:-3,fansSuccess:5,fansFailure:-4},
    {label:"Paradinha",skill:"technique",difficulty:75,successText:"PARADINHA GENIAL!",failText:"Paradinha ridícula.",successType:"goal",failType:"saved",bossSuccess:-3,bossFailure:-8,fansSuccess:12,fansFailure:-8}
  ]},
  { id:"ata_u4", tier:"uncommon", text:"Escanteio na segunda trave. Dois zagueiros disputam com você.", options:[
    {label:"Cabecear com força",skill:"power",difficulty:45,successText:"GOOOL de cabeça!",failText:"Cabeceio fraco.",successType:"goal",failType:"saved",bossSuccess:3,bossFailure:0,fansSuccess:5,fansFailure:-1},
    {label:"Desviar de leve",skill:"technique",difficulty:50,successText:"Desvio sutil, gol!",failText:"Não pegou bem.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:-1,fansSuccess:4,fansFailure:-1},
    {label:"Deixar passar pro companheiro",skill:"vision",difficulty:25,successText:"Jogada ensaiada! GOL!",failText:"Ninguém chegou.",successType:"goal",failType:"miss",bossSuccess:5,bossFailure:0,fansSuccess:2,fansFailure:0}
  ]},
  // === RARO (dif 60-80) ===
  { id:"ata_r1", tier:"rare", text:"Bola vem pelo alto, de costas pro gol. Momento de gênio ou fiasco.", options:[
    {label:"Voleio de primeira",skill:"technique",difficulty:70,successText:"VOLEIO ESPETACULAR! GOLAÇO!",failText:"Voleio na arquibancada.",successType:"goal",failType:"miss",bossSuccess:1,bossFailure:-3,fansSuccess:12,fansFailure:-3},
    {label:"Dominar no peito e girar",skill:"power",difficulty:55,successText:"Domínio e giro perfeito!",failText:"Domínio ruim, bola perdida.",successType:"goal",failType:"turnover",bossSuccess:3,bossFailure:-1,fansSuccess:6,fansFailure:-1},
    {label:"Cabeceio acrobático",skill:"pace",difficulty:65,successText:"Cabeceio inacreditável!",failText:"Cabeceio sem direção.",successType:"goal",failType:"miss",bossSuccess:1,bossFailure:-2,fansSuccess:10,fansFailure:-2}
  ]},
  { id:"ata_r2", tier:"rare", text:"Drible na entrada da área. Dois marcadores. A torcida grita seu nome.", options:[
    {label:"Drible curto e chute colocado",skill:"technique",difficulty:65,successText:"Driblou os dois! GOLAÇO!",failText:"Tropeçou no segundo.",successType:"goal",failType:"turnover",bossSuccess:0,bossFailure:-4,fansSuccess:10,fansFailure:-4},
    {label:"Passar entre as pernas do zagueiro",skill:"technique",difficulty:75,successText:"CANETA e gol!",failText:"Caneta travada. Contra-ataque.",successType:"goal",failType:"turnover",bossSuccess:-2,bossFailure:-5,fansSuccess:14,fansFailure:-5},
    {label:"Chute de longe com efeito",skill:"power",difficulty:60,successText:"Chute com efeito no ângulo!",failText:"Efeito demais, saiu torto.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:-2,fansSuccess:8,fansFailure:-2}
  ]},
  { id:"ata_r3", tier:"rare", text:"Falta na entrada da área. Barreira formada. A bola é sua.", options:[
    {label:"Por cima da barreira com efeito",skill:"technique",difficulty:60,successText:"Curva perfeita! GOLAÇO DE FALTA!",failText:"Na barreira.",successType:"goal",failType:"blocked",bossSuccess:3,bossFailure:-1,fansSuccess:10,fansFailure:-1},
    {label:"Rasteiro embaixo da barreira",skill:"technique",difficulty:55,successText:"Passou por baixo! GOL!",failText:"Bateu na barreira.",successType:"goal",failType:"blocked",bossSuccess:2,bossFailure:0,fansSuccess:7,fansFailure:0},
    {label:"Cruzar na área",skill:"vision",difficulty:35,successText:"Cruzamento, cabeceio e gol!",failText:"Zagueiro afastou.",successType:"goal",failType:"cleared",bossSuccess:4,bossFailure:0,fansSuccess:3,fansFailure:0}
  ]},
  { id:"ata_r4", tier:"rare", text:"Último minuto! Seu time perde por 1. A bola chega nos seus pés na grande área.", options:[
    {label:"Chutar com tudo!",skill:"power",difficulty:60,successText:"GOOOL NO ÚLTIMO MINUTO!!! EMPATE!",failText:"Chute por cima... Fim de jogo.",successType:"goal",failType:"miss",bossSuccess:3,bossFailure:-2,fansSuccess:15,fansFailure:-5},
    {label:"Dominar e pensar",skill:"vision",difficulty:55,successText:"Calma absoluta. Gol cirúrgico!",failText:"Demorou e o zagueiro tirou.",successType:"goal",failType:"turnover",bossSuccess:5,bossFailure:-3,fansSuccess:12,fansFailure:-3},
    {label:"Cabecear de qualquer jeito",skill:"power",difficulty:50,successText:"Cabeçada no cantinho! GOOOL!",failText:"Cabeçada fraca.",successType:"goal",failType:"saved",bossSuccess:3,bossFailure:-1,fansSuccess:10,fansFailure:-2}
  ]},
  // === LENDÁRIO (dif 80+, requer renown >= 3) ===
  { id:"ata_l1", tier:"legendary", minRenown:3, text:"Bola alçada na área. Você está de costas. O estádio inteiro prende a respiração.", options:[
    {label:"GOL DE BICICLETA",skill:"technique",difficulty:85,successText:"BICICLETAAA! GOL HISTÓRICO!!!",failText:"Bicicleta no vácuo. Vergonha.",successType:"goal",failType:"miss",bossSuccess:-3,bossFailure:-10,fansSuccess:20,fansFailure:-8},
    {label:"Dominar e finalizar normal",skill:"technique",difficulty:45,successText:"Gol seguro. Eficiente.",failText:"Domínio ruim.",successType:"goal",failType:"turnover",bossSuccess:3,bossFailure:-1,fansSuccess:3,fansFailure:-1},
    {label:"Escorpião (chute de calcanhar)",skill:"technique",difficulty:90,successText:"ESCORPIÃO!!! GOL DO ANO!!!",failText:"Errou completamente. Memes.",successType:"goal",failType:"miss",bossSuccess:-5,bossFailure:-12,fansSuccess:25,fansFailure:-10}
  ]},
  { id:"ata_l2", tier:"legendary", minRenown:3, text:"Você recebe no meio-campo. 40 metros do gol. Goleiro adiantado.", options:[
    {label:"CHUTE DO MEIO-CAMPO",skill:"technique",difficulty:88,successText:"DO MEIO-CAMPO!!! GOLAÇO ABSURDO!!!",failText:"Longe. Muito longe.",successType:"goal",failType:"miss",bossSuccess:-4,bossFailure:-8,fansSuccess:22,fansFailure:-6},
    {label:"Conduzir e chutar de 30m",skill:"pace",difficulty:60,successText:"Corrida e golaço!",failText:"Goleiro voltou a tempo.",successType:"goal",failType:"saved",bossSuccess:2,bossFailure:-2,fansSuccess:8,fansFailure:-2},
    {label:"Lançar pro atacante que corre",skill:"vision",difficulty:40,successText:"Lançamento genial!",failText:"Impedimento.",successType:"goal",failType:"offside",bossSuccess:4,bossFailure:0,fansSuccess:3,fansFailure:0}
  ]},
  { id:"ata_l3", tier:"legendary", minRenown:4, text:"FINAL DE CAMPEONATO. Prorrogação. Pênalti decisivo. O mundo te assiste.", options:[
    {label:"Cavadinha Panenka",skill:"technique",difficulty:85,successText:"PANENKA NA FINAL!!! LENDA VIVA!!!",failText:"Panenka na final... e errou. Infame.",successType:"goal",failType:"saved",bossSuccess:-5,bossFailure:-15,fansSuccess:25,fansFailure:-15},
    {label:"Potência no ângulo",skill:"power",difficulty:55,successText:"BOMBA! CAMPEÃO!!!",failText:"Na trave! Desolação.",successType:"goal",failType:"miss",bossSuccess:3,bossFailure:-5,fansSuccess:15,fansFailure:-8},
    {label:"Deslocamento e canto oposto",skill:"vision",difficulty:50,successText:"Leu o goleiro! CAMPEÃO!",failText:"Goleiro acertou o lado.",successType:"goal",failType:"saved",bossSuccess:3,bossFailure:-4,fansSuccess:12,fansFailure:-6}
  ]}
];
