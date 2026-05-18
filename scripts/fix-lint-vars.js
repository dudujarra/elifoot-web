import fs from 'fs';

const report = JSON.parse(fs.readFileSync('eslint_report.json', 'utf8'));

report.forEach(file => {
    if (file.messages.length === 0) return;
    let content = fs.readFileSync(file.filePath, 'utf8');
    const lines = content.split('\n');
    
    file.messages.sort((a, b) => b.line - a.line || b.column - a.column);
    
    file.messages.forEach(msg => {
        if (msg.ruleId === 'unused-imports/no-unused-vars') {
            const match = msg.message.match(/'([^']+)' is/);
            if (match) {
                const varName = match[1];
                const lineIdx = msg.line - 1;
                const lineStr = lines[lineIdx];
                
                // Find index of the variable in the line around the column specified
                // msg.column is 1-based
                // we want to replace the first occurrence of varName at or after column-1, or near it
                const regex = new RegExp(`\\b${varName}\\b`, 'g');
                
                lines[lineIdx] = lineStr.replace(regex, (m, offset) => {
                    // Only replace if it's close to the reported column
                    // msg.column might point to the start of the variable
                    if (Math.abs(offset - (msg.column - 1)) < 20 && !varName.startsWith('_')) {
                        return `_${varName}`;
                    }
                    return m;
                });
                
                // Fallback: if no replace happened, just replace the first one
                if (lines[lineIdx] === lineStr && !varName.startsWith('_')) {
                     lines[lineIdx] = lineStr.replace(new RegExp(`\\b${varName}\\b`), `_${varName}`);
                }
            }
        }
    });
    
    fs.writeFileSync(file.filePath, lines.join('\n'));
});
