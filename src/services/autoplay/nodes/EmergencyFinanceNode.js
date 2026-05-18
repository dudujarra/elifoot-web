import { EngineLogger } from '../../../engine/EngineLogger.js';

export class EmergencyFinanceNode {
    execute(parent, engine, teamId, _stateKey, _ctx) {
        try {
            const team = engine.getTeam(teamId);
            if (!team) return;
            
            if ((team.balance || 0) < 0 && !engine.activeLoan) {
                const loanOpts = engine.getLoanOptions();
                if (loanOpts.available && loanOpts.options.length > 0) {
                    const mediumLoan = loanOpts.options[1] || loanOpts.options[0];
                    const result = engine.takeLoan(mediumLoan.amount);
                    if (result.success) {
                        parent._logDecision('TAKE_LOAN', { amount: mediumLoan.amount, weeklyPayment: mediumLoan.weeklyPayment, balance: team.balance }, 0);
                    }
                }
            }
            
            if ((team.balance || 0) < -5_000_000) {
                parent._emergencySell(team);
            }
        } catch (err) { EngineLogger.capture(err, 'EmergencyFinanceNode.execute', { week: parent.stats.weeksPlayed }); }
    }
}
