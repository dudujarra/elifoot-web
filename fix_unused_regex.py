import json
import re
import os

with open('eslint-fix-dry.json', 'r') as f:
    results = json.load(f)

for result in results:
    if not result.get('messages'):
        continue
    
    file_path = result['filePath']
    with open(file_path, 'r') as f:
        lines = f.readlines()
        
    lines_to_delete = set()
    lines_to_modify = {}
    
    for msg in result['messages']:
        if msg.get('message', '').startswith('Unused eslint-disable directive'):
            line_idx = msg['line'] - 1
            line = lines[line_idx]
            
            # Use regex to remove eslint comments
            new_line = re.sub(r'//\s*eslint-disable-next-line[^\n]*', '', line)
            new_line = re.sub(r'/\*\s*eslint-disable-next-line[^*]*\*/', '', new_line)
            new_line = re.sub(r'//\s*eslint-disable-line[^\n]*', '', new_line)
            new_line = re.sub(r'/\*\s*eslint-disable-line[^*]*\*/', '', new_line)
            new_line = re.sub(r'\{/\*\s*eslint-disable-next-line[^*]*\*/\}', '', new_line)
            
            # If line is completely empty after stripping (except newline), delete it
            if not new_line.strip():
                lines_to_delete.add(line_idx)
            else:
                lines_to_modify[line_idx] = new_line

    if lines_to_delete or lines_to_modify:
        new_lines = []
        for i, line in enumerate(lines):
            if i in lines_to_delete:
                continue
            if i in lines_to_modify:
                new_lines.append(lines_to_modify[i])
            else:
                new_lines.append(line)
                
        with open(file_path, 'w') as f:
            f.writelines(new_lines)

print("Done")
