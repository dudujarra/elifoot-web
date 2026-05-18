const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
    tsConfigFilePath: 'tsconfig.json',
});

project.addSourceFilesAtPaths('src/engine/**/*.ts');
const files = project.getSourceFiles();

const typeMap = {
    'engine': 'any', // Will cast locally as any to avoid circular deps if needed, wait, better 'unknown' or 'Engine'
    'player': 'Player',
    'p': 'Player',
    'team': 'Team',
    't': 'Team',
    'match': 'MatchResult',
    'm': 'MatchResult',
    'tournament': 'Tournament',
    'manager': 'Manager',
};

files.forEach(file => {
    let modified = false;

    // Fix implicit anys in parameters
    file.getDescendantsOfKind(SyntaxKind.Parameter).forEach(param => {
        const typeNode = param.getTypeNode();
        if (typeNode && typeNode.getText() === 'any') {
            const name = param.getName();
            let newType = 'unknown';
            
            if (name.toLowerCase().includes('player')) newType = 'Player';
            else if (name.toLowerCase().includes('team')) newType = 'Team';
            else if (name.toLowerCase().includes('match')) newType = 'MatchResult';
            else if (name.toLowerCase().includes('tournament')) newType = 'Tournament';
            else if (name.toLowerCase().includes('manager')) newType = 'Manager';
            else if (name.toLowerCase().includes('engine')) newType = 'unknown'; // Can't easily import Engine everywhere without circular deps
            
            param.setType(newType);
            modified = true;
        }
    });

    // Fix variable declarations
    file.getDescendantsOfKind(SyntaxKind.VariableDeclaration).forEach(vd => {
        const typeNode = vd.getTypeNode();
        if (typeNode && typeNode.getText() === 'any') {
            vd.setType('unknown');
            modified = true;
        } else if (typeNode && typeNode.getText() === 'any[]') {
            vd.setType('unknown[]');
            modified = true;
        }
    });

    // Fix properties in classes
    file.getDescendantsOfKind(SyntaxKind.PropertyDeclaration).forEach(prop => {
        const typeNode = prop.getTypeNode();
        if (typeNode && typeNode.getText() === 'any') {
            prop.setType('unknown');
            modified = true;
        } else if (typeNode && typeNode.getText() === 'any[]') {
            prop.setType('unknown[]');
            modified = true;
        }
    });

    // Fix method return types
    file.getDescendantsOfKind(SyntaxKind.MethodDeclaration).forEach(method => {
        const returnTypeNode = method.getReturnTypeNode();
        if (returnTypeNode && returnTypeNode.getText() === 'any') {
            method.setReturnType('unknown');
            modified = true;
        } else if (returnTypeNode && returnTypeNode.getText() === 'any[]') {
            method.setReturnType('unknown[]');
            modified = true;
        }
    });

    if (modified) {
        // We might need to add imports if we used Player, Team, etc.
        const usesPlayer = file.getFullText().includes('Player');
        const usesTeam = file.getFullText().includes('Team');
        const usesMatch = file.getFullText().includes('MatchResult');
        const usesTournament = file.getFullText().includes('Tournament');
        const usesManager = file.getFullText().includes('Manager');

        const importsToAdd = [];
        if (usesPlayer) importsToAdd.push('Player');
        if (usesTeam) importsToAdd.push('Team');
        if (usesMatch) importsToAdd.push('MatchResult');
        if (usesTournament) importsToAdd.push('Tournament');
        if (usesManager) importsToAdd.push('Manager');

        if (importsToAdd.length > 0) {
            // Very naive import injection
            const filePath = file.getFilePath();
            // Assuming most files are in src/engine/ or src/engine/subdir/
            let importPath = './types.js';
            if (filePath.includes('/tournaments/') || filePath.includes('/systems/') || filePath.includes('/tactical/') || filePath.includes('/training/')) {
                importPath = '../types.js';
            }
            
            const existingImports = file.getImportDeclarations();
            const hasTypesImport = existingImports.some(i => i.getModuleSpecifierValue().includes('types.js'));
            if (!hasTypesImport) {
                file.addImportDeclaration({
                    namedImports: importsToAdd,
                    moduleSpecifier: importPath
                });
            } else {
                // If it has it, we should theoretically merge, but for now we'll rely on TS allowing multiple imports or we skip
            }
        }
    }
});

project.saveSync();
console.log('Fixed types with ts-morph');
