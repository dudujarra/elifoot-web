// Catálogo de Traits compráveis
export interface BuyableTrait {
    name: string;
    cost: number;
    description: string;
    requiredBoss: number;
}

export const TRAITS_CATALOG: Record<string, BuyableTrait> = {
    set_piece_taker: { name: "Batedor de Faltas", cost: 2000, description: "Habilidade especial em cobranças de falta", requiredBoss: 60 },
    surprise_element: { name: "Elemento Surpresa", cost: 3000, description: "Jogadas imprevisíveis que surpreendem a defesa", requiredBoss: 50 },
    sweeper_keeper: { name: "Goleiro Líbero", cost: 2500, description: "Sai da área para interceptar jogadas", requiredBoss: 70 },
    target_man: { name: "Pivô de Área", cost: 1500, description: "Domínio de bola de costas para o gol", requiredBoss: 40 },
    engine_box_to_box: { name: "Box-to-Box", cost: 2000, description: "Cobre o campo inteiro, da defesa ao ataque", requiredBoss: 55 },
};
