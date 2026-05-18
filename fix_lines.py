import json
import os

with open('eslint-fix-dry.json', 'r') as f:
    results = json.load(f)

for result in results:
    if not result.get('messages'):
        continue
    
    file_path = result['filePath']
    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    lines_to_modify = {}
    
    for msg in result['messages']:
        if msg.get('message', '').startswith('Unused eslint-disable directive'):
            line_idx = msg['line'] - 1
            line = lines[line_idx]
            
            # Since eslint-disable directives can be inline or block, we can just replace 'eslint-disable' with 'eslint-disabled' or something?
            # No, we want to remove the directive.
            # If the directive is at the end of a line, we can split it.
            # Usually the message points to the exact start of the directive.
            # Let's just remove the text that matches eslint-disable.*no-restricted-syntax
            # or eslint-disable.*react-hooks/exhaustive-deps
            import re
            
            new_line = re.sub(r'//\s*eslint-disable-next-line[^\n]*', '', line)
            new_line = re.sub(r'/\*\s*eslint-disable-next-line.*?\*/', '', new_line)
            new_line = re.sub(r'//\s*eslint-disable-line[^\n]*', '', new_line)
            new_line = re.sub(r'/\*\s*eslint-disable-line.*?\*/', '', new_line)
            new_line = re.sub(r'\{\s*/\*\s*eslint-disable-next-line.*?\*/\s*\}', '', new_line)
            
            # If it's a JSX comment like {/* eslint-disable-next-line ... */} it will be removed.
            
            if new_line.strip() == '':
                lines_to_modify[line_idx] = ''
            else:
                lines_to_modify[line_idx] = new_line

    if lines_to_modify:
        new_lines = []
        for i, line in enumerate(lines):
            if i in lines_to_modify:
                if lines_to_modify[i] != '':
                    new_lines.append(lines_to_modify[i])
            else:
                new_lines.append(line)
                
        with open(file_path, 'w') as f:
            f.writelines(new_lines)

print("Done")
