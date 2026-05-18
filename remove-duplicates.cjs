const { Project, SyntaxKind } = require('ts-morph');

const project = new Project({
    tsConfigFilePath: 'tsconfig.json'
});

const sourceFiles = project.getSourceFiles('src/engine/**/*.ts');

for (const sourceFile of sourceFiles) {
    let changed = false;
    for (const cls of sourceFile.getClasses()) {
        const methods = cls.getMethods().map(m => m.getName());
        const getters = cls.getGetAccessors().map(g => g.getName());
        const setters = cls.getSetAccessors().map(s => s.getName());
        
        const allMethods = new Set([...methods, ...getters, ...setters]);
        
        const properties = cls.getProperties();
        
        const propNames = new Set();

        for (const prop of properties) {
            const name = prop.getName();
            
            // If it's a duplicate of a method/getter/setter, remove it
            if (allMethods.has(name)) {
                console.log(`Removing duplicate property (method name match) ${name} from ${cls.getName()} in ${sourceFile.getBaseName()}`);
                prop.remove();
                changed = true;
                continue;
            }
            
            // If we've seen this property name before, remove the current (subsequent) one
            if (propNames.has(name)) {
                console.log(`Removing duplicate property ${name} from ${cls.getName()} in ${sourceFile.getBaseName()}`);
                prop.remove();
                changed = true;
            } else {
                propNames.add(name);
            }
        }
    }
    if (changed) {
        sourceFile.saveSync();
    }
}
