import re
import os

with open('src/services/AutoPlayDecisions.js', 'r') as f:
    content = f.read()

# Match each class up to the next class or end
nodes = re.findall(r'(class (\w+) \{\n(?:.*?\n)*?(?=\nclass |export class |\Z))', content)

for full_match, class_name in nodes:
    if class_name == 'AutoPlayDecisions':
        continue
    file_path = f'src/services/autoplay/nodes/{class_name}.js'
    
    # We need to find which imports this class uses.
    # Instead of sophisticated import resolution, we just include the common ones
    # and strip unused later, or we can just keep them.
    imports = """import { TRAINING_TYPES } from '../../../engine/ManagerSystems.js';
import { encodeState } from '../../learning/AdaptiveBrain.js';
import { detectMonotonyHeuristic } from '../../learning/LLMBridge.js';
import { smartSellDecision, rankCandidates, computeTransferReward } from '../../learning/SmartMarketEngine.js';
import { rng as systemRng } from '../../../engine/rng.js';
import { evaluate as evaluateCoachProposal, decide as decideCoachProposal } from '../../../engine/CoachProposalSystem.js';
import { PressService } from '../../PressService.js';
import { EngineLogger } from '../../../engine/EngineLogger.js';

const TRAINING_ROTATION = (TRAINING_TYPES || []).map(t => t.id).filter(Boolean);
const FORMATION_POOL = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];
const VIEW_ROTATION = [
    'dashboard', 'squad', 'market', 'standings', 'pressView',
    'matchView', 'rivalries', 'chronicle', 'achievements', 'monitor',
    'tutorial', 'saveSlots', 'styleguide', 'cosmeticShop', 'start', 'autoplay'
];

"""
    class_code = "export " + full_match
    
    with open(file_path, 'w') as out:
        out.write(imports + class_code)
        
    print(f"Created {file_path}")

