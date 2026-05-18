import { calculateWeeklyFinances } from '../../engine/ManagerSystems.js';
import { getTicketMoralBoost } from '../../engine/TicketPricingSystem.js';
import { rng as systemRng } from '../../engine/rng.js';

export function processWeeklyFinances(engine, team, weekResults) {
    // Energy management based on training
    team.squad.forEach(p => {
        if (p.isTitular) {
            p.energy = Math.max(0, p.energy - (Math.floor(systemRng() * 10) + 12));
        } else {
            p.energy = Math.min(100, p.energy + 12);
        }
    });

    // Finanças detalhadas (agora passando engine)
    engine.weeklyFinance = calculateWeeklyFinances(team, weekResults, team.id, engine);
    // Staff costs
    const staffCost = engine.staff.getWeeklyCost();
    if (staffCost > 0) {
        engine.weeklyFinance.expenses += staffCost;
        engine.weeklyFinance.details.push({ label: 'Staff', amount: staffCost, type: 'expense' });
    }
    // Loan repayment
    if (engine.activeLoan) {
        const loanResult = engine.processLoanPayment();
        if (loanResult) {
            engine.weeklyFinance.expenses += loanResult.paid;
            engine.weeklyFinance.details.push({ label: '🏦 Parcela Empréstimo', amount: loanResult.paid, type: 'expense' });
            if (loanResult.finished) {
                engine.weekEvents.push(loanResult.msg);
            }
        }
    }
    
    team.balance += engine.weeklyFinance.income - engine.weeklyFinance.expenses;

    // Elifoot Classic: Ticket Pricing — moral semanal da torcida
    const ticketMoralDelta = getTicketMoralBoost(engine);
    if (ticketMoralDelta !== 0) {
        team.squad.forEach(p => {
            p.moral = Math.max(0, Math.min(100, (p.moral || 50) + ticketMoralDelta));
        });
    }
}
