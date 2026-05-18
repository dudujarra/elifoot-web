import { PRESS, MOOD, LIFESTYLE, NARRATIVE } from './EmojiConstants.js';

// NPCs Nomeados
export interface NpcDef {
    id: string;
    name: string;
    role: string;
    emoji: string;
    personality: string;
    unlockWeek?: number;
    unlockRenown?: number;
}

export const NPCS: NpcDef[] = [
    { id: "coach", name: "Marcos Oliveira", role: "Técnico", emoji: PRESS.TIE, personality: "pragmatic" },
    { id: "journalist", name: "Juliana Reis", role: "Jornalista", emoji: PRESS.MIC, personality: "provocative", unlockWeek: 3 },
    { id: "fanLeader", name: "Tio Dinho", role: "Líder da Torcida", emoji: PRESS.MEGAPHONE_NPC, personality: "passionate", unlockWeek: 1 },
    { id: "veteran", name: "Rafael Monteiro", role: "Veterano", emoji: MOOD.HANDSHAKE, personality: "mentor", unlockWeek: 2 },
    { id: "agent", name: "Patrícia Lemos", role: "Empresária", emoji: LIFESTYLE.BRIEFCASE, personality: "ambitious", unlockRenown: 2 },
    { id: "rival", name: "Diego Costa", role: "Rival", emoji: NARRATIVE.CROSSED_SWORDS, personality: "competitive", unlockWeek: 5 }
];
