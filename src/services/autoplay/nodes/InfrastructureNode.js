export class InfrastructureNode {
    execute(parent, engine, teamId, _stateKey, _ctx) {
        if (parent.stats.seasonsPlayed > 0 && parent.stats.seasonsPlayed % 2 === 0 && parent.stats.weeksPlayed % 38 === 1) {
            const team = engine.getTeam(teamId);
            if (team && team.balance > 3_000_000) {
                if (engine.upgradeStadium) {
                    engine.upgradeStadium();
                    parent._logDecision('UPGRADE_STADIUM', {}, 0);
                }
                if (engine.upgradeAcademy) {
                    engine.upgradeAcademy();
                    parent._logDecision('UPGRADE_ACADEMY', {}, 0);
                }
            }
        }
    }
}
