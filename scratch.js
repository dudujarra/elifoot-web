import { Engine } from './src/engine/engine.js';
import { setDifficulty } from './src/engine/systems/DifficultyModes.js';
import { AutoPlayController } from './src/services/AutoPlayService.js';

setDifficulty('sinistro');
const engine = new Engine();
engine.initGame('IguatuBot', 1, 'manager', 'fallen');
const iguatu = engine.teams.find(t => t.name === 'Iguatu');
const teamId = iguatu ? iguatu.id : 1;
const engine2 = new Engine();
engine2.initGame('IguatuBot', teamId, 'manager', 'fallen');
const bot = new AutoPlayController(engine2);
bot.running = true;

let firings = 0;
let lastFired = false;

for (let w = 0; w < 38 * 20; w++) { // run 20 seasons
    bot._tick();
    if (engine2.board?.isFired && !lastFired) {
        firings++;
    }
    lastFired = engine2.board?.isFired || false;
}

const div4 = engine2.teams.filter(t => t.division === 4);
console.log(`Firings in 20 seasons: ${firings}`);
console.log('Div 4 Balances:');
div4.forEach(t => console.log(`${t.name}: R$${(t.balance/1e6).toFixed(2)}M, Squad: ${t.squad.length}`));
