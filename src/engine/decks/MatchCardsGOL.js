// GOL Match Cards — 7 cartas
export const MatchCardsGOL = [
  {id:"gol_c1",tier:"common",text:"Chute de fora da área. Bola vem com efeito.",options:[
    {label:"Espalmar pro lado",skill:"vision",difficulty:30,successText:"Defesa segura! Espalma pro canto.",failText:"Espalmou pro meio. Rebote perigoso.",successType:"save",failType:"rebound",bossSuccess:2,bossFailure:-1,fansSuccess:3,fansFailure:-1},
    {label:"Encaixar no peito",skill:"power",difficulty:35,successText:"Encaixou firme! Seguro.",failText:"Bola escorregou! Quase gol.",successType:"catch",failType:"fumble",bossSuccess:3,bossFailure:-2,fansSuccess:2,fansFailure:-2},
    {label:"Desviar por cima",skill:"technique",difficulty:25,successText:"Tapa por cima da trave!",failText:"Desviou mal, entrou.",successType:"save",failType:"goal_conceded",bossSuccess:2,bossFailure:-2,fansSuccess:3,fansFailure:-2}
  ]},
  {id:"gol_c2",tier:"common",text:"Cruzamento na sua área. Você decide se sai ou fica.",options:[
    {label:"Sair e socar",skill:"power",difficulty:30,successText:"SOCO FIRME! Perigo afastado!",failText:"Saiu e não pegou. Cabeçada livre.",successType:"punch",failType:"goal_conceded",bossSuccess:3,bossFailure:-3,fansSuccess:3,fansFailure:-3},
    {label:"Ficar na linha",skill:"vision",difficulty:25,successText:"Esperou certo. Defesa tranquila.",failText:"Ficou plantado. Cabeçada no canto.",successType:"save",failType:"goal_conceded",bossSuccess:2,bossFailure:-2,fansSuccess:2,fansFailure:-2},
    {label:"Sair e encaixar no alto",skill:"pace",difficulty:35,successText:"Encaixou no alto! Seguro!",failText:"Não alcançou. Gol de cabeça.",successType:"catch",failType:"goal_conceded",bossSuccess:3,bossFailure:-2,fansSuccess:4,fansFailure:-2}
  ]},
  {id:"gol_u1",tier:"uncommon",text:"Cara a cara! Atacante avança em velocidade!",options:[
    {label:"Sair e fechar o ângulo",skill:"pace",difficulty:45,successText:"FECHOU O GOL! Defesaça!",failText:"Saiu cedo. Cobertura.",successType:"great_save",failType:"goal_conceded",bossSuccess:5,bossFailure:-3,fansSuccess:8,fansFailure:-3},
    {label:"Ficar na linha e esperar",skill:"vision",difficulty:40,successText:"Esperou e pegou! Reflexo!",failText:"Plantado. Bola no canto.",successType:"save",failType:"goal_conceded",bossSuccess:3,bossFailure:-2,fansSuccess:5,fansFailure:-2},
    {label:"Sair com os pés",skill:"technique",difficulty:75,successText:"GOLEIRO LÍBERO! Driblou!",failText:"Perdeu fora da área! Gol!",successType:"sweeper_save",failType:"goal_conceded",bossSuccess:-3,bossFailure:-8,fansSuccess:15,fansFailure:-10}
  ]},
  {id:"gol_u2",tier:"uncommon",text:"PÊNALTI contra! Batedor posiciona a bola.",options:[
    {label:"Pular pra direita",skill:"vision",difficulty:50,successText:"ACERTOU O LADO! DEFESAÇA!",failText:"Lado errado. Gol.",successType:"penalty_save",failType:"goal_conceded",bossSuccess:5,bossFailure:-1,fansSuccess:10,fansFailure:-2},
    {label:"Pular pra esquerda",skill:"vision",difficulty:50,successText:"PEGOU! Torcida explode!",failText:"Bateu no meio.",successType:"penalty_save",failType:"goal_conceded",bossSuccess:5,bossFailure:-1,fansSuccess:10,fansFailure:-2},
    {label:"Ficar parado no centro",skill:"power",difficulty:55,successText:"FICOU PARADO E PEGOU! Frieza!",failText:"Chutou no canto.",successType:"penalty_save",failType:"goal_conceded",bossSuccess:3,bossFailure:-2,fansSuccess:12,fansFailure:-1}
  ]},
  {id:"gol_r1",tier:"rare",text:"Cobrança de falta perigosa. Barreira posicionada. Bola vem com veneno.",options:[
    {label:"Voar pro ângulo",skill:"pace",difficulty:60,successText:"VOO DE GATO! DEFESA ESPETACULAR!",failText:"Quase... entrou no ângulo.",successType:"great_save",failType:"goal_conceded",bossSuccess:4,bossFailure:-2,fansSuccess:12,fansFailure:-2},
    {label:"Confiar na barreira",skill:"vision",difficulty:40,successText:"Barreira funcionou!",failText:"Passou pela barreira. Gol.",successType:"wall_block",failType:"goal_conceded",bossSuccess:2,bossFailure:-3,fansSuccess:2,fansFailure:-3},
    {label:"Dar um passo e reagir",skill:"technique",difficulty:50,successText:"Reflexo incrível! Defendeu!",failText:"Reagiu tarde.",successType:"save",failType:"goal_conceded",bossSuccess:3,bossFailure:-2,fansSuccess:8,fansFailure:-2}
  ]},
  {id:"gol_r2",tier:"rare",text:"Seu time precisa de gol. Último escanteio. Técnico manda você subir.",options:[
    {label:"Subir e cabecear!",skill:"power",difficulty:65,successText:"GOLEIRO FEZ GOL! LOUCURA!!!",failText:"Cabeçada fraca. Contra-ataque vazio.",successType:"goal",failType:"goal_conceded",bossSuccess:2,bossFailure:-8,fansSuccess:20,fansFailure:-6},
    {label:"Ficar no gol",skill:"vision",difficulty:15,successText:"Ficou. Prudente.",failText:"—",successType:"composure",failType:"nothing",bossSuccess:2,bossFailure:0,fansSuccess:-2,fansFailure:0},
    {label:"Subir e fazer presença",skill:"power",difficulty:45,successText:"Criou confusão! Zagueiro marcou!",failText:"Contra-ataque. Gol adversário.",successType:"goal",failType:"goal_conceded",bossSuccess:1,bossFailure:-5,fansSuccess:10,fansFailure:-5}
  ]},
  {id:"gol_l1",tier:"legendary",minRenown:3,text:"Pênalti decisivo na final. Se defender, é campeão. O mundo te assiste.",options:[
    {label:"Estudar o batedor e pular certo",skill:"vision",difficulty:70,successText:"ESTUDOU E DEFENDEU! CAMPEÃO!!!",failText:"Errou o lado. Vice.",successType:"legendary_save",failType:"goal_conceded",bossSuccess:5,bossFailure:-5,fansSuccess:25,fansFailure:-10},
    {label:"Ficar parado e confiar",skill:"power",difficulty:60,successText:"PARADO NO MEIO! PEGOU! HERÓI!",failText:"Chutou com força no canto.",successType:"legendary_save",failType:"goal_conceded",bossSuccess:4,bossFailure:-4,fansSuccess:22,fansFailure:-8},
    {label:"Dançar na linha pra desconcentrar",skill:"technique",difficulty:65,successText:"DANÇOU E PEGOU! VIRAL!",failText:"Dançou e tomou. Meme eterno.",successType:"legendary_save",failType:"goal_conceded",bossSuccess:-2,bossFailure:-12,fansSuccess:20,fansFailure:-15}
  ]}
];
