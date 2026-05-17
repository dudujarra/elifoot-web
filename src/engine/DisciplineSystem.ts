/**
 * DisciplineSystem — Card & Suspension Processing
 *
 * Handles yellow/red card accumulation and automatic suspensions.
 * Pure stateless functions operating on team/player data.
 */

interface CardEvent {
    team: string;
    player: string;
    type: 'yellow' | 'red';
}

interface Player {
    name: string;
    seasonYellows?: number;
    suspension?: number;
    isTitular?: boolean;
    setFlag?: (flag: string, value: boolean) => void;
    clearFlag?: (flag: string) => void;
}

interface Team {
    name: string;
    squad?: Player[];
}

const YELLOWS_FOR_SUSPENSION = 3;

export function processMatchCards(cards: CardEvent[], team: Team): void {
    if (!team || !team.squad || !cards) return;

    cards.forEach(cardEvt => {
        // Filter cards that belong to this team
        if (cardEvt.team === team.name) {
            const p = team.squad!.find(player => player.name === cardEvt.player);
            if (p) {
                if (cardEvt.type === 'yellow') {
                    p.seasonYellows = (p.seasonYellows || 0) + 1;
                    // Suspend for 1 match after 3 yellow cards
                    if (p.seasonYellows === YELLOWS_FOR_SUSPENSION) {
                        p.suspension = (p.suspension || 0) + 1;
                        p.seasonYellows = 0; // Reset count
                        p.isTitular = false; // Remove from starting XI
                        if (p.setFlag) p.setFlag('suspended', true);
                    }
                } else if (cardEvt.type === 'red') {
                    // Suspend for 1 match (direct red)
                    p.suspension = (p.suspension || 0) + 1;
                    p.isTitular = false; // Remove from starting XI
                    if (p.setFlag) p.setFlag('suspended', true);
                }
            }
        }
    });
}

export function decrementSuspensions(team: Team): void {
    if (!team || !team.squad) return;

    team.squad.forEach(p => {
        if (p.suspension && p.suspension > 0) {
            p.suspension -= 1;
            if (p.suspension <= 0) {
                delete p.suspension;
                if (p.clearFlag) p.clearFlag('suspended');
            }
        }
    });
}
