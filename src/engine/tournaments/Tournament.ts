import { Team, Tournament as ITournament } from "../types.js";

export class Tournament implements ITournament {
    [key: string]: any;
    constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.participants = [];
        this.isActive = false;
        this.winner = null;
    }

    init(teamIds: any[]) {
        this.participants = [...teamIds];
        this.isActive = true;
    }

    advanceWeek(_engine: any, _week: number): any {
        // Override in subclasses
        return null;
    }

    id: string;
    name: string;
    participants: any[];
    isActive: boolean;
    winner: any;
}
