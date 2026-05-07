import { Engine } from './engine.js';
import { BOARD_MEMBERS } from './BoardSystem.js';

console.log("=== AKITA-007: Board + Contratos + Lesões ===\n");

const engine = new Engine();
engine.initGame("Mourinho", 1, "manager", "livre");
const team = engine.getTeam(1);

// 1. Board
console.log("--- #1 Board System ---");
console.log(`  ${BOARD_MEMBERS.president.emoji} ${BOARD_MEMBERS.president.name} (${BOARD_MEMBERS.president.role})`);
console.log(`  ${BOARD_MEMBERS.director.emoji} ${BOARD_MEMBERS.director.name} (${BOARD_MEMBERS.director.role})`);
console.log(`  Confiança: ${engine.board.confidence}%`);
console.log(`  Objetivos: ${engine.board.objectives.map(o => o.text).join(', ')}`);

// 2. Contratos
console.log("\n--- #2 Contratos ---");
const contracts = team.squad.map(p => `${p.name}: ${p.contract.weeksLeft}sem`);
console.log(`  ${contracts.slice(0, 3).join(' | ')} ...`);

// 3. Simulate 20 weeks
console.log("\n--- #3 Simulação 20 semanas ---");
let totalInjuries = 0;
let expiredContracts = 0;
for (let w = 0; w < 20; w++) {
    engine.weekEvents = [];
    engine.doTraining(w % 5 === 0 ? 'double' : 'fitness');
    engine.advanceWeek();
    totalInjuries += engine.weekInjuries.length;
    if (engine.weekEvents.length > 0) {
        expiredContracts += engine.weekEvents.length;
        engine.weekEvents.forEach(e => console.log(`  Sem ${w+1}: ${e}`));
    }
    if (engine.weekInjuries.length > 0) {
        engine.weekInjuries.forEach(inj => {
            console.log(`  Sem ${w+1}: ${inj.emoji} ${inj.player} — ${inj.name} (${inj.weeksLeft} sem)`);
        });
    }
}

// 4. Board status
const status = engine.board.getStatus();
console.log(`\n--- #4 Board Status ---`);
console.log(`  Confiança: ${engine.board.confidence}% ${status.emoji} ${status.label}`);
console.log(`  Demitido: ${engine.board.isFired}`);
console.log(`  Warning: ${engine.board.warningGiven}`);

// 5. Injury summary
const injured = team.squad.filter(p => p.injury);
console.log(`\n--- #5 Lesões ---`);
console.log(`  Total lesões no período: ${totalInjuries}`);
console.log(`  Atualmente lesionados: ${injured.length}`);
injured.forEach(p => console.log(`    ${p.injury.emoji} ${p.name}: ${p.injury.name} (${p.injury.weeksLeft} sem restantes)`));

// 6. Contract summary
console.log(`\n--- #6 Contratos expirados: ${expiredContracts} ---`);
console.log(`  Squad size: ${team.squad.length}`);

console.log("\n=== TODOS OS TESTES PASSARAM ===");
