// MEI Match Cards — 10 cartas
export const MatchCardsMEI = [
  {id:"mei_c1",tier:"common",text:"Bola no meio-campo. Dois companheiros fazem movimento à frente.",options:[
    {label:"Passe curto seguro",skill:"vision",difficulty:20,successText:"Troca de passes, gol!",failText:"Passe interceptado.",successType:"goal",failType:"turnover",bossSuccess:4,bossFailure:0,fansSuccess:2,fansFailure:0},
    {label:"Lançamento em profundidade",skill:"vision",difficulty:40,successText:"Bola perfeita! Atacante livre!",failText:"Lançamento longo demais.",successType:"goal",failType:"miss",bossSuccess:3,bossFailure:-1,fansSuccess:5,fansFailure:-1},
    {label:"Conduzir e infiltrar",skill:"pace",difficulty:35,successText:"Infiltrou e chutou!",failText:"Marcador tirou a bola.",successType:"goal",failType:"turnover",bossSuccess:2,bossFailure:-2,fansSuccess:6,fansFailure:-2}
  ]},
  {id:"mei_c2",tier:"common",text:"Roubo de bola no meio. Chance de contra-ataque rápido.",options:[
    {label:"Lançar imediatamente",skill:"vision",difficulty:30,successText:"Contra-ataque letal!",failText:"Lançamento impreciso.",successType:"goal",failType:"miss",bossSuccess:4,bossFailure:0,fansSuccess:4,fansFailure:0},
    {label:"Conduzir e esperar apoio",skill:"technique",difficulty:25,successText:"Jogou com calma. Gol construído.",failText:"Demorou e perdeu o momento.",successType:"goal",failType:"turnover",bossSuccess:3,bossFailure:-1,fansSuccess:3,fansFailure:-1},
    {label:"Chute de longe surpresa",skill:"power",difficulty:55,successText:"BOMBA! Goleiro nem viu!",failText:"Longe do gol.",successType:"goal",failType:"miss",bossSuccess:0,bossFailure:-2,fansSuccess:8,fansFailure:-1}
  ]},
  {id:"mei_c3",tier:"common",text:"Cobrança de escanteio. Você é o cobrador.",options:[
    {label:"Cruzar na primeira trave",skill:"technique",difficulty:30,successText:"Cabeçada certeira! GOL!",failText:"Cruzamento curto.",successType:"goal",failType:"cleared",bossSuccess:3,bossFailure:0,fansSuccess:4,fansFailure:0},
    {label:"Cruzar na segunda trave",skill:"vision",difficulty:35,successText:"Chegou livre atrás! GOL!",failText:"Bola forte demais, saiu.",successType:"goal",failType:"miss",bossSuccess:3,bossFailure:0,fansSuccess:4,fansFailure:0},
    {label:"Escanteio curto ensaiado",skill:"vision",difficulty:25,successText:"Jogada ensaiada perfeita!",failText:"Adversário leu a jogada.",successType:"goal",failType:"turnover",bossSuccess:5,bossFailure:0,fansSuccess:2,fansFailure:0}
  ]},
  {id:"mei_u1",tier:"uncommon",text:"Falta na entrada da área. Barreira formada. Você posiciona a bola.",options:[
    {label:"Cobrar por cima da barreira",skill:"technique",difficulty:55,successText:"GOLAÇO DE FALTA! Curva perfeita!",failText:"Na barreira.",successType:"goal",failType:"blocked",bossSuccess:3,bossFailure:-1,fansSuccess:10,fansFailure:-1},
    {label:"Rasteiro no canto",skill:"technique",difficulty:45,successText:"Passou por baixo! GOL!",failText:"Bateu na barreira.",successType:"goal",failType:"blocked",bossSuccess:2,bossFailure:0,fansSuccess:5,fansFailure:0},
    {label:"Cruzar na área",skill:"vision",difficulty:30,successText:"Cruzamento, cabeçada, gol!",failText:"Zagueiro afastou.",successType:"goal",failType:"cleared",bossSuccess:4,bossFailure:0,fansSuccess:3,fansFailure:0}
  ]},
  {id:"mei_u2",tier:"uncommon",text:"Tabela rápida no meio. Você recebe de volta na meia-lua.",options:[
    {label:"Chute colocado no canto",skill:"technique",difficulty:50,successText:"Colocação perfeita! GOLAÇO!",failText:"Passou raspando a trave.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:-1,fansSuccess:7,fansFailure:-1},
    {label:"Driblar e chutar",skill:"technique",difficulty:55,successText:"Drible e gol!",failText:"Perdeu no drible.",successType:"goal",failType:"turnover",bossSuccess:1,bossFailure:-3,fansSuccess:8,fansFailure:-3},
    {label:"Tocar pro ponta que infiltra",skill:"vision",difficulty:35,successText:"Assistência genial!",failText:"Ponta não chegou.",successType:"goal",failType:"miss",bossSuccess:4,bossFailure:0,fansSuccess:4,fansFailure:0}
  ]},
  {id:"mei_u3",tier:"uncommon",text:"Você intercepta um passe e tem 3 contra 2.",options:[
    {label:"Conduzir e decidir na hora",skill:"vision",difficulty:45,successText:"Jogada de maestro! Gol!",failText:"Indeciso, zagueiro recuperou.",successType:"goal",failType:"turnover",bossSuccess:3,bossFailure:-2,fansSuccess:6,fansFailure:-2},
    {label:"Lançar o mais rápido",skill:"vision",difficulty:35,successText:"Velocidade matou! GOL!",failText:"Impedimento no lance.",successType:"goal",failType:"offside",bossSuccess:4,bossFailure:0,fansSuccess:4,fansFailure:0},
    {label:"Chutar de fora da área",skill:"power",difficulty:55,successText:"MÍSSIL! Golaço!",failText:"Passou longe.",successType:"goal",failType:"miss",bossSuccess:0,bossFailure:-2,fansSuccess:9,fansFailure:-1}
  ]},
  {id:"mei_r1",tier:"rare",text:"Bola dividida no meio. Chance de passe de calcanhar genial.",options:[
    {label:"Passe de calcanhar",skill:"technique",difficulty:65,successText:"CALCANHAR GENIAL! Gol do time!",failText:"Calcanhar no nada.",successType:"goal",failType:"turnover",bossSuccess:-1,bossFailure:-5,fansSuccess:12,fansFailure:-4},
    {label:"Dominar e construir",skill:"vision",difficulty:30,successText:"Construiu com paciência. Gol.",failText:"Perdeu a bola no domínio.",successType:"goal",failType:"turnover",bossSuccess:4,bossFailure:-1,fansSuccess:3,fansFailure:-1},
    {label:"Lançamento de trivela",skill:"technique",difficulty:70,successText:"TRIVELA! Passe do ano!",failText:"Trivela torta.",successType:"goal",failType:"miss",bossSuccess:0,bossFailure:-4,fansSuccess:14,fansFailure:-3}
  ]},
  {id:"mei_r2",tier:"rare",text:"Jogada ensaiada no treino. Momento de executar.",options:[
    {label:"Executar a jogada combinada",skill:"vision",difficulty:60,successText:"Saiu EXATAMENTE como treinou! GOL!",failText:"Descompassou. Não funcionou.",successType:"goal",failType:"turnover",bossSuccess:6,bossFailure:-2,fansSuccess:6,fansFailure:-2},
    {label:"Improvisar algo diferente",skill:"technique",difficulty:65,successText:"Improvisou e funcionou!",failText:"Saiu do plano. Técnico furioso.",successType:"goal",failType:"turnover",bossSuccess:-3,bossFailure:-6,fansSuccess:10,fansFailure:-4},
    {label:"Chutar direto ao gol",skill:"power",difficulty:55,successText:"Chute certeiro!",failText:"Goleiro pegou.",successType:"goal",failType:"saved",bossSuccess:1,bossFailure:-1,fansSuccess:6,fansFailure:-1}
  ]},
  {id:"mei_l1",tier:"legendary",minRenown:3,text:"Você recebe de costas a 25m do gol. Vira e vê o gol aberto por um instante.",options:[
    {label:"Chute de cobertura impossível",skill:"technique",difficulty:82,successText:"COBERTURA DE 25 METROS! OBRA DE ARTE!",failText:"Bonito mas longe demais.",successType:"goal",failType:"miss",bossSuccess:-2,bossFailure:-6,fansSuccess:20,fansFailure:-4},
    {label:"Drible + passe decisivo",skill:"vision",difficulty:55,successText:"Visão de jogo absurda. Assistência de gênio.",failText:"Marcador recuperou.",successType:"goal",failType:"turnover",bossSuccess:4,bossFailure:-2,fansSuccess:8,fansFailure:-2},
    {label:"Lançamento de letra",skill:"technique",difficulty:80,successText:"DE LETRA! Passe do século!",failText:"Tentativa vergonhosa.",successType:"goal",failType:"turnover",bossSuccess:-3,bossFailure:-8,fansSuccess:18,fansFailure:-6}
  ]},
  {id:"mei_l2",tier:"legendary",minRenown:4,text:"Derby decisivo. Estádio em êxtase. Bola sobra pra você na entrada da área aos 89'.",options:[
    {label:"Chute de primeira com alma",skill:"power",difficulty:65,successText:"GOLAÇO NO DERBY! HERÓI!",failText:"Por cima... Silêncio.",successType:"goal",failType:"miss",bossSuccess:3,bossFailure:-3,fansSuccess:20,fansFailure:-8},
    {label:"Drible duplo e finalização",skill:"technique",difficulty:80,successText:"DRIBLOU DOIS E FEZ! LENDA!",failText:"Perdeu tentando demais.",successType:"goal",failType:"turnover",bossSuccess:-2,bossFailure:-6,fansSuccess:22,fansFailure:-6},
    {label:"Passe decisivo pro artilheiro",skill:"vision",difficulty:45,successText:"Assistência cirúrgica! Time comemora junto!",failText:"Artilheiro impedido.",successType:"goal",failType:"offside",bossSuccess:5,bossFailure:-1,fansSuccess:10,fansFailure:-3}
  ]}
];
