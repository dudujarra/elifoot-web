// DEF Match Cards — 8 cartas
export const MatchCardsDEF = [
  {id:"def_c1",tier:"common",text:"Bola longa para o atacante adversário. Você corre pra disputar.",options:[
    {label:"Antecipar e cabecear",skill:"vision",difficulty:30,successText:"Leitura perfeita! Bola afastada.",failText:"Atacante ganhou posição.",successType:"interception",failType:"goal_conceded",bossSuccess:3,bossFailure:-2,fansSuccess:3,fansFailure:-2},
    {label:"Acompanhar e pressionar",skill:"pace",difficulty:25,successText:"Pressionou até o erro!",failText:"Atacante mais rápido.",successType:"tackle",failType:"goal_conceded",bossSuccess:3,bossFailure:-1,fansSuccess:2,fansFailure:-2},
    {label:"Carrinho forte",skill:"power",difficulty:35,successText:"Carrinho limpo!",failText:"Falta! Cartão amarelo.",successType:"tackle",failType:"yellow_card",bossSuccess:2,bossFailure:-3,fansSuccess:4,fansFailure:-3}
  ]},
  {id:"def_c2",tier:"common",text:"Cruzamento vem na sua área. Centroavante se posiciona.",options:[
    {label:"Subir e cabecear primeiro",skill:"power",difficulty:35,successText:"Ganhou no alto! Perigo afastado.",failText:"Perdeu o duelo aéreo.",successType:"header_won",failType:"header_lost",bossSuccess:3,bossFailure:-2,fansSuccess:3,fansFailure:-2},
    {label:"Cortar antes do cruzamento",skill:"pace",difficulty:30,successText:"Cortou o cruzamento!",failText:"Chegou atrasado.",successType:"interception",failType:"cross_completed",bossSuccess:4,bossFailure:-1,fansSuccess:2,fansFailure:-1},
    {label:"Marcar por trás, firme",skill:"power",difficulty:25,successText:"Marcação firme. Atacante travado.",failText:"Puxou a camisa. Falta!",successType:"tackle",failType:"foul",bossSuccess:3,bossFailure:-2,fansSuccess:2,fansFailure:-2}
  ]},
  {id:"def_u1",tier:"uncommon",text:"Atacante passa pelo último zagueiro! Você é a última linha!",options:[
    {label:"Carrinho deslizante",skill:"power",difficulty:50,successText:"CARRINHO PERFEITO!",failText:"Carrinho no corpo! Pênalti!",successType:"tackle",failType:"penalty_given",bossSuccess:5,bossFailure:-5,fansSuccess:6,fansFailure:-4},
    {label:"Acompanhar e fechar ângulo",skill:"pace",difficulty:40,successText:"Pressionou até errar!",failText:"Atacante mais rápido. Gol.",successType:"tackle",failType:"goal_conceded",bossSuccess:3,bossFailure:-2,fansSuccess:3,fansFailure:-2},
    {label:"Cortar linha de passe",skill:"vision",difficulty:45,successText:"Leitura genial! Interceptou!",failText:"Leu errado. Atacante livre.",successType:"interception",failType:"goal_conceded",bossSuccess:4,bossFailure:-3,fansSuccess:4,fansFailure:-3}
  ]},
  {id:"def_u2",tier:"uncommon",text:"Contra-ataque adversário! 2 contra 1. Você é o único defensor.",options:[
    {label:"Fechar o meio e forçar a lateral",skill:"vision",difficulty:45,successText:"Fechou o espaço! Chute fraco.",failText:"Passou por dentro. Gol.",successType:"positioning",failType:"goal_conceded",bossSuccess:5,bossFailure:-3,fansSuccess:3,fansFailure:-3},
    {label:"Tentar roubar a bola",skill:"power",difficulty:55,successText:"Roubou! Contra-ataque neutralizado!",failText:"Driblou e fez o gol.",successType:"tackle",failType:"goal_conceded",bossSuccess:4,bossFailure:-4,fansSuccess:5,fansFailure:-4},
    {label:"Fazer falta tática",skill:"power",difficulty:30,successText:"Falta tática. Amarelo mas salvou.",failText:"Não conseguiu nem fazer a falta.",successType:"tactical_foul",failType:"goal_conceded",bossSuccess:3,bossFailure:-3,fansSuccess:2,fansFailure:-3}
  ]},
  {id:"def_u3",tier:"uncommon",text:"Pênalti contra! Você tem chance de reclamar com o juiz.",options:[
    {label:"Aceitar calado",skill:"vision",difficulty:15,successText:"Manteve a compostura. Respeito.",failText:"—",successType:"composure",failType:"nothing",bossSuccess:3,bossFailure:0,fansSuccess:1,fansFailure:0},
    {label:"Reclamar energicamente",skill:"power",difficulty:40,successText:"Juiz voltou atrás! Falta anulada!",failText:"Cartão amarelo por reclamação.",successType:"reversal",failType:"yellow_card",bossSuccess:2,bossFailure:-3,fansSuccess:5,fansFailure:-2},
    {label:"Pressionar o batedor",skill:"technique",difficulty:35,successText:"Desconcentrou o batedor!",failText:"Batedor ignorou. Gol.",successType:"mind_game",failType:"goal_conceded",bossSuccess:1,bossFailure:-2,fansSuccess:3,fansFailure:-1}
  ]},
  {id:"def_r1",tier:"rare",text:"Bola na área, confusão total. Você pode tentar sair jogando por baixo.",options:[
    {label:"Sair tocando pelo chão",skill:"technique",difficulty:60,successText:"Saída de bola elegante! Contra-ataque!",failText:"Perdeu na saída! Gol do adversário!",successType:"buildup",failType:"goal_conceded",bossSuccess:4,bossFailure:-6,fansSuccess:6,fansFailure:-6},
    {label:"Chutão pra frente",skill:"power",difficulty:20,successText:"Afastou o perigo. Seguro.",failText:"—",successType:"clearance",failType:"nothing",bossSuccess:2,bossFailure:0,fansSuccess:0,fansFailure:0},
    {label:"Lançamento longo pro atacante",skill:"vision",difficulty:55,successText:"Lançamento do zagueiro! Contra-ataque letal!",failText:"Lançamento interceptado.",successType:"goal",failType:"turnover",bossSuccess:3,bossFailure:-2,fansSuccess:7,fansFailure:-2}
  ]},
  {id:"def_r2",tier:"rare",text:"Escanteio pro seu time! Você sobe pra área adversária!",options:[
    {label:"Cabecear com tudo",skill:"power",difficulty:55,successText:"ZAGUEIRO ARTILHEIRO! GOOOL!",failText:"Cabeçada por cima.",successType:"goal",failType:"miss",bossSuccess:3,bossFailure:-1,fansSuccess:8,fansFailure:-1},
    {label:"Desviar de leve",skill:"technique",difficulty:50,successText:"Desvio sutil. GOL!",failText:"Não pegou.",successType:"goal",failType:"miss",bossSuccess:2,bossFailure:-1,fansSuccess:6,fansFailure:-1},
    {label:"Voltar e proteger o contra-ataque",skill:"vision",difficulty:20,successText:"Voltou a tempo! Defesa segura.",failText:"—",successType:"positioning",failType:"nothing",bossSuccess:4,bossFailure:0,fansSuccess:0,fansFailure:0}
  ]},
  {id:"def_l1",tier:"legendary",minRenown:3,text:"Último minuto da final. Atacante passa por todos. Só você. A história te observa.",options:[
    {label:"Carrinho salvando o título",skill:"power",difficulty:75,successText:"CARRINHO HISTÓRICO!!! SALVOU O TÍTULO!!!",failText:"Pênalti. E vermelho.",successType:"legendary_tackle",failType:"penalty_red",bossSuccess:5,bossFailure:-10,fansSuccess:20,fansFailure:-10},
    {label:"Bloquear com o corpo",skill:"power",difficulty:60,successText:"Bloqueou o chute com o peito!",failText:"Bola desviou e entrou.",successType:"block",failType:"goal_conceded",bossSuccess:4,bossFailure:-5,fansSuccess:12,fansFailure:-5},
    {label:"Posicionar e esperar o erro",skill:"vision",difficulty:55,successText:"Frieza absoluta. Atacante errou.",failText:"Atacante não errou. Gol.",successType:"composure",failType:"goal_conceded",bossSuccess:5,bossFailure:-4,fansSuccess:10,fansFailure:-5}
  ]}
];
